import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import { toast } from "sonner"; // 🟢 Thêm dòng này
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = "Email không được để trống.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (!form.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống.";
    } else if (form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const payload = {
        email: form.email,
        password: form.password,
      };

      try {
        const response = await fetch("http://localhost:5001/schoolbus/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Đăng nhập thất bại");
        }

        console.log("Phản hồi từ server:", data);
        toast.success("Đăng nhập thành công! 🎉"); // ✅ Thông báo thành công
        navigate('/schoolbus/dashboard'); // Chuyển hướng sau khi đăng nhập thành công
        
      } catch (err) {
        toast.error("Lỗi: " + err.message); // ❌ Thông báo lỗi
      }
    } else {
      toast.warning("Vui lòng kiểm tra lại thông tin đăng nhập."); // ⚠️ Cảnh báo
    }
  };

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
        <input
          name="email"
          type="email"
          placeholder="Email......"
          value={form.email}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-2xl outline-none focus:ring-2 ${
            errors.email ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2 px-2.5">{errors.email}</p>
        )}

        <input
          name="password"
          type="password"
          placeholder="Password......"
          value={form.password}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-2xl outline-none focus:ring-2 ${
            errors.password ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2 px-2.5">{errors.password}</p>
        )}

        <p className="text-sm text-gray-400 self-end mb-4 cursor-pointer hover:text-yellow-600">
          Forgot your password?
        </p>

        <button
          type="submit"
          className="w-full bg-[#e9cf3f] text-white py-3 rounded-full font-bold hover:bg-yellow-500 transition"
        >
          LOG IN
        </button>

        <p className="text-sm text-gray-500 mt-5">
          Don't have an account?{" "}
          <a href="/schoolbus/register" className="text-teal-500 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
