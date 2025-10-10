import express from 'express';
import { registerUser } from '../controllers/registerControllers.js';

const router = express.Router();

/**
 * @route POST /schoolbus/auth/register
 * @description Đăng ký tài khoản mới
 * @body {string} email - Email của người dùng
 * @body {string} username - Tên người dùng
 * @body {string} password - Mật khẩu của người dùng
 * @returns {object} Thông tin người dùng đã đăng ký
 */
router.post('/register', registerUser);

export default router;