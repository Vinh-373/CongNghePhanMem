// src/config/sequelize.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'schoolbus',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      freezeTableName: true,  // Không tự thêm 's' vào tên bảng
      timestamps: false       // Tắt tự tạo createdAt/updatedAt
    },
    dialectOptions: {
      charset: 'utf8mb4',
    }
  }
);

export default sequelize;
