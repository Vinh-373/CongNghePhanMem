import { TaiXe, NguoiDung } from "../models/index.js";

/**
 * @desc Lấy thông tin chi tiết của tài xế theo idtaixe
 * @route GET /api/taixe/:idtaixe
 * @access Public/Private
 */
export const getDriverById = async (req, res) => {
    const driverId = req.params.idtaixe;

    try {
        // QUERY Sequelize
        const driverInfo = await TaiXe.findByPk(driverId, {
            attributes: ["idtaixe", "mabang", "kinhnghiem"],

            include: [
                {
                    model: NguoiDung,          // JOIN bảng nguoidung
                    // alias KHÔNG DÙNG vì bạn chưa tạo alias trong association
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
