import React, { useState, useEffect } from "react";
import AuthLayout from "./AuthLayout";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  // ✅ Nếu đã đăng nhập thì chuyển sang dashboard tương ứng
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        // Điều hướng theo role (vaitro)
        // 0: Admin, 1: Tài xế, 2: Phụ huynh
        if (userData.vaitro === 0) {
          navigate("/admin/schoolbus/dashboard");
        } else if (userData.vaitro === 1) {
          navigate("/driver/schoolbus/dashboard");
        } else if (userData.vaitro === 2) {
          navigate("/parent/schoolbus/dashboard");
        }
      } catch (err) {
        console.error("Lỗi parse user:", err);
      }
    }
  }, [navigate]);

  // ✅ Trạng thái form và lỗi
  const [form, setForm] = useState({ email: "", matkhau: "" });
  const [errors, setErrors] = useState({});

  // ------------------ Xử lý thay đổi input ------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ------------------ Kiểm tra dữ liệu ------------------
  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = "Email không được để trống.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (!form.matkhau.trim()) {
      newErrors.matkhau = "Mật khẩu không được để trống.";
    } else if (form.matkhau.length < 6) {
      newErrors.matkhau = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------ Xử lý đăng nhập ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.warning("⚠️ Vui lòng kiểm tra lại thông tin đăng nhập.");
      return;
    }

    const payload = {
      email: form.email.trim(),
      matkhau: form.matkhau.trim(), // 👈 gửi đúng tên field mà backend yêu cầu
    };

    try {
      const response = await fetch("http://localhost:5001/schoolbus/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại.");
      }

      // 🔍 Kiểm tra trạng thái tài khoản
      if (data.user.trangthai === 0) {
        toast.error("🚫 Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!");
        return;
      }

      if (data.user.trangthai === 1) {
        toast.warning("⏳ Tài khoản của bạn đang chờ phê duyệt. Hãy quay lại sau!");
        return;
      }

      // ✅ Thành công (trạng thái 2)
      toast.success("🎉 Đăng nhập thành công!");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Điều hướng theo role (vaitro)
      // 0: Admin, 1: Tài xế, 2: Phụ huynh
      setTimeout(() => {
        if (data.user.vaitro === 0) {
          navigate("/admin/schoolbus/dashboard");
        } else if (data.user.vaitro === 1) {
          navigate("/driver/schoolbus/dashboard");
        } else if (data.user.vaitro === 2) {
          navigate("/parent/schoolbus/dashboard");
        }
      }, 800);
    } catch (err) {
      toast.error(`❌ Lỗi đăng nhập: ${err.message}`);
    }

    console.log("Form data before submit:", form);
  };

  // ------------------ Giao diện ------------------
  return (
    <AuthLayout
      title="Welcome"
      subtitle="Login to your account to continue"
      sideTitle="Welcome Back!"
      sideDesc="To stay connected with us please login with your personal info"
      sideButtonText="SIGN UP"
      sideButtonLink="/schoolbus/register"
    >
      <form onSubmit={handleSubmit} className="w-full">
        {/* Email */}
        <input
          name="email"
          type="email"
          placeholder="Email..."
          value={form.email}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-2xl outline-none focus:ring-2 ${
            errors.email ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2 px-2.5">{errors.email}</p>
        )}

        {/* Mật khẩu */}
        <input
          name="matkhau"
          type="password"
          placeholder="Mật khẩu..."
          value={form.matkhau}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-2xl outline-none focus:ring-2 ${
            errors.matkhau ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.matkhau && (
          <p className="text-red-500 text-sm mb-2 px-2.5">{errors.matkhau}</p>
        )}

        <p className="text-sm text-gray-400 self-end mb-4 cursor-pointer hover:text-yellow-600">
          Quên mật khẩu?
        </p>

        <button
          type="submit"
          className="w-full bg-[#e9cf3f] text-white py-3 rounded-full font-bold hover:bg-yellow-500 transition"
        >
          ĐĂNG NHẬP
        </button>

        <p className="text-sm text-gray-500 mt-5 text-center">
          Chưa có tài khoản?{" "}
          <a
            href="/schoolbus/register"
            className="text-teal-500 hover:underline font-medium"
          >
            Đăng ký ngay
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
