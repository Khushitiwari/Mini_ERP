import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Plus } from 'lucide-react';

const ADD_NEW_OPTION = { id: '__add_new__', name: '+ Add New' };

export default function EntityAutocomplete({
  label,
  options,
  value,
  onChange,
  onCreate,
  createFields = ['name', 'email', 'phone', 'address'],
  disabled = false,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const allOptions = [...options, ADD_NEW_OPTION];
  const selected = options.find((o) => o.id === value) ?? null;

  const handleSelect = (_, option) => {
    if (!option) {
      onChange('');
      return;
    }
    if (option.id === ADD_NEW_OPTION.id) {
      setForm({ name: '', email: '', phone: '', address: '' });
      setDialogOpen(true);
      return;
    }
    onChange(option.id);
  };

  const handleCreate = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      const payload = {};
      createFields.forEach((f) => {
        if (form[f]) payload[f] = form[f];
      });
      const created = await onCreate(payload);
      onChange(created.id);
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Autocomplete
        options={allOptions}
        getOptionLabel={(o) => o.name ?? ''}
        value={selected}
        onChange={handleSelect}
        disabled={disabled}
        renderInput={(params) => <TextField {...params} label={label} size="small" fullWidth />}
        renderOption={(props, option) => (
          <li
            {...props}
            key={option.id}
            style={option.id === ADD_NEW_OPTION.id ? { fontWeight: 600, color: '#6366f1' } : undefined}
          >
            {option.id === ADD_NEW_OPTION.id ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Plus size={14} /> Add New
              </Box>
            ) : (
              option.name
            )}
          </li>
        )}
        isOptionEqualToValue={(a, b) => a.id === b.id}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New {label}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Name"
              required
              size="small"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {createFields.includes('email') && (
              <TextField
                label="Email"
                size="small"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            )}
            {createFields.includes('phone') && (
              <TextField
                label="Phone"
                size="small"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            )}
            {createFields.includes('address') && (
              <TextField
                label="Address"
                size="small"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.name?.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
