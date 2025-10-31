import jwt from "jsonwebtoken";
import { NguoiDung } from "../models/index.js";

export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "schoolbus_secret_key");

    const user = await NguoiDung.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });

    res.status(200).json({
      id: user.id,
      hoten: user.hoten,
      email: user.email,
      vaitro: user.vaitro,
      anhdaidien: user.anhdaidien,
      trangthai: user.trangthai,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
  }
};
