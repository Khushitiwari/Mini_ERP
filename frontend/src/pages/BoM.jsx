import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Clock, MapPin, Trash2 } from 'lucide-react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Drawer,
  Stack,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material';
import { useERP } from '../context/ERPContext';
import * as bomApi from '../api/bomApi';
import { mapBomFromApi } from '../api/mappers';
import { showError } from '../utils/helpers';

const emptyForm = () => ({
  finishedProductId: null,
  components: [{ componentProductId: null, quantityRequired: 1 }],
  operations: [{ operationName: '', durationMinutes: 30, workCenter: '' }],
});

const isFinishedGood = (p) =>
  p.type === 'Finished Good' || p.typeRaw === 'FINISHED_GOOD';

const isRawMaterial = (p) =>
  p.type === 'Raw Material' || p.typeRaw === 'RAW_MATERIAL';

export default function BoM() {
  const { data, updateData, refreshBoms } = useERP();
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBom, setSelectedBom] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const loadBoms = useCallback(async () => {
    setLoading(true);
    try {
      const result = await bomApi.getAllBoms();
      const mapped = (result ?? []).map(mapBomFromApi);
      setBoms(mapped);
      updateData('boms', [...mapped]);
    } catch (err) {
      showError(err, 'Failed to load BoMs');
    } finally {
      setLoading(false);
    }
  }, [updateData]);

  useEffect(() => {
    loadBoms();
  }, [loadBoms]);

  const resetForm = () => setForm(emptyForm());

  const handleCreateBom = async () => {
    if (!form.finishedProductId) {
      alert('Please select a finished product');
      return;
    }

    const components = form.components
      .filter((c) => c.componentProductId)
      .map((c) => ({
        componentProductId: Number(c.componentProductId),
        quantityRequired: Number(c.quantityRequired),
      }));

    if (components.length === 0) {
      alert('Add at least one component');
      return;
    }

    const operations = form.operations
      .filter((o) => o.operationName?.trim() && o.workCenter?.trim() && o.durationMinutes > 0)
      .map((o) => ({
        operationName: o.operationName.trim(),
        durationMinutes: Number(o.durationMinutes),
        workCenter: o.workCenter.trim(),
      }));

    try {
      const result = await bomApi.createBom({
        finishedProductId: Number(form.finishedProductId),
        components,
        operations,
      });
      const mapped = mapBomFromApi(result);
      setBoms((prev) => [...prev, mapped]);
      updateData('boms', (prev) => [...(prev || []), mapped]);
      await refreshBoms();
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      showError(err, 'Failed to create BoM');
    }
  };

  const addComponent = () =>
    setForm((f) => ({
      ...f,
      components: [...f.components, { componentProductId: null, quantityRequired: 1 }],
    }));

  const addOperation = () =>
    setForm((f) => ({
      ...f,
      operations: [
        ...f.operations,
        { operationName: '', durationMinutes: 30, workCenter: '' },
      ],
    }));

  const updateComponent = (idx, field, val) =>
    setForm((f) => {
      const components = [...f.components];
      components[idx] = { ...components[idx], [field]: val };
      return { ...f, components };
    });

  const updateOperation = (idx, field, val) =>
    setForm((f) => {
      const operations = [...f.operations];
      operations[idx] = { ...operations[idx], [field]: val };
      return { ...f, operations };
    });

  const finishedGoods = (data.products || []).filter(isFinishedGood);
  const rawMaterials = (data.products || []).filter(isRawMaterial);
  const bomsWithoutExisting = finishedGoods.filter(
    (p) => !boms.some((b) => b.finishedProductId === p.id)
  );

  const getFreeToUse = (component) => {
    const p = component.componentProduct;
    if (!p) return 0;
    const onHand = p.onHandQty ?? p.onHand ?? 0;
    const reserved = p.reservedQty ?? p.reserved ?? 0;
    return onHand - reserved;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Bill of Materials
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => setCreateOpen(true)}
          disabled={bomsWithoutExisting.length === 0 && finishedGoods.length > 0}
        >
          New BoM
        </Button>
      </Stack>

      {loading ? (
        <Typography color="text.secondary" textAlign="center" mt={6}>
          Loading BoMs...
        </Typography>
      ) : boms.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={6}>
          No BoMs defined yet. Create one to start manufacturing.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {boms.map((bom) => (
            <Grid item xs={12} md={6} lg={4} key={bom.id}>
              <Card
                onClick={() => {
                  setSelectedBom(bom);
                  setDrawerOpen(true);
                }}
                sx={{
                  cursor: 'pointer',
                  transition: '0.2s',
                  '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {bom.finishedProduct?.name ?? bom.finishedProductName}
                    </Typography>
                    <Chip
                      label={`${bom.components?.length ?? 0} parts`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {bom.operations?.map((o) => o.operationName).join(' → ') || '—'}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={0.5}>
                    {bom.components?.slice(0, 3).map((c) => {
                      const ftu = getFreeToUse(c);
                      const ok = ftu >= c.quantityRequired;
                      return (
                        <Stack
                          key={c.id}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="caption">
                            {c.componentProduct?.name ?? c.componentName} × {c.quantityRequired}
                          </Typography>
                          <Chip
                            label={ok ? 'OK' : 'Low'}
                            color={ok ? 'success' : 'error'}
                            size="small"
                            sx={{ height: 18, fontSize: 10 }}
                          />
                        </Stack>
                      );
                    })}
                    {(bom.components?.length ?? 0) > 3 && (
                      <Typography variant="caption" color="primary.main">
                        +{bom.components.length - 3} more components
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 480, p: 3 }}>
          {selectedBom && (
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  BoM — {selectedBom.finishedProduct?.name ?? selectedBom.finishedProductName}
                </Typography>
                <IconButton onClick={() => setDrawerOpen(false)}>
                  <X size={20} />
                </IconButton>
              </Stack>

              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                COMPONENTS
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell>Component</TableCell>
                      <TableCell align="center">Qty Required</TableCell>
                      <TableCell align="center">In Stock</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBom.components?.map((c) => {
                      const ftu = getFreeToUse(c);
                      const ok = ftu >= c.quantityRequired;
                      return (
                        <TableRow key={c.id}>
                          <TableCell>{c.componentProduct?.name ?? c.componentName}</TableCell>
                          <TableCell align="center">{c.quantityRequired}</TableCell>
                          <TableCell align="center">{ftu}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={ok ? 'Sufficient' : 'Insufficient'}
                              color={ok ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                OPERATIONS
              </Typography>
              {selectedBom.operations?.length > 0 ? (
                <Stepper orientation="vertical">
                  {selectedBom.operations.map((op) => (
                    <Step key={op.id} active completed={false}>
                      <StepLabel>
                        <Typography variant="body2" fontWeight={600}>
                          {op.operationName}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Stack direction="row" spacing={1} mb={1}>
                          <Chip
                            label={`${op.durationMinutes} min`}
                            size="small"
                            icon={<Clock size={12} />}
                            variant="outlined"
                          />
                          <Chip
                            label={op.workCenter}
                            size="small"
                            icon={<MapPin size={12} />}
                            variant="outlined"
                          />
                        </Stack>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No operations defined
                </Typography>
              )}
            </>
          )}
        </Box>
      </Drawer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Bill of Materials</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <Autocomplete
              options={bomsWithoutExisting.length > 0 ? bomsWithoutExisting : finishedGoods}
              getOptionLabel={(p) => p.name}
              onChange={(_, val) => setForm((f) => ({ ...f, finishedProductId: val?.id ?? null }))}
              renderInput={(params) => (
                <TextField {...params} label="Finished Product *" size="small" />
              )}
            />

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">Components</Typography>
                <Button size="small" startIcon={<Plus size={14} />} onClick={addComponent}>
                  Add Component
                </Button>
              </Stack>
              {form.components.map((c, i) => (
                <Stack key={i} direction="row" spacing={1} mb={1} alignItems="center">
                  <Autocomplete
                    options={rawMaterials}
                    getOptionLabel={(p) => p.name}
                    value={rawMaterials.find((p) => p.id === c.componentProductId) || null}
                    onChange={(_, val) => updateComponent(i, 'componentProductId', val?.id ?? null)}
                    renderInput={(params) => <TextField {...params} label="Component" size="small" />}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    label="Qty"
                    type="number"
                    size="small"
                    value={c.quantityRequired}
                    onChange={(e) => updateComponent(i, 'quantityRequired', Number(e.target.value))}
                    sx={{ width: 80 }}
                    inputProps={{ min: 1 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        components: f.components.filter((_, idx) => idx !== i),
                      }))
                    }
                    disabled={form.components.length <= 1}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>
              ))}
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">Operations</Typography>
                <Button size="small" startIcon={<Plus size={14} />} onClick={addOperation}>
                  Add Operation
                </Button>
              </Stack>
              {form.operations.map((op, i) => (
                <Stack key={i} direction="row" spacing={1} mb={1} alignItems="center">
                  <TextField
                    label="Operation Name"
                    size="small"
                    value={op.operationName}
                    onChange={(e) => updateOperation(i, 'operationName', e.target.value)}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    label="Duration (min)"
                    type="number"
                    size="small"
                    value={op.durationMinutes}
                    onChange={(e) => updateOperation(i, 'durationMinutes', Number(e.target.value))}
                    sx={{ width: 120 }}
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    label="Work Center"
                    size="small"
                    value={op.workCenter}
                    onChange={(e) => updateOperation(i, 'workCenter', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        operations: f.operations.filter((_, idx) => idx !== i),
                      }))
                    }
                    disabled={form.operations.length <= 1}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateBom}>
            Create BoM
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
