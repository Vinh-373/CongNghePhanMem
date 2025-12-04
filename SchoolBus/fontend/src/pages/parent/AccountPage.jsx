import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, KeyRound, Mail, Phone, Loader2, FilePenLine } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

// --- CẤU HÌNH API VÀ HẰNG SỐ ---
const API_BASE_URL = "http://localhost:5001";
const USER_API_BASE_URL = `${API_BASE_URL}/schoolbus/admin`;
const UPDATE_PROFILE_ENDPOINT = `${USER_API_BASE_URL}/update-user`;
const CHANGE_PASSWORD_ENDPOINT = `${USER_API_BASE_URL}/change-password`;

// Map role số sang tên (Theo file mẫu chuẩn)
const roleMap = {
  0: "Quản trị viên (Admin)",
  2: "Phụ huynh",
  1: "Tài xế",
};

/**
 * Xây dựng URL ảnh đại diện hoàn chỉnh
 */
const getFullAvatarUrl = (relativeUrl) => {
  if (!relativeUrl) {
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Ảnh mặc định
  }
  // Tránh trùng lặp domain nếu đường dẫn đã có sẵn
  if (relativeUrl.startsWith('/uploads')) {
    return `${API_BASE_URL}${relativeUrl}`;
  }
  return relativeUrl;
};

