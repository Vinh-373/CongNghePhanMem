import jwt from "jsonwebtoken";
import { NguoiDung, PhuHuynh, HocSinh, LichChuyen, TuyenDuong, DiemDung, TrangThaiDonTra, TaiXe, XeBuyt, DangKyDiemDon,ViTriXe,ThongBao} from "../models/index.js";
import { where } from "sequelize";
import { Op } from 'sequelize';


export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");

    const user = await NguoiDung.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });

    // Base response (tất cả role)
    const baseResponse = {
      id: user.id,
      hoten: user.hoten,
      email: user.email,
      vaitro: user.vaitro,
      anhdaidien: user.anhdaidien,
      trangthai: user.trangthai,
      sodienthoai: user.sodienthoai,
    };

    // Nếu là Phụ Huynh (vaitro = 1), lấy thêm thông tin từ bảng PhuHuynh
    if (user.vaitro === 2) {
      const parentInfo = await PhuHuynh.findOne({
        where: { idnguoidung: user.id }
      });

      if (parentInfo) {
        return res.status(200).json({
          ...baseResponse,
          // Thông tin bổ sung từ bảng PhuHuynh
          diachi: parentInfo.diachi || "",
          idphuhuynh: parentInfo.idphuhuynh, // ID trong bảng PhuHuynh
        });
      } else {
        // Trường hợp user có vaitro = 1 nhưng chưa có record trong PhuHuynh
        console.warn(`⚠️ User ${user.id} có vaitro = 2 nhưng không có thông tin PhuHuynh`);
        return res.status(200).json({
          ...baseResponse,
          diachi: "",
          warning: "Chưa có thông tin phụ huynh. Vui lòng cập nhật!"
        });
      }
    }

    // Các role khác (Admin = 0, Driver = 2)
    res.status(200).json(baseResponse);

  } catch (error) {
    console.error("❌ Lỗi getMe:", error);

    // Xử lý lỗi JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Token không hợp lệ!" });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn!" });
    }

    res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
  }
};

// ========== KIỂM TRA HỌC SINH ==========
/**
 * API kiểm tra học sinh có tồn tại hay chưa
 * Query: studentId (mã học sinh)
 */
export const checkStudentExists = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: "Vui lòng cung cấp mã học sinh!" });
    }

    // Tìm kiếm học sinh theo mã
    const student = await HocSinh.findOne({
      where: { mahocsinh: studentId }
    });

    if (!student) {
      return res.status(404).json({
        message: "Học sinh không tồn tại!",
        exists: false
      });
    }

    // Nếu tìm thấy, kiểm tra phụ huynh
    const parentInfo = await PhuHuynh.findOne({
      where: { idphuhuynh: student.idphuhuynh }
    });

    const parentUser = parentInfo
      ? await NguoiDung.findByPk(parentInfo.idnguoidung)
      : null;

    return res.status(200).json({
      message: "Học sinh tồn tại!",
      exists: true,
      student: {
        mahocsinh: student.mahocsinh,
        hoten: student.hoten,
        lop: student.lop,
        gioitinh: student.gioitinh,
      },
      parentLinked: {
        exists: !!parentUser,
        parentInfo: parentUser ? {
          id: parentUser.id,
          hoten: parentUser.hoten,
          email: parentUser.email,
          sodienthoai: parentUser.sodienthoai,
        } : null
      }
    });
  } catch (error) {
    console.error("❌ Lỗi kiểm tra học sinh:", error);
    res.status(500).json({
      message: "Lỗi máy chủ khi kiểm tra học sinh!",
      error: error.message
    });
  }
};

/**
 * API lấy danh sách các học sinh của phụ huynh hiện tại
 */
export const getMyChildren = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");
    const userId = decoded.id;

    // Tìm thông tin phụ huynh
    const parentInfo = await PhuHuynh.findOne({
      where: { idnguoidung: userId }
    });

    if (!parentInfo) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin phụ huynh!",
        children: []
      });
    }

    // Tìm các học sinh của phụ huynh này
    const children = await HocSinh.findAll({
      where: { idphuhuynh: parentInfo.idphuhuynh }
    });

    res.status(200).json({
      message: "Lấy danh sách học sinh thành công!",
      count: children.length,
      children: children.map(child => ({
        mahocsinh: child.mahocsinh,
        hoten: child.hoten,
        lop: child.lop,
        gioitinh: child.gioitinh,
        namsinh: child.namsinh,
        anhdaidien: child.anhdaidien,
      }))
    });
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách học sinh:", error);
    res.status(500).json({
      message: "Lỗi máy chủ khi lấy danh sách học sinh!",
      error: error.message
    });
  }
};

export const linkStudentToParent = async (req, res) => {
  try {
    // 1. Xác thực token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Chưa đăng nhập!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");
    const userId = decoded.id;

    // 2. Validate input
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({
        message: "Vui lòng cung cấp mã học sinh!"
      });
    }

    // 3. Tìm thông tin phụ huynh hiện tại
    const parentInfo = await PhuHuynh.findOne({
      where: { idnguoidung: userId }
    });

    if (!parentInfo) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin phụ huynh. Vui lòng liên hệ quản trị viên!"
      });
    }

    // 4. Tìm học sinh theo mã
    const student = await HocSinh.findOne({
      where: { mahocsinh: studentId }
    });

    if (!student) {
      return res.status(404).json({
        message: "Mã học sinh không tồn tại trong hệ thống!"
      });
    }

    // 5. Kiểm tra học sinh đã được liên kết chưa
    if (student.idphuhuynh) {
      // Lấy thông tin phụ huynh hiện tại của học sinh
      const existingParent = await PhuHuynh.findOne({
        where: { idphuhuynh: student.idphuhuynh }
      });

      if (existingParent) {
        const existingParentUser = await NguoiDung.findByPk(existingParent.idnguoidung);
        return res.status(400).json({
          message: `Học sinh này đã được liên kết với phụ huynh: ${existingParentUser?.hoten || 'Không rõ'}`,
          existingParent: {
            hoten: existingParentUser?.hoten,
            email: existingParentUser?.email,
            sodienthoai: existingParentUser?.sodienthoai,
          }
        });
      }
    }

    // 6. Kiểm tra xem phụ huynh đã có học sinh này chưa (tránh duplicate)
    const alreadyLinked = await HocSinh.findOne({
      where: {
        mahocsinh: studentId,
        idphuhuynh: parentInfo.idphuhuynh
      }
    });

    if (alreadyLinked) {
      return res.status(400).json({
        message: "Bạn đã liên kết với học sinh này rồi!"
      });
    }

    // 7. Cập nhật idphuhuynh cho học sinh
    await student.update({
      idphuhuynh: parentInfo.idphuhuynh
    });

    // 8. Log hoạt động (optional - để audit trail)
    console.log(`✅ Phụ huynh ${userId} đã liên kết với học sinh ${studentId}`);

    // 9. Trả về thông tin học sinh đã liên kết
    res.status(200).json({
      message: "Liên kết học sinh thành công!",
      student: {
        mahocsinh: student.mahocsinh,
        hoten: student.hoten,
        lop: student.lop,
        gioitinh: student.gioitinh,
        namsinh: student.namsinh,
        anhdaidien: student.anhdaidien,
      }
    });

  } catch (error) {
    console.error("❌ Lỗi khi liên kết học sinh:", error);

    // Xử lý lỗi JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Token không hợp lệ!"
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"
      });
    }

    res.status(500).json({
      message: "Lỗi máy chủ khi liên kết học sinh!",
      error: error.message
    });
  }
};
const parseStudentIds = (jsonString) => {
  try {
    if (!jsonString) return [];
    // Parse chuỗi JSON thành mảng
    const ids = JSON.parse(jsonString);
    return Array.isArray(ids) ? ids : [];
  } catch (e) {
    console.error("Lỗi khi parse chuỗi danhsachhocsinh:", jsonString, e);
    return [];
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

export const getSchedulesByMyChildren = async (req, res) => {
  try {
    // --- 1. XÁC THỰC VÀ LẤY USER ID ---
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");
    const userId = decoded.id;

    // --- 2. TÌM ID PHỤ HUYNH & HỌC SINH (Con của họ) ---
    const parentInfo = await PhuHuynh.findOne({
      where: { idnguoidung: userId },
      attributes: ['idphuhuynh']
    });

    if (!parentInfo) {
      return res.status(404).json({ message: "Không tìm thấy thông tin phụ huynh.", schedules: [] });
    }

    const children = await HocSinh.findAll({
      where: { idphuhuynh: parentInfo.idphuhuynh },
      attributes: ['mahocsinh']
    });

    const studentIds = children.map(child => child.mahocsinh);

    if (studentIds.length === 0) {
      return res.status(200).json({ message: "Người dùng này chưa có học sinh nào được liên kết.", schedules: [] });
    }

    // --- 3. XÂY DỰNG ĐIỀU KIỆN TÌM KIẾM ---
    const searchConditions = studentIds.flatMap(id => [
      { danhsachhocsinh: { [Op.like]: `[${id},%` } },
      { danhsachhocsinh: { [Op.like]: `%,${id},%` } },
      { danhsachhocsinh: { [Op.like]: `%,${id}]` } },
      { danhsachhocsinh: { [Op.like]: `[${id}]` } }
    ]);
    const today = new Date().toISOString().split('T')[0];

    // --- 4. TRUY VẤN LỊCH TRÌNH VÀ CÁC MỐI QUAN HỆ ---
    let schedules = await LichChuyen.findAll({
      where: {
        [Op.or]: searchConditions,
        ngaydi: today
      },
      include: [
        {
          model: TuyenDuong,
          as: 'tuyenDuongInfo',
          attributes: { include: ['dsdiemdung'] }
        },
        {
          model: XeBuyt,
          as: 'xebuyt', // <--- SỬ DỤNG ALIAS THEO KẾT QUẢ JSON CỦA BẠN
          attributes: ['bienso'],
          include: [{
            model: ViTriXe,
            as: 'vitrixe',
            attributes: ['kinhdo', 'vido']
          }]
        },
        {
          model: TaiXe,
          as: 'taixe', // <--- SỬ DỤNG ALIAS THEO KẾT QUẢ JSON CỦA BẠN
          attributes: ['kinhnghiem'],
          include: [{
            model: NguoiDung,
            as: 'userInfo',
            attributes: ['hoten', 'sodienthoai', 'anhdaidien']
          }]
        }
      ],
      // order: ...
    });

    // --------------------------------------------------------------------
    // TRUY VẤN BỔ SUNG: TRẠNG THÁI ĐÓN TRẢ
    // --------------------------------------------------------------------
    const scheduleIds = schedules.map(schedule => schedule.idlich);
    let trangThaiDonTraList = [];
    if (scheduleIds.length > 0) {
      trangThaiDonTraList = await TrangThaiDonTra.findAll({
        where: {
          idlich: scheduleIds
        }
      });
    }

    // Tạo Map { idlich_mahocsinh: {trạng thái} }
    const trangThaiMap = trangThaiDonTraList.reduce((map, tt) => {
      // Giả định trường ID học sinh trong TrangThaiDonTra là idhocsinh
      map[`${tt.idlich}_${tt.idhocsinh}`] = tt.toJSON();
      return map;
    }, {});


    // --------------------------------------------------------------------
    // TRUY VẤN BỔ SUNG: ĐIỂM DỪNG (TWO-STEP QUERY)
    // --------------------------------------------------------------------
    let allPointIds = new Set();
    schedules.forEach(schedule => {
      const routeData = schedule.tuyenDuongInfo;
      if (routeData) {
        const ids = pointIds(routeData.dsdiemdung);
        ids.forEach(id => allPointIds.add(id));
      }
    });

    const uniquePointIds = Array.from(allPointIds);
    let pointMap = {};

    if (uniquePointIds.length > 0) {
      const pointsDetail = await DiemDung.findAll({
        where: { iddiemdung: uniquePointIds },
        attributes: ['iddiemdung', 'tendiemdon', 'diachi', 'kinhdo', 'vido', 'trangthai']
      });
      pointMap = pointsDetail.reduce((map, point) => {
        map[point.iddiemdung] = point.toJSON();
        return map;
      }, {});
    }

    // --------------------------------------------------------------------
    // TRUY VẤN BỔ SUNG: HỌC SINH (TWO-STEP QUERY)
    // --------------------------------------------------------------------
    let allStudentIds = new Set();
    schedules.forEach(schedule => {
      const ids = parseStudentIds(schedule.danhsachhocsinh);
      ids.forEach(id => allStudentIds.add(id));
    });

    const uniqueStudentIds = Array.from(allStudentIds);
    let studentMap = {};
    if (uniqueStudentIds.length > 0) {
      const studentsDetail = await HocSinh.findAll({
        where: { mahocsinh: uniqueStudentIds },
        attributes: ['mahocsinh', 'hoten', 'lop', 'namsinh', 'gioitinh', 'anhdaidien', 'idphuhuynh', 'iddiemdon']
      });
      studentMap = studentsDetail.reduce((map, student) => {
        map[student.mahocsinh] = student.toJSON();
        return map;
      }, {});
    }

    // --------------------------------------------------------------------
    // BƯỚC 6: GẮN CHI TIẾT VÀO LỊCH TRÌNH VÀ LOẠI BỎ DỮ LIỆU THỪA
    // --------------------------------------------------------------------
    const finalSchedules = schedules.map(schedule => {
      const scheduleData = schedule.toJSON();
      const idlich = scheduleData.idlich;

      // 6a. Gắn chi tiết điểm dừng vào tuyến đường
      if (scheduleData.tuyenDuongInfo) {
        const idsInRoute = pointIds(scheduleData.tuyenDuongInfo.dsdiemdung);
        const detailedPoints = idsInRoute
          .map(id => pointMap[id])
          .filter(point => point);

        scheduleData.tuyenDuongInfo.diemDungDetails = detailedPoints;
        delete scheduleData.tuyenDuongInfo.dsdiemdung;
      }

      // 6b. Gắn chi tiết con của phụ huynh VÀ TRẠNG THÁI
      const idsInSchedule = parseStudentIds(scheduleData.danhsachhocsinh);
      const myChildrenIdsInSchedule = idsInSchedule.filter(id => studentIds.includes(id));

      const detailedMyChildren = myChildrenIdsInSchedule
        .map(id => {
          const studentDetail = studentMap[id];
          if (studentDetail) {
            // Gán trạng thái đón/trả vào chi tiết học sinh
            const trangThai = trangThaiMap[`${idlich}_${id}`];
            // Thêm trạng thái vào studentDetail
            studentDetail.trangThaiDonTra = trangThai ? { loaitrangthai: trangThai.loaitrangthai } : { loaitrangthai: -1, trangthai_text: 'Chưa cập nhật' };
          }
          return studentDetail;
        })
        .filter(student => student);

      scheduleData.myChildren = detailedMyChildren;

      // Yêu cầu: LOẠI BỎ MẢNG trangThaiDonTras KHỎI KẾT QUẢ CUỐI CÙNG
      delete scheduleData.trangThaiDonTras;

      return scheduleData;
    });

    res.status(200).json({
      message: "Lấy danh sách lịch trình thành công!",
      count: finalSchedules.length,
      schedules: finalSchedules
    });

  } catch (error) {
    console.error("❌ Lỗi lấy danh sách lịch chuyến theo học sinh:", error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn!" });
    }

    res.status(500).json({
      message: "Lỗi máy chủ khi lấy danh sách lịch chuyến!",
      error: error.message
    });
  }
};
export const addRegisteredPoint = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");
    const userId = decoded.id;

    // Tìm thông tin phụ huynh
    const parentInfo = await PhuHuynh.findOne({
      where: { idnguoidung: userId }
    });

    if (!parentInfo) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin phụ huynh!",
        children: []
      });
    }
    const children = await HocSinh.findAll({
      where: { idphuhuynh: parentInfo.idphuhuynh }
    });
    const studentIds = children.map(child => child.mahocsinh);
    const { iddiemdung } = req.params;
    for (const mahocsinh of studentIds) {
      await DangKyDiemDon.create({
        mahocsinh,
        iddiemdung,
        thoigiandangky: new Date(),
        trangthai: 0,
        idphuhuynh: parentInfo.idphuhuynh
      });
    }

    res.status(200).json({ message: "Đăng ký điểm đón thành công!" });
  } catch (error) {
    console.error("❌ Lỗi đăng ký điểm đón:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi đăng ký điểm đón!", error: error.message });
  }
};
export const addNotification = async (req, res) => {
  try{
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");
    const idnguoidung = decoded.id;
    const { tieude, noidung } = req.body;
    const newNotification = await ThongBao.create({idnguoidung,tieude,noidung});
    res.status(201).json({
            message: "Thêm thông báo thành công!",
            newNotification
        });
    } catch (error) {
        console.error("❌ Lỗi thêm thông báo:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm thông báo!",
            error: error.message
        });
    }
}
