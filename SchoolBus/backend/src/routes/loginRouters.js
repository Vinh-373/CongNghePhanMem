import express from 'express';
import { loginUser } from '../controllers/loginControllers.js';

const router = express.Router();

/**
 * @route POST /schoolbus/auth/login
 * @description Đăng nhập người dùng
 * @body {string} email - Email của người dùng
 * @body {string} password - Mật khẩu của người dùng
 * @returns {object} Thông tin người dùng và token
 */
router.post('/login', loginUser);

export default router;