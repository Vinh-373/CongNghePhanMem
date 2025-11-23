import React, { useState, useEffect, useMemo, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
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
// Nếu chưa có, bạn cần cài đặt và import toast
const toast = { 
    success: (msg) => console.log("SUCCESS:", msg), 
    error: (msg) => console.log("ERROR:", msg) 
};


// === Cấu hình API ===
const API_URL = "http://localhost:5001/schoolbus/admin/get-all-drivers";
const API_ADD_DRIVER = "http://localhost:5001/schoolbus/admin/add-driver";
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

// =======================================================
// === Cấu hình Fields cho Dialog Thêm Tài xế (ĐÃ SẮP XẾP LẠI) ===
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
    
    // === 1. State cho Dialog Thêm mới và trạng thái submit ===
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state Submitting

    // Lấy 2 ký tự đầu tên cho Avatar Fallback
    const getInitials = (fullName) =>
        fullName
            ? fullName.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase()
            : 'TX';

    // === LOGIC GỌI API VÀ XỬ LÝ DỮ LIỆU (Giữ nguyên) ===
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
            console.log("Fetched drivers data:", data);

            const driversList = Array.isArray(data.drivers) ? data.drivers : [];

            // Xử lý dữ liệu từ API
            const processedList = driversList.map(driver => {
                const userInfo = driver.userInfo || {};
                // mapStatus sử dụng mã số 0, 1, 2, 3
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
                    status: displayStatus,
                };
            });

            setDrivers(processedList);
        } catch (err) {
            console.error("Fetch error:", err);
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying fetch... Attempt ${retryCount + 1}`);
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

    // === LOGIC TÌM KIẾM VÀ LỌC DỮ LIỆU (Giữ nguyên) ===
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

    // === TÍNH TOÁN THỐNG KÊ (Giữ nguyên) ===
    const stats = useMemo(() => ({
        total: drivers.length,
        // Dựa vào chuỗi đã mapStatus để tính toán
        active: drivers.filter((d) => d.status === "Hoạt động").length,
        ready: drivers.filter((d) => d.status === "Chờ duyệt").length, 
    }), [drivers]);

    // Helper để lấy badge màu theo trạng thái (Giữ nguyên)
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
    // === XỬ LÝ SUBMIT DIALOG (Hàm đã được sửa và đưa vào trong component) ===
    const handleAddDriver = async (newDriverData) => {
        // 1. Khởi tạo trạng thái Submitting
        setIsSubmitting(true);
        let statusMessage = '';
        
        // 2. Ánh xạ chuỗi trạng thái thành mã số (1, 2, 0)
        const statusMap = {
            'Chờ duyệt': 1, 
            'Hoạt động': 2, 
            'Ngưng hoạt động': 0
        };

        // 3. Tạo FormData và xử lý dữ liệu
        const fd = new FormData();
        
        // Tạo đối tượng dữ liệu đã xử lý để dễ dàng append vào FormData
        const processedData = {
            ...newDriverData,
            // Thay thế chuỗi trạng thái bằng mã số 
            trangthai: statusMap[newDriverData.trangthai] !== undefined 
                ? statusMap[newDriverData.trangthai] 
                : newDriverData.trangthai,
            // Đảm bảo kinh nghiệm là số 
            kinhnghiem: Number(newDriverData.kinhnghiem)
        };

        // Thêm các trường vào FormData
        for (const key in processedData) {
    // THAY THẾ dòng gây cảnh báo bằng phương pháp an toàn:
    if (Object.prototype.hasOwnProperty.call(processedData, key)) { 
        const value = processedData[key];

        // Nếu là file và có giá trị (không phải null/undefined)
        if (key === 'anhdaidien' && value instanceof File) {
             fd.append(key, value, value.name);
        } 
        // Nếu là trường khác và không phải null/undefined
        else if (value !== null && value !== undefined) {
             fd.append(key, value);
        }
    }
}

        try {
            // 4. Gọi API POST
            const res = await fetch(API_ADD_DRIVER, { 
                method: "POST",
                // headers: { Authorization: `Bearer ${token}` }, // Bỏ comment nếu bạn cần token
                body: fd,
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || "Thêm thất bại. Vui lòng kiểm tra dữ liệu.");
            }

            // 5. Xử lý thành công
            statusMessage = "🎉 Thêm tài xế thành công!";
            toast.success(statusMessage); 

            // 6. Đóng Dialog và làm mới danh sách
            setIsDialogOpen(false);
            fetchDriversData(); 
        } catch (err) {
            // 7. Xử lý thất bại
            statusMessage = `❌ Lỗi thêm tài xế: ${err.message}`;
            toast.error(statusMessage);
            console.error("Lỗi API Thêm Tài Xế:", err);
        } finally {
            // 8. Kết thúc quá trình Submitting
            setIsSubmitting(false);
        }
    };
    // =======================================================

    return (
   
            <div className="space-y-6">
                {/* === 1. THẺ TỔNG QUAN (Giữ nguyên) === */}
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

                {/* === 2. BẢNG DANH SÁCH TÀI XẾ (Giữ nguyên) === */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Danh sách tài xế ({drivers.length})</CardTitle>
                        <Button onClick={() => setIsDialogOpen(true)}>
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
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="hover:bg-blue-100 text-blue-600 border-blue-200"
                                                                onClick={() => alert(`Sửa tài xế: ${driver.name}`)}
                                                            >
                                                                <FilePenLine className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                                                onClick={() => alert(`Xóa tài xế: ${driver.name}`)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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
                
                {/* === 3. Component Dialog Thêm Tài Xế Mới === */}
                <AddEntityDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    title="Thêm Tài Xế Mới"
                    description="Nhập thông tin chi tiết của tài xế để thêm vào hệ thống quản lý xe buýt."
                    fields={DRIVER_FIELDS}
                    onSubmit={handleAddDriver}
                    // Hiển thị Loader2 khi đang submit
                    submitButtonText={isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Thêm Tài Xế"}
                    accentColor="bg-[#175e7a] hover:bg-[#134c60]"
                    isSubmitting={isSubmitting}
                />

            </div>

    );
}