import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import { toast } from "sonner";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  // --- Khi nhập input ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // --- Validate ---
  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Tên người dùng không được để trống.";
    }

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

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Khi bấm REGISTER ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
    };

    try {
      const response = await fetch(
        "http://localhost:5001/schoolbus/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      toast.success("🎉 Đăng ký thành công! Bạn có thể đăng nhập ngay.");
    } catch (error) {
      toast.error(`❌ Lỗi: ${error.message}`);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Please fill in your information"
      sideTitle="Hello, Friend!"
      sideDesc="Enter your personal details and start your journey with us"
      sideButtonText="SIGN IN"
      sideButtonLink="/schoolbus/login"
      reverse={true}
    >
      <form onSubmit={handleSubmit} className="w-full">
        <input
          name="username"
          type="text"
          placeholder="Username..."
          value={form.username}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-full outline-none focus:ring-2 ${
            errors.username ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.username && (
          <p className="text-red-500 text-sm mb-2 px-2.5">{errors.username}</p>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email..."
          value={form.email}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-full outline-none focus:ring-2 ${
            errors.email ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2 px-2.5">{errors.email}</p>
        )}

        <input
          name="password"
          type="password"
          placeholder="Password..."
          value={form.password}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-full outline-none focus:ring-2 ${
            errors.password ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2 px-2.5">{errors.password}</p>
        )}

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password..."
          value={form.confirmPassword}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-full outline-none focus:ring-2 ${
            errors.confirmPassword ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mb-2 px-2.5">
            {errors.confirmPassword}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-[#e9cf3f] text-white py-3 rounded-full font-bold hover:bg-yellow-500 transition"
        >
          REGISTER
        </button>

        <p className="text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <a href="/schoolbus/login" className="text-teal-500 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
