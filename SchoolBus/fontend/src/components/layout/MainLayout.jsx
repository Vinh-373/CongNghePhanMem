// frontend/src/components/layout/MainLayout.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SidebarLayout from "./SidebarLayout";
import HeaderLayout from "./HeaderLayout";
import { getMenuByRole } from "../../config/roleMenus";
import { Home } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function MainLayout({ onLogout }) {
  const location = useLocation();
  const path = location.pathname;

  // 1️⃣ State lưu thông tin user
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 2️⃣ Fetch thông tin user 1 lần
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    fetch("http://localhost:5001/schoolbus/user/me", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser({
          name: data.hoten || "",
          email: data.email || "",
          phone: data.sodienthoai || "",
          role: data.vaitro !== undefined ? Number(data.vaitro) : 0,
          address: data.diachi || "",
          avatarUrl: data.anhdaidien || "",
        });
      })
      .catch((err) => console.error("Lỗi lấy user:", err))
      .finally(() => setLoadingUser(false));
  }, []);

  // 3️⃣ Các hook useMemo vẫn phải được gọi DÙ user đang null
  const userRole = user?.role ?? 0;
  const menuItems = useMemo(() => getMenuByRole(userRole), [userRole]);

  const selectedMenu = useMemo(() => {
    const normalize = (p) => p.replace(/\/+$/, "");
    const cur = normalize(path);
    let found = menuItems.find((m) => normalize(m.href) === cur);
    if (!found) found = menuItems.find((m) => cur.startsWith(normalize(m.href)));
    return found ?? menuItems[0] ?? { label: "Dashboard", icon: Home };
  }, [path, menuItems]);

  // 4️⃣ Sau khi gọi đủ hook, mới return có điều kiện
  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Không tìm thấy người dùng. Vui lòng đăng nhập lại.
      </div>
    );
  }
  console.log("user in layout", user);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarLayout menuItems={menuItems} selectedMenu={selectedMenu} />
      <main className="flex-1 flex flex-col md:ml-64">
        <HeaderLayout pageTitle={selectedMenu.label} icon={selectedMenu.icon} user={user} onLogout={onLogout} />
        <section className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet context={{ user }} /> {/* 🟢 Dữ liệu user chia sẻ cho các trang con */}
        </section>
      </main>
    </div>
  );
}
