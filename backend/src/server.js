const app = require('./app');
const env = require('./config/env');

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Shiv Furniture Works ERP API running on port ${PORT}`);
});
