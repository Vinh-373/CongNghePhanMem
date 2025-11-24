import { TaiXe, NguoiDung } from "../models/index.js";
import sequelize from "../config/sequelize.js";
import { LichChuyen, TuyenDuong, XeBuyt, DiemDung, HocSinh } from '../models/index.js';
import { Op, Sequelize } from 'sequelize'; // Import Op và Sequelize

/**
 * @desc Lấy thông tin chi tiết của tài xế theo idtaixe
 * @route GET /api/taixe/:idtaixe
 * @access Public/Private
 */
// Controller lấy thông tin 1 tài xế
export const getDriverById = async (req, res) => {
    const driverId = req.params.idtaixe;

    try {
        // QUERY Sequelize
        const driverInfo = await TaiXe.findByPk(driverId, {
            attributes: ["idtaixe", "mabang", "kinhnghiem"],

            include: [
                {
                    model: NguoiDung,          // JOIN bảng nguoidung
                    as: "userInfo",
                    attributes: ["hoten", "sodienthoai", "email"],
                }
            ]
        });

        // Không tìm thấy dữ liệu
        if (!driverInfo) {
            return res.status(404).json({
                message: `Không tìm thấy thông tin tài xế với ID ${driverId}.`
            });
        }

        // Thành công
        return res.status(200).json({
            message: "Lấy thông tin tài xế thành công!",
            driver: driverInfo
        });

    } catch (error) {
        console.error("❌ Lỗi lấy thông tin tài xế:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi lấy thông tin tài xế!",
            error: error.message
        });
    }
};

// Controller lấy id tài xế theo idnguoidung
export const getDriverIdByUserId = async (req, res) => {
    // Lấy idnguoidung từ tham số (parameter) của route
    const userId = req.params.idnguoidung;

    try {
        // QUERY Sequelize: Tìm một bản ghi TaiXe dựa trên idnguoidung
        const driver = await TaiXe.findOne({
            // Điều kiện tìm kiếm
            where: { idnguoidung: userId },
            // Chỉ lấy trường idtaixe
            attributes: ["idtaixe"],
        });

        // 1. Xử lý không tìm thấy
        if (!driver) {
            return res.status(404).json({
                message: `Không tìm thấy tài xế liên kết với ID người dùng ${userId}.`
            });
        }

        // 2. Thành công
        return res.status(200).json({
            message: "Lấy idtaixe thành công!",
            idtaixe: driver.idtaixe // Trả về giá trị của trường idtaixe
        });

    } catch (error) {
        console.error("❌ Lỗi lấy idtaixe theo idnguoidung:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi lấy idtaixe!",
            error: error.message
        });
    }
};


// Controller cập nhật thông tin tài xế và người dùng (đa bảng)
export const updateDriver = async (req, res) => {
    const idtaixe = req.params.idtaixe;

    const {
        hoten, email, sodienthoai,
        kinhnghiem, mabang,
        idnguoidung
    } = req.body;

    // Kiểm tra cơ bản
    if (!idnguoidung || !idtaixe) {
        return res.status(400).json({
            message: "Thiếu ID người dùng hoặc ID tài xế để cập nhật."
        });
    }

    const transaction = await sequelize.transaction();

    try {
        // ===============================================
        // BƯỚC 1: KIỂM TRA TỒN TẠI VÀ CẬP NHẬT NguoiDung
        // ===============================================

        // 1.1 Tìm kiếm NguoiDung để đảm bảo ID tồn tại
        const user = await NguoiDung.findByPk(idnguoidung, { transaction });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({
                message: `Không tìm thấy ID người dùng ${idnguoidung} để cập nhật. (NguoiDung)`
            });
        }

        // 1.2 Cập nhật NguoiDung. 
        // Dùng user.update() trên instance không cần trả về rowsAffected
        await user.update(
            { hoten, email, sodienthoai },
            { transaction }
        );


        // ===============================================
        // BƯỚC 2: KIỂM TRA TỒN TẠI VÀ CẬP NHẬT TaiXe
        // ===============================================

        // 2.1 Tìm kiếm TaiXe để đảm bảo ID tồn tại
        const driver = await TaiXe.findByPk(idtaixe, { transaction });

        if (!driver) {
            await transaction.rollback();
            return res.status(404).json({
                message: `Không tìm thấy tài xế với ID: ${idtaixe} để cập nhật. (TaiXe)`
            });
        }

        // 2.2 Cập nhật TaiXe.
        await driver.update(
            { kinhnghiem, mabang },
            { transaction }
        );

        // Commit transaction nếu cả hai bước tìm kiếm/cập nhật không gặp lỗi
        await transaction.commit();

        res.status(200).json({
            message: "Cập nhật thông tin tài xế và cá nhân thành công!"
        });

    } catch (error) {
        await transaction.rollback();
        console.error("❌ Lỗi cập nhật Tài xế (đa bảng):", error);

        // Xử lý lỗi ràng buộc UNIQUE (409)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: "Email hoặc Số điện thoại đã được sử dụng bởi người dùng khác.",
                fields: error.errors.map(e => e.path)
            });
        }

        // Lỗi máy chủ chung (500)
        res.status(500).json({
            message: "Lỗi máy chủ trong quá trình cập nhật.",
            error: error.message
        });
    }
};


