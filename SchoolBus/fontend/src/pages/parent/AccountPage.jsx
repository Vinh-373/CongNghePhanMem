import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, KeyRound, Mail, Phone, Building, MapPin } from "lucide-react";
import { useOutletContext } from "react-router-dom";

// Map role số sang tên
const roleMap = {
  0: "Admin",
  1: "Parent",
  2: "Driver",
};

export default function AccountPage() {
  const { user } = useOutletContext();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: null,
    organization: "",
    address: "",
    avatarUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
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
        organization: user.organization || "",
        address: user.address || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    console.log("Cập nhật hồ sơ:", userData);
    setIsEditing(false);
    // TODO: gọi API cập nhật hồ sơ
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    console.log("Đổi mật khẩu:", passwordData);
    // TODO: gọi API cập nhật mật khẩu
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        Không có thông tin người dùng.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* === Thông tin cá nhân === */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-[#175e7a]" /> Hồ sơ Người dùng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar & Role */}
            <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg w-full md:w-1/3 shadow-inner">
              <Avatar className="h-24 w-24 border-4 border-[#175e7a]">
                <AvatarImage src={`http://localhost:5001${userData.avatarUrl}`} alt={userData.name} />
                <AvatarFallback className="text-3xl bg-[#e3c138] text-white">
                  {userData.name ? userData.name.slice(0, 2).toUpperCase() : "??"}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold text-gray-800">{userData.name}</h3>
              <div className="text-sm font-medium text-[#175e7a] px-3 py-1 rounded-full bg-[#175e7a]/10">
                {roleMap[userData.role] || "Người dùng"}
              </div>
            </div>

            {/* Form chỉnh sửa */}
            <div className="space-y-4 w-full md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="name"
                  name="name"
                  label="Họ và Tên"
                  value={userData.name}
                  onChange={handleUserChange}
                  disabled={!isEditing}
                  icon={User}
                />
                <InputField
                  id="phone"
                  name="phone"
                  label="Số Điện thoại"
                  value={userData.phone}
                  onChange={handleUserChange}
                  disabled={!isEditing}
                  icon={Phone}
                />
                <InputField
                id="email"
                name="email"
                label="Email"
                value={userData.email}
                disabled
                icon={Mail}
              />
              <InputField
                id="address"
                name="address"
                label="Địa chỉ"
                value={userData.address}
                onChange={handleUserChange}
                disabled={!isEditing}
                icon={MapPin}
              />
              </div>
              

              <div className="flex justify-end pt-2">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-[#175e7a] text-[#175e7a] hover:bg-[#175e7a]/10"
                  >
                    Chỉnh sửa Hồ sơ
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* === Thay đổi mật khẩu === */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <KeyRound className="h-5 w-5 text-red-600" /> Thay đổi Mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="currentPassword"
            name="currentPassword"
            label="Mật khẩu Hiện tại"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
          />
          <InputField
            id="newPassword"
            name="newPassword"
            label="Mật khẩu Mới"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
          />
          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label="Xác nhận Mật khẩu Mới"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
          />

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleUpdatePassword}
              className="bg-red-600 hover:bg-red-700"
              disabled={
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
            >
              Cập nhật Mật khẩu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// === Component con: Input có icon và label ===
function InputField({ id, name, label, icon: Icon, className, ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          id={id}
          name={name}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${Icon ? "pl-10" : ""} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
