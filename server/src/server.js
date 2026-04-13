import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from '../config/db.js';
import authRoutes from '../routes/authRoutes.js';
import messageRoutes from '../routes/messageRoutes.js';
import userRoutes from '../routes/userRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// For Vercel serverless export
export { app };

// Only start server in non-Vercel environments (local dev)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
