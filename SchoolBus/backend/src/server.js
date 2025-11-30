import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRouters.js';
import userRoutes from './routes/userRouters.js';
import adminRoutes from './routes/adminRouters.js';
import driverRoutes from './routes/driverRoutes.js';

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

// ✅ Routes
app.use("/schoolbus/auth", authRoutes);
app.use("/schoolbus/driver", driverRoutes);
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

// ✅ Start server với WebSocket
async function startServer() {
  try {
    await connectDB();
    console.log('✅ MySQL connected successfully');

    // Tạo HTTP server từ Express app
    const httpServer = createServer(app);

    // Tạo Socket.io server
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    // Lắng nghe kết nối WebSocket
    // Trong socket.js hoặc server.js
io.on('connection', (socket) => {
    console.log('Driver connected:', socket.id);
    
    // Lắng nghe event từ Driver
    socket.on('vehiclePositionUpdated', (data) => {
        console.log('📡 Nhận vị trí xe:', data);
        // Broadcast cho tất cả Admin
        io.emit('vehiclePositionUpdated', data);
    });
    
    socket.on('tripStatusChanged', (data) => {
        console.log('🚦 Trạng thái chuyến thay đổi:', data);
        io.emit('tripStatusChanged', data);
    });
});

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/schoolbus/health`);
      console.log(`🖼️  Static uploads: http://localhost:${PORT}/uploads/avatars/...`);
    });

  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
}

startServer();
