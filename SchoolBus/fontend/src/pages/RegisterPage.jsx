import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import { toast } from "sonner";

export default function RegisterPage() {
  const [form, setForm] = useState({
    hoten: "",
    email: "",
    dienthoai: "",
    diachi: "",
    matkhau: "",
    anhdaidien: null, // ảnh lưu tạm
  });

  const [errors, setErrors] = useState({});

  // --- Khi nhập input ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // --- Khi chọn ảnh ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, anhdaidien: file });
    }
  };

  // --- Validate dữ liệu ---
  const validate = () => {
    const newErrors = {};

    if (!form.hoten.trim()) newErrors.hoten = "Họ và tên không được để trống.";

    if (!form.email.trim()) newErrors.email = "Email không được để trống.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email không hợp lệ.";

    if (!form.dienthoai.trim())
      newErrors.dienthoai = "Số điện thoại không được để trống.";
    else if (!/^[0-9]{9,11}$/.test(form.dienthoai))
      newErrors.dienthoai = "Số điện thoại không hợp lệ.";

    if (!form.diachi.trim()) newErrors.diachi = "Địa chỉ không được để trống.";

    if (!form.matkhau.trim()) newErrors.matkhau = "Mật khẩu không được để trống.";
    else if (form.matkhau.length < 6)
      newErrors.matkhau = "Mật khẩu phải có ít nhất 6 ký tự.";

    if (!form.anhdaidien) newErrors.anhdaidien = "Vui lòng chọn ảnh đại diện.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Khi bấm REGISTER ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("hoten", form.hoten);
      formData.append("email", form.email);
      formData.append("dienthoai", form.dienthoai);
      formData.append("diachi", form.diachi);
      formData.append("matkhau", form.matkhau);
      formData.append("anhdaidien", form.anhdaidien);

      const response = await fetch("http://localhost:5001/schoolbus/auth/register", {
        method: "POST",
        body: formData, // dùng FormData thay vì JSON
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      toast.success("🎉 Đăng ký thành công! Tài khoản đang chờ phê duyệt.");

      setForm({
        hoten: "",
        email: "",
        dienthoai: "",
        diachi: "",
        matkhau: "",
        anhdaidien: null,
      });
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
      <form onSubmit={handleSubmit} className="w-full" encType="multipart/form-data">
        <input
          name="hoten"
          type="text"
          placeholder="Họ và tên..."
          value={form.hoten}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-full outline-none focus:ring-2 ${
            errors.hoten ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.hoten && <p className="text-red-500 text-sm mb-2 px-2.5">{errors.hoten}</p>}

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
        {errors.email && <p className="text-red-500 text-sm mb-2 px-2.5">{errors.email}</p>}

        <input
          name="dienthoai"
          type="text"
          placeholder="Điện thoại..."
          value={form.dienthoai}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-full outline-none focus:ring-2 ${
            errors.dienthoai ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.dienthoai && (
          <p className="text-red-500 text-sm mb-2 px-2.5">{errors.dienthoai}</p>
        )}

        <input
          name="diachi"
          type="text"
          placeholder="Địa chỉ..."
          value={form.diachi}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-full outline-none focus:ring-2 ${
            errors.diachi ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.diachi && <p className="text-red-500 text-sm mb-2 px-2.5">{errors.diachi}</p>}

        <input
          name="matkhau"
          type="password"
          placeholder="Mật khẩu..."
          value={form.matkhau}
          onChange={handleChange}
          className={`w-full bg-gray-100 px-6 py-3 mb-1 rounded-full outline-none focus:ring-2 ${
            errors.matkhau ? "focus:ring-red-400" : "focus:ring-yellow-400"
          }`}
        />
        {errors.matkhau && <p className="text-red-500 text-sm mb-2 px-2.5">{errors.matkhau}</p>}

        {/* --- Ảnh đại diện --- */}
        <div className="mb-3">
          <input
            type="file"
            accept="image/*"
            placeholder="Chọn ảnh đại diện..."
            onChange={handleFileChange}
            className="w-full bg-gray-100 px-6 py-3 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
          />
          {errors.anhdaidien && (
            <p className="text-red-500 text-sm mt-1 px-2.5">{errors.anhdaidien}</p>
          )}

          {/* Hiển thị ảnh xem trước */}
          {form.anhdaidien && (
            <div className="mt-3 text-center">
              <img
                src={URL.createObjectURL(form.anhdaidien)}
                
                alt="preview"
                className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-yellow-400"
              />
            </div>
          )}
        </div>

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
