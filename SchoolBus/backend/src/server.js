import express from 'express';
import cors from 'cors';
import loginRouters from './routes/loginRouters.js';
import registerRouters from './routes/registerRouters.js';
import dashboardRouters from './routes/dashboardRouters.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check route
app.get('/schoolbus/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth Routes
app.use("/schoolbus/auth", loginRouters);
app.use("/schoolbus/auth", registerRouters);

// Dashboard or other routes can be added here
app.use('/schoolbus/dashboard', dashboardRouters);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Đã xảy ra lỗi server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/schoolbus/health`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
}

startServer();
