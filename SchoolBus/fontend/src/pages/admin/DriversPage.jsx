import React, { useState, useEffect, useMemo, useCallback } from "react";
// Đã loại bỏ MainLayout vì nó không có trong đoạn mã gốc và có thể gây lỗi nếu không được cung cấp
// import MainLayout from "@/components/layout/MainLayout"; 
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users,
    UserCheck,
    UserPlus,
    PlusCircle,
    FilePenLine,
    Trash2,
    Search,
    Loader2,
    XCircle,
} from "lucide-react";

// === Import component Dialog ===
import AddEntityDialog from "@/components/AddEntityDialog";
// Thêm import cho toast (Giả định bạn đang dùng một thư viện toast như sonner/react-hot-toast)
const toast = {
    success: (msg) => console.log("SUCCESS:", msg),
    error: (msg) => console.log("ERROR:", msg)
};


// === Cấu hình API ===
const API_URL = "http://localhost:5001/schoolbus/admin/get-all-drivers";
const API_ADD_DRIVER = "http://localhost:5001/schoolbus/admin/add-driver";
const API_UPDATE_DRIVER = "http://localhost:5001/schoolbus/admin/update-driver";
// Giả định API DELETE yêu cầu id trong URL: DELETE /schoolbus/admin/delete-driver/{idtaixe}
const API_DELETE_DRIVER_BASE = "http://localhost:5001/schoolbus/admin/delete-driver";
const MAX_RETRIES = 3;
const AVATAR_BASE_URL = 'http://localhost:5001';

/**
 * Ánh xạ mã trạng thái từ API sang chuỗi hiển thị
 */
const mapStatus = (code) => {
    switch (code) {
        case 2: return 'Hoạt động';
        case 1: return 'Chờ duyệt';
        case 0: return 'Ngưng hoạt động';
        default: return 'Không rõ';
    }
}

/**
 * Ánh xạ chuỗi trạng thái hiển thị thành mã số API
 */
const STATUS_STRING_TO_CODE = {
    'Chờ duyệt': 1,
    'Hoạt động': 2,
    'Ngưng hoạt động': 0
};

// =======================================================
// === Cấu hình Fields cho Dialog Thêm/Sửa Tài xế ===
const DRIVER_FIELDS = [
    // Hàng 1: Họ tên, Mật khẩu
    {
        name: 'hoten',
        label: 'Họ tên',
        type: 'text',
        placeholder: 'Nguyễn Văn A',
        required: true
    },
    {
        name: 'matkhau',
        label: 'Mật khẩu',
        type: 'password',
        placeholder: 'Mật khẩu đăng nhập',
        // Khi thêm mới thì bắt buộc, khi sửa (update) thì không (set required động trong logic)
        required: true
    },

    // Hàng 2: SĐT, Email
    {
        name: 'sodienthoai',
        label: 'Số điện thoại',
        type: 'tel',
        placeholder: '0987654321',
        required: true
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'a@example.com',
        required: true
    },

    // Hàng 3: Mã bằng lái, Kinh nghiệm
    {
        name: 'mabang',
        label: 'Mã bằng lái',
        type: 'text',
        placeholder: 'B2-123456',
        required: true
    },
    {
        name: 'kinhnghiem',
        label: 'Kinh nghiệm (Năm)',
        type: 'number',
        min: 0,
        defaultValue: 0,
        required: true
    },

    // Hàng 4: Trạng thái
    {
        name: 'trangthai',
        label: 'Trạng thái',
        type: 'select',
        options: ['Chờ duyệt', 'Hoạt động', 'Ngưng hoạt động'],
        defaultValue: 'Chờ duyệt',
        required: true,
        smColSpan: 2 // Chiếm trọn 2 cột
    },

    // Ảnh đại diện (Chiếm 2 cột, đẩy xuống cuối)
    {
        name: 'anhdaidien',
        label: 'Ảnh đại diện',
        type: 'file',
        accept: 'image/*',
        required: false,
        smColSpan: 2
    },
];
// =======================================================


