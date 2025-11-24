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
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Shield,
  Clock,
  BusFront,
  Pencil
} from "lucide-react";
import { toast } from "sonner";

import EditDriverDialog from "./EditDriverDialog";
const roleMap = {
  0: "Admin",
  1: "Phụ huynh",
  2: "Tài xế",
};

export default function AccountPage() {
  const [userData, setUserData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. XÓA 'matkhau' khỏi state khởi tạo
  const [editForm, setEditForm] = useState({
    hoten: "",
    sodienthoai: "",
    email: "",
    kinhnghiem: 0,
    mabang: "",
  });

  // API endpoints
  const API_DRIVER_INFO = "http://localhost:5001/schoolbus/driver";
  const API_DRIVER_ID_BY_USER = "http://localhost:5001/schoolbus/driver/user_id";
  const API_UPDATE_DRIVER = "http://localhost:5001/schoolbus/driver/update";

  const userId = localStorage.getItem("idnguoidung");
  const [driverId, setDriverId] = useState(null);

  // Hàm đồng bộ dữ liệu userData vào editForm và mở Dialog để làm mới dữ liệu mỗi lần mở
  const syncDataToEditForm = () => {
    if (userData && userData.userInfo) {
      setEditForm({
        hoten: userData.userInfo.hoten || "",
        sodienthoai: userData.userInfo.sodienthoai || "",
        email: userData.userInfo.email || "",
        kinhnghiem: userData.kinhnghiem || "",
        mabang: userData.mabang || "",
      });
    }
    setIsDialogOpen(true);
  };


  // ------------------------------------------------
  // 2. LOGIC LOAD DATA VÀ CẬP NHẬT FORM
  // ------------------------------------------------
  const fetchDriverData = async () => {
    if (!userId) {
      toast.error("Không tìm thấy ID người dùng.");
      return;
    }

    let currentDriverId = null;

    try {
      const idRes = await axios.get(`${API_DRIVER_ID_BY_USER}/${userId}`);
      currentDriverId = idRes.data.idtaixe;
      setDriverId(currentDriverId);

    } catch (idErr) {
      console.error("Lỗi tìm kiếm idtaixe:", idErr);
      toast.error("Không tìm thấy ID tài xế tương ứng!");
      return;
    }

    if (!currentDriverId) return;

    try {
      const res = await axios.get(`${API_DRIVER_INFO}/${currentDriverId}`);
      const driverData = res.data.driver;
      setUserData(driverData);

      // KHỞI TẠO FORM CHỈNH SỬA VỚI DỮ LIỆU HIỆN TẠI (Lần đầu mount)
      setEditForm({
        hoten: driverData.userInfo?.hoten || "",
        sodienthoai: driverData.userInfo?.sodienthoai || "",
        email: driverData.userInfo?.email || "",
        // 2. XÓA 'matkhau' khỏi logic khởi tạo
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
  // 3. HÀM XỬ LÝ CHỈNH SỬA & CẬP NHẬT
  // ------------------------------------------------

  // Hàm xử lý thay đổi input trong form chỉnh sửa
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'kinhnghiem' ? Number(value) : value;
    setEditForm(prev => ({ ...prev, [name]: newValue }));
  };

  // Hàm xử lý cập nhật thông tin
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!driverId) {
      toast.error("Không có ID tài xế để cập nhật.");
      return;
    }

    const finalUserId = Number(userId); // userId đã được khai báo ở đầu component
    if (isNaN(finalUserId)) {
      toast.error("ID người dùng không hợp lệ.");
      return;
    }
    const payload = {
      // Thông tin NguoiDung (User)
      hoten: editForm.hoten.trim(),
      sodienthoai: editForm.sodienthoai.trim(),
      email: editForm.email.trim(),
      // Thông tin TaiXe (Driver)
      kinhnghiem: Number(editForm.kinhnghiem),
      mabang: editForm.mabang.trim(),
      idnguoidung: finalUserId
    };

    try {
      const res = await axios.put(`${API_UPDATE_DRIVER}/${driverId}`, payload);

      if (res.status === 200) {
        toast.success("Cập nhật thông tin thành công!");
        setIsDialogOpen(false);
        await fetchDriverData(); // Tải lại dữ liệu mới
      } else {
        toast.error(res.data.message || "Cập nhật thất bại!");
      }

    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      toast.error(`Lỗi cập nhật: ${err.response?.data?.message || err.message}`);
    }
  };


  if (!userData) {
    return (
      <div className="text-center py-20">
        {userId ? "Đang tải thông tin..." : "Vui lòng đăng nhập lại để lấy ID người dùng."}
      </div>
    );
  }

  const { idtaixe, mabang, kinhnghiem, userInfo } = userData;
  const fullName = userInfo?.hoten || "Tài xế";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              <AvatarImage src="" alt={fullName} />
              <AvatarFallback className="text-4xl bg-white/20 text-white">
                {fullName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold mb-2">{fullName}</h1>

                {/* NÚT CHỈNH SỬA VÀ DIALOG */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      className="bg-white/30 hover:bg-white/50 text-white border border-white"
                      onClick={syncDataToEditForm} // Đồng bộ dữ liệu mỗi lần mở Dialog
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

              <div className="flex flex-wrap gap-3 mb-3 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">{idtaixe}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">{roleMap[2]}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 p-3 rounded-lg text-center">
                  <BusFront className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{userData.totalTrips || 0}</p>
                  <p className="text-xs">Chuyến đi</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-center">
                  <Clock className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{kinhnghiem || 0}</p>
                  <p className="text-xs">Năm KN</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-center">
                  <Shield className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{userData.safetyRating || 0}</p>
                  <p className="text-xs">Điểm an toàn</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* THÔNG TIN CÁ NHÂN */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-blue-600" /> Thông tin Cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Họ và tên" value={userInfo?.hoten} icon={User} />
            <InfoField label="SDT" value={userInfo?.sodienthoai} icon={Phone} />
            <InfoField label="Email" value={userInfo?.email} icon={Mail} />
            <InfoField label="Số năm kinh nghiệm" value={kinhnghiem} icon={Clock} />
          </div>
        </CardContent>
      </Card>

      {/* GPLX */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-5 w-5 text-indigo-600" /> Thông tin Giấy phép
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField
              label="Số GPLX"
              value={mabang || "Chưa cập nhật"}
              icon={Shield}
            />
            <InfoField
              label="Hạn GPLX"
              value={userData.hangplx || "Không có"}
              icon={Calendar}
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

function InfoField({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      {Icon && <Icon className="h-5 w-5 text-gray-600 mt-1" />}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}