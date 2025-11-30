import { TaiXe, NguoiDung } from "../models/index.js";
import sequelize from "../config/sequelize.js";
import { LichChuyen, TuyenDuong, XeBuyt, DiemDung, HocSinh, TrangThaiDonTra, ViTriXe } from '../models/index.js';
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
const pointIds = (jsonString) => {
    if (!jsonString) return [];
    try {
        const ids = JSON.parse(jsonString);
        return Array.isArray(ids) ? ids.filter(Number.isFinite) : [];
    } catch (e) {
        console.error("LỖI PARSE JSON", e, "Chuỗi gốc:", jsonString);
        return [];
    }
};

const parseStudentIds = (jsonString) => {
    if (!jsonString) return [];
    try {
        const ids = JSON.parse(jsonString);
        return Array.isArray(ids) ? ids.filter(Number.isFinite) : [];
    } catch (e) {
        console.error("LỖI PARSE JSON", e, "Chuỗi gốc:", jsonString);
        return [];
    }
};

export const getCurrentTrip = async (req, res) => {
    const idtaixe = req.params.idtaixe;
    // Đảm bảo Op được khai báo hoặc import từ ORM
    // const { Op } = require('sequelize'); 
    const today = new Date();
    
    try {
        // 1. TRUY VẤN TẤT CẢ CHUYẾN ĐI TRONG NGÀY
        const tripsToday = await LichChuyen.findAll({
            where: {
                idtaixe,
                ngaydi: { [Op.eq]: today.toISOString().split('T')[0] } 
            },
            include: [
                {
                    model: TuyenDuong,
                    as: "tuyenDuongInfo",
                    attributes: ["tentuyen", "loaituyen", "dsdiemdung", "fullroutepolyline"],
                    required: true,
                },
                {
                    model: XeBuyt,
                   
                    include: [
                        {
                            model: ViTriXe,
                            attributes: ["kinhdo", "vido"],
                            required: false,
                        }
                    ],
                    attributes: ["bienso"],
                    required: true,
                }
            ],

        });

        const tripIds = tripsToday.map(trip => trip.idlich);
        
        // Thoát sớm nếu không tìm thấy chuyến đi
        if (tripsToday.length === 0) {
            return res.status(200).json({
                message: "Không tìm thấy chuyến đi nào trong ngày!",
                tripsToday: [],
            });
        }

        // =======================================================
        // 2. TẬP HỢP TẤT CẢ ID DUY NHẤT CỦA ĐIỂM DỪNG VÀ HỌC SINH
        // =======================================================

        let allPointIds = new Set();
        let allStudentIds = new Set();
        
        tripsToday.forEach(trip => {
            const tripData = trip.toJSON();
            
            // a. Điểm dừng
            const dsdiemdungString = tripData.tuyenDuongInfo?.dsdiemdung;
            if (dsdiemdungString) {
                const pIds = pointIds(dsdiemdungString);
                pIds.forEach(id => allPointIds.add(id));
            }

            // b. Học sinh
            const studentIdsString = tripData.danhsachhocsinh;
            if (studentIdsString) {
                const sIds = parseStudentIds(studentIdsString);
                sIds.forEach(id => allStudentIds.add(id));
            }
        });

        const uniquePointIds = Array.from(allPointIds);
        const uniqueStudentIds = Array.from(allStudentIds);
        
        // =======================================================
        // 3. TRUY VẤN CHI TIẾT DỮ LIỆU CHUNG (Batch Queries)
        // =======================================================

        let pointMap = {};
        let studentMap = {};
        let statusMap = {};
        
        // a. Chi tiết Điểm dừng
        if (uniquePointIds.length > 0) {
            const pointsDetail = await DiemDung.findAll({
                where: { iddiemdung: uniquePointIds },
            });
            pointMap = pointsDetail.reduce((map, point) => {
                map[point.iddiemdung] = point.toJSON(); 
                return map;
            }, {});
        }

        // b. Chi tiết Học sinh
        if (uniqueStudentIds.length > 0) {
            const studentsDetail = await HocSinh.findAll({
                where: { mahocsinh: uniqueStudentIds }, // Giả định mahocsinh là khóa chính
            });
            studentMap = studentsDetail.reduce((map, student) => {
                map[student.mahocsinh] = student.toJSON(); 
                return map;
            }, {});
        }

        // c. Trạng thái Đón Trả 🆕
        if (tripIds.length > 0 && uniqueStudentIds.length > 0) {
            const statusDetails = await TrangThaiDonTra.findAll({ // Sử dụng Model TrangThaiDonTra

                where: {
                    idlich: tripIds,
                    idhocsinh: uniqueStudentIds // Giả định idhocsinh trong TrangThaiDonTra tương đương mahocsinh
                },
                
                // Có thể thêm order: [['createdAt', 'DESC']] để lấy trạng thái mới nhất
            });
            statusMap = statusDetails.reduce((map, status) => {
                // Key kết hợp: 'idlich-idhocsinh'
                const key = `${status.idlich}-${status.idhocsinh}`;
                map[key] = status.toJSON(); 
                return map;
            }, {});
        }

        // =======================================================
        // 4. GẮN THÔNG TIN CHI TIẾT VÀO TỪNG CHUYẾN ĐI
        // =======================================================

        const finalTrips = tripsToday.map(trip => {
            const tripData = trip.toJSON();
            const routeData = tripData.tuyenDuongInfo;

            // 4.1 Gắn chi tiết Điểm dừng
            if (routeData && routeData.dsdiemdung) {
                const idsInRoute = pointIds(routeData.dsdiemdung);
                const detailedPoints = idsInRoute
                    .map(id => pointMap[id])
                    .filter(point => point); 
                routeData.diemDungDetails = detailedPoints;
            }

            // 4.2 Gắn chi tiết Học sinh và Trạng thái 🆕
            if (tripData.danhsachhocsinh) {
                const idsInTrip = parseStudentIds(tripData.danhsachhocsinh);

                const detailedStudents = idsInTrip
                    .map(id => {
                        const student = studentMap[id];
                        if (student) {
                            // a. Gắn Trạng thái Đón Trả (Tra cứu bằng idlich và idhocsinh)
                            const statusKey = `${tripData.idlich}-${id}`;
                            const studentStatus = statusMap[statusKey] || {
                                loaitrangthai: -1, // Đặt -1 hoặc 0 làm giá trị mặc định/chưa cập nhật
                                dangcho: 0,
                                lenxe: 0,
                                dennoi: 0,
                                trasan: 0,
                                vang: 0
                            }; 
                            student.trangThaiDonTra = studentStatus;
                            
                            // b. (Tùy chọn) Gắn chi tiết Điểm Đón của học sinh (nếu cần)
                            // const diemDonId = student.iddiemdon;
                            // if(diemDonId && pointMap[diemDonId]) {
                            //     student.diemDonDetail = pointMap[diemDonId];
                            // }
                        }
                        return student;
                    })
                    .filter(student => student);

                tripData.studentDetails = detailedStudents;
                
                // Tùy chọn: Xóa chuỗi JSON ID nếu không cần thiết
                // delete routeData.dsdiemdung; 
                // delete tripData.danhsachhocsinh;
            }
            
            return tripData;
        });

        // 5. TRẢ VỀ KẾT QUẢ
        return res.status(200).json({
            message: "Lấy thông tin chuyến đi trong ngày của tài xế thành công!",
            tripsToday: finalTrips,
        });
        
    } catch (error) {
        console.error("❌ Lỗi lấy thông tin chuyến đi trong ngày:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi lấy thông tin chuyến đi!",
            error: error.message,
        });
    }
};
export const putStudentStatus = async (req, res) => {
    const { idlich, idhocsinh, loaitrangthai} = req.body;
    try {
        const [status, created] = await TrangThaiDonTra.findOrCreate({
            where: { idlich, idhocsinh },
            
        });
        status.loaitrangthai = loaitrangthai;
        await status.save();
        return res.status(200).json({
            message: created ? "Tạo trạng thái đón/trả thành công!" : "Cập nhật trạng thái đón/trả thành công!",
            status,
        });
    } catch (error) {
        console.error("❌ Lỗi cập nhật trạng thái đón/trả:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật trạng thái đón/trả!",
            error: error.message,
        });
    }
};
export const putTripStatus = async (req, res) => {
    const { idlich, trangthai} = req.body;
    try {
        const trip = await LichChuyen.findByPk(idlich);
        if (!trip) {
            return res.status(404).json({
                message: `Không tìm thấy chuyến đi với ID: ${idlich}.`
            });
        }
        trip.trangthai = trangthai;
        await trip.save();
        return res.status(200).json({   
            message: "Cập nhật trạng thái chuyến đi thành công!",
            trip,
        });
    } catch (error) {
        console.error("❌ Lỗi cập nhật trạng thái chuyến đi:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật trạng thái chuyến đi!",
            error: error.message,
        });
    }

};
export const updateDriverLocation = async (req, res) => {
    const { idxebuyt, kinhdo, vido } = req.body;
    try {
        let vehicleLocation = await ViTriXe.findOne({ where: { idxebuyt } });
        if (vehicleLocation) {
            vehicleLocation.kinhdo = kinhdo;
            vehicleLocation.vido = vido;
            await vehicleLocation.save();
        } else {
            vehicleLocation = await ViTriXe.create({ idxebuyt, kinhdo, vido });
        }
        return res.status(200).json({
            message: "Cập nhật vị trí xe thành công!",
            vehicleLocation,
        });
    }
    catch (error) {
        console.error("❌ Lỗi cập nhật vị trí xe:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật vị trí xe!",
            error: error.message,
        });
    }
};