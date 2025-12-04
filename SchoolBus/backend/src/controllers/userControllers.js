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
    // --------------------------------------------------------------
    // 1. XÁC THỰC TOKEN
    // --------------------------------------------------------------
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");
    const userId = decoded.id;

    // --------------------------------------------------------------
    // 2. TÌM PHỤ HUYNH & DANH SÁCH HỌC SINH
    // --------------------------------------------------------------
    const parentInfo = await PhuHuynh.findOne({
      where: { idnguoidung: userId },
      attributes: ["idphuhuynh"]
    });

    if (!parentInfo) {
      return res.status(404).json({ message: "Không tìm thấy thông tin phụ huynh.", schedules: [] });
    }

    const children = await HocSinh.findAll({
      where: { idphuhuynh: parentInfo.idphuhuynh },
      attributes: ["mahocsinh"]
    });

    const studentIds = children.map((child) => child.mahocsinh);

    if (studentIds.length === 0) {
      return res.status(200).json({
        message: "Người dùng này chưa có học sinh nào được liên kết.",
        schedules: []
      });
    }

    // --------------------------------------------------------------
    // 3. XÂY DỰNG ĐIỀU KIỆN LIKE DS HỌC SINH
    // --------------------------------------------------------------
    const searchConditions = studentIds.flatMap((id) => [
      { danhsachhocsinh: { [Op.like]: `[${id},%` } },
      { danhsachhocsinh: { [Op.like]: `%,${id},%` } },
      { danhsachhocsinh: { [Op.like]: `%,${id}]` } },
      { danhsachhocsinh: { [Op.like]: `[${id}]` } }
    ]);

    const today = new Date().toISOString().split("T")[0];

    // --------------------------------------------------------------
    // 4. LẤY LỊCH + TUYẾN + XE + TÀI XẾ
    // --------------------------------------------------------------
    let schedules = await LichChuyen.findAll({
      where: {
        [Op.or]: searchConditions,
        ngaydi: today
      },
      include: [
        {
          model: TuyenDuong,
          as: "tuyenDuongInfo",
          attributes: { include: ["dsdiemdung"] }
        },
        {
          model: XeBuyt,
          as: "xebuyt",
          attributes: ["bienso"],
          include: [
            {
              model: ViTriXe,
              as: "vitrixe",
              attributes: ["kinhdo", "vido"]
            }
          ]
        },
        {
          model: TaiXe,
          as: "taixe",
          attributes: ["kinhnghiem"],
          include: [
            {
              model: NguoiDung,
              as: "userInfo",
              attributes: ["hoten", "sodienthoai", "anhdaidien"]
            }
          ]
        }
      ]
    });

    // --------------------------------------------------------------
    // 5. TRẠNG THÁI ĐÓN TRẢ
    // --------------------------------------------------------------
    const scheduleIds = schedules.map((s) => s.idlich);

    let trangThaiDonTraList = [];
    if (scheduleIds.length > 0) {
      trangThaiDonTraList = await TrangThaiDonTra.findAll({
        where: { idlich: scheduleIds }
      });
    }

    const trangThaiMap = trangThaiDonTraList.reduce((map, tt) => {
      map[`${tt.idlich}_${tt.idhocsinh}`] = tt.toJSON();
      return map;
    }, {});

    // --------------------------------------------------------------
    // 6. TRUY VẤN ĐIỂM DỪNG
    // --------------------------------------------------------------
    let allPointIds = new Set();
    schedules.forEach((s) => {
      if (s.tuyenDuongInfo) {
        pointIds(s.tuyenDuongInfo.dsdiemdung).forEach((id) => allPointIds.add(id));
      }
    });

    const pointMap = {};
    if (allPointIds.size > 0) {
      const pointsDetail = await DiemDung.findAll({
        where: { iddiemdung: Array.from(allPointIds) },
        attributes: ["iddiemdung", "tendiemdon", "diachi", "kinhdo", "vido", "trangthai"]
      });

      pointsDetail.forEach((p) => (pointMap[p.iddiemdung] = p.toJSON()));
    }

    // --------------------------------------------------------------
    // 7. TRUY VẤN THÔNG TIN HỌC SINH
    // --------------------------------------------------------------
    let allStudentIds = new Set();
    schedules.forEach((s) => {
      parseStudentIds(s.danhsachhocsinh).forEach((id) => allStudentIds.add(id));
    });

    const studentMap = {};
    if (allStudentIds.size > 0) {
      const studentsDetail = await HocSinh.findAll({
        where: { mahocsinh: Array.from(allStudentIds) },
        attributes: [
          "mahocsinh",
          "hoten",
          "lop",
          "namsinh",
          "gioitinh",
          "anhdaidien",
          "idphuhuynh",
          "iddiemdon"
        ]
      });

      studentsDetail.forEach((stu) => (studentMap[stu.mahocsinh] = stu.toJSON()));
    }

    // --------------------------------------------------------------
    // 8. TRUY VẤN THÔNG BÁO THEO LỊCH (BỔ SUNG MỚI)
    // --------------------------------------------------------------
    let thongBaoList = [];
    if (scheduleIds.length > 0) {
      thongBaoList = await ThongBao.findAll({
        where: { idlich: scheduleIds },
        order: [['thoigiangui', 'DESC']]
        // attributes: ["idthongbao", "idlich", "noidung", "createdAt"]
      });
    }

    const thongBaoMap = thongBaoList.reduce((map, tb) => {
      if (!map[tb.idlich]) map[tb.idlich] = [];
      map[tb.idlich].push(tb.toJSON());
      return map;
    }, {});

    // --------------------------------------------------------------
    // 9. BUILD FINAL SCHEDULES
    // --------------------------------------------------------------
    const finalSchedules = schedules.map((schedule) => {
      const scheduleData = schedule.toJSON();
      const idlich = scheduleData.idlich;

      // 9a. Điểm dừng
      if (scheduleData.tuyenDuongInfo) {
        const ids = pointIds(scheduleData.tuyenDuongInfo.dsdiemdung);
        scheduleData.tuyenDuongInfo.diemDungDetails = ids
          .map((id) => pointMap[id])
          .filter((x) => x);
        delete scheduleData.tuyenDuongInfo.dsdiemdung;
      }

      // 9b. Học sinh của phụ huynh + trạng thái
      const idsInSchedule = parseStudentIds(scheduleData.danhsachhocsinh);
      const myChildrenIds = idsInSchedule.filter((id) => studentIds.includes(id));

      scheduleData.myChildren = myChildrenIds
        .map((id) => {
          const stu = studentMap[id];
          if (stu) {
            const tt = trangThaiMap[`${idlich}_${id}`];
            stu.trangThaiDonTra = tt
              ? { loaitrangthai: tt.loaitrangthai }
              : { loaitrangthai: -1, trangthai_text: "Chưa cập nhật" };
          }
          return stu;
        })
        .filter((x) => x);

      // 9c. Gắn danh sách THÔNG BÁO
      scheduleData.thongbao = thongBaoMap[idlich] || [];

      delete scheduleData.trangThaiDonTras;

      return scheduleData;
    });

    // --------------------------------------------------------------
    // 10. RESPONSE
    // --------------------------------------------------------------
    res.status(200).json({
      message: "Lấy danh sách lịch trình thành công!",
      count: finalSchedules.length,
      schedules: finalSchedules
    });

  } catch (error) {
    console.error("❌ Lỗi lấy danh sách lịch chuyến theo học sinh:", error);

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
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
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Chưa đăng nhập!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");
        const idnguoidung = decoded.id;

        // 1. SỬA LỖI CÚ PHÁP: Lấy dữ liệu từ req.body
        const { tieude, noidung } = req.body;

        // 2. KIỂM TRA DỮ LIỆU ĐẦU VÀO
        if (!tieude || !noidung) {
            return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung thông báo!" });
        }

        // 3. TÌM PHỤ HUYNH
        const parent = await PhuHuynh.findOne({
            where: {
                idnguoidung: idnguoidung
            },
        });

        // 4. KIỂM TRA PHỤ HUYNH TỒN TẠI
        if (!parent) {
            return res.status(404).json({ message: "Không tìm thấy thông tin phụ huynh!" });
        }
        
        // 5. TẠO THÔNG BÁO
        const notifications = await ThongBao.create({
            idnguoigui: null, // Giả sử 0 là Hệ thống/Admin
            idphuhuynh: parent.idphuhuynh,
            tieude: tieude,
            noidung: noidung,
        });

        // 6. TRẢ VỀ KẾT QUẢ
        return res.status(201).json(notifications); // Dùng 201 Created cho hành động tạo mới
    } catch (error) {
        console.error("❌ Lỗi thêm thông báo:", error);
        
        // Xử lý lỗi JWT hết hạn/không hợp lệ
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn!", error: error.message });
        }
        
        res.status(500).json({
            message: "Lỗi máy chủ khi thêm thông báo!",
            error: error.message
        });
    }
}
export const getAllNotification = async (req, res) => {
    try{
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Chưa đăng nhập! (No token provided)" });
        }

        // Verify the token and extract the user ID (idnguoidung)
        // Assuming the ID is stored in the 'id' field of the JWT payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");
        const idnguoidung = decoded.id; // This is the recipient ID (idnguoinhan)
        const parent = await PhuHuynh.findOne({
          where: {
                idnguoidung: idnguoidung 
            },

        })
        console.log("hehe",parent.idphuhuynh)

        // 1. Fetch notifications where the recipient ID matches the authenticated user's ID
        // (Sử dụng Sequelize-style query: where: { idnguoinhan: idnguoidung })
        const notifications = await ThongBao.findAll({
    where: {
        trangthai: { [Op.ne]: -1 },
        [Op.or]: [
            { idphuhuynh: parent.idphuhuynh },
            { idvaitro: "0" },
            { idvaitro: "2" }
        ]
    },
    
    include: [
      {
                    model: NguoiDung,
         
                    attributes: ['id', 'hoten', 'vaitro'],
                    required: false
                },
        {
            model: PhuHuynh,
            include: [
                {
                    model: NguoiDung,
                    as: "userInfo",
                    attributes: ["id", "hoten", "vaitro"],
                    required: false
                }
            ],
            attributes: ["idphuhuynh"],
            required: false,
            where: {
                idphuhuynh: {
                    [Op.ne]: null
                }
            }
        }
    ],
    
    order: [["thoigiangui", "DESC"]] // Nếu muốn
});

        
        // 2. Return the list of notifications
        return res.status(200).json(notifications);

    } catch(error) {
        console.error('Error fetching notifications:', error);
        
        // Handle JWT verification errors specifically
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
        }
        
        return res.status(500).json({ message: 'Lỗi server khi lấy thông báo.', error: error.message });
    }
}