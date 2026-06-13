import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Truck, XCircle, FileText, Plus, Trash2, Zap } from 'lucide-react';
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
  TextField,
  Autocomplete,
  IconButton,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useERP } from '../context/ERPContext';
import * as salesOrderApi from '../api/salesOrderApi';
import { mapSalesOrderDetailFromApi, toDeliverPayload } from '../api/mappers';
import { showError } from '../utils/helpers';

export default function SalesOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, syncStockFromBackend, refreshPurchaseOrders, refreshManufacturingOrders } = useERP();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await salesOrderApi.getSalesOrderById(id);
      setOrder(mapSalesOrderDetailFromApi(res));
    } catch (err) {
      showError(err, 'Failed to load sales order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const getStatusChip = (status) => {
    const map = {
      DRAFT: { label: 'Draft', color: 'default' },
      CONFIRMED: { label: 'Confirmed', color: 'primary' },
      PARTIALLY_DELIVERED: { label: 'Partially Delivered', color: 'warning' },
      FULLY_DELIVERED: { label: 'Fully Delivered', color: 'success' },
      CANCELLED: { label: 'Cancelled', color: 'error' },
    };
    const s = map[status] || { label: status, color: 'default' };
    return <Chip label={s.label} color={s.color} size="small" />;
  };

  const handleConfirm = async () => {
    try {
      const res = await salesOrderApi.confirmSalesOrder(id);
      setOrder(mapSalesOrderDetailFromApi(res));
      await syncStockFromBackend();
      const actions = res.procurementActions ?? [];
      if (actions.length > 0) {
        const hasPO = actions.some((a) => a.type === 'PURCHASE_ORDER');
        const hasMO = actions.some((a) => a.type === 'MANUFACTURING_ORDER');
        if (hasPO) await refreshPurchaseOrders();
        if (hasMO) await refreshManufacturingOrders();
      }
    } catch (err) {
      showError(err, 'Failed to confirm sales order');
    }
  };

  const handleDeliver = async () => {
    try {
      const deliverItems = toDeliverPayload(
        order.items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          deliveredQty: i.deliveredQty ?? 0,
        }))
      );
      const res = await salesOrderApi.deliverSalesOrder(id, deliverItems);
      setOrder(mapSalesOrderDetailFromApi(res));
      await syncStockFromBackend();
    } catch (err) {
      showError(err, 'Failed to deliver sales order');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await salesOrderApi.cancelSalesOrder(id);
      setOrder(mapSalesOrderDetailFromApi(res));
      await syncStockFromBackend();
    } catch (err) {
      showError(err, 'Failed to cancel sales order');
    }
  };

  const handleAddItem = () => {
    setOrder((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { productId: null, quantity: 1, salesUnitPrice: 0, deliveredQty: 0 },
      ],
    }));
  };

  const handleRemoveItem = (idx) => {
    setOrder((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleUpdateItem = (idx, field, value) => {
    setOrder((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === 'productId') {
        const prod = data.products.find((p) => p.id === value);
        if (prod) items[idx].salesUnitPrice = prod.salesPrice;
      }
      return { ...prev, items };
    });
  };

  const finishedGoods = (data.products || []).filter((p) => p.type === 'Finished Good');

  const orderTotal =
    order?.items?.reduce((sum, i) => sum + (i.quantity * (i.salesUnitPrice || 0)), 0) || 0;
  const isDraft = order?.status === 'DRAFT';
  const canDeliver = ['CONFIRMED', 'PARTIALLY_DELIVERED'].includes(order?.status);
  const canCancel = !['CANCELLED', 'FULLY_DELIVERED'].includes(order?.status);

  const getProductStock = (item) => {
    const product = data.products?.find((p) => p.id === item.productId) || item.product;
    const onHand = product?.onHandQty ?? product?.onHand ?? 0;
    const reserved = product?.reservedQty ?? product?.reserved ?? 0;
    return { product, freeToUse: onHand - reserved };
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
        <Typography color="error">Sales order not found</Typography>
        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/sales-orders')} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            variant="outlined"
            onClick={() => navigate('/sales-orders')}
          >
            Back
          </Button>
          {isDraft && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircle size={16} />}
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          )}
          {canDeliver && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Truck size={16} />}
              onClick={handleDeliver}
            >
              Deliver
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<XCircle size={16} />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </Stack>

        <Button
          variant="outlined"
          startIcon={<FileText size={16} />}
          onClick={() => navigate(`/audit-logs?entityType=SalesOrder&entityId=${id}`)}
        >
          Logs
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
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
              {order?.id}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              {getStatusChip(order?.status)}
            </Stack>
          </Stack>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Customer
                  </Typography>
                  {isDraft ? (
                    <Autocomplete
                      options={data.customers || []}
                      getOptionLabel={(c) => c.name}
                      value={data.customers?.find((c) => c.id === order?.customerId) || null}
                      onChange={(_, val) =>
                        setOrder((prev) => ({ ...prev, customerId: val?.id, customer: val }))
                      }
                      renderInput={(params) => (
                        <TextField {...params} size="small" placeholder="Select customer..." />
                      )}
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={500}>
                      {order?.customer?.name || '—'}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Customer Address
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order?.customer?.address || '—'}
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
                    {order?.orderDate ? new Date(order.orderDate).toLocaleDateString() : '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Sales Person
                  </Typography>
                  <Typography variant="body2">
                    {order?.createdByUser?.name || user?.name}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" mb={1}>
            Products
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Availability</TableCell>
                  <TableCell align="center">Ordered Quantity</TableCell>
                  <TableCell align="center">Delivered Quantity</TableCell>
                  <TableCell align="center">Units</TableCell>
                  <TableCell align="right">Sales Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                  {isDraft && <TableCell width={40} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {order?.items?.map((item, idx) => {
                  const { product, freeToUse } = getProductStock(item);
                  const sufficient = freeToUse >= item.quantity;
                  const itemTotal = (item.quantity || 0) * (item.salesUnitPrice || 0);
                  const selectedProduct =
                    finishedGoods.find((p) => p.id === item.productId) || null;

                  return (
                    <TableRow key={item.id || idx} hover>
                      <TableCell sx={{ minWidth: 180 }}>
                        {isDraft ? (
                          <Autocomplete
                            options={finishedGoods}
                            getOptionLabel={(p) => p.name}
                            value={selectedProduct}
                            onChange={(_, val) => handleUpdateItem(idx, 'productId', val?.id)}
                            renderInput={(params) => <TextField {...params} size="small" />}
                            sx={{ minWidth: 160 }}
                          />
                        ) : (
                          <Typography variant="body2">
                            {item.product?.name || product?.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={sufficient ? 'Available' : `Short ${item.quantity - freeToUse}`}
                          color={sufficient ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {isDraft ? (
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'quantity', Number(e.target.value))
                            }
                            inputProps={{ min: 1, style: { textAlign: 'center', width: 60 } }}
                          />
                        ) : (
                          <Typography variant="body2">{item.quantity}</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{item.deliveredQty || 0}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          Units
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {isDraft ? (
                          <TextField
                            type="number"
                            size="small"
                            value={item.salesUnitPrice || 0}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'salesUnitPrice', Number(e.target.value))
                            }
                            inputProps={{ style: { textAlign: 'right', width: 80 } }}
                          />
                        ) : (
                          <Typography variant="body2">
                            ₹{(item.salesUnitPrice || 0).toLocaleString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          ₹{itemTotal.toLocaleString()}
                        </Typography>
                      </TableCell>
                      {isDraft && (
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(idx)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {isDraft && (
            <Button
              startIcon={<Plus size={16} />}
              onClick={handleAddItem}
              sx={{ mt: 1, color: 'text.secondary' }}
            >
              Add a product
            </Button>
          )}

          <Stack direction="row" justifyContent="flex-end" mt={2} pr={1}>
            <Typography variant="h6" fontWeight={700}>
              Total: ₹{orderTotal.toLocaleString()}
            </Typography>
          </Stack>

          {order?.procurementActions?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }} icon={<Zap size={18} />}>
              <AlertTitle>Auto Procurement Triggered</AlertTitle>
              {order.procurementActions.map((a, i) => (
                <Typography key={i} variant="body2">
                  •{' '}
                  {a.type === 'MANUFACTURING_ORDER' ? 'Manufacturing Order' : 'Purchase Order'}{' '}
                  {a.order?.id} auto-created for {a.shortageQty} units shortage
                </Typography>
              ))}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