export default function AccountPage() {
  const { user, setUser } = useOutletContext(); // Lấy hàm setUser để cập nhật context sau khi sửa xong

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: null,
    avatarUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🟢 Cập nhật userData khi prop user thay đổi
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role ?? null,
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const getInitials = (fullName) =>
    fullName
      ? fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "??";

  // === Xử lý Form Hồ sơ ===

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Tạo URL tạm thời để hiển thị ảnh preview ngay lập tức
      setUserData({ ...userData, avatarUrl: URL.createObjectURL(file) });
    }
  };

  const handleSaveProfile = async () => {
    if (!userData.name || !userData.phone) {
      toast.error("Vui lòng nhập đầy đủ Họ tên và Số điện thoại!");
      return;
    }

    setIsSavingProfile(true);

    const fd = new FormData();
    fd.append("hoten", userData.name);
    fd.append("sodienthoai", userData.phone);
    // Email thường không cho phép sửa, nên không gửi hoặc chỉ gửi để verify nếu BE cần
    
    // Nếu có file mới được chọn, đính kèm file
    if (selectedFile) {
      fd.append("anhdaidien", selectedFile, selectedFile.name);
    } else if (user?.avatarUrl && !userData.avatarUrl.startsWith('blob:')) {
      // Nếu không có file mới, gửi lại đường dẫn cũ để BE biết không xóa ảnh
      fd.append("anhdaidien", user.avatarUrl);
    }
    
    // Lấy ID người dùng từ localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.warn("⚠️ Không tìm thấy user trong localStorage");
      return null;
    }
    const userh = JSON.parse(userStr);
    if (userh?.id) {
      fd.append("idnguoidung", userh.id);
    } else {
       toast.error("Lỗi: Không tìm thấy ID người dùng để cập nhật!");
       setIsSavingProfile(false);
       return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(UPDATE_PROFILE_ENDPOINT, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Cập nhật hồ sơ thành công!");
      
      // Cập nhật lại state user gốc trong OutletContext để Header/Sidebar cập nhật theo
      if (setUser) {
        setUser({ 
          ...user, 
          name: res.data.updatedUser.hoten,
          phone: res.data.updatedUser.sodienthoai,
          avatarUrl: res.data.updatedUser.anhdaidien, // Sử dụng đường dẫn mới từ server trả về
        });
      }

      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("❌ Lỗi cập nhật hồ sơ:", error);
      const message = error.response?.data?.message || "Cập nhật thất bại!";
      toast.error(`🚫 ${message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // === Xử lý Form Mật khẩu ===

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
       toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
       return;
    }

    setIsChangingPassword(true);
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.warn("⚠️ Không tìm thấy user trong localStorage");
      return null;
    }
    const userh = JSON.parse(userStr);
    
    const payload = {
      idnguoidung: userh.id,
      oldpassword: passwordData.currentPassword,
      newpassword: passwordData.newPassword,
    };

    try {
      const token = localStorage.getItem("token");
      await axios.put(CHANGE_PASSWORD_ENDPOINT, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      toast.success("🎉 Đổi mật khẩu thành công!");
      // Reset form mật khẩu
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

    } catch (error) {
      console.error("❌ Lỗi đổi mật khẩu:", error);
      const message = error.response?.data?.message || "Đổi mật khẩu thất bại!";
      toast.error(`🚫 ${message}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin text-[#175e7a]" />
        Đang tải thông tin người dùng...
      </div>
    );
  }

  // === Layout Chính ===
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột 1: Thông tin cá nhân (Chiếm 2/3 width trên màn hình lớn) */}
        <Card className="shadow-xl border-t-4 border-[#175e7a] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-[#175e7a]">
              <FilePenLine className="h-6 w-6" /> Quản lý Hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Avatar & Role */}
              <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl w-full xl:w-1/2 shadow-inner border border-gray-200">
                <Avatar className="h-28 w-28 border-4 border-[#175e7a] shadow-md">
                  <AvatarImage src={getFullAvatarUrl(userData.avatarUrl)} alt={userData.name} />
                  <AvatarFallback className="text-4xl font-bold bg-[#175e7a] text-white">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <div className="space-y-2 w-full">
                    <Label htmlFor="avatarFile" className="text-sm font-medium">Thay đổi Ảnh</Label>
                    <input
                      id="avatarFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#175e7a] file:text-white hover:file:bg-[#175e7a]/90 cursor-pointer"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-800 mt-2">{userData.name}</h3>
                <div className="text-sm font-semibold text-[#175e7a] px-3 py-1 rounded-full bg-[#175e7a]/10 border border-[#175e7a]/20">
                  {roleMap[userData.role] || "Người dùng"}
                </div>
              </div>

              {/* Form chi tiết */}
              <div className="space-y-5 w-full xl:w-1/2 pt-2">
                <InputField
                  id="name"
                  name="name"
                  label="Họ và Tên"
                  value={userData.name}
                  onChange={handleUserChange}
                  disabled={!isEditing || isSavingProfile}
                  icon={User}
                />
                <InputField
                  id="phone"
                  name="phone"
                  label="Số Điện thoại"
                  value={userData.phone}
                  onChange={handleUserChange}
                  disabled={!isEditing || isSavingProfile}
                  icon={Phone}
                />
                
                <InputField
                  id="email"
                  name="email"
                  label="Email (Không thể sửa)"
                  value={userData.email}
                  disabled
                  icon={Mail}
                />
                
                <div className="flex justify-end pt-3">
                  {!isEditing ? (
                    <Button
                      onClick={() => {
                        setIsEditing(true);
                        setSelectedFile(null);
                      }}
                      variant="outline"
                      className="border-[#175e7a] text-[#175e7a] hover:bg-[#175e7a]/10 font-semibold"
                    >
                      Chỉnh sửa Hồ sơ
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setIsEditing(false);
                          // Reset lại data về trạng thái ban đầu
                          if (user) {
                            setUserData({ 
                              name: user.name, 
                              email: user.email, 
                              phone: user.phone, 
                              role: user.role, 
                              avatarUrl: user.avatarUrl 
                            });
                          }
                          setSelectedFile(null);
                        }} 
                        variant="outline"
                        disabled={isSavingProfile}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-green-600 hover:bg-green-700 font-semibold"
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang Lưu...</>
                        ) : (
                          "Lưu thay đổi"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cột 2: Thay đổi mật khẩu (Chiếm 1/3 width) */}
        <Card className="shadow-xl border-t-4 border-red-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-red-600">
              <KeyRound className="h-6 w-6" /> Thay đổi Mật khẩu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <InputField
              id="currentPassword"
              name="currentPassword"
              label="Mật khẩu Hiện tại"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              disabled={isChangingPassword}
              icon={KeyRound}
            />
            <InputField
              id="newPassword"
              name="newPassword"
              label="Mật khẩu Mới (Tối thiểu 6 ký tự)"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              disabled={isChangingPassword}
              icon={KeyRound}
            />
            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label="Xác nhận Mật khẩu Mới"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              disabled={isChangingPassword}
              icon={KeyRound}
            />

            <div className="flex justify-end pt-3">
              <Button
                onClick={handleUpdatePassword}
                className="bg-red-600 hover:bg-red-700 font-semibold"
                disabled={
                  isChangingPassword ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword ||
                  passwordData.newPassword.length < 6
                }
              >
                 {isChangingPassword ? (
                   <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang Cập nhật...</>
                 ) : (
                   "Cập nhật Mật khẩu"
                 )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// === Component con: Input Field ===
function InputField({ id, name, label, icon: Icon, className, ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        )}
        <input
          id={id}
          name={name}
          className={`flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#175e7a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${Icon ? "pl-10" : ""} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}