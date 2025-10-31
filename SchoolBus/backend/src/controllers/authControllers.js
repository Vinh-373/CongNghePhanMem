import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NguoiDung } from "../models/index.js";
// ---------------- ĐĂNG KÝ ----------------
export const register = async (req, res) => {
  try {
    const { hoten, dienthoai, email, diachi, matkhau } = req.body;

    // Kiểm tra email tồn tại
    const existed = await NguoiDung.findOne({ where: { email } });
    if (existed) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(matkhau, 10);

    // Xử lý ảnh đại diện
    let anhdaidien = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // Tạo người dùng mới
    const newUser = await NguoiDung.create({
      hoten,
      sodienthoai: dienthoai,
      email,
      diachi,
      matkhau: hashedPassword,
      vaitro: 2, // Mặc định là user
      trangthai: 1, // Đang chờ phê duyệt
      anhdaidien,
    });

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        id: newUser.id,
        hoten: newUser.hoten,
        email: newUser.email,
        anhdaidien: newUser.anhdaidien,
        trangthai: newUser.trangthai,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi đăng ký!" });
  }
};

// ---------------- ĐĂNG NHẬP ----------------
export const login = async (req, res) => {
  try {
    const { email, matkhau } = req.body;

    // ✅ Kiểm tra dữ liệu nhập vào
    if (!email || !matkhau) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mật khẩu!" });
    }

    // ✅ Tìm người dùng theo email
    const user = await NguoiDung.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    // ✅ So sánh mật khẩu (giải mã hóa bằng bcrypt)
    const isMatch = await bcrypt.compare(matkhau, user.matkhau);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không chính xác!" });
    }

    // ✅ Tạo JWT token
    const token = jwt.sign(
      { id: user.id, vaitro: user.vaitro },
      process.env.JWT_SECRET || "schoolbus_secret_key",
      { expiresIn: "7d" }
    );

    // ✅ Phản hồi kết quả
    return res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        hoten: user.hoten,
        email: user.email,
        vaitro: user.vaitro,
        anhdaidien: user.anhdaidien,
        trangthai: user.trangthai,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error.message);
    console.error(error.stack);
    return res.status(500).json({ message: "Lỗi máy chủ khi đăng nhập!", error: error.message });
  }
};