import { NguoiDung, PhuHuynh, HocSinh, DiemDung, XeBuyt, TuyenDuong, TaiXe, LichChuyen, DangKyDiemDon, ViTriXe, ThongBao } from "../models/index.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { where, Op } from "sequelize";

// --- Lấy toàn bộ học sinh ---
export const getAllStudents = async (req, res) => {
    try {
        const students = await HocSinh.findAll({
            where:{
                status : 1,
            },
            attributes: ['mahocsinh', 'hoten', 'lop', 'namsinh', 'gioitinh', 'anhdaidien','idphuhuynh', 'iddiemdon'],
            include: [
                {
                    model: DiemDung,
                    as: 'diemDonMacDinh',
                    attributes: ['iddiemdung', 'tendiemdon', 'diachi'],
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
        const vehicles = await XeBuyt.findAll({
            where: {
                trangthai: {
                    [Op.ne]: -1
                }
            }
        });
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
export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;  // Lấy ID từ URL
        const { bienso, soghe, hangsanxuat, loainhienlieu, trangthai } = req.body;

        // 1) Tìm xe theo ID
        const vehicle = await XeBuyt.findByPk(id);  // Sequelize

        if (!vehicle) {
            return res.status(404).json({
                message: "Không tìm thấy xe để cập nhật!"
            });
        }

        // 2) Cập nhật dữ liệu
        await vehicle.update({ bienso, soghe, hangsanxuat, loainhienlieu, trangthai });

        // 3) Trả về kết quả thành công
        return res.status(200).json({
            message: "Cập nhật xe thành công!",
            updatedVehicle: vehicle
        });

    } catch (error) {
        console.error("❌ Lỗi cập nhật xe:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật xe!",
            error: error.message
        });
    }
};
export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        // 1) Tìm xe theo ID
        const vehicle = await XeBuyt.findByPk(id);

        if (!vehicle) {
            return res.status(404).json({
                message: "Không tìm thấy xe!"
            });
        }

        // 2) Cập nhật trạng thái thành -1 (xóa mềm)
        vehicle.trangthai = -1;
        await vehicle.save();

        // 3) Trả về thành công
        return res.status(200).json({
            message: "Đã cập nhật trạng thái xe thành -1 (xóa mềm)!",
            updatedVehicle: vehicle
        });

    } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái xe:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ!",
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
        const routes = await TuyenDuong.findAll({
            where: {
                trangthai: {
                    [Op.ne]: -1
                }
            }
        });

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


// =========================================================================
// --- CONTROLLER: addRoute ĐÃ VIẾT LẠI ---
// =========================================================================

export const addRoute = async (req, res) => {
    try {
        const { tentuyen, dsdiemdung, mota, loaituyen, trangthai } = req.body;

        // 1. CHUYỂN ĐỔI dsdiemdung (String JSON) thành Array ID và VALIDATE
        let stopIds;
        try {
            stopIds = JSON.parse(dsdiemdung);
            if (!Array.isArray(stopIds) || stopIds.length < 2) {
                return res.status(400).json({ message: "dsdiemdung phải là một mảng ID điểm dừng có ít nhất 2 phần tử." });
            }
        } catch (e) {
            return res.status(400).json({ message: "Định dạng dsdiemdung không hợp lệ (Không phải chuỗi JSON mảng)." });
        }

        // *** Đã loại bỏ hoàn toàn các bước truy vấn tọa độ và tính toán Polyline ***

        // 2. LƯU VÀO CƠ SỞ DỮ LIỆU
        const newRoute = await TuyenDuong.create({
            tentuyen,
            dsdiemdung,
            mota,
            loaituyen,
            trangthai,
            // fullroutepolyline: đã được xóa
        });

        res.status(201).json({
            message: "Thêm tuyến đường thành công!",
            newRoute: newRoute
        });
    } catch (error) {
        console.error("❌ Lỗi thêm tuyến đường:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm tuyến đường!",
            error: error.message
        });
    }
};
export const updateRoute = async (req, res) => {
    try {
        // Lấy ID tuyến đường từ params (URL)
        const { idtuyenduong } = req.params;
        const { tentuyen, dsdiemdung, mota, loaituyen, trangthai } = req.body;

        // 1. TÌM TUYẾN ĐƯỜNG HIỆN TẠI
        const route = await TuyenDuong.findByPk(idtuyenduong);

        if (!route) {
            return res.status(404).json({ message: "Không tìm thấy tuyến đường cần cập nhật!" });
        }

        // 2. XỬ LÝ dsdiemdung VÀ VALIDATE (Nếu dsdiemdung được cung cấp)
        if (dsdiemdung !== undefined) {
            try {
                // CHUYỂN ĐỔI dsdiemdung (String JSON) thành Array ID để validate
                const stopIds = JSON.parse(dsdiemdung);

                if (!Array.isArray(stopIds) || stopIds.length < 2) {
                    return res.status(400).json({ message: "dsdiemdung phải là một mảng ID điểm dừng có ít nhất 2 phần tử." });
                }
            } catch (e) {
                return res.status(400).json({ message: "Định dạng dsdiemdung không hợp lệ (Không phải chuỗi JSON mảng)." });
            }


        }

        // 3. CẬP NHẬT VÀ LƯU VÀO CƠ SỞ DỮ LIỆU
        // Dùng `!== undefined` để đảm bảo có thể cập nhật các trường thành giá trị rỗng hoặc 0
        const updatedRoute = await route.update({
            tentuyen: tentuyen !== undefined ? tentuyen : route.tentuyen,
            dsdiemdung: dsdiemdung !== undefined ? dsdiemdung : route.dsdiemdung,
            mota: mota !== undefined ? mota : route.mota,
            loaituyen: loaituyen !== undefined ? loaituyen : route.loaituyen,
            trangthai: trangthai !== undefined ? trangthai : route.trangthai,
            // fullroutepolyline: đã được xóa
        });

        res.status(200).json({
            message: "Cập nhật tuyến đường thành công!",
            updatedRoute: updatedRoute
        });

    } catch (error) {
        console.error("❌ Lỗi cập nhật tuyến đường:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật tuyến đường!",
            error: error.message
        });
    }
};
export const deleteRoute = async (req, res) => {
    try {
        // Lấy ID tuyến đường từ URL parameters
        const { idtuyenduong } = req.params;

        if (!idtuyenduong) {
            return res.status(400).json({ message: "Thiếu ID tuyến đường cần xóa mềm." });
        }

        // 1. TÌM TUYẾN ĐƯỜNG
        const route = await TuyenDuong.findByPk(idtuyenduong);

        if (!route) {
            return res.status(404).json({
                message: "Không tìm thấy tuyến đường để xóa mềm (ID không tồn tại)."
            });
        }

        // 2. THỰC HIỆN XÓA MỀM (Cập nhật trạng thái)
        const [updatedRows] = await TuyenDuong.update(
            { trangthai: -1 }, // Giá trị 0 đại diện cho trạng thái đã xóa/ngưng hoạt động
            {
                where: {
                    idtuyenduong: idtuyenduong
                }
            }
        );

        // 3. KIỂM TRA KẾT QUẢ
        if (updatedRows === 0) {
            return res.status(500).json({
                message: "Không thể cập nhật trạng thái (Tuyến đường có thể đã bị xóa mềm trước đó)."
            });
        }

        res.status(200).json({
            message: `Xóa mềm tuyến đường ID ${idtuyenduong} thành công! (Trạng thái đã chuyển thành 0)`,
            deletedRoute: updatedRows
        });

    } catch (error) {
        console.error("❌ Lỗi xóa mềm tuyến đường:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi xóa mềm tuyến đường!",
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
                where: {
                    // ✅ ĐÃ SỬA: Op đã được import
                    trangthai: {
                        [Op.ne]: -1 // Sử dụng Sequelize Operator: Op.ne (Not Equal)
                    }
                }
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

        // --- BƯỚC KIỂM TRA EMAIL TỒN TẠI ---
        const existed = await NguoiDung.findOne({ where: { email } });
        if (existed) {
            // ✅ Nâng cấp: Kiểm tra thêm nếu người dùng bị xóa mềm (-1) để gợi ý khôi phục
            if (existed.trangthai === -1) {
                return res.status(400).json({ 
                    message: "Email này đã được đăng ký nhưng đang ở trạng thái bị xóa mềm. Hãy khôi phục tài khoản nếu cần!" 
                });
            }
            return res.status(400).json({ message: "Email này đã được đăng ký!" });
        }


        // --- BƯỚC XỬ LÝ ẢNH ĐẠI DIỆN ---
        let anhdaidien = req.file
            ? `/uploads/avatars/${req.file.filename}` // ⬅️ Dùng đường dẫn tương đối này
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Nếu không có file, dùng ảnh mặc định

        // --- BƯỚC MÃ HÓA MẬT KHẨU (BẮT BUỘC) ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(matkhau, saltRounds);

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
export const updateParent = async (req, res) => {
    try {
        // Lấy dữ liệu từ req.body (có thể là chuỗi)
        const { idphuhuynh, hoten, sodienthoai, email, matkhau, trangthai, diachi } = req.body;
        // Bỏ anhdaidien khỏi destructuring body để xử lý riêng

        // ==== 1) ÉP KIỂU ID ====
        const parentId = parseInt(idphuhuynh, 10);

        if (isNaN(parentId) || parentId <= 0) {
            return res.status(400).json({ message: "ID phụ huynh không hợp lệ." });
        }

        // ==== 2) TÌM PHỤ HUYNH ====
        const parent = await PhuHuynh.findByPk(parentId, {
            include: [{ model: NguoiDung, as: "userInfo" }]
        });

        if (!parent) {
            return res.status(404).json({ message: "Không tìm thấy phụ huynh!" });
        }

        // ==== 3) HASH MẬT KHẨU NẾU CÓ GỬI ====
        let hashedPassword = parent.userInfo.matkhau;

        if (matkhau && matkhau.trim() !== "") {
            hashedPassword = await bcrypt.hash(matkhau, 10);
        }

        // ✅ ĐÃ SỬA: Xử lý file ảnh đại diện mới từ Multer
        let newAvatarPath = parent.userInfo.anhdaidien; // Mặc định là ảnh cũ

        if (req.file) {
            // Nếu có file mới, cập nhật đường dẫn mới
            newAvatarPath = `/uploads/avatars/${req.file.filename}`;
            
            // ⭐ LƯU Ý CẢI TIẾN: Thêm logic xóa file ảnh đại diện cũ trên server
            // Nếu muốn xóa file cũ, bạn cần import fs và path.
            /*
            if (parent.userInfo.anhdaidien && !parent.userInfo.anhdaidien.startsWith('http')) {
                const oldFilePath = path.join(__dirname, '..', parent.userInfo.anhdaidien);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            */
        } else if (req.body.anhdaidien) {
            // Trường hợp người dùng gửi lại đường dẫn ảnh cũ từ body (hoặc đường dẫn mặc định)
            newAvatarPath = req.body.anhdaidien;
        }


        // ==== 4) UPDATE BẢNG NGUOIDUNG ====
        await parent.userInfo.update({
            hoten,
            sodienthoai,
            email,
            matkhau: hashedPassword,
            anhdaidien: newAvatarPath, // ⬅️ Sử dụng đường dẫn đã xử lý
            trangthai
        });

        // ==== 5) UPDATE BẢNG PHUHUYNH ====
        await parent.update({
            diachi
        });
        
        // Lấy lại dữ liệu mới nhất sau khi update để phản hồi
        const updatedParent = await PhuHuynh.findByPk(parentId, {
            include: [{ model: NguoiDung, as: "userInfo" }]
        });

        return res.status(200).json({
            message: "Cập nhật phụ huynh thành công!",
            updatedParent: updatedParent // Trả về đối tượng đã được cập nhật
        });

    } catch (error) {
        console.error("❌ Lỗi cập nhật phụ huynh:", error);
        
        // --- XỬ LÝ LỖI DUY NHẤT (UNIQUE CONSTRAINT) ---
        if (error.name === "SequelizeUniqueConstraintError") {
             const field = error.errors[0].path;
             const message = field === "email" 
                 ? "Email này đã được sử dụng bởi tài khoản khác!" 
                 : field === "sodienthoai" 
                 ? "Số điện thoại này đã được sử dụng bởi tài khoản khác!" 
                 : `Giá trị ${field} đã tồn tại!`;
            return res.status(400).json({ message });
        }
        
        return res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật phụ huynh!",
            error: error.message
        });
    }
};

// Chỉnh sửa thông tin học sinh 
export const editStudent = async (req, res) => {
    // Lấy ID học sinh từ params
    const studentId = req.params.idStudent; // cần giống với api

    try {
        const { hoten, lop, namsinh, gioitinh, iddiemdon, idphuhuynh } = req.body;

        // 1. Tìm học sinh theo ID
        const student = await HocSinh.findByPk(studentId);

        if (!student) {
            return res.status(404).json({ message: "Không tìm thấy học sinh để chỉnh sửa!" });
        }

        // 2. Chuẩn bị dữ liệu cập nhật
        const updateData = {
            hoten,
            lop,
            namsinh,
            gioitinh,
            iddiemdon: iddiemdon || null,
            idphuhuynh: idphuhuynh || null
        };

        // 3. Xử lý tệp ảnh mới (nếu có)
        if (req.file) {
            const uploadDir = path.join(process.cwd(), "src/uploads/avatars");
            const filename = Date.now() + "_" + req.file.originalname;
            const filepath = path.join(uploadDir, filename);

            // Đảm bảo thư mục tồn tại (như trong addStudent)
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            // Di chuyển file tạm thời vào thư mục uploads
            fs.renameSync(req.file.path, filepath);

            // Xóa ảnh cũ (nếu có và không phải là ảnh mặc định)
            if (student.anhdaidien) {
                const oldFilePath = path.join(uploadDir, student.anhdaidien);
                // Kiểm tra file cũ tồn tại trước khi xóa
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            // Cập nhật tên file ảnh mới vào dữ liệu
            updateData.anhdaidien = filename;
        }

        // 4. Cập nhật bản ghi trong cơ sở dữ liệu
        await student.update(updateData);

        // 5. Trả về kết quả thành công
        res.status(200).json({
            message: "Cập nhật thông tin học sinh thành công!",
            student: student // Trả về thông tin học sinh sau khi đã cập nhật
        });

    } catch (error) {
        console.error("❌ Lỗi chỉnh sửa học sinh:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi chỉnh sửa học sinh!",
            error: error.message
        });
    }
};

// xóa học sinh
export const deleteStudent = async (req, res) => {
    const studentId = req.params.idStudent;

    try {
        // 1. Tìm học sinh theo ID
        const student = await HocSinh.findByPk(studentId);

        if (!student) {
            return res.status(404).json({ message: "Không tìm thấy học sinh để xóa!" });
        }

        // 2. Kiểm tra trạng thái hiện tại (Tùy chọn: Đảm bảo chưa bị xóa mềm)
        if (student.status === -1) {
            return res.status(400).json({ message: "Học sinh này đã bị xóa mềm trước đó!" });
        }

        // 3. Cập nhật trường status thành -1 (Soft Delete)
        await student.update({
            status: -1
        });

        // 4. Trả về kết quả thành công
        res.status(200).json({
            message: `Xóa mềm (cập nhật status thành -1) cho học sinh có ID ${studentId} thành công!`,
            student: student // Trả về thông tin học sinh sau khi đã cập nhật
        });

    } catch (error) {
        // Xử lý lỗi trong quá trình thực thi
        console.error("❌ Lỗi xóa mềm học sinh:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thực hiện xóa mềm học sinh!",
            error: error.message
        });
    }
};

export const deleteParent = async (req, res) => {
    try {
        const { id } = req.params;

        const parent = await PhuHuynh.findByPk(id, {
            include: [{ model: NguoiDung, as: "userInfo" }]
        });

        if (!parent) {
            return res.status(404).json({ message: "Không tìm thấy phụ huynh để xóa!" });
        }

        // Xóa mềm: trạng thái = -1
        await parent.userInfo.update({ trangthai: -1 });

        return res.status(200).json({
            message: "Xóa mềm phụ huynh thành công! (trangthai = -1)",
            deletedParent: parent
        });

    } catch (error) {
        console.error("❌ Lỗi xóa phụ huynh:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi xóa phụ huynh!",
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
                where: {
                    trangthai: {
                        [Op.ne]: -1 // Sử dụng Sequelize Operator: Op.ne (Not Equal)
                    }
                }
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
// ⭐ Cần đảm bảo các biến sau đã được import/require (ví dụ):
// const { Op } = require('sequelize');
// const NguoiDung = require('../models/NguoiDung');
// const TaiXe = require('../models/TaiXe');
// const bcrypt = require('bcryptjs');

// --- HÀM THÊM TÀI XẾ ---
export const addDriver = async (req, res) => {
    try {
        // Lấy dữ liệu từ body request
        const { hoten, sodienthoai, email, mabang, kinhnghiem, matkhau, trangthai } = req.body;
        
        // **✅ SỬA LỖI LOGIC: Đưa kiểm tra tồn tại lên đầu**
        // Điều này giúp tránh việc tạo và hash mật khẩu không cần thiết.
        const existed = await NguoiDung.findOne({ where: { email } });
        if (existed) {
            // ✅ Nâng cấp: Kiểm tra thêm nếu người dùng bị xóa mềm (-1)
            if (existed.trangthai === -1) {
                return res.status(400).json({ 
                    message: "Email này đã được đăng ký nhưng đang ở trạng thái bị xóa mềm. Hãy khôi phục tài khoản nếu cần!" 
                });
            }
            return res.status(400).json({ message: "Email này đã được đăng ký!" });
        }

        // --- BƯỚC XỬ LÝ ẢNH ĐẠI DIỆN ---
        let anhdaidien = req.file
            ? `/uploads/avatars/${req.file.filename}` // ⬅️ Dùng đường dẫn tương đối này
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Nếu không có file, dùng ảnh mặc định
            
        // --- BƯỚC MÃ HÓA MẬT KHẨU (BẮT BUỘC) ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(matkhau, saltRounds);

        // Tạo bản ghi người dùng (NguoiDung)
        const newUser = await NguoiDung.create({
            hoten,
            sodienthoai,
            email,
            matkhau: hashedPassword,
            vaitro: 1, // Vai trò Tài xế
            anhdaidien: anhdaidien, 
            trangthai: trangthai || 1 // Mặc định trạng thái là Chờ duyệt (1)
        });

        // Tạo bản ghi tài xế (TaiXe) liên kết với người dùng vừa tạo
        const newDriver = await TaiXe.create({
            mabang,
            kinhnghiem,
            idnguoidung: newUser.id
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
        
        // ✅ BỔ SUNG: Xử lý lỗi trùng lặp (SequelizeUniqueConstraintError)
        if (error.name === "SequelizeUniqueConstraintError") {
            const field = error.errors[0].path;
            let message = "Giá trị đã tồn tại!";

            if (field === "email") {
                message = "Email này đã được đăng ký!";
            } else if (field === "sodienthoai") {
                message = "Số điện thoại này đã được đăng ký!";
            } else if (field === "mabang") {
                 message = "Mã bằng lái này đã được đăng ký!";
            }
            return res.status(400).json({ message });
        }
        
        // Xử lý lỗi validation khác
        if (error.name === "SequelizeValidationError") {
            const messages = error.errors.map(e => e.message).join(", ");
            return res.status(400).json({ message: `Dữ liệu không hợp lệ: ${messages}` });
        }

        res.status(500).json({
            message: "Lỗi máy chủ khi thêm tài xế!",
            error: error.message
        });
    }
};

// --- HÀM CẬP NHẬT TÀI XẾ ---
export const updateDriver = async (req, res) => {
    try {
        // Lấy dữ liệu dạng chuỗi từ req.body
        // ✅ ĐÃ SỬA: Loại bỏ anhdaidien khỏi destructuring body để xử lý riêng (vì có thể là File hoặc Chuỗi)
        const { idtaixe, hoten, sodienthoai, email, matkhau, trangthai, mabang, kinhnghiem } = req.body;
        
        // **BƯỚC 1: ÉP KIỂU IDTAIXE VỀ SỐ NGUYÊN**
        const driverId = parseInt(idtaixe, 10);
        
        if (isNaN(driverId) || driverId <= 0) {
            return res.status(400).json({ message: "ID tài xế không hợp lệ." });
        }

        // **BƯỚC 2: Tìm kiếm tài xế**
        const driver = await TaiXe.findByPk(driverId, {
            include: [{ model: NguoiDung, as: 'userInfo' }]
        });

        if (!driver) {
            return res.status(404).json({
                message: "Không tìm thấy tài xế!"
            });
        }
        
        // **BƯỚC 3: Xử lý mã hóa mật khẩu nếu có gửi**
        let hashedPassword = driver.userInfo.matkhau; // giữ nguyên mật khẩu cũ

        if (matkhau && matkhau.trim() !== "") {
            hashedPassword = await bcrypt.hash(matkhau, 10);
        }

        // **✅ BỔ SUNG: Xử lý file ảnh đại diện mới từ Multer**
        let newAvatarPath = driver.userInfo.anhdaidien; // Mặc định là ảnh cũ

        if (req.file) {
            // Nếu có file mới, cập nhật đường dẫn mới
            newAvatarPath = `/uploads/avatars/${req.file.filename}`;
            // ⭐ Tùy chọn: Thêm logic xóa file cũ ở đây nếu cần
            
        } else if (req.body.anhdaidien) {
             // Trường hợp người dùng gửi lại đường dẫn ảnh cũ từ body (hoặc đường dẫn mặc định)
            newAvatarPath = req.body.anhdaidien;
        }


        // **BƯỚC 4: Cập nhật thông tin bảng NguoiDung**
        await driver.userInfo.update({
            hoten,
            sodienthoai,
            matkhau: hashedPassword,
            email,
            // ✅ ĐÃ SỬA: Sử dụng đường dẫn ảnh đã được xử lý (newAvatarPath)
            anhdaidien: newAvatarPath, 
            trangthai
        });

        // **BƯỚC 5: Cập nhật thông tin bảng TaiXe**
        await driver.update({ mabang, kinhnghiem });
        
        // Lấy lại dữ liệu mới nhất sau khi update để phản hồi
        const updatedDriver = await TaiXe.findByPk(driverId, {
            include: [{ model: NguoiDung, as: "userInfo" }]
        });

        return res.status(200).json({
            message: "Cập nhật thông tin tài xế thành công!",
            updatedDriver: updatedDriver
        });

    } catch (error) {
        console.error("❌ Lỗi cập nhật tài xế:", error);
        
         // ✅ BỔ SUNG: Xử lý lỗi trùng lặp (Unique Constraint)
        if (error.name === "SequelizeUniqueConstraintError") {
             const field = error.errors[0].path;
             let message = "Giá trị đã tồn tại!";
             
             if (field === "email") {
                message = "Email này đã được sử dụng bởi tài khoản khác!";
            } else if (field === "sodienthoai") {
                message = "Số điện thoại này đã được sử dụng bởi tài khoản khác!";
            } else if (field === "mabang") {
                 message = "Mã bằng lái này đã được đăng ký!";
            }
            return res.status(400).json({ message });
        }
        
        res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật tài xế!",
            error: error.message
        });
    }
};

export const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm tài xế theo ID
        const driver = await TaiXe.findByPk(id, {
            include: [{ model: NguoiDung, as: "userInfo" }]
        });

        if (!driver) {
            return res.status(404).json({
                message: "Không tìm thấy tài xế để xóa!"
            });
        }

        // Xóa mềm: cập nhật trạng thái = -1
        await driver.userInfo.update({ trangthai: -1 });

        res.status(200).json({
            message: "Xóa mềm tài xế thành công! (trangthai = -1)",
            deletedDriver: driver
        });

    } catch (error) {
        console.error("❌ Lỗi xóa mềm tài xế:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi xóa tài xế!",
            error: error.message
        });
    }
};