const STATUS_MAP = {
    0: 'Chưa chạy',
    1: 'Đang chạy',
    2: 'Hoàn thành',
    3: 'Trễ',
};

// Hàm tiện ích: Chuyển đổi số ngày (1-7) sang tên Thứ trong tiếng Việt
// Giả định DAYOFWEEK() trả về 1 (Chủ Nhật) đến 7 (Thứ Bảy)
const mapDayNumberToVietnamese = (dayNumber) => {
    switch (dayNumber) {
        case 1: return 'Chủ Nhật';
        case 2: return 'Thứ Hai';
        case 3: return 'Thứ Ba';
        case 4: return 'Thứ Tư';
        case 5: return 'Thứ Năm';
        case 6: return 'Thứ Sáu';
        case 7: return 'Thứ Bảy';
        default: return 'Không xác định';
    }
};

export const getWeeklySchedule = async (req, res) => {
    const idtaixe = req.params.idtaixe;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekLater = new Date();
    oneWeekLater.setDate(today.getDate() + 7);
    oneWeekLater.setHours(23, 59, 59, 999);

    try {
        const schedule = await LichChuyen.findAll({
            where: {
                idtaixe,
                ngaydi: { [Op.between]: [today, oneWeekLater] },
            },
            attributes: [
                "idlich",
                "ngaydi",
                "giobatdau",
                "danhsachhocsinh",
                "trangthai",
                [Sequelize.fn("DAYOFWEEK", Sequelize.col("ngaydi")), "thu"],
            ],
            include: [
                {
                    model: TuyenDuong,
                    as: "tuyenDuongInfo",
                    attributes: [
                        "tentuyen",
                        "idtuyenduong",
                        "loaituyen",
                        "dsdiemdung", // danh sách điểm dừng
                    ],
                    required: true,
                },
                {
                    model: XeBuyt,
                    as: "busInfo",
                    attributes: ["bienso"],
                    required: true,
                }
            ],
            order: [
                ["ngaydi", "ASC"],
                ["giobatdau", "ASC"]
            ]
        });

        if (!schedule.length) {
            return res.status(200).json({
                message: "Không có lịch trình nào trong 7 ngày tới.",
                schedule: []
            });
        }

        const formattedSchedule = schedule.map(item => {
            const hs = item.danhsachhocsinh ? JSON.parse(item.danhsachhocsinh) : [];
            const routeInfo = item.tuyenDuongInfo;

            // Parse danh sách điểm dừng và đếm
            let dsDiemDung = [];
            let soDiemDung = 0;
            if (routeInfo?.dsdiemdung) {
                try {
                    dsDiemDung = JSON.parse(routeInfo.dsdiemdung);
                    soDiemDung = Array.isArray(dsDiemDung) ? dsDiemDung.length : 0;
                } catch (e) {
                    console.warn("❌ Lỗi parse dsdiemdung:", e);
                }
            }
            const soLuongHocSinh = Array.isArray(hs) ? hs.length : 0;


            return {
                idlich: item.idlich,
                ngay: item.ngaydi,
                thu: mapDayNumberToVietnamese(item.dataValues.thu),
                tenTuyen: routeInfo?.tentuyen,
                loaituyen: routeInfo?.loaituyen,
                gioBatDau: item.giobatdau,
                bienSoXe: item.busInfo?.bienso,
                soDiemDung,        // số điểm dừng tính từ dsdiemdung
                trangThai: STATUS_MAP[item.trangthai] || "Không xác định",
                soLuongHocSinh,    // số học sinh tính từ danhsachhocsinh
            };
        });

        return res.status(200).json({
            message: "Lấy lịch trình hàng tuần thành công!",
            schedule: formattedSchedule,
        });

    } catch (error) {
        console.error("❌ Lỗi lấy lịch trình:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi lấy lịch trình!",
            error: error.message,
        });
    }
};
