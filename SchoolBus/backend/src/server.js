import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRouters.js';
import userRoutes from './routes/userRouters.js';
import adminRoutes from './routes/adminRouters.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();

// 🧩 Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // URL frontend (Vite React)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Cho phép truy cập thư mục upload ảnh
app.use("/uploads", express.static("src/uploads"));

// ✅ Health check
app.get('/schoolbus/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// ✅ Auth routes
app.use("/schoolbus/auth", authRoutes);

app.use("/schoolbus/user", userRoutes);
app.use("/schoolbus/admin", adminRoutes); 

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Đã xảy ra lỗi server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Start server
async function startServer() {
  try {
    await connectDB();
    console.log('✅ MySQL connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/schoolbus/health`);
      console.log(`🖼️  Static uploads: http://localhost:${PORT}/uploads/avatars/...`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
}

startServer();
