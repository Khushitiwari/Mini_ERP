import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Shiv Furniture ERP API is running' });
});

app.use('/api', routes);
app.use(errorHandler);

export default app;