export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // === State cho Dialog Thêm mới/Chỉnh sửa và trạng thái submit ===
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null); // Dữ liệu tài xế đang chỉnh sửa
    const [deletingId, setDeletingId] = useState(null); // ID của tài xế đang bị xóa

    // Lấy 2 ký tự đầu tên cho Avatar Fallback
    const getInitials = (fullName) =>
        fullName
            ? fullName.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase()
            : 'TX';

    // === LOGIC GỌI API VÀ XỬ LÝ DỮ LIỆU ===
    const fetchDriversData = useCallback(async (retryCount = 0) => {
        setLoading(true);
        setError(null);

        const delay = Math.pow(2, retryCount) * 1000;
        if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const driversList = Array.isArray(data.drivers) ? data.drivers : [];

            // Xử lý dữ liệu từ API
            const processedList = driversList.map(driver => {
                const userInfo = driver.userInfo || {};
                const displayStatus = mapStatus(userInfo.trangthai);

                const avatarUrl = userInfo.anhdaidien
                    ? (userInfo.anhdaidien.startsWith('http') ? userInfo.anhdaidien : `${AVATAR_BASE_URL}${userInfo.anhdaidien}`)
                    : null;

                return {
                    id: driver.idtaixe,
                    name: userInfo.hoten || 'Tài xế chưa đặt tên',
                    avatar: avatarUrl,
                    phone: userInfo.sodienthoai || 'N/A',
                    email: userInfo.email || 'N/A',
                    license: driver.mabang || 'Chưa cập nhật',
                    experience: driver.kinhnghiem || 0,
                    status: displayStatus, // Trạng thái đã được map thành chuỗi
                };
            });

            setDrivers(processedList);
        } catch (err) {
            console.error("Fetch error:", err);
            if (retryCount < MAX_RETRIES) {
                fetchDriversData(retryCount + 1);
            } else {
                setError(`Không thể kết nối đến API: ${API_URL}. Chi tiết lỗi: ${err.message}`);
            }
        } finally {
            if (retryCount === 0 || retryCount === MAX_RETRIES) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchDriversData();
    }, [fetchDriversData]);

    // === LOGIC TÌM KIẾM VÀ LỌC DỮ LIỆU ===
    const filteredDrivers = useMemo(() => {
        if (loading) return [];
        if (!searchTerm) return drivers;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return drivers.filter(driver =>
            driver.name.toLowerCase().includes(lowerCaseSearch) ||
            driver.phone.includes(searchTerm) ||
            (driver.email && driver.email.toLowerCase().includes(lowerCaseSearch)) ||
            driver.license.toLowerCase().includes(lowerCaseSearch) ||
            driver.status.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchTerm, drivers, loading]);

    // === TÍNH TOÁN THỐNG KÊ ===
    const stats = useMemo(() => ({
        total: drivers.length,
        active: drivers.filter((d) => d.status === "Hoạt động").length,
        ready: drivers.filter((d) => d.status === "Chờ duyệt").length,
    }), [drivers]);

    // Helper để lấy badge màu theo trạng thái 
    const getStatusBadge = (status) => {
        switch (status) {
            case "Hoạt động":
                return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
            case "Chờ duyệt":
                return <Badge className="bg-blue-100 text-blue-800">Chờ duyệt</Badge>;
            case "Ngưng hoạt động":
                return <Badge className="bg-red-100 text-red-800">Ngưng hoạt động</Badge>;
            default:
                return <Badge variant="outline">Không rõ</Badge>;
        }
    };

    // =======================================================
    // === XỬ LÝ THÊM MỚI (CREATE) ===
    // =======================================================
    const handleAddDriver = async (newDriverData) => {
        setIsSubmitting(true);
        let statusMessage = '';

        const fd = new FormData();

        const processedData = {
            ...newDriverData,
            // Chuyển chuỗi trạng thái thành mã số
            trangthai: STATUS_STRING_TO_CODE[newDriverData.trangthai] !== undefined ? STATUS_STRING_TO_CODE[newDriverData.trangthai] : newDriverData.trangthai,
            kinhnghiem: Number(newDriverData.kinhnghiem)
        };

        for (const key in processedData) {
            if (Object.prototype.hasOwnProperty.call(processedData, key)) {
                const value = processedData[key];
                // Xử lý File 
                if (key === 'anhdaidien' && value instanceof File) {
                    fd.append(key, value, value.name);
                }
                else if (value !== null && value !== undefined) {
                    fd.append(key, value);
                }
            }
        }

        try {
            const res = await fetch(API_ADD_DRIVER, {
                method: "POST",
                body: fd,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Thêm thất bại. Vui lòng kiểm tra dữ liệu.");
            }

            statusMessage = "🎉 Thêm tài xế thành công!";
            toast.success(statusMessage);

            setIsDialogOpen(false);
            fetchDriversData();
        } catch (err) {
            statusMessage = `❌ Lỗi thêm tài xế: ${err.message}`;
            toast.error(statusMessage);
            console.error("Lỗi API Thêm Tài Xế:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // =======================================================
    // === XỬ LÝ CHỈNH SỬA TÀI XẾ (UPDATE) ===
    // =======================================================
    const handleUpdateDriver = async (updatedDriverData) => {
        setIsSubmitting(true);
        let statusMessage = '';

        const fd = new FormData();
        const driverId = parseInt(updatedDriverData.id);

        const dataToSend = { ...updatedDriverData };
        // Đảm bảo không gửi 'matkhau' nếu người dùng không nhập (giá trị là chuỗi rỗng)
        if (dataToSend.matkhau === '') {
            delete dataToSend.matkhau;
        }

        const processedData = {
            ...dataToSend,
            // Chuyển chuỗi trạng thái thành mã số
            trangthai: STATUS_STRING_TO_CODE[dataToSend.trangthai] !== undefined ? STATUS_STRING_TO_CODE[dataToSend.trangthai] : dataToSend.trangthai,
            kinhnghiem: Number(dataToSend.kinhnghiem),
        };

        for (const key in processedData) {
            if (Object.prototype.hasOwnProperty.call(processedData, key)) {
                const value = processedData[key];

                // Trường hợp 1: Gửi file mới
                if (key === 'anhdaidien' && value instanceof File) {
                    fd.append(key, value, value.name);
                }
                // Trường hợp 2: Gửi lại đường dẫn ảnh cũ (dạng chuỗi)
                // Điều kiện: key là 'anhdaidien' và value là chuỗi không rỗng/null/undefined
                else if (key === 'anhdaidien' && typeof value === 'string' && value.trim() !== "") {
                    fd.append(key, value);
                }
                // Trường hợp 3: Gửi các trường khác
                else if (key !== 'anhdaidien' && value !== null && value !== undefined) {
                    fd.append(key, value);
                }
            }
        }

        fd.append('idtaixe', driverId); // Thêm ID vào FormData cho API Update
        console.log("--- Nội dung FormData đang gửi đi ---");
for (const [key, value] of fd.entries()) {
    // Với File, value sẽ là đối tượng File (có thể rất lớn). 
    // Chúng ta chỉ log tên và loại file để tránh làm rối console.
    if (value instanceof File) {
        console.log(`${key}: File | Tên: ${value.name} | Loại: ${value.type}`);
    } else {
        console.log(`${key}: ${value}`);
    }
}


        try {
            const res = await fetch(API_UPDATE_DRIVER, {
                method: "PUT", // Thường là PUT hoặc PATCH
                body: fd,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Cập nhật thất bại. Vui lòng kiểm tra dữ liệu.");
            }

            statusMessage = "✅ Cập nhật tài xế thành công!";
            toast.success(statusMessage);

            setIsDialogOpen(false);
            setEditingDriver(null); // Reset dữ liệu đang chỉnh sửa
            fetchDriversData();
        } catch (err) {
            statusMessage = `❌ Lỗi cập nhật tài xế: ${err.message}`;
            toast.error(statusMessage);
            console.error("Lỗi API Cập Nhật Tài Xế:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // =======================================================
    // === XỬ LÝ XÓA TÀI XẾ (DELETE) ===
    // =======================================================
    const handleDeleteDriver = async (driverId, driverName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tài xế "${driverName}" không? Hành động này không thể hoàn tác.`)) {
            return;
        }

        setDeletingId(driverId);

        try {
            const res = await fetch(`${API_DELETE_DRIVER_BASE}/${driverId}`, {
                method: "PUT",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Xóa thất bại. Vui lòng thử lại.");
            }

            toast.success(`🗑️ Đã xóa tài xế "${driverName}" thành công!`);
            fetchDriversData();
        } catch (err) {
            toast.error(`❌ Lỗi xóa tài xế: ${err.message}`);
            console.error("Lỗi API Xóa Tài Xế:", err);
        } finally {
            setDeletingId(null);
        }
    };

    // =======================================================
    // === KHỞI ĐỘNG CHẾ ĐỘ CHỈNH SỬA ===
    // =======================================================
    const handleEditClick = (driver) => {
        // Cần tạo một bản sao DRIVER_FIELDS và set required của matkhau thành false
        // const fieldsForEdit = DRIVER_FIELDS.map(field =>
        //     field.name === 'matkhau' ? { ...field, required: false } : field
        // );

        // Chuẩn bị dữ liệu để AddEntityDialog nhận vào (initialData)
        const initialDataForEdit = {
            id: driver.id, // ID là quan trọng nhất cho API Update
            hoten: driver.name,
            matkhau: '', // Để trống, không hiển thị mật khẩu hiện tại
            sodienthoai: driver.phone,
            email: driver.email,
            mabang: driver.license,
            kinhnghiem: driver.experience,
            trangthai: driver.status, // Trạng thái là chuỗi hiển thị
            anhdaidien: driver.avatar, // Giữ lại URL ảnh cũ
        };

        setEditingDriver(initialDataForEdit);
        setIsDialogOpen(true);
    };

    // Dynamic fields cho Dialog (required của mật khẩu)
    const dynamicFields = useMemo(() => {
        // Khi chỉnh sửa, mật khẩu là không bắt buộc (false)
        const isEditMode = !!editingDriver;
        return DRIVER_FIELDS.map(field =>
            field.name === 'matkhau' && isEditMode
                ? { ...field, required: false }
                : field
        );
    }, [editingDriver]);

    return (

        <div className="space-y-6">
            {/* === 1. THẺ TỔNG QUAN === */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng tài xế</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">tài xế trong hệ thống</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">tài xế đang hoạt động/chạy</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                        <UserPlus className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.ready}</div>
                        <p className="text-xs text-muted-foreground">tài xế chờ duyệt</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- */}

            {/* === 2. BẢNG DANH SÁCH TÀI XẾ === */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Danh sách tài xế ({drivers.length})</CardTitle>
                    <Button onClick={() => { setIsDialogOpen(true); setEditingDriver(null); }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Thêm tài xế mới
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Thanh tìm kiếm */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên, SĐT, Email, Bằng lái, Trạng thái..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#175e7a] focus:border-[#175e7a] transition duration-150 shadow-sm text-base"
                        />
                    </div>

                    {/* Loading / Error / Data Table */}
                    <div className="overflow-x-auto min-h-[200px] relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                                <Loader2 className="h-8 w-8 text-[#175e7a] animate-spin" />
                                <span className="ml-3 text-lg font-medium text-gray-600">Đang tải dữ liệu...</span>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="flex flex-col items-center justify-center py-10 bg-red-50 border border-red-200 rounded-lg">
                                <XCircle className="h-8 w-8 text-red-600 mb-3" />
                                <p className="text-red-700 text-center font-medium px-4">{error}</p>
                                <Button onClick={() => fetchDriversData(0)} className="mt-4 bg-red-600 hover:bg-red-700">Thử lại</Button>
                            </div>
                        )}

                        {!loading && !error && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Họ tên</TableHead>
                                        <TableHead>Thông tin liên lạc</TableHead>
                                        <TableHead>Mã bằng lái</TableHead>
                                        <TableHead className="text-center">Kinh nghiệm</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDrivers.length > 0 ? (
                                        filteredDrivers.map((driver) => (
                                            <TableRow key={driver.id}>
                                                {/* Họ tên & Avatar */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage
                                                                src={driver.avatar}
                                                                alt={driver.name}
                                                            />
                                                            <AvatarFallback className="bg-gray-200 text-gray-800">
                                                                {getInitials(driver.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{driver.name}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Thông tin liên lạc */}
                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span>{driver.phone}</span>
                                                        <span className="text-muted-foreground">{driver.email}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Bằng lái */}
                                                <TableCell className="font-mono">{driver.license}</TableCell>

                                                {/* Kinh nghiệm */}
                                                <TableCell className="text-center">
                                                    {driver.experience} năm
                                                </TableCell>

                                                {/* Trạng thái */}
                                                <TableCell>{getStatusBadge(driver.status)}</TableCell>

                                                {/* Hành động */}
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {/* NÚT CHỈNH SỬA */}
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="hover:bg-blue-100 text-blue-600 border-blue-200"
                                                            onClick={() => handleEditClick(driver)}
                                                            disabled={isSubmitting || deletingId}
                                                        >
                                                            <FilePenLine className="h-4 w-4" />
                                                        </Button>
                                                        {/* NÚT XÓA */}
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                                            onClick={() => handleDeleteDriver(driver.id, driver.name)}
                                                            // Disabled nếu đang submit/driver này đang bị xóa
                                                            disabled={deletingId === driver.id || isSubmitting}
                                                        >
                                                            {deletingId === driver.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                                {searchTerm ? `Không tìm thấy tài xế nào phù hợp với từ khóa "${searchTerm}".` : "Chưa có tài xế nào trong hệ thống."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* --- */}

            {/* === 3. Component Dialog Thêm/Sửa Tài Xế === */}
            <AddEntityDialog
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingDriver(null); // Đảm bảo reset khi đóng
                }}
                title={editingDriver ? "Chỉnh Sửa Tài Xế" : "Thêm Tài Xế Mới"}
                description={editingDriver ?
                    `Cập nhật thông tin tài xế ${editingDriver.hoten}.` :
                    "Nhập thông tin chi tiết của tài xế để thêm vào hệ thống quản lý xe buýt."
                }
                // Sử dụng dynamicFields để bật/tắt required của mật khẩu
                fields={dynamicFields}

                // Chọn hàm submit dựa trên trạng thái (Thêm mới/Chỉnh sửa)
                onSubmit={editingDriver ? handleUpdateDriver : handleAddDriver}
                // Truyền dữ liệu ban đầu cho chế độ chỉnh sửa
                initialData={editingDriver}

                // Text nút và màu sắc động
                submitButtonText={
                    isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                        (editingDriver ? "Cập Nhật" : "Thêm Tài Xế")
                }
                accentColor={editingDriver ? "bg-orange-500 hover:bg-orange-600" : "bg-[#175e7a] hover:bg-[#134c60]"}
                isSubmitting={isSubmitting}
            />

        </div>

    );
}