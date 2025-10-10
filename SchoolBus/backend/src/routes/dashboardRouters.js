import express from 'express';
import { getDashboardInfo }  from '../controllers/dashboardControllers.js';
const router = express.Router();
/**
 * @route GET /schoolbus/dashboard
 * @description Lấy thông tin tổng quan cho dashboard
 *  @returns {object} Thông tin tổng quan
 /** */
router.get('/',getDashboardInfo);
export default router;