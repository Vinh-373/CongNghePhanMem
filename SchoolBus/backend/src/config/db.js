// src/config/db.js
import mysql from 'mysql2/promise';

// Export named 'connectDB' để match import ở server.js
export const connectDB = async () => {
  let pool;  // Biến để lưu pool, tránh kết nối nhiều lần
  try {
    if (!pool) {  // Chỉ tạo pool lần đầu
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.DB_NAME || 'schoolbus',
        port: process.env.MYSQL_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 20,  // Tăng cho hỗ trợ 300 xe (từ yêu cầu SSB)
        queueLimit: 0,
        charset: 'utf8mb4'  // Hỗ trợ tiếng Việt
      });
    }

    // Kiểm tra kết nối (ping)
    const connection = await pool.getConnection();
    const [result] = await connection.execute('SELECT 1 as ping');
    if (result[0].ping !== 1) throw new Error('Ping failed');
    connection.release();

    console.log('✅ MySQL connected successfully to:', process.env.DB_NAME);
    return pool;  // Trả về pool để dùng ở routes
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    if (pool) pool.end();  // Đóng pool nếu lỗi
    process.exit(1);
  }
};