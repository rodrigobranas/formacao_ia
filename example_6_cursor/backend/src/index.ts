import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health';
import weatherRoutes from './routes/weather';
import { HttpError } from './types/http-error';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRoutes);
app.use('/weather', weatherRoutes);

app.use((err: Error, _req: Request, res: Response, _next: unknown) => {
  console.error(err.stack);
  const statusCode = err instanceof HttpError ? err.statusCode : 500;

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Something went wrong!' : err.message,
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
