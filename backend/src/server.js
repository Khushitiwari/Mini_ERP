import app from './app.js';
import env from './config/env.js';

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Shiv Furniture Works ERP API running on port ${PORT}`);
});
