import { NguoiDung, PhuHuynh, HocSinh, DiemDung, XeBuyt, TuyenDuong } from "../models/index.js";
import fs from "fs";
import path from "path";

// --- Lấy toàn bộ học sinh ---
export const getAllStudents = async (req, res) => {
    try {
        const students = await HocSinh.findAll({
            attributes: ['mahocsinh', 'hoten', 'lop', 'namsinh', 'gioitinh', 'anhdaidien'],
            include: [
                {
                    model: DiemDung,
                    as: 'diemDonMacDinh',
                    attributes: ['tendiemdon', 'diachi'],
                    required: false
                },
                {
                    model: PhuHuynh,
                    as: 'parentInfo',
                    attributes: ['diachi'],
                    required: false,
                    include: [{
                        model: NguoiDung,
                        as: 'userInfo',
                        attributes: ['hoten', 'sodienthoai', 'email'],
                        required: false
                    }]
                }
            ]
        });

        res.status(200).json({
            message: "Lấy toàn bộ danh sách học sinh thành công!",
            count: students.length,
            students
        });
    } catch (error) {
        console.error("❌ Lỗi lấy toàn bộ danh sách học sinh:", error);
        res.status(500).json({ 
            message: "Lỗi máy chủ khi lấy danh sách học sinh!",
            error: error.message
        });
    }
};

// --- Thêm học sinh (có upload ảnh) ---
export const addStudent = async (req, res) => {
    try {
        const { hoten, lop, namsinh, gioitinh, iddiemdon, idphuhuynh } = req.body;

        // Kiểm tra file ảnh
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn ảnh đại diện!" });
        }

        // Lưu file vào thư mục uploads
        const uploadDir = path.join(process.cwd(), "src/uploads/avatars");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        const filename = Date.now() + "_" + req.file.originalname;
        const filepath = path.join(uploadDir, filename);

        fs.renameSync(req.file.path, filepath);

        // Tạo bản ghi học sinh
        const newStudent = await HocSinh.create({
            hoten,
            lop,
            namsinh,
            gioitinh,
            anhdaidien: filename,
            iddiemdon: iddiemdon || null,
            idphuhuynh: idphuhuynh || null
        });

        res.status(201).json({
            message: "Thêm học sinh thành công!",
            student: newStudent
        });
    } catch (error) {
        console.error("❌ Lỗi thêm học sinh:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm học sinh!",
            error: error.message
        });
    }
};
export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await XeBuyt.findAll();
        res.status(200).json({
            message: "Lấy toàn bộ danh sách xe thành công!",
            vehicles
        });
    } catch (error) {
        console.error("❌ Lỗi lấy toàn bộ danh sách xe:", error);
        res.status(500).json({  
            message: "Lỗi máy chủ khi lấy danh sách xe!",
            error: error.message
        });
    }   
};
export const addVehicle = async (req, res) => {
    try {
        const { bienso, soghe, hangsanxuat, loainhienlieu, trangthai } = req.body;
        
        const newVehicle = await XeBuyt.create({ bienso, soghe, hangsanxuat, loainhienlieu, trangthai });

        res.status(201).json({
            message: "Thêm xe thành công!",
            vehicle: newVehicle
        });
    } catch (error) {
        console.error("❌ Lỗi thêm xe:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm xe!",
            error: error.message
        });
    }
};
export const getAllRoutes = async (req, res) => {
    try {
        // Giả sử có model TuyếnĐường (Route) và ĐiểmDừng (Stop)
        const routes = await TuyenDuong.findAll({
            include: [{ model: DiemDung, as: 'diemDungs' }]
        });
        res.status(200).json({
            message: "Lấy toàn bộ danh sách tuyến đường thành công!",
            routes
        });
    } catch (error) {
        console.error("❌ Lỗi lấy toàn bộ danh sách tuyến đường:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi lấy danh sách tuyến đường!",
            error: error.message
        });
    }

};
