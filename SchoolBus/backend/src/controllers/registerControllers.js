import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
    const { email, username, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: "Đăng ký thành công", user: newUser });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};