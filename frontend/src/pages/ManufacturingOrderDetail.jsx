import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Zap,
  Factory,
} from 'lucide-react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Grid,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useERP } from '../context/ERPContext';
import * as manufacturingOrderApi from '../api/manufacturingOrderApi';
import { mapManufacturingOrderDetailFromApi, mapManufacturingOrderFromApi } from '../api/mappers';
import { showError } from '../utils/helpers';

const MO_STATUS_CHIP = {
  DRAFT: { label: 'Draft', color: 'default' },
  IN_PROGRESS: { label: 'In Progress', color: 'info' },
  COMPLETED: { label: 'Completed', color: 'success' },
  CANCELLED: { label: 'Cancelled', color: 'error' },
};

const WO_STATUS_CHIP = {
  PENDING: { label: 'Pending', color: 'default' },
  IN_PROGRESS: { label: 'In Progress', color: 'info' },
  DONE: { label: 'Done', color: 'success' },
};

const canManageMO = (role) => ['ADMIN', 'MANUFACTURING'].includes(role);

export default function ManufacturingOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, updateData, syncStockFromBackend, refreshStockLedger } = useERP();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await manufacturingOrderApi.getManufacturingOrderById(id);
      setOrder(mapManufacturingOrderDetailFromApi(res));
    } catch (err) {
      showError(err, 'Failed to load manufacturing order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const refreshLocalAndContext = async (updated) => {
    const mapped = mapManufacturingOrderDetailFromApi(updated);
    setOrder(mapped);
    updateData('manufacturingOrders', (prev) =>
      prev.map((o) => (o.id === mapped.id ? mapManufacturingOrderFromApi(updated) : o))
    );
    return mapped;
  };

  const handleStart = async () => {
    try {
      const updated = await manufacturingOrderApi.startMO(id);
      await refreshLocalAndContext(updated);
    } catch (err) {
      showError(err, 'Failed to start manufacturing order');
    }
  };

  const handleCompleteWorkOrder = async (woId) => {
    try {
      const updated = await manufacturingOrderApi.completeWorkOrder(id, woId);
      await refreshLocalAndContext(updated);
    } catch (err) {
      showError(err, 'Failed to complete work order');
    }
  };

  const handleCompleteMO = async () => {
    try {
      const updated = await manufacturingOrderApi.completeMO(id);
      const mapped = await refreshLocalAndContext(updated);
      await syncStockFromBackend();
      await refreshStockLedger(mapped.productId);
    } catch (err) {
      showError(err, 'Failed to complete manufacturing order');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this manufacturing order?')) return;
    try {
      const updated = await manufacturingOrderApi.cancelMO(id);
      await refreshLocalAndContext(updated);
      await syncStockFromBackend();
    } catch (err) {
      showError(err, 'Failed to cancel manufacturing order');
    }
  };

  const getMoStatusChip = (statusRaw) => {
    const s = MO_STATUS_CHIP[statusRaw] || { label: statusRaw, color: 'default' };
    return <Chip label={s.label} color={s.color} size="small" />;
  };

  const getWoStatusChip = (statusRaw) => {
    const s = WO_STATUS_CHIP[statusRaw] || { label: statusRaw, color: 'default' };
    return <Chip label={s.label} color={s.color} size="small" />;
  };

  const getComponentStock = (componentProductId) => {
    const product = data.products?.find((p) => p.id === componentProductId);
    const onHand = product?.onHand ?? 0;
    const reserved = product?.reserved ?? 0;
    return { product, onHand, reserved, freeToUse: onHand - reserved };
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Manufacturing order not found</Typography>
        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/manufacturing')} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  const statusRaw = order.statusRaw ?? order.status;
  const isDraft = statusRaw === 'DRAFT';
  const isInProgress = statusRaw === 'IN_PROGRESS';
  const canCancel = !['COMPLETED', 'CANCELLED'].includes(statusRaw);
  const allWorkOrdersDone = order.workOrders?.every((wo) => wo.statusRaw === 'DONE');
  const totalDuration = order.workOrders?.reduce((sum, wo) => sum + (wo.durationMinutes || 0), 0) ?? 0;
  const manageMO = canManageMO(user?.role);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            startIcon={<ArrowLeft size={16} />}
            variant="outlined"
            onClick={() => navigate('/manufacturing')}
          >
            Back
          </Button>
          {manageMO && isDraft && (
            <Button variant="contained" color="primary" startIcon={<Play size={16} />} onClick={handleStart}>
              Start
            </Button>
          )}
          {manageMO && isInProgress && (
            <>
              {order.workOrders
                ?.filter((wo) => wo.statusRaw !== 'DONE')
                .map((wo) => (
                  <Button
                    key={wo.id}
                    variant="outlined"
                    size="small"
                    startIcon={<CheckCircle size={16} />}
                    onClick={() => handleCompleteWorkOrder(wo.id)}
                  >
                    Complete {wo.operationName}
                  </Button>
                ))}
              {allWorkOrdersDone && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle2 size={16} />}
                  onClick={handleCompleteMO}
                >
                  Complete MO
                </Button>
              )}
            </>
          )}
          {manageMO && canCancel && (
            <Button variant="outlined" color="error" startIcon={<XCircle size={16} />} onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </Stack>

        <Button
          variant="outlined"
          startIcon={<FileText size={16} />}
          onClick={() => navigate(`/audit-logs?entityType=ManufacturingOrder&entityId=${id}`)}
        >
          Logs
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 2,
                  py: 0.5,
                  display: 'inline-block',
                }}
              >
                MO-{order.id}
              </Typography>
              {order.autoGenerated && (
                <Chip label="Auto-Generated" color="warning" size="small" icon={<Zap size={14} />} />
              )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              {getMoStatusChip(statusRaw)}
            </Stack>
          </Stack>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Product to Manufacture
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Factory size={18} color="#8b5cf6" />
                    <Typography variant="body1" fontWeight={500}>
                      {order.product?.name || order.productName || '—'}
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    SKU
                  </Typography>
                  <Typography variant="body2">{order.product?.sku || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Quantity to Manufacture
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {order.quantity} Units
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Bill of Materials
                  </Typography>
                  <Typography variant="body2">
                    BoM #{order.bomId}
                    {order.bom?.finishedProductName ? ` — ${order.bom.finishedProductName}` : ''}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Creation Date
                  </Typography>
                  <Typography variant="body2">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Assigned To
                  </Typography>
                  <Typography variant="body2">{order.assignedUser?.name || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Total Production Duration
                  </Typography>
                  <Typography variant="body2">{totalDuration} minutes</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Source
                  </Typography>
                  <Typography variant="body2">
                    {order.autoGenerated ? 'Auto-procurement from Sales Order' : 'Manual creation'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" mb={1}>
            BoM Components Required
          </Typography>
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell>Component</TableCell>
                  <TableCell align="center">Qty per Unit</TableCell>
                  <TableCell align="center">Total Required</TableCell>
                  <TableCell align="center">On Hand</TableCell>
                  <TableCell align="center">Availability</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(order.bom?.components ?? []).map((comp) => {
                  const totalRequired = Math.ceil((comp.quantityRequired || 0) * order.quantity);
                  const { product, onHand, freeToUse } = getComponentStock(comp.componentProductId);
                  const sufficient = freeToUse >= totalRequired;
                  return (
                    <TableRow key={comp.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {comp.componentName || comp.componentProduct?.name || product?.name || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product?.sku || comp.componentProduct?.sku || ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{comp.quantityRequired}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={500}>
                          {totalRequired}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{onHand}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={sufficient ? 'Available' : `Short ${totalRequired - freeToUse}`}
                          color={sufficient ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(order.bom?.components ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No BoM components defined
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle2" mb={1}>
            Work Orders
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell>Operation</TableCell>
                  <TableCell>Work Center</TableCell>
                  <TableCell align="center">Duration (min)</TableCell>
                  <TableCell align="center">Status</TableCell>
                  {manageMO && isInProgress && <TableCell align="center">Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {order.workOrders?.map((wo) => (
                  <TableRow key={wo.id} hover>
                    <TableCell>
                      <Typography variant="body2">{wo.operationName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{wo.workCenter || '—'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{wo.durationMinutes}</Typography>
                    </TableCell>
                    <TableCell align="center">{getWoStatusChip(wo.statusRaw)}</TableCell>
                    {manageMO && isInProgress && (
                      <TableCell align="center">
                        {wo.statusRaw !== 'DONE' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CheckCircle size={14} />}
                            onClick={() => handleCompleteWorkOrder(wo.id)}
                          >
                            Complete
                          </Button>
                        ) : (
                          <Chip label="Done" color="success" size="small" />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {(!order.workOrders || order.workOrders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={manageMO && isInProgress ? 5 : 4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No work orders
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {order.autoGenerated && (
            <Alert severity="info" sx={{ mt: 2 }} icon={<Zap size={18} />}>
              <AlertTitle>Auto-Generated Order</AlertTitle>
              <Typography variant="body2">
                This manufacturing order was automatically created by the procurement engine when a sales order
                could not be fulfilled from available stock.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
