import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { DataGrid } from '@mui/x-data-grid';
import { Plus } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useAuth } from '../context/AuthContext';
import * as productApi from '../api/productApi';
import { mapProductToApi } from '../api/mappers';
import StockChip from '../components/common/StockChip';
import { canWriteProducts, formatCurrency, showError } from '../utils/helpers';

const emptyProduct = {
  name: '',
  sku: '',
  type: 'Finished Good',
  typeRaw: 'FINISHED_GOOD',
  salesPrice: 0,
  costPrice: 0,
  onHand: 0,
  procurementStrategy: 'MTS',
  procureOnDemand: false,
  procurementType: '',
  defaultVendorId: '',
};

export default function Products() {
  const { data, updateData, addAuditLog, refreshProducts } = useERP();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });

  const canWrite = canWriteProducts(user?.role);

  const resetForm = () => {
    setForm({ ...emptyProduct });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      ...product,
      typeRaw: product.type === 'Raw Material' ? 'RAW_MATERIAL' : 'FINISHED_GOOD',
      defaultVendorId: product.defaultVendorId ?? '',
      procurementType: product.procurementType ?? '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku) {
      alert('Name and SKU are required');
      return;
    }
    try {
      const payload = mapProductToApi(form);
      if (editingId) {
        await productApi.updateProduct(editingId, payload);
      } else {
        await productApi.createProduct(payload);
      }
      await refreshProducts();
      addAuditLog();
      resetForm();
    } catch (err) {
      showError(err, 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productApi.deleteProduct(id);
      updateData('products', (prev) => prev.filter((p) => p.id !== id));
      addAuditLog();
    } catch (err) {
      showError(err, 'Failed to delete product');
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'sku', headerName: 'SKU', width: 110 },
    { field: 'type', headerName: 'Type', width: 130 },
    {
      field: 'salesPrice',
      headerName: 'Sales Price',
      width: 120,
      valueFormatter: (v) => formatCurrency(v),
    },
    {
      field: 'costPrice',
      headerName: 'Cost Price',
      width: 120,
      valueFormatter: (v) => formatCurrency(v),
    },
    {
      field: 'onHand',
      headerName: 'On Hand',
      width: 100,
      renderCell: ({ row }) => <StockChip qty={row.onHand} label="On Hand" />,
    },
    { field: 'reserved', headerName: 'Reserved', width: 100 },
    {
      field: 'freeToUse',
      headerName: 'Free to Use',
      width: 130,
      renderCell: ({ row }) => <StockChip qty={row.freeToUse} label="Free" />,
    },
    {
      field: 'procurementStrategy',
      headerName: 'Strategy',
      width: 90,
    },
    ...(canWrite
      ? [
          {
            field: 'actions',
            headerName: 'Actions',
            width: 160,
            sortable: false,
            renderCell: ({ row }) => (
              <div className="flex gap-1">
                <Button size="small" variant="outlined" onClick={() => handleEdit(row)}>
                  Edit
                </Button>
                <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(row.id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p className="page-subtitle">
            {canWrite ? 'Manage product catalog' : 'View product catalog (read-only)'}
          </p>
        </div>
        {canWrite && (
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
            New Product
          </Button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <DataGrid
          rows={data.products}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </div>

      <Dialog open={showForm && canWrite} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Product' : 'Create Product'}</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <TextField label="Name" size="small" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="SKU" size="small" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <TextField
              select
              label="Type"
              size="small"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                  typeRaw: e.target.value === 'Raw Material' ? 'RAW_MATERIAL' : 'FINISHED_GOOD',
                })
              }
            >
              <MenuItem value="Finished Good">Finished Good</MenuItem>
              <MenuItem value="Raw Material">Raw Material</MenuItem>
            </TextField>
            <TextField
              type="number"
              label="Sales Price"
              size="small"
              value={form.salesPrice}
              onChange={(e) => setForm({ ...form, salesPrice: e.target.value })}
            />
            <TextField
              type="number"
              label="Cost Price"
              size="small"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            />
            {!editingId && (
              <TextField
                type="number"
                label="Initial Stock"
                size="small"
                value={form.onHand}
                onChange={(e) => setForm({ ...form, onHand: e.target.value })}
              />
            )}
            <TextField
              select
              label="Procurement Strategy"
              size="small"
              value={form.procurementStrategy}
              onChange={(e) => setForm({ ...form, procurementStrategy: e.target.value })}
            >
              <MenuItem value="MTS">MTS (Make to Stock)</MenuItem>
              <MenuItem value="MTO">MTO (Make to Order)</MenuItem>
            </TextField>
            <TextField
              select
              label="Procurement Type"
              size="small"
              value={form.procurementType || ''}
              onChange={(e) => setForm({ ...form, procurementType: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="PURCHASE">Purchase</MenuItem>
              <MenuItem value="MANUFACTURING">Manufacturing</MenuItem>
            </TextField>
            <TextField
              select
              label="Default Vendor"
              size="small"
              value={form.defaultVendorId || ''}
              onChange={(e) => setForm({ ...form, defaultVendorId: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {data.vendors.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.procureOnDemand}
                  onChange={(e) => setForm({ ...form, procureOnDemand: e.target.checked })}
                />
              }
              label="Procure on Demand"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