export const getAllPickupPoints = async (req, res) => {
    try {
        const pickupPoints = await DiemDung.findAll({
            where: {
                trangthai: {
                    [Op.ne]: -1
                }
            }
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
        const { tendiemdon, diachi, trangthai, kinhdo, vido } = req.body;
        const newPoint = await DiemDung.create({ tendiemdon, diachi, trangthai, kinhdo, vido });
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
export const updatePickupPoint = async (req, res) => {
    try {
        const { id } = req.params;
        const { tendiemdon, diachi, trangthai, kinhdo, vido } = req.body;

        // Kiểm tra điểm đón có tồn tại không
        const pickupPoint = await DiemDung.findByPk(id);
        if (!pickupPoint) {
            return res.status(404).json({
                message: "Điểm đón không tồn tại!",
            });
        }

        // Cập nhật dữ liệu
        await pickupPoint.update({
            tendiemdon: tendiemdon !== undefined ? tendiemdon : pickupPoint.tendiemdon,
            diachi: diachi !== undefined ? diachi : pickupPoint.diachi,
            trangthai: trangthai !== undefined ? trangthai : pickupPoint.trangthai,
            kinhdo: kinhdo !== undefined ? kinhdo : pickupPoint.kinhdo,
            vido: vido !== undefined ? vido : pickupPoint.vido,
        });

        res.status(200).json({
            message: "Cập nhật điểm đón thành công!",
            pickupPoint
        });
    } catch (error) {
        console.error("❌ Lỗi cập nhật điểm đón:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật điểm đón!",
            error: error.message
        });
    }
};

export const deletePickupPoint = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra điểm đón có tồn tại không
        const pickupPoint = await DiemDung.findByPk(id);
        if (!pickupPoint) {
            return res.status(404).json({
                message: "Điểm đón không tồn tại!",
            });
        }

        // Cập nhật trạng thái thành 0 (tạm dừng/xóa mềm)
        await pickupPoint.update({ trangthai: -1 });

        res.status(200).json({
            message: "Xóa mềm điểm đón thành công!",
            pickupPoint
        });
    } catch (error) {
        console.error("❌ Lỗi xóa mềm điểm đón:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi xóa mềm điểm đón!",
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
            where: {
                trangthai: {
                    [Op.ne]: -1
                }
            },
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
                        attributes: ['iddiemdung', 'tendiemdon'],
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
export const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { idxebuyt, idtaixe, idtuyenduong, giobatdau, ngaydi, danhsachhocsinh, trangthai } = req.body;

        // Kiểm tra lịch chuyến tồn tại
        const schedule = await LichChuyen.findByPk(id);
        if (!schedule) {
            return res.status(404).json({
                message: "Lịch chuyến không tồn tại!",
            });
        }

        // Kiểm tra xe buýt nếu thay đổi
        if (idxebuyt) {
            const xe = await XeBuyt.findByPk(idxebuyt);
            if (!xe) {
                return res.status(404).json({
                    message: "Xe buýt không tồn tại!",
                });
            }
        }

        // Kiểm tra tài xế nếu thay đổi
        if (idtaixe) {
            const taixe = await TaiXe.findByPk(idtaixe);
            if (!taixe) {
                return res.status(404).json({
                    message: "Tài xế không tồn tại!",
                });
            }
        }

        // Kiểm tra tuyến đường nếu thay đổi
        if (idtuyenduong) {
            const tuyen = await TuyenDuong.findByPk(idtuyenduong);
            if (!tuyen) {
                return res.status(404).json({
                    message: "Tuyến đường không tồn tại!",
                });
            }
        }

        // Cập nhật lịch chuyến
        await schedule.update({
            idxebuyt: idxebuyt !== undefined ? idxebuyt : schedule.idxebuyt,
            idtaixe: idtaixe !== undefined ? idtaixe : schedule.idtaixe,
            idtuyenduong: idtuyenduong !== undefined ? idtuyenduong : schedule.idtuyenduong,
            giobatdau: giobatdau !== undefined ? giobatdau : schedule.giobatdau,
            ngaydi: ngaydi !== undefined ? ngaydi : schedule.ngaydi,
            danhsachhocsinh: danhsachhocsinh !== undefined
                ? (typeof danhsachhocsinh === 'string' ? danhsachhocsinh : JSON.stringify(danhsachhocsinh))
                : schedule.danhsachhocsinh,
            trangthai: trangthai !== undefined ? trangthai : schedule.trangthai,
        });

        // Lấy dữ liệu cập nhật để trả về
        const updatedSchedule = await LichChuyen.findByPk(id, {
            include: [
                {
                    model: XeBuyt,
                    attributes: ['idxebuyt', 'bienso'],
                },
                {
                    model: TaiXe,
                    attributes: ['idtaixe'],
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
            ]
        });

        res.status(200).json({
            message: "Cập nhật lịch chuyến thành công!",
            schedule: updatedSchedule
        });
    } catch (error) {
        console.error("❌ Lỗi cập nhật lịch chuyến:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật lịch chuyến!",
            error: error.message
        });
    }
};

// ============================================================
// ✅ XÓA MỀM LỊCH CHUYẾN (Soft Delete)
// ============================================================
// Giả sử model LichChuyen có field `trangthai` để đánh dấu
// trangthai = 3: hủy/xóa mềm
export const softDeleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra lịch chuyến tồn tại
        const schedule = await LichChuyen.findByPk(id);
        if (!schedule) {
            return res.status(404).json({
                message: "Lịch chuyến không tồn tại!",
            });
        }

        // Cập nhật trạng thái thành 3 (Hủy/xóa mềm)
        await schedule.update({ trangthai: -1 });

        res.status(200).json({
            message: "Xóa mềm lịch chuyến thành công!",
            schedule
        });
    } catch (error) {
        console.error("❌ Lỗi xóa mềm lịch chuyến:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi xóa mềm lịch chuyến!",
            error: error.message
        });
    }
};
export const getAllRegisteredPickupPoints = async (req, res) => {
    try {
        const registrations = await DangKyDiemDon.findAll({
            where: {
                trangthai: {
                    [Op.ne]: -1
                }
            },
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
export const addRegisteredPickupPoint = async (req, res) => {
    try {
        const { mahocsinh, idphuhuynh, iddiemdung, trangthai } = req.body;

        // Validate dữ liệu bắt buộc
        if (!mahocsinh || !idphuhuynh || !iddiemdung) {
            return res.status(400).json({
                message: "Mã học sinh, ID phụ huynh và ID điểm đón không được để trống!",
            });
        }

        // Kiểm tra học sinh tồn tại
        const hocSinh = await HocSinh.findByPk(mahocsinh);
        if (!hocSinh) {
            return res.status(404).json({
                message: "Học sinh không tồn tại!",
            });
        }

        // Kiểm tra phụ huynh tồn tại
        const phuHuynh = await PhuHuynh.findByPk(idphuhuynh);
        if (!phuHuynh) {
            return res.status(404).json({
                message: "Phụ huynh không tồn tại!",
            });
        }

        // Kiểm tra điểm đón tồn tại
        const diemDon = await DiemDung.findByPk(iddiemdung);
        if (!diemDon) {
            return res.status(404).json({
                message: "Điểm đón không tồn tại!",
            });
        }

        // Kiểm tra trùng lặp - một học sinh chỉ có thể đăng ký một điểm đón
        const existingRegistration = await DangKyDiemDon.findOne({
            where: { mahocsinh, trangthai: 1 } // Chỉ kiểm tra những cái đang hoạt động
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: "Học sinh này đã đăng ký điểm đón rồi!",
            });
        }

        // Tạo đăng ký mới
        const newRegistration = await DangKyDiemDon.create({
            mahocsinh,
            idphuhuynh,
            iddiemdung,

            trangthai: trangthai !== undefined ? trangthai : 1
        });

        // Lấy dữ liệu đầy đủ để trả về
        const registration = await DangKyDiemDon.findByPk(newRegistration.iddangky, {

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

        res.status(201).json({
            message: "Thêm đăng ký điểm đón thành công!",
            registration
        });
    } catch (error) {
        console.error("❌ Lỗi thêm đăng ký điểm đón:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm đăng ký điểm đón!",
            error: error.message
        });
    }
};

// ============================================================
// ✅ CẬP NHẬT ĐĂ KÝ ĐIỂM ĐÓN
// ============================================================
export const updateRegisteredPickupPoint = async (req, res) => {
    try {
        const { id } = req.params;
        const { mahocsinh, idphuhuynh, iddiemdung, trangthai } = req.body;

        // Kiểm tra đăng ký tồn tại
        const registration = await DangKyDiemDon.findByPk(id);
        if (!registration) {
            return res.status(404).json({
                message: "Đăng ký điểm đón không tồn tại!",
            });
        }

        // Nếu thay đổi học sinh, kiểm tra trùng lặp
        if (mahocsinh && mahocsinh !== registration.mahocsinh) {
            const existingRegistration = await DangKyDiemDon.findOne({
                where: {
                    mahocsinh,
                    trangthai: 1,
                    iddangky: { [Op.ne]: id } // Exclude hiện tại
                }
            });

            if (existingRegistration) {
                return res.status(400).json({
                    message: "Học sinh này đã đăng ký điểm đón rồi!",
                });
            }

            // Kiểm tra học sinh mới tồn tại
            const hocSinh = await HocSinh.findByPk(mahocsinh);
            if (!hocSinh) {
                return res.status(404).json({
                    message: "Học sinh không tồn tại!",
                });
            }
        }

        // Kiểm tra phụ huynh nếu thay đổi
        if (idphuhuynh) {
            const phuHuynh = await PhuHuynh.findByPk(idphuhuynh);
            if (!phuHuynh) {
                return res.status(404).json({
                    message: "Phụ huynh không tồn tại!",
                });
            }
        }

        // Kiểm tra điểm đón nếu thay đổi
        if (iddiemdung) {
            const diemDon = await DiemDung.findByPk(iddiemdung);
            if (!diemDon) {
                return res.status(404).json({
                    message: "Điểm đón không tồn tại!",
                });
            }
        }

        // Lưu trạng thái cũ để kiểm tra thay đổi
        const oldStatus = registration.trangthai;
        const newStatus = trangthai !== undefined ? trangthai : registration.trangthai;
        const actualMahocsinh = mahocsinh !== undefined ? mahocsinh : registration.mahocsinh;
        const actualIddiemdung = iddiemdung !== undefined ? iddiemdung : registration.iddiemdung;

        // ============================================================
        // ✅ XỬ LÝ THAY ĐỔI TRẠNG THÁI
        // ============================================================
        // Nếu trạng thái thay đổi từ 0 (Chờ duyệt) thành 1 (Đã duyệt)
        if (oldStatus === 0 && newStatus === 1) {
            // Cập nhật ID điểm đón cho học sinh
            const hocSinh = await HocSinh.findByPk(actualMahocsinh);
            if (hocSinh) {
                await hocSinh.update({ iddiemdon: actualIddiemdung });
                console.log(`✅ Cập nhật iddiemdung=${actualIddiemdung} cho học sinh ${actualMahocsinh}`);
            }
        }
        // Nếu trạng thái thay đổi từ 1 (Đã duyệt) thành 0 (Chờ duyệt)
        else if (oldStatus === 1 && newStatus === 0) {
            // Xóa ID điểm đón của học sinh (set thành NULL hoặc 0)
            const hocSinh = await HocSinh.findByPk(actualMahocsinh);
            if (hocSinh) {
                await hocSinh.update({ iddiemdon: null }); // hoặc 0 nếu field không null
                console.log(`✅ Xóa iddiemdung cho học sinh ${actualMahocsinh}`);
            }
        }
        // Nếu thay đổi điểm đón khi trạng thái = 1 (Đã duyệt)
        else if (newStatus === 1 && iddiemdung && iddiemdung !== registration.iddiemdung) {
            // Cập nhật ID điểm đón mới cho học sinh
            const hocSinh = await HocSinh.findByPk(actualMahocsinh);
            if (hocSinh) {
                await hocSinh.update({ iddiemdon: actualIddiemdung });
                console.log(`✅ Cập nhật iddiemdung=${actualIddiemdung} cho học sinh ${actualMahocsinh}`);
            }
        }

        // ============================================================
        // ✅ CẬP NHẬT DỮ LIỆU ĐĂNG KÝ
        // ============================================================
        await registration.update({
            mahocsinh: actualMahocsinh,
            idphuhuynh: idphuhuynh !== undefined ? idphuhuynh : registration.idphuhuynh,
            iddiemdung: actualIddiemdung,
            trangthai: newStatus,
        });

        // Lấy dữ liệu đầy đủ để trả về
        const updatedRegistration = await DangKyDiemDon.findByPk(id, {
            include: [
                {
                    model: HocSinh,
                    attributes: ['mahocsinh', 'hoten', 'lop', 'iddiemdon']
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
            message: "Cập nhật đăng ký điểm đón thành công!",
            registration: updatedRegistration
        });
    } catch (error) {
        console.error("❌ Lỗi cập nhật đăng ký điểm đón:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật đăng ký điểm đón!",
            error: error.message
        });
    }
};
// ============================================================
// ✅ XÓA MỀM ĐĂ KÝ ĐIỂM ĐÓN (Soft Delete)
// ============================================================
// trangthai = 0: đã hủy/xóa mềm
// trangthai = 1: đang hoạt động
export const softDeleteRegisteredPickupPoint = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra đăng ký tồn tại
        const registration = await DangKyDiemDon.findByPk(id);
        if (!registration) {
            return res.status(404).json({
                message: "Đăng ký điểm đón không tồn tại!",
            });
        }

        // Cập nhật trạng thái thành 0 (xóa mềm)
        await registration.update({ trangthai: -1 });

        res.status(200).json({
            message: "Xóa mềm đăng ký điểm đón thành công!",
            registration
        });
    } catch (error) {
        console.error("❌ Lỗi xóa mềm đăng ký điểm đón:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi xóa mềm đăng ký điểm đón!",
            error: error.message
        });
    }
};
export const getInfoDashboard = async (req, res) => {
    try {
        const studentCount = await HocSinh.count();
        const driverCount = await TaiXe.count();

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
            attributes: ['idxebuyt', 'idtaixe', 'giobatdau', 'idtuyenduong', 'ngaydi', 'thu', 'trangthai'],
            include: [
                {
                    model: XeBuyt, attributes: ['bienso', 'trangthai'],
                    include: [{
                        model: ViTriXe,
                        attributes: ['kinhdo', 'vido'],
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
                    attributes: ['tentuyen', 'dsdiemdung', 'loaituyen'],
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
export const getAllNotification = async (req, res) => {
    try {
        // Lấy tất cả thông báo chưa bị xóa mềm
        const notifications = await ThongBao.findAll({
            where: {
                trangthai: {
                    [Op.ne]: -1
                }
            },
            include: [
                {
                    model: NguoiDung,
         
                    attributes: ['id', 'hoten', 'vaitro'],
                    required: false
                },
                {
                    model: TaiXe,
                  
                     include: [
                {
                    model: NguoiDung,
                    as: "userInfo",
                    attributes: [ 'hoten', 'vaitro'],
                    required: false
                }],
                    required: false,
                    where: {
                        idtaixe: {
                            [Op.ne]: null // Chỉ include nếu idtaixe không null
                        }
                    }
                },
                {
                    model: PhuHuynh,
                   include: [
                {
                    model: NguoiDung,
                    as: "userInfo",
                    attributes: ['id', 'hoten', 'vaitro'],
                    required: false
                }],
                    attributes: ['idphuhuynh'],
                    required: false,
                    where: {
                        idphuhuynh: {
                            [Op.ne]: null
                        }
                    }
                },
                {
                    model: LichChuyen,
                    include: [
                {
                    model: TuyenDuong,
                    as: "tuyenDuongInfo",
                    attributes: ['tentuyen'],
                    required: false
                }],
                    attributes: ['ngaydi', 'giobatdau'],
                    required: false,
                    where: {
                        idlich: {
                            [Op.ne]: null
                        }
                    }
                }
            ],
            order: [['thoigiangui', 'DESC']]
        });
        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo nào.' });
        }
         const cleanedNotifications = notifications.map(notif => {
            const data = notif.toJSON();
            
            if (!data.idtaixe) {delete data.taixe;delete data.idtaixe;}
            if (!data.idphuhuynh) {delete data.phuhuynh;delete data.idphuhuynh;}
            if (!data.idlich) {delete data.lichchuyen;delete data.idlich;}
            
            return data;
        });

        return res.status(200).json({
            message: 'Lấy toàn bộ danh sách thông báo thành công!',
            notifications : cleanedNotifications
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách thông báo:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
};
export const addNotification = async (req, res) => {
    const { tieude, noidung, idlich, idtaixe, idphuhuynh, idvaitro, loai,idnguoigui,trangthai } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!tieude || !noidung) {
        return res.status(400).json({ message: 'Tiêu đề và Nội dung là bắt buộc.' });
    }

    try {
        const newNotification = await ThongBao.create({
            tieude,
            noidung,
            idlich: idlich || null,
            idtaixe: idtaixe || null,
            idphuhuynh: idphuhuynh || null,
            idvaitro: idvaitro || null,
            loai: loai !== undefined ? loai : 0, // Mặc định là Thông báo thường
            thoigiangui: new Date(), // Gán thời gian hiện tại
            idnguoigui,
            trangthai
            // Các trường khác sẽ là NULL nếu không được cung cấp (theo cấu hình model)
        });

        return res.status(201).json({
            message: 'Thêm thông báo mới thành công!',
            notification: newNotification
        });

    } catch (error) {
        console.error('Lỗi khi thêm thông báo:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi tạo thông báo.' });
    }
};
export const updateNotification = async (req, res) => {
    const { idthongbao } = req.params;
    const updateData = req.body;

    try {
        const notification = await ThongBao.findByPk(idthongbao);

        if (!notification) {
            return res.status(404).json({ message: `Không tìm thấy thông báo với ID: ${idthongbao}.` });
        }

        // Cập nhật thông tin (Sequelize sẽ bỏ qua các trường không tồn tại)
        await notification.update(updateData);

        // Tùy chọn: Bạn có thể cập nhật lại thoigiangui nếu muốn
        // await notification.update({ thoigiangui: new Date() });

        return res.status(200).json({
            message: 'Cập nhật thông báo thành công!',
            notification
        });

    } catch (error) {
        console.error(`Lỗi khi cập nhật thông báo ID ${idthongbao}:`, error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi cập nhật thông báo.' });
    }
};
export const deleteNotification = async (req, res) => {
    const { idthongbao } = req.params;

    try {
        const notification = await ThongBao.findByPk(idthongbao);

        if (!notification) {
            return res.status(404).json({ message: `Không tìm thấy thông báo với ID: ${idthongbao}.` });
        }

        // ⭐ Xóa mềm (Soft Delete) - Cập nhật trạng thái thành -1
        // Nếu mô hình của bạn không có trường 'trangthai', bạn phải dùng force: true để xóa cứng
        await notification.update({ trangthai: -1 });

        // HOẶC Xóa cứng (Hard Delete) nếu bạn chắc chắn:
        // await notification.destroy();

        return res.status(200).json({
            message: `Xóa thông báo ID ${idthongbao} thành công!`
        });

    } catch (error) {
        console.error(`Lỗi khi xóa thông báo ID ${idthongbao}:`, error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi xóa thông báo.' });
    }
};
export const updateUser = async (req, res) => {
    // Lấy ID người dùng từ req.params để đồng bộ với định tuyến (router)

    
    // Lấy các trường cần cập nhật và đường dẫn ảnh cũ từ req.body (FormData)
    const { idnguoidung, hoten, sodienthoai, anhdaidien: currentAvatarUrl } = req.body; 
    
    // Đối tượng chứa các trường sẽ được cập nhật
    const updateFields = {
        hoten: hoten,
        sodienthoai: sodienthoai,
        // Không cho phép cập nhật email hoặc vai trò qua API này
    };

    try {
        // 1. Tìm người dùng trong cơ sở dữ liệu
        const User = await NguoiDung.findByPk(idnguoidung);
        
        if (!User) {
            return res.status(404).json({ message: `Không tìm thấy người dùng với ID: ${idnguoidung}.` });
        }

        let newAvatarPath = User.anhdaidien; // Mặc định là đường dẫn ảnh cũ từ DB

        // 2. Xử lý logic Ảnh đại diện
        if (req.file) {
            // Trường hợp 1: CÓ FILE MỚI được upload.
            // Giả định middleware upload file (vd: multer) đã xử lý và lưu file
            newAvatarPath = `/uploads/avatars/${req.file.filename}`;
            
            // ⭐ Tùy chọn: Thêm logic xóa file ảnh cũ (User.anhdaidien) trên server nếu cần
            
        } else if (currentAvatarUrl && !currentAvatarUrl.startsWith('blob:')) {
            // Trường hợp 2: KHÔNG CÓ FILE MỚI, nhưng client gửi lại đường dẫn ảnh cũ (hoặc đường dẫn mặc định).
            // Điều kiện !currentAvatarUrl.startsWith('blob:') đảm bảo không sử dụng URL tạm thời của trình duyệt.
            newAvatarPath = currentAvatarUrl; 
        } 
        // Trường hợp 3: Giữ nguyên newAvatarPath = User.anhdaidien nếu không có thay đổi.
        
        // Cập nhật đường dẫn ảnh đại diện vào đối tượng updateFields
        updateFields.anhdaidien = newAvatarPath;
        
        // 3. Thực hiện cập nhật các trường
        await User.update(updateFields);

        // 4. Lấy lại thông tin người dùng đã được cập nhật để trả về client
        // Điều này đảm bảo client nhận được thông tin mới nhất, bao gồm cả đường dẫn ảnh mới.
        const updatedUser = await NguoiDung.findByPk(idnguoidung);

        return res.status(200).json({
            message: `Cập nhật hồ sơ người dùng ID ${idnguoidung} thành công!`,
            updatedUser: {
                id: updatedUser.id,
                hoten: updatedUser.hoten,
                sodienthoai: updatedUser.sodienthoai,
                email: updatedUser.email, // giữ lại email cũ
                role: updatedUser.role, // giữ lại role cũ
                anhdaidien: updatedUser.anhdaidien, // đường dẫn ảnh đã cập nhật
            }
        });

    } catch (error) {
        console.error(`Lỗi khi Cập nhật người dùng ID ${idnguoidung}:`, error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi Cập nhật người dùng.' });
    }
}
export const changePassword = async (req, res) => {
    // 1. Destructure from req.body, now including oldpassword
    const { idnguoidung, oldpassword, newpassword } = req.body;

    // Basic validation (Xác thực cơ bản: kiểm tra đủ các trường cần thiết)
    if (!idnguoidung || !oldpassword || !newpassword) {
        return res.status(400).json({ message: 'Missing user ID, old password, or new password.' });
    }

    try {
        // 2. Find the user by primary key (idnguoidung)
        const User = await NguoiDung.findByPk(idnguoidung);

        if (!User) {
            // User not found
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // 3. FIX: Check if the user has a password hash stored before comparing
        if (!User.matkhau) {
             console.warn(`User ${idnguoidung} found, but password hash is missing. Denying access.`);
             // Treat as incorrect password for security (to avoid leaking existence of user without password)
             return res.status(401).json({ message: 'Incorrect old password.' });
        }

        // 4. SECURITY STEP: Verify the old password
        const isMatch = await bcrypt.compare(oldpassword, User.matkhau);
        
        if (!isMatch) {
            // If the old password does not match the stored hash, deny access
            return res.status(401).json({ message: 'Incorrect old password.' });
        }
        
        // 5. Hash the new password before storing it
        const hashedPassword = await bcrypt.hash(newpassword, 10);

        // 6. Update the user's password field with the new hash
        User.matkhau = hashedPassword;

        // 7. Save the updated user record to the database
        await User.save();

        // 8. Send success response
        return res.status(200).json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ message: 'An error occurred during password change.', error: error.message });
    }
};
