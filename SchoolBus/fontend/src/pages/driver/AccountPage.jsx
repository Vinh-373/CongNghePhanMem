import { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "@/components/layout/MainLayout";
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
import { 
  User, 
  KeyRound, 
  Mail, 
  Phone, 
  Building, 
  CreditCard, 
  Calendar,
  Shield,
  Clock,
  BusFront,
  UserCircle,
  AlertCircle
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";

// Map role số sang tên
const roleMap = {
  0: "Admin",
  1: "Phụ huynh",
  2: "Tài xế",
};

// Dữ liệu tài xế mẫu (trong thực tế sẽ lấy từ API)
const mockDriverData = {
  id: "TX001",
  name: "Nguyễn Văn An",
  email: "nguyenvanan@buscompany.vn",
  phone: "0912345678",
  role: 2,
  organization: "Công ty Vận tải ABC",
  avatarUrl: "",
  driverCode: "TX-2024-001",
  licenseNumber: "B2-123456789",
  licenseExpiry: "2028-12-31",
  experienceYears: 8,
  vehicleTypes: ["Xe buýt 29 chỗ", "Xe buýt 45 chỗ"],
  emergencyContact: {
    name: "Nguyễn Thị Bình",
    relationship: "Vợ",
    phone: "0987654321"
  },
  joinDate: "2020-03-15",
  status: "Đang hoạt động",
  totalTrips: 2456,
  safetyRating: 4.8
};

export default function AccountPage() {
  // Nếu có context từ router, dùng nó, nếu không dùng mock data
  let user;
  try {
    const context = useOutletContext();
    user = context?.user || mockDriverData;
  } catch {
    user = mockDriverData;
  }

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: null,
    organization: "",
    avatarUrl: "",
    driverCode: "",
    licenseNumber: "",
    licenseExpiry: "",
    experienceYears: 0,
    vehicleTypes: [],
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    },
    joinDate: "",
    status: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);
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
        avatarUrl: user.avatarUrl || "",
        driverCode: user.driverCode || "",
        licenseNumber: user.licenseNumber || "",
        licenseExpiry: user.licenseExpiry || "",
        experienceYears: user.experienceYears || 0,
        vehicleTypes: user.vehicleTypes || [],
        emergencyContact: user.emergencyContact || {
          name: "",
          relationship: "",
          phone: ""
        },
        joinDate: user.joinDate || "",
        status: user.status || "",
      });
    }
  }, [user]);

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleEmergencyContactChange = (e) => {
    setUserData({
      ...userData,
      emergencyContact: {
        ...userData.emergencyContact,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSaveProfile = () => {
    console.log("Cập nhật hồ sơ:", userData);
    toast.success("Đã cập nhật thông tin cá nhân thành công!");
    setIsEditing(false);
    // TODO: gọi API cập nhật hồ sơ
  };

  const handleSaveEmergencyContact = () => {
    console.log("Cập nhật liên hệ khẩn cấp:", userData.emergencyContact);
    toast.success("Đã cập nhật thông tin liên hệ khẩn cấp!");
    setIsEditingEmergency(false);
    // TODO: gọi API cập nhật liên hệ khẩn cấp
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    console.log("Đổi mật khẩu:", passwordData);
    toast.success("Đã cập nhật mật khẩu thành công!");
    // TODO: gọi API cập nhật mật khẩu
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-20 text-gray-500">
          Không có thông tin người dùng.
        </div>
      </MainLayout>
    );
  }

  // Tính số năm làm việc
  const calculateWorkYears = (joinDate) => {
    if (!joinDate) return 0;
    const join = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - join.getFullYear();
    return years;
  };

  const workYears = calculateWorkYears(userData.joinDate);

  return (
      <div className="space-y-6">
        {/* === HEADER THÔNG TIN TÀI XẾ === */}
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                <AvatarFallback className="text-4xl bg-white/20 text-white backdrop-blur-sm">
                  {userData.name ? userData.name.slice(0, 2).toUpperCase() : "??"}
                </AvatarFallback>
              </Avatar>

              {/* Thông tin cơ bản */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm font-medium">{userData.driverCode}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">{roleMap[userData.role] || "Tài xế"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    <span className="text-sm font-medium">● {userData.status}</span>
                  </div>
                </div>
                
                {/* Thống kê nhanh */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <BusFront className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{user.totalTrips || 0}</p>
                    <p className="text-xs text-blue-100">Chuyến đi</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{userData.experienceYears}</p>
                    <p className="text-xs text-blue-100">Năm KN</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <Shield className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{user.safetyRating || 0}</p>
                    <p className="text-xs text-blue-100">Điểm an toàn</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === Thông tin cá nhân === */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-blue-600" /> Thông tin Cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="email"
                  name="email"
                  label="Email"
                  value={userData.email}
                  disabled
                  icon={Mail}
                />
                <InputField
                  id="organization"
                  name="organization"
                  label="Tổ chức"
                  value={userData.organization}
                  disabled
                  icon={Building}
                />
              </div>

              <div className="flex justify-end pt-2">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Chỉnh sửa Thông tin
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
          </CardContent>
        </Card>

        {/* === Thông tin Giấy phép & Nghề nghiệp === */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-indigo-600" /> Thông tin Giấy phép & Nghề nghiệp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột trái */}
              <div className="space-y-4">
                <InfoRow 
                  label="Mã Tài xế" 
                  value={userData.driverCode}
                  icon={CreditCard}
                />
                <InfoRow 
                  label="Mã giấy phép Lái xe" 
                  value={userData.licenseNumber}
                  icon={Shield}
                />
                
              </div>

              {/* Cột phải */}
              <div className="space-y-4">
                <InfoRow 
                  label="Số năm Kinh nghiệm" 
                  value={`${userData.experienceYears} năm`}
                  icon={Clock}
                />
                <InfoRow 
                  label="Ngày hết hạn GPLX" 
                  value={new Date(userData.licenseExpiry).toLocaleDateString('vi-VN')}
                  icon={Calendar}
                  status={"valid"}
                />
              </div>
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
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</Label>
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

// === Component hiển thị thông tin dạng hàng ===
function InfoRow({ label, value, icon: Icon, status }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      {Icon && (
        <div className="mt-0.5">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">{value}</p>
          {status === "valid" && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Còn hạn
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
