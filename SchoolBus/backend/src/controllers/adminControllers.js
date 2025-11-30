import { NguoiDung, PhuHuynh, HocSinh, DiemDung, XeBuyt, TuyenDuong, TaiXe, LichChuyen, DangKyDiemDon, ViTriXe } from "../models/index.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

// --- Lấy toàn bộ học sinh ---
export const getAllStudents = async (req, res) => {
    try {
        const students = await HocSinh.findAll({
            attributes: ['mahocsinh', 'hoten', 'lop', 'namsinh', 'gioitinh', 'anhdaidien'],
            include: [
                {
                    model: DiemDung,
                    as: 'diemDonMacDinh',
                    attributes: ['iddiemdung','tendiemdon', 'diachi'],
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
const pointIds = (jsonString) => {
    if (!jsonString) return [];
    try {
        // Chuyển đổi chuỗi JSON (ví dụ: "[1, 5, 2]") thành mảng các ID số
        const ids = JSON.parse(jsonString);
        return Array.isArray(ids) ? ids : [];
    } catch (e) {
        console.error("LỖI PARSE JSON", e, "Chuỗi gốc:", jsonString);
        return [];
    }
};

export const getAllRoutes = async (req, res) => {
    try {
        // 1. TRUY VẤN TẤT CẢ TUYẾN ĐƯỜNG
        const routes = await TuyenDuong.findAll();
        
        // 2. TÌM VÀ THU THẬP TẤT CẢ ID ĐIỂM DỪNG DUY NHẤT
        let allPointIds = new Set();
        routes.forEach(route => {
            // dsdiemdung là chuỗi JSON chứa các ID điểm dừng theo thứ tự
            const ids = pointIds(route.dsdiemdung);
            ids.forEach(id => allPointIds.add(id));
        });

        const uniquePointIds = Array.from(allPointIds);

        // 3. TRUY VẤN CHI TIẾT TẤT CẢ ĐIỂM DỪNG ĐÓ
        let pointMap = {};
        if (uniquePointIds.length > 0) {
            const pointsDetail = await DiemDung.findAll({
                where: {
                    // Giả định cột ID của DiemDung là iddiemsung
                    iddiemdung: uniquePointIds 
                },
                // Có thể thêm attributes nếu không muốn lấy tất cả các cột
            });

            // Tạo Map { iddiemsung: {chi tiết điểm dừng} } để tra cứu nhanh
            pointMap = pointsDetail.reduce((map, point) => {
                // Giả định iddiemsung là key chính để map
                map[point.iddiemdung] = point.toJSON(); 
                return map;
            }, {});
        }

        // 4. GẮN THÔNG TIN ĐIỂM DỪNG CHI TIẾT VÀO TỪNG TUYẾN ĐƯỜNG
        const finalRoutes = routes.map(route => {
            const routeData = route.toJSON();
            const idsInRoute = pointIds(routeData.dsdiemdung);

            // Tạo một mảng chi tiết các điểm dừng theo đúng thứ tự trong idsInRoute
            const detailedPoints = idsInRoute
                .map(id => pointMap[id])
                .filter(point => point); // Lọc bỏ điểm dừng không tìm thấy (nếu có)

            routeData.diemDungDetails = detailedPoints;
            
            // Nếu bạn muốn giữ lại chuỗi JSON dsdiemdung gốc, không cần lệnh delete
            // delete routeData.dsdiemdung; 
            
            return routeData;
        });

        res.status(200).json({
            message: "Lấy toàn bộ danh sách tuyến đường thành công!",
            routes: finalRoutes // Trả về danh sách tuyến đường đã có chi tiết điểm dừng
        });
    } catch (error) {
        console.error("❌ Lỗi lấy toàn bộ danh sách tuyến đường:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi lấy danh sách tuyến đường!",
            error: error.message
        });
    }
};
// export const addRoute = async (req, res) => {
//     try {
//         const { tentuyen, dsdiemdung, mota, loaituyen, trangthai } = req.body;
//         const newRoute = await TuyenDuong.create({ tentuyen, dsdiemdung, mota, loaituyen, trangthai });
//         res.status(201).json({
//             message: "Thêm tuyến đường thành công!",
//             newRoute
//         });
//     } catch (error) {
//         console.error("❌ Lỗi thêm tuyến đường:", error);
//         res.status(500).json({
//             message: "Lỗi máy chủ khi thêm tuyến đường!",
//             error: error.message
//         });
//     }
// };
function createFullRoutePolyline(stops, steps = 30) {
    let fullRoutePolyline = [];

    // Chỉ tính toán nếu có ít nhất 2 điểm dừng
    if (stops.length < 2) {
        return "[]"; 
    }

    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];
        
        // Thêm điểm dừng hiện tại
        fullRoutePolyline.push(start); 

        // Nội suy tuyến tính (Interpolation)
        for (let j = 1; j <= steps; j++) {
            const ratio = j / steps;
            
            const lat = start.lat + (end.lat - start.lat) * ratio;
            const lng = start.lng + (end.lng - start.lng) * ratio;

            fullRoutePolyline.push({ 
                lat: parseFloat(lat.toFixed(6)), 
                lng: parseFloat(lng.toFixed(6)) 
            });
        }
    }
    
    // Đảm bảo điểm dừng cuối cùng được thêm vào
    const lastStop = stops[stops.length - 1];
    if (fullRoutePolyline.length === 0 || fullRoutePolyline[fullRoutePolyline.length - 1].lat !== lastStop.lat || fullRoutePolyline[fullRoutePolyline.length - 1].lng !== lastStop.lng) {
        fullRoutePolyline.push(lastStop);
    }

    return JSON.stringify(fullRoutePolyline); 
}

// =========================================================================
// --- CONTROLLER: addRoute ĐÃ VIẾT LẠI ---
// =========================================================================

export const addRoute = async (req, res) => {
    try {
        const { tentuyen, dsdiemdung, mota, loaituyen, trangthai } = req.body;
        
        // 1. CHUYỂN ĐỔI dsdiemdung (String JSON) thành Array ID
        let stopIds;
        try {
            stopIds = JSON.parse(dsdiemdung);
            if (!Array.isArray(stopIds) || stopIds.length < 2) {
                 return res.status(400).json({ message: "dsdiemdung phải là một mảng ID điểm dừng có ít nhất 2 phần tử." });
            }
        } catch (e) {
            return res.status(400).json({ message: "Định dạng dsdiemdung không hợp lệ (Không phải chuỗi JSON mảng)." });
        }


        // 2. TRUY VẤN TỌA ĐỘ TỪ DB THEO ĐÚNG THỨ TỰ ID
        const pointsDetail = await DiemDung.findAll({
            where: {
                // Lấy các điểm dừng có ID nằm trong mảng stopIds
                iddiemdung: stopIds 
            },
            attributes: ['vido', 'kinhdo', 'iddiemdung'],
        });

        // 3. ĐẢM BẢO TỌA ĐỘ ĐƯỢC XẾP ĐÚNG THEO THỨ TỰ stopIds
        const pointMap = pointsDetail.reduce((map, point) => {
            map[point.iddiemdung] = { 
                lat: parseFloat(point.vido), 
                lng: parseFloat(point.kinhdo) 
            }; 
            return map;
        }, {});
        
        // Tạo mảng tọa độ theo đúng thứ tự tuyến đường
        const stopsForCalculation = stopIds
            .map(id => pointMap[id])
            .filter(point => point); // Lọc bỏ nếu có ID điểm dừng không tồn tại

        if (stopsForCalculation.length !== stopIds.length) {
            console.warn(`Cảnh báo: Không tìm thấy ${stopIds.length - stopsForCalculation.length} tọa độ điểm dừng.`);
        }
        
        // 4. TÍNH TOÁN FULL ROUTE POLYLINE
        // Chuỗi JSON chứa mảng {lat, lng} chi tiết
        const fullRoutePolyline = createFullRoutePolyline(stopsForCalculation, 30);
        
        // 5. LƯU VÀO CƠ SỞ DỮ LIỆU
        // **Lưu ý:** Model TuyenDuong phải có trường `full_route_polyline` kiểu TEXT/JSON
        const newRoute = await TuyenDuong.create({ 
            tentuyen, 
            dsdiemdung, 
            mota, 
            loaituyen, 
            trangthai,
            fullroutepolyline: fullRoutePolyline // 💡 LƯU CHUỖI TỌA ĐỘ CHI TIẾT
        });
        
        res.status(201).json({
            message: "Thêm tuyến đường thành công và đã tính toán đường đi chi tiết!",
            newRoute: {
                 ...newRoute.toJSON(),
                 fullroutepolylineinfo: `Chuỗi Polyline có ${JSON.parse(fullRoutePolyline).length} tọa độ.`
            }
        });
    } catch (error) {
        console.error("❌ Lỗi thêm tuyến đường:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm tuyến đường!",
            error: error.message
        });
    }
};

export const getAllParents = async (req, res) => {
    try {
        const parents = await PhuHuynh.findAll({
            include: [{
                model: NguoiDung,
                as: 'userInfo',
                attributes: ['hoten', 'sodienthoai', 'email', 'anhdaidien', 'trangthai'],
            }]
        });
        res.status(200).json({
            message: "Lấy toàn bộ danh sách phụ huynh thành công!",
            parents
        });
    } catch (error) {
        console.error("❌ Lỗi lấy toàn bộ danh sách phụ huynh:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi lấy danh sách phụ huynh!",
            error: error.message
        });
    }
};
export const addParent = async (req, res) => {
    try {
        // Lấy dữ liệu từ body request. Mật khẩu, trạng thái, và các trường khác
        const { hoten, sodienthoai, email, diachi, matkhau, trangthai } = req.body;

        // --- BƯỚC XỬ LÝ ẢNH ĐẠI DIỆN ---
        // Lấy tên file từ req.file (do Multer cung cấp)
        // Áp dụng logic tương tự như trong hàm 'register' để tạo đường dẫn tương đối
        let anhdaidien = req.file
            ? `/uploads/avatars/${req.file.filename}` // ⬅️ Dùng đường dẫn tương đối này
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Nếu không có file, dùng ảnh mặc định

        // --- BƯỚC MÃ HÓA MẬT KHẨU (BẮT BUỘC) ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(matkhau, saltRounds);

        // --- BƯỚC KIỂM TRA EMAIL TỒN TẠI (NÊN THÊM VÀO) ---
        // Nên kiểm tra email/sđt tồn tại trước khi tạo để tránh lỗi trùng lặp/giảm tải cho DB
        const existed = await NguoiDung.findOne({ where: { email } });
        if (existed) {
            return res.status(400).json({ message: "Email này đã được đăng ký!" });
        }


        // Tạo bản ghi người dùng (NguoiDung)
        const newUser = await NguoiDung.create({
            hoten,
            sodienthoai,
            email,
            matkhau: hashedPassword,
            vaitro: 2,
            // Lưu đường dẫn ảnh đại diện đã được xử lý
            anhdaidien: anhdaidien, // ⬅️ Sử dụng biến đã được xử lý
            trangthai: trangthai || 1 // Mặc định trạng thái là Chờ duyệt (1)
        });

        // Tạo bản ghi phụ huynh (PhuHuynh) liên kết với người dùng vừa tạo
        const newParent = await PhuHuynh.create({
            diachi,
            idnguoidung: newUser.id // Lấy ID vừa tạo
        });

        // Phản hồi thành công
        res.status(201).json({
            message: "Thêm phụ huynh thành công!",
            parent: {
                ...newParent.toJSON(),
                userInfo: newUser.toJSON()
            }
        });
    } catch (error) {
        console.error("❌ Lỗi thêm phụ huynh:", error);

        // --- XỬ LÝ LỖI DUY NHẤT (SEQUELIZE) ---
        // Thêm logic xử lý lỗi trùng lặp (nếu bạn có ràng buộc UNIQUE cho email/sđt)
        if (error.name === "SequelizeUniqueConstraintError") {
            const field = error.errors[0].path;
            const value = error.errors[0].value;

            if (field === "email") {
                return res.status(400).json({ message: "Email này đã được đăng ký!" });
            } else if (field === "sodienthoai") {
                return res.status(400).json({ message: "Số điện thoại này đã được đăng ký!" });
            }
            return res.status(400).json({ message: `${field} đã tồn tại!` });
        }

        // Xử lý lỗi validation khác
        if (error.name === "SequelizeValidationError") {
            const messages = error.errors.map(e => e.message).join(", ");
            return res.status(400).json({ message: `Dữ liệu không hợp lệ: ${messages}` });
        }

        res.status(500).json({
            message: "Lỗi máy chủ khi thêm phụ huynh!",
            error: error.message
        });
    }
};
export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await TaiXe.findAll({
            include: [{
                model: NguoiDung,
                as: 'userInfo',
                attributes: ['hoten', 'sodienthoai', 'email', 'anhdaidien', 'trangthai'],
            }]
        });
        res.status(200).json({
            message: "Lấy toàn bộ danh sách tài xế thành công!",
            drivers
        });
    } catch (error) {
        console.error("❌ Lỗi lấy toàn bộ danh sách tài xế:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi lấy danh sách tài xế!",
            error: error.message
        });
    }
};
export const addDriver = async (req, res) => {
    try {
        // Lấy dữ liệu từ body request. Mật khẩu, trạng thái, và các trường khác
        const { hoten, sodienthoai, email, mabang, kinhnghiem, matkhau, trangthai } = req.body;
        let anhdaidien = req.file
            ? `/uploads/avatars/${req.file.filename}` // ⬅️ Dùng đường dẫn tương đối này
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Nếu không có file, dùng ảnh mặc định
        // --- BƯỚC MÃ HÓA MẬT KHẨU (BẮT BUỘC) ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(matkhau, saltRounds);
        // --- BƯỚC KIỂM TRA EMAIL TỒN TẠI (NÊN THÊM VÀO) ---
        // Nên kiểm tra email/sđt tồn tại trước khi tạo để tránh lỗi trùng lặp/giảm tải cho DB
        const existed = await NguoiDung.findOne({ where: { email } });
        if (existed) {
            return res.status(400).json({ message: "Email này đã được đăng ký!" });
        }
        // Tạo bản ghi người dùng (NguoiDung)
        const newUser = await NguoiDung.create({
            hoten,
            sodienthoai,
            email,
            matkhau: hashedPassword,
            vaitro: 1,
            anhdaidien: anhdaidien, // ⬅️ Sử dụng biến đã được xử lý
            trangthai: trangthai || 1 // Mặc định trạng thái là Chờ duyệt (1)
        });
        // Tạo bản ghi tài xế (TaiXe) liên kết với người dùng vừa tạo
        const newDriver = await TaiXe.create({
            mabang,
            kinhnghiem,
            idnguoidung: newUser.id // Lấy ID vừa tạo
        });
        // Phản hồi thành công
        res.status(201).json({
            message: "Thêm tài xế thành công!",
            driver: {
                ...newDriver.toJSON(),
                userInfo: newUser.toJSON()
            }
        });
    } catch (error) {
        console.error("❌ Lỗi thêm tài xế:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm tài xế!",
            error: error.message
        });
    }
};
export const getAllPickupPoints = async (req, res) => {
    try {
        const pickupPoints = await DiemDung.findAll({
            
        });
        res.status(200).json({
            message: "Lấy toàn bộ danh sách điểm đón thành công!",
            pickupPoints
        });
    } catch (error) {
        console.error("❌ Lỗi lấy toàn bộ danh sách điểm đón:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi lấy danh sách điểm đón!",
            error: error.message
        });
    }
};
export const addPickupPoint = async (req, res) => {
    try {
        const { tendiemdon, diachi, trangthai,kinhdo,vido } = req.body;
        const newPoint = await DiemDung.create({ tendiemdon, diachi, trangthai,kinhdo,vido });
        res.status(201).json({
            message: "Thêm điểm đón thành công!",
            newPoint
        });
    } catch (error) {
        console.error("❌ Lỗi thêm điểm đón:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm điểm đón!",
            error: error.message
        });
    }
};
const parseStudentIds = (jsonString) => {
    if (!jsonString) return [];
    try {
        const ids = JSON.parse(jsonString);
        return Array.isArray(ids) ? ids : [];
    } catch (e) {
        console.error("LỖI PARSE JSON", e, "Chuỗi gốc:", jsonString);
        return [];
    }
};


export const getAllSchadules = async (req, res) => {
    try {
        // --- BƯỚC 1: Truy vấn Lịch trình và các thông tin liên quan (Xe, Tài xế, Tuyến) ---
        const schedules = await LichChuyen.findAll({
            include: [
                {
                    model: XeBuyt,
                    // Bắt buộc include PK và thuộc tính bạn cần
                    attributes: ['idxebuyt', 'bienso'], 
                },
                {
                    model: TaiXe,
                    attributes: ['idtaixe'], 
                    // Dùng alias 'userInfo' theo định nghĩa của bạn
                    include: [{
                        model: NguoiDung,
                        as: 'userInfo', 
                        attributes: ['hoten', 'sodienthoai'],
                    }],
                },
                { 
                    model: TuyenDuong,
                    as: 'tuyenDuongInfo',
                    attributes: ['tentuyen'],
                }
            ],
            order: [
                ['ngaydi', 'ASC'], 
                ['giobatdau', 'ASC']
            ]
        });

        // --- BƯỚC 2 & BƯỚC 3 (Giữ nguyên logic xử lý Học sinh) ---
        let allStudentIds = new Set();
        schedules.forEach(schedule => {
            const ids = parseStudentIds(schedule.danhsachhocsinh);
            ids.forEach(id => allStudentIds.add(id));
        });
        
        const uniqueStudentIds = Array.from(allStudentIds);

        let studentMap = {};
        if (uniqueStudentIds.length > 0) {
            const studentsDetail = await HocSinh.findAll({
                where: {
                    mahocsinh: uniqueStudentIds 
                },
                attributes: ['mahocsinh', 'hoten', 'lop', 'namsinh', 'gioitinh', 'anhdaidien', 'idphuhuynh', 'iddiemdon'],
                include: [
                    {
                        model: PhuHuynh,
                        as: 'parentInfo',
                        
                        include: [{
                            model: NguoiDung,
                            as: 'userInfo',
                            attributes: ['hoten', 'sodienthoai', 'email'],
                        }]
                    },
                    {
                        model: DiemDung,
                        as: 'diemDonMacDinh',
                        attributes: ['iddiemdung','tendiemdon'],
                    }
                ]
            });

            studentMap = studentsDetail.reduce((map, student) => {
                map[student.mahocsinh] = student.toJSON(); 
                return map;
            }, {});
        }


        // --- BƯỚC 4: XỬ LÝ VÀ ÁNH XẠ DỮ LIỆU CÓ KIỂM TRA AN TOÀN ---
        const statusMap = {
            0: 'Chưa chạy', 1: 'Đang chạy', 2: 'Hoàn thành', 3: 'Hủy' 
        };

        const formattedSchedules = schedules.map(schedule => {
            
            const studentIds = parseStudentIds(schedule.danhsachhocsinh);
            const studentDetails = studentIds
                .map(id => studentMap[id]) 
                .filter(detail => detail); 
            
            // 🎯 SỬ DỤNG Optional Chaining (?.): An toàn tuyệt đối khi truy cập các đối tượng có thể là NULL
            
            
            
            // 2. Thông tin Tài Xế / Người Dùng (Dùng alias 'userInfo')
            const userInfo = schedule.taixe?.userInfo; 
            
            return {
                idlich: schedule.idlich,
                ngaydi: schedule.ngaydi,
                giobatdau: schedule.giobatdau,
                thu: schedule.thu,
                
                // Thông tin Xe
                idxebuyt: schedule.idxebuyt, 
                bienso: schedule.xebuyt?.bienso || 'N/A',
                
                // Thông tin Tài xế
                idtaixe: schedule.idtaixe,
                tentaixe: userInfo ? userInfo.hoten : 'N/A', 
                sdttaixe: userInfo ? userInfo.sodienthoai : 'N/A', 
                
                // Thông tin Tuyến
                idtuyenduong: schedule.idtuyenduong,
                tentuyen: schedule.tuyenDuongInfo ? schedule.tuyenDuongInfo.tentuyen : 'N/A', 

                
                trangthai_code: schedule.trangthai,
                trangthai_text: statusMap[schedule.trangthai] || 'Không rõ',

                // Danh sách Học sinh
                danhsachhocsinh_ids: studentIds, 
                danhsachhocsinh_chi_tiet: studentDetails, 
                tong_hocsinh: studentIds.length,
            };
        });

        // --- BƯỚC 5: Trả về dữ liệu đã được ánh xạ ---
        res.status(200).json({
            message: "Lấy toàn bộ danh sách lịch chuyến thành công!",
            schedules: formattedSchedules
        });
    } catch (error) {
        console.error("❌ Lỗi lấy toàn bộ danh sách lịch chuyến:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi lấy danh sách lịch chuyến!",
            error: error.message 
        });
    }
};
export const addSchedule = async (req, res) => {
    try {
        const { idxebuyt, idtaixe, idtuyenduong, giobatdau, ngaydi, danhsachhocsinh, trangthai } = req.body;
        const newSchedule = await LichChuyen.create({
            idxebuyt,
            idtaixe,
            idtuyenduong,
            giobatdau,
            ngaydi,
            danhsachhocsinh: danhsachhocsinh || '[]',
            trangthai: trangthai || 0
        });
        res.status(201).json({
            message: "Thêm lịch chuyến thành công!",
            schedule: newSchedule
        });
    } catch (error) {
        console.error("❌ Lỗi thêm lịch chuyến:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm lịch chuyến!",
            error: error.message
        });
    }
};
export const getAllRegisteredPickupPoints = async (req, res) => {
    try {
        const registrations = await DangKyDiemDon.findAll({
            include: [
                {
                    model: HocSinh,
                    attributes: ['mahocsinh', 'hoten', 'lop']
                },
                {
                    model: DiemDung,
                    attributes: ['iddiemdung', 'tendiemdon', 'diachi']
                },
                {
                    model: PhuHuynh,
                    include: [{
                        model: NguoiDung,
                        as: 'userInfo',
                        attributes: ['hoten', 'sodienthoai', 'email']
                    }]
                }
            ]
        });
        res.status(200).json({
            message: "Lấy toàn bộ danh sách đăng ký điểm đón thành công!",
            registrations
        });
    } catch (error) {
        console.error("❌ Lỗi lấy toàn bộ danh sách đăng ký điểm đón:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi lấy danh sách đăng ký điểm đón!",
            error: error.message
        });
    }

};
export const getInfoDashboard = async (req, res) => {
    try {
        const studentCount = await HocSinh.count();
        const driverCount   = await TaiXe.count();

        const vehicleData = await XeBuyt.findAll({
            attributes: ['idxebuyt', 'bienso', 'trangthai']
        });

        // ==============================
        // Lấy lịch chuyến hôm nay
        // ==============================
        const schaeduleTodayData = await LichChuyen.findAll({
            where: {
                ngaydi: new Date().toISOString().split('T')[0]
            },
            attributes: ['idxebuyt','idtaixe','giobatdau','idtuyenduong','ngaydi','thu','trangthai'],
            include: [
                { model: XeBuyt, attributes: ['bienso','trangthai'],
                    include: [{
                        model: ViTriXe,
                        attributes: ['kinhdo','vido'],
                    }]
                 },
                { 
                    model: TaiXe,
                    include: [{
                        model: NguoiDung,
                        as: 'userInfo',
                        attributes: ['hoten'],
                    }]
                },
                {
                    model: TuyenDuong,
                    as: 'tuyenDuongInfo',
                    attributes: ['tentuyen','dsdiemdung','loaituyen'],
                }
            ]
        });

        // ==============================
        // LẤY DANH SÁCH TẤT CẢ ID ĐIỂM DỪNG (TỪ SCHEDULE TODAY)
        // ==============================
        let allPointIds = new Set();

        schaeduleTodayData.forEach(item => {
            const route = item.tuyenDuongInfo;
            if (route?.dsdiemdung) {
                const ids = pointIds(route.dsdiemdung);
                ids.forEach(id => allPointIds.add(id));
            }
        });

        const uniquePointIds = Array.from(allPointIds);

        // ==============================
        // TRUY VẤN TẤT CẢ CHI TIẾT ĐIỂM DỪNG (TỐI ƯU)
        // ==============================
        let pointMap = {};
        if (uniquePointIds.length > 0) {
            const pointsDetail = await DiemDung.findAll({
                where: { iddiemdung: uniquePointIds }
            });

            pointMap = pointsDetail.reduce((map, point) => {
                map[point.iddiemdung] = point.toJSON();
                return map;
            }, {});
        }

        // GẮN CHI TIẾT VÀO từng route
        const finalSchedule = schaeduleTodayData.map(item => {
            const route = item.tuyenDuongInfo;
            if (route?.dsdiemdung) {
                const idsInRoute = pointIds(route.dsdiemdung);
                route.dataValues.diemDungDetails = idsInRoute
                    .map(id => pointMap[id])
                    .filter(x => x);
            }
            return item;
        });

        return res.status(200).json({
            message: "Lấy thông tin dashboard thành công!",
            data: {
                studentCount,
                driverCount,
                vehicleData,
                schaeduleTodayData: finalSchedule
            }
        });
    } catch (error) {
        console.error("❌ Lỗi lấy thông tin dashboard:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ!",
            error: error.message
        });
    }
};
