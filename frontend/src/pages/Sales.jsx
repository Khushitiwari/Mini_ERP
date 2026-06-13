import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { DataGrid } from '@mui/x-data-grid';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import * as salesOrderApi from '../api/salesOrderApi';
import * as customerApi from '../api/customerApi';
import { mapSalesOrderFromApi, toDeliverPayload } from '../api/mappers';
import EntityAutocomplete from '../components/common/EntityAutocomplete';
import { formatCurrency, formatDate, showError } from '../utils/helpers';

const emptyItem = { productId: '', quantity: 1 };

export default function Sales() {
  const navigate = useNavigate();
  const {
    data,
    updateData,
    addAuditLog,
    syncStockFromBackend,
    refreshCustomers,
    refreshPurchaseOrders,
    refreshManufacturingOrders,
  } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [procurementAlert, setProcurementAlert] = useState(null);

  const finishedGoods = data.products.filter((p) => p.type === 'Finished Good');

  const calcTotal = (lineItems) =>
    lineItems.reduce((sum, item) => {
      const product = data.products.find((p) => p.id === Number(item.productId));
      return sum + (Number(item.quantity) || 0) * (product?.salesPrice ?? 0);
    }, 0);

  const handleAddLine = () => setItems([...items, { ...emptyItem }]);

  const handleRemoveLine = (idx) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const resetForm = () => {
    setCustomerId('');
    setItems([{ ...emptyItem }]);
    setShowForm(false);
  };

  const handleCreateCustomer = async (payload) => {
    const created = await customerApi.createCustomer(payload);
    await refreshCustomers();
    return created;
  };

  const handleCreate = async () => {
    if (!customerId || items.some((i) => !i.productId || !i.quantity)) {
      alert('Please select customer and fill all line items');
      return;
    }
    try {
      const payload = {
        customerId: Number(customerId),
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
      };
      const created = await salesOrderApi.createSalesOrder(payload);
      const mapped = mapSalesOrderFromApi(created);
      if (!mapped.total) mapped.total = calcTotal(items);
      updateData('salesOrders', (prev) => [...prev, mapped]);
      addAuditLog();
      resetForm();
    } catch (err) {
      showError(err, 'Failed to create sales order');
    }
  };

  const advanceStatus = async (order) => {
    try {
      let updated;
      if (order.status === 'Draft') {
        updated = await salesOrderApi.confirmSalesOrder(order.id);
        console.log('Confirm SO response:', updated);
        await syncStockFromBackend();

        const actions = updated.procurementActions ?? [];
        if (actions.length > 0) {
          setProcurementAlert(actions[0]);
          const hasPO = actions.some((a) => a.type === 'PURCHASE_ORDER');
          const hasMO = actions.some((a) => a.type === 'MANUFACTURING_ORDER');
          if (hasPO) await refreshPurchaseOrders();
          if (hasMO) await refreshManufacturingOrders();
        }
      } else if (order.status === 'Confirmed' || order.status === 'Partially Delivered') {
        const deliverItems = toDeliverPayload(order.items);
        updated = await salesOrderApi.deliverSalesOrder(order.id, deliverItems);
        await syncStockFromBackend();
      } else {
        return;
      }

      const mapped = mapSalesOrderFromApi(updated);
      updateData('salesOrders', (prev) => prev.map((o) => (o.id === mapped.id ? mapped : o)));
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to update sales order');
    }
  };

  const handleCancel = async (order) => {
    try {
      const updated = await salesOrderApi.cancelSalesOrder(order.id);
      const mapped = mapSalesOrderFromApi(updated);
      updateData('salesOrders', (prev) => prev.map((o) => (o.id === mapped.id ? mapped : o)));
      await syncStockFromBackend();
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to cancel sales order');
    }
  };

  const getActionLabel = (status) => {
    if (status === 'Draft') return 'Confirm';
    if (status === 'Confirmed' || status === 'Partially Delivered') return 'Deliver';
    return null;
  };

  const statusColor = (status) => {
    const map = {
      Draft: 'default',
      Confirmed: 'info',
      'Partially Delivered': 'warning',
      'Fully Delivered': 'success',
      Cancelled: 'error',
    };
    return map[status] ?? 'default';
  };

  const columns = [
    {
      field: 'id',
      headerName: 'SO #',
      width: 90,
      valueGetter: (value, row) => `SO-${row.id}`,
    },
    { field: 'customerName', headerName: 'Customer', flex: 1 },
    {
      field: 'orderDate',
      headerName: 'Date',
      width: 120,
      valueFormatter: (v) => formatDate(v),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: ({ value }) => <Chip label={value} color={statusColor(value)} size="small" />,
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      valueFormatter: (v) => formatCurrency(v),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: ({ row }) => (
        <div className="flex gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {getActionLabel(row.status) && (
            <Button size="small" variant="contained" onClick={() => advanceStatus(row)}>
              {getActionLabel(row.status)}
            </Button>
          )}
          {!['Fully Delivered', 'Cancelled'].includes(row.status) && (
            <Button size="small" color="error" variant="outlined" onClick={() => handleCancel(row)}>
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Sales Orders</h2>
          <p className="page-subtitle">Create, confirm, and deliver sales orders</p>
        </div>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          New Sales Order
        </Button>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataGrid
          rows={data.salesOrders}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          onRowClick={(params) => navigate(`/sales-orders/${params.row.id}`)}
          sx={{
            '& .MuiDataGrid-row': { cursor: 'pointer' },
          }}
        />
      </div>

      <Dialog open={showForm} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle>Create Sales Order</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt--2">
            <EntityAutocomplete
              label="Customer"
              options={data.customers}
              value={customerId}
              onChange={setCustomerId}
              onCreate={handleCreateCustomer}
            />
            <div>
              <h4 className="text-sm font-semibold mb-2">Line Items</h4>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <TextField
                    select
                    size="small"
                    label="Product"
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                    sx={{ flex: 2 }}
                  >
                    <MenuItem value="">Select product</MenuItem>
                    {finishedGoods.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="number"
                    size="small"
                    label="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    inputProps={{ min: 1 }}
                    sx={{ width: 100 }}
                  />
                  <Button size="small" color="error" onClick={() => handleRemoveLine(idx)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              <Button size="small" variant="outlined" startIcon={<Plus size={14} />} onClick={handleAddLine}>
                Add Line
              </Button>
            </div>
            <p className="font-semibold">Total: {formatCurrency(calcTotal(items))}</p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Order</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(procurementAlert)}
        autoHideDuration={6000}
        onClose={() => setProcurementAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          icon={<AlertTriangle size={20} />}
          onClose={() => setProcurementAlert(null)}
        >
          Stock shortage detected — Auto-created{' '}
          {procurementAlert?.type === 'MANUFACTURING_ORDER' ? 'Manufacturing Order' : 'Purchase Order'}{' '}
          {procurementAlert?.order?.id} for {procurementAlert?.shortageQty} units of{' '}
          {procurementAlert?.productName}
        </Alert>
      </Snackbar>
    </div>
  );
}
