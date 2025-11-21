import jwt from "jsonwebtoken";
import { NguoiDung, PhuHuynh, HocSinh } from "../models/index.js";

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

