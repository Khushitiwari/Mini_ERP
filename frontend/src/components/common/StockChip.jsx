import Chip from '@mui/material/Chip';

const LOW_THRESHOLD = 10;

export default function StockChip({ qty, label }) {
  const n = Number(qty) || 0;
  let color = 'success';
  if (n <= 0) color = 'error';
  else if (n <= LOW_THRESHOLD) color = 'warning';

  return <Chip label={`${label}: ${n}`} color={color} size="small" variant="outlined" />;
}
