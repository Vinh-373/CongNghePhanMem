import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Shield,
  Clock,
  BusFront,
  Pencil,
  Loader2,
  Lock, // Icon cho bảo mật
  Key, // Icon cho mật khẩu
} from "lucide-react";
import { toast } from "sonner";


const roleMap = {
  0: "Admin",
  1: "Phụ huynh",
  2: "Tài xế",
};

// Component hiển thị từng dòng thông tin
function InfoField({ label, value, icon: Icon, highlight = false }) {
  return (
    <div className={`flex items-start gap-4 p-3 rounded-lg border ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-transparent'} transition-colors hover:border-gray-200`}>
      {Icon && <Icon className={`h-5 w-5 mt-0.5 ${highlight ? 'text-blue-600' : 'text-gray-500'}`} />}
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className={`font-semibold ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}

// ==========================================================
// 1. COMPONENT DIALOG CHỈNH SỬA THÔNG TIN (Gộp vào file chính)
// ==========================================================
function EditDriverDialog({ editForm, handleEditChange, handleUpdate }) {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-xl text-[#175e7a]">Cập nhật hồ sơ tài xế</DialogTitle>
        <DialogDescription>
          Chỉnh sửa thông tin cá nhân và thông tin nghề nghiệp của bạn.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleUpdate}>
        <div className="grid gap-5 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hoten" className="text-right font-medium flex items-center justify-end gap-2">
              <User className="h-4 w-4 text-gray-400" /> Họ tên
            </Label>
            <Input
              id="hoten"
              name="hoten"
              value={editForm.hoten}
              onChange={handleEditChange}
              className="col-span-3"
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sodienthoai" className="text-right font-medium flex items-center justify-end gap-2">
              <Phone className="h-4 w-4 text-gray-400" /> SĐT
            </Label>
            <Input
              id="sodienthoai"
              name="sodienthoai"
              value={editForm.sodienthoai}
              onChange={handleEditChange}
              className="col-span-3"
              placeholder="Số điện thoại liên hệ"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right font-medium flex items-center justify-end gap-2">
              <Mail className="h-4 w-4 text-gray-400" /> Email
            </Label>
            <Input
              id="email"
              name="email"
              value={editForm.email}
              onChange={handleEditChange}
              className="col-span-3"
              placeholder="example@schoolbus.com"
            />
          </div>

          <div className="border-t my-1"></div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kinhnghiem" className="text-right font-medium flex items-center justify-end gap-2">
              <Clock className="h-4 w-4 text-gray-400" /> Kinh nghiệm
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="kinhnghiem"
                name="kinhnghiem"
                type="number"
                min="0"
                value={editForm.kinhnghiem}
                onChange={handleEditChange}
                className="w-24"
              />
              <span className="text-sm text-gray-500">năm</span>
            </div>
          </div>

           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mabang" className="text-right font-medium flex items-center justify-end gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" /> Số GPLX
            </Label>
            <Input
              id="mabang"
              name="mabang"
              value={editForm.mabang}
              onChange={handleEditChange}
              className="col-span-3"
              placeholder="Nhập số giấy phép lái xe"
            />
          </div>

        </div>
        
        <DialogFooter>
          <Button type="submit" className="bg-[#175e7a] hover:bg-[#134b61]">
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// ==========================================================
// 2. COMPONENT DIALOG ĐỔI MẬT KHẨU (MỚI - Gộp vào file chính)
// ==========================================================
function ChangePasswordDialog({ passwordForm, handleChangePasswordChange, handleChangePasswordUpdate }) {
  return (
    <DialogContent className="sm:max-w-[425px] bg-white">
      <DialogHeader>
        <DialogTitle className="text-xl text-red-600">Đổi mật khẩu</DialogTitle>
        <DialogDescription>
          Mật khẩu mới phải có ít nhất 6 ký tự.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleChangePasswordUpdate}>
        <div className="grid gap-4 py-4">
          
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={handleChangePasswordChange}
              required
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handleChangePasswordChange}
              required
              minLength={6}
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handleChangePasswordChange}
              required
              minLength={6}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

        </div>
        <DialogFooter>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            Cập nhật mật khẩu
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}


// ==========================================================
// 3. COMPONENT CHÍNH ACCOUNT PAGE
// ==========================================================
export default function AccountPage() {
  const [userData, setUserData] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false); // State cho Dialog đổi mật khẩu

  // State form chỉnh sửa thông tin chung
  const [editForm, setEditForm] = useState({
    hoten: "",
    sodienthoai: "",
    email: "",
    kinhnghiem: 0,
    mabang: "",
  });

  // State form đổi mật khẩu (MỚI)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // API endpoints
  const API_BASE_URL = "http://localhost:5001";
  const API_DRIVER_INFO = `${API_BASE_URL}/schoolbus/driver`;
  const API_DRIVER_ID_BY_USER = `${API_BASE_URL}/schoolbus/driver/user_id`;
  const API_UPDATE_DRIVER = `${API_BASE_URL}/schoolbus/driver/update`;
  const API_CHANGE_PASSWORD = `${API_BASE_URL}/schoolbus/admin/change-password`; // Endpoint đổi mật khẩu giả định

  // Lấy ID người dùng an toàn
  const getUserId = () => {
    const directId = localStorage.getItem("idnguoidung");
    if (directId) return directId;
    
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        return userObj.id || userObj.idnguoidung;
      } catch  {
        return null;
      }
    }
    return null;
  };

  const userId = getUserId();
  const [driverId, setDriverId] = useState(null);

  // Hàm đồng bộ dữ liệu userData vào editForm và mở Dialog
  const syncDataToEditForm = () => {
    if (userData && userData.userInfo) {
      setEditForm({
        hoten: userData.userInfo.hoten || "",
        sodienthoai: userData.userInfo.sodienthoai || "",
        email: userData.userInfo.email || "",
        kinhnghiem: userData.kinhnghiem || 0,
        mabang: userData.mabang || "",
      });
    }
    setIsEditDialogOpen(true);
  };

  // ------------------------------------------------
  // LOGIC LOAD DATA
  // ------------------------------------------------
  const fetchDriverData = async () => {
    if (!userId) return;

    let currentDriverId = null;

    try {
      // Bước 1: Lấy idtaixe từ idnguoidung
      const idRes = await axios.get(`${API_DRIVER_ID_BY_USER}/${userId}`);
      currentDriverId = idRes.data.idtaixe;
      setDriverId(currentDriverId);

    } catch (idErr) {
      console.error("Lỗi tìm kiếm idtaixe:", idErr);
      return;
    }

    if (!currentDriverId) return;

    try {
      // Bước 2: Lấy thông tin chi tiết tài xế
      const res = await axios.get(`${API_DRIVER_INFO}/${currentDriverId}`);
      const driverData = res.data.driver;
      setUserData(driverData);

      // Khởi tạo form lần đầu
      setEditForm({
        hoten: driverData.userInfo?.hoten || "",
        sodienthoai: driverData.userInfo?.sodienthoai || "",
        email: driverData.userInfo?.email || "",
        kinhnghiem: driverData.kinhnghiem || 0,
        mabang: driverData.mabang || "",
      });

    } catch (err) {
      console.error("Lỗi tải thông tin tài xế:", err);
      toast.error("Không thể tải thông tin chi tiết tài xế!");
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [userId]);

  // ------------------------------------------------
  // XỬ LÝ CHỈNH SỬA THÔNG TIN CHUNG
  // ------------------------------------------------

  // Xử lý thay đổi input form chỉnh sửa chung
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'kinhnghiem' ? Number(value) : value;
    setEditForm(prev => ({ ...prev, [name]: newValue }));
  };

  // Xử lý submit update thông tin chung
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!driverId) {
      toast.error("Không có ID tài xế để cập nhật.");
      return;
    }

    const finalUserId = Number(userId);
    if (isNaN(finalUserId)) {
      toast.error("ID người dùng không hợp lệ.");
      return;
    }

    const payload = {
      hoten: editForm.hoten.trim(),
      sodienthoai: editForm.sodienthoai.trim(),
      email: editForm.email.trim(),
      kinhnghiem: Number(editForm.kinhnghiem),
      mabang: editForm.mabang.trim(),
      idnguoidung: finalUserId
    };

    try {
      const res = await axios.put(`${API_UPDATE_DRIVER}/${driverId}`, payload);

      if (res.status === 200) {
        toast.success("Cập nhật thông tin thành công!");
        setIsEditDialogOpen(false);
        await fetchDriverData(); // Tải lại dữ liệu mới
      } else {
        toast.error(res.data.message || "Cập nhật thất bại!");
      }

    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      toast.error(`Lỗi cập nhật: ${err.response?.data?.message || err.message}`);
    }
  };

  // ------------------------------------------------
  // XỬ LÝ ĐỔI MẬT KHẨU (MỚI)
  // ------------------------------------------------

  // Xử lý thay đổi input form đổi mật khẩu
  const handleChangePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Xử lý submit đổi mật khẩu
  const handleChangePasswordUpdate = async (e) => {
    e.preventDefault();
    const finalUserId = Number(userId);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    
    // Giả định API đổi mật khẩu yêu cầu userId, mật khẩu cũ và mật khẩu mới
    const payload = {
      idnguoidung: finalUserId,
      oldpassword: passwordForm.oldPassword,
      newpassword: passwordForm.newPassword,
    };

    try {
      // Sử dụng axios.put hoặc axios.post tùy thuộc vào backend API
      const res = await axios.put(API_CHANGE_PASSWORD, payload); 

      if (res.status === 200) {
        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        setIsPasswordDialogOpen(false);
        // Có thể thêm logic logout hoặc chuyển hướng ở đây
      } else {
        toast.error(res.data.message || "Đổi mật khẩu thất bại! Kiểm tra mật khẩu cũ.");
      }

    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      // Giả sử 401/403 là lỗi mật khẩu cũ không đúng
      const msg = err.response?.data?.message || "Đổi mật khẩu thất bại. Mật khẩu cũ không đúng hoặc lỗi hệ thống.";
      toast.error(msg);
    } finally {
        // Reset form sau khi cố gắng cập nhật
        setPasswordForm({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    }
  };


  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#175e7a]" />
        <p>{userId ? "Đang tải thông tin tài xế..." : "Vui lòng đăng nhập lại để xem thông tin."}</p>
      </div>
    );
  }

  const { idtaixe, mabang, kinhnghiem, userInfo } = userData;
  const fullName = userInfo?.hoten || "Tài xế";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* === HEADER CARD === */}
      <Card className="bg-gradient-to-r from-[#175e7a] to-[#2a85a8] text-white shadow-lg border-none">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-white/30 shadow-2xl">
              <AvatarImage src={userInfo?.anhdaidien ? `http://localhost:5001${userInfo.anhdaidien}` : ""} alt={fullName} />
              <AvatarFallback className="text-4xl bg-white/20 text-white backdrop-blur-sm">
                {fullName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-medium">TX-{idtaixe}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">{roleMap[2]}</span>
                    </div>
                  </div>
                </div>

                {/* NÚT CHỈNH SỬA VÀ DIALOG THÔNG TIN CHUNG*/}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      className="mt-4 md:mt-0 bg-white text-[#175e7a] hover:bg-gray-100 font-semibold shadow-md border-none"
                      onClick={syncDataToEditForm}
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Chỉnh sửa
                    </Button>
                  </DialogTrigger>

                  <EditDriverDialog
                    editForm={editForm}
                    handleEditChange={handleEditChange}
                    handleUpdate={handleUpdate}
                  />
                </Dialog>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-center hover:bg-white/20 transition-colors">
                  <BusFront className="h-6 w-6 mx-auto mb-1 opacity-90" />
                  <p className="text-2xl font-bold">{userData.totalTrips || 0}</p>
                  <p className="text-xs opacity-80 uppercase tracking-wide">Chuyến đi</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-center hover:bg-white/20 transition-colors">
                  <Clock className="h-6 w-6 mx-auto mb-1 opacity-90" />
                  <p className="text-2xl font-bold">{kinhnghiem || 0}</p>
                  <p className="text-xs opacity-80 uppercase tracking-wide">Năm KN</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-center hover:bg-white/20 transition-colors">
                  <Shield className="h-6 w-6 mx-auto mb-1 opacity-90" />
                  <p className="text-2xl font-bold">{userData.safetyRating || "100"}</p>
                  <p className="text-xs opacity-80 uppercase tracking-wide">Điểm an toàn</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* THÔNG TIN CÁ NHÂN VÀ GPLX (2/3 cột) */}
        <div className="md:col-span-2 space-y-6">
            {/* THÔNG TIN CÁ NHÂN */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg text-[#175e7a]">
                <User className="h-5 w-5" /> Thông tin Cá nhân
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Họ và tên" value={userInfo?.hoten} icon={User} />
                <InfoField label="Số điện thoại" value={userInfo?.sodienthoai} icon={Phone} />
                <InfoField label="Email" value={userInfo?.email} icon={Mail} />
                <InfoField label="Kinh nghiệm" value={`${kinhnghiem} năm`} icon={Clock} />
                </div>
            </CardContent>
            </Card>

            {/* THÔNG TIN GIẤY PHÉP */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg text-[#175e7a]">
                <CreditCard className="h-5 w-5" /> Thông tin Giấy phép
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField
                    label="Số Giấy phép lái xe"
                    value={mabang || "Chưa cập nhật"}
                    icon={Shield}
                    highlight={true}
                />
                <InfoField
                    label="Hạng GPLX"
                    value={userData.hangplx || "D"}
                    icon={CreditCard}
                />
                <InfoField
                    label="Ngày cấp"
                    value={userData.ngaycap || "Chưa cập nhật"}
                    icon={Calendar}
                />
                <InfoField
                    label="Ngày hết hạn"
                    value={userData.ngayhethan || "Chưa cập nhật"}
                    icon={Calendar}
                />
                </div>
            </CardContent>
            </Card>
        </div>

        {/* BẢO MẬT (1/3 cột) - MỚI */}
        <div className="md:col-span-1">
            <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                    <Lock className="h-5 w-5" /> Bảo mật tài khoản
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            Thay đổi mật khẩu đăng nhập của bạn để bảo vệ tài khoản.
                        </p>
                        <p className="text-xs text-gray-500">
                            Bạn sẽ cần đăng nhập lại sau khi thay đổi thành công.
                        </p>
                    </div>

                    {/* NÚT ĐỔI MẬT KHẨU VÀ DIALOG */}
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full mt-4 border-red-500 text-red-600 hover:bg-red-50/50 hover:text-red-700"
                            >
                                <Key className="h-4 w-4 mr-2" /> Đổi mật khẩu
                            </Button>
                        </DialogTrigger>

                        <ChangePasswordDialog
                            passwordForm={passwordForm}
                            handleChangePasswordChange={handleChangePasswordChange}
                            handleChangePasswordUpdate={handleChangePasswordUpdate}
                        />
                    </Dialog>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}