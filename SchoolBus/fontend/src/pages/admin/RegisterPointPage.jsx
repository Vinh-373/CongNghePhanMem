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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ClipboardList,
    CheckCircle,
    Clock,
    PlusCircle,
    FilePenLine,
    Trash2,
    Search,
    Loader2,
    XCircle,
} from "lucide-react";

// === Import component Dialog ===
import AddEntityDialog from "@/components/AddEntityDialog";

// Giả định toast
const toast = {
    success: (msg) => console.log("SUCCESS:", msg),
    error: (msg) => console.log("ERROR:", msg)
};


// === Cấu hình API ===
const API_URL = "http://localhost:5001/schoolbus/admin/get-all-registered-pickup-points";
const API_ADD_REGISTRATION = "http://localhost:5001/schoolbus/admin/add-registration";

/**
 * Ánh xạ mã trạng thái (0: Chờ duyệt, 1: Đã duyệt)
 */
const mapStatus = (code) => {
    switch (code) {
        case 1: return 'Đã duyệt';
        case 0: return 'Chờ duyệt';
        default: return 'Không rõ';
    }
}

// =======================================================
// === Cấu hình Fields cho Dialog Thêm Đăng Ký ===
const REGISTRATION_FIELDS = [
    {
        name: 'mahocsinh',
        label: 'Mã Học Sinh (FK)',
        type: 'number',
        placeholder: 'Ví dụ: 7',
        min: 1,
        required: true
    },
    {
        name: 'iddiemdung',
        label: 'Mã Điểm Dừng (FK)',
        type: 'number',
        placeholder: 'Ví dụ: 12',
        min: 1,
        required: true
    },
    {
        name: 'trangthai',
        label: 'Trạng thái',
        type: 'select',
        options: ['Chờ duyệt', 'Đã duyệt'],
        defaultValue: 'Chờ duyệt',
        required: true,
        smColSpan: 2
    },
    {
        name: 'ghichu',
        label: 'Ghi chú (Tùy chọn)',
        type: 'textarea',
        placeholder: 'Các yêu cầu đặc biệt...',
        required: false,
        smColSpan: 2
    },
];
// =======================================================


export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hàm lấy ngày giờ hiển thị
    const formatDateTime = useCallback((isoString) => {
        if (!isoString) return 'N/A';
        try {
            let dateToParse = isoString;
            // Xử lý chuỗi định dạng "YYYY-MM-DD HH:mm:ss" không có múi giờ
            if (isoString.includes(' ') && !isoString.includes('Z') && isoString.length > 10) {
                // Thay thế khoảng trắng bằng 'T' để Date object hiểu là ISO 8601 (Local time)
                dateToParse = isoString.replace(' ', 'T'); 
            }
            const dateObj = new Date(dateToParse);
            if (isNaN(dateObj.getTime())) return isoString;

            // Định dạng theo chuẩn Việt Nam
            return dateObj.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).replace(/\//g, '-').replace(',', '');
        } catch {
            return isoString;
        }
    }, []);

    // === LOGIC GỌI API VÀ XỬ LÝ DỮ LIỆU ĐÃ CẬP NHẬT CHÍNH XÁC THEO LOG ===
    const fetchRegistrationsData = useCallback(async () => {
        setError(null);
        setRegistrations([]);

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Lỗi HTTP: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched registrations data:", data);

            // Kiểm tra cấu trúc data.registrations
            const registrationsList = Array.isArray(data.registrations) ? data.registrations : [];

            // Xử lý dữ liệu từ API dựa trên cấu trúc mới
            const processedList = registrationsList.map(reg => {
                // 💡 Đảm bảo tên thuộc tính khớp chính xác với ảnh log (DiemDung, hocsinh, phuhuynh)
                const diemDung = reg.DiemDung || {};
                const hocSinh = reg.hocsinh || {};
                const phuHuynh = reg.phuhuynh || {};
                const phuHuynhInfo = phuHuynh.userInfo || {}; 

                // Trích xuất các trường
                const id = reg.iddangky;
                const studentId = reg.mahocsinh;
                const stopId = reg.iddiemdung;
                
                // Trích xuất thông tin Học sinh
                const studentName = hocSinh.hoten || 'N/A';
                const studentClass = hocSinh.lop || 'N/A';
                
                // Trích xuất thông tin Phụ huynh
                const parentName = phuHuynhInfo.hoten || 'N/A';
                const parentPhone = phuHuynhInfo.sodienthoai || 'N/A';

                // Trích xuất thông tin Điểm Dừng
                // ⚠️ Dùng tên thuộc tính 'tendiemdung'
                const stopName = diemDung.tendiemdon || 'N/A';
                
                // Trích xuất và định dạng Thời gian đăng ký
                // ⚠️ Dùng tên thuộc tính 'thoigiandangky'
                const time = formatDateTime(reg.thoigiandangky); 
                
                const status = mapStatus(reg.trangthai);

                return {
                    id,
                    studentId,
                    stopId,
                    studentName,
                    studentClass,
                    parentName,
                    parentPhone,
                    stopName,
                    time,
                    status,
                    rawStatus: reg.trangthai
                };
            });

            setRegistrations(processedList);

        } catch (err) {
            console.error("Fetch error:", err);
            setError(`Không thể tải dữ liệu đăng ký: ${err.message}. Vui lòng kiểm tra kết nối API.`);
        }
    }, [formatDateTime]);

    useEffect(() => {
        fetchRegistrationsData();
    }, [fetchRegistrationsData]);


    // === LOGIC TÌM KIẾM VÀ LỌC DỮ LIỆU ===
    const filteredRegistrations = useMemo(() => {
        if (!searchTerm) return registrations;

        const lowerCaseSearch = searchTerm.toLowerCase();
        return registrations.filter(reg =>
            reg.studentId.toString().includes(searchTerm) ||
            reg.stopId.toString().includes(searchTerm) ||
            reg.time.includes(searchTerm) ||
            reg.status.toLowerCase().includes(lowerCaseSearch) ||
            reg.studentName.toLowerCase().includes(lowerCaseSearch) ||
            reg.parentName.toLowerCase().includes(lowerCaseSearch) ||
            reg.stopName.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchTerm, registrations]);

    // === TÍNH TOÁN THỐNG KÊ (Giữ nguyên) ===
    const stats = useMemo(() => ({
        total: registrations.length,
        approved: registrations.filter((r) => r.status === "Đã duyệt").length,
        pending: registrations.filter((r) => r.status === "Chờ duyệt").length,
    }), [registrations]);

    // Helper để lấy badge màu theo trạng thái (Giữ nguyên)
    const getStatusBadge = (status) => {
        switch (status) {
            case "Đã duyệt":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Đã duyệt</Badge>;
            case "Chờ duyệt":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Chờ duyệt</Badge>;
            default:
                return <Badge variant="outline">Không rõ</Badge>;
        }
    };

    // === XỬ LÝ SUBMIT DIALOG THÊM MỚI (Giữ nguyên) ===
    const handleAddRegistration = async (newRegData) => {
        setIsSubmitting(true);
        let statusMessage = '';

        const statusMap = {
            'Chờ duyệt': 0,
            'Đã duyệt': 1,
        };

        const processedData = {
            mahocsinh: Number(newRegData.mahocsinh),
            iddiemdung: Number(newRegData.iddiemdung),
            trangthai: statusMap[newRegData.trangthai] !== undefined
                ? statusMap[newRegData.trangthai]
                : 0,
            ghichu: newRegData.ghichu || ''
        };

        try {
            const res = await fetch(API_ADD_REGISTRATION, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(processedData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Thêm thất bại. Vui lòng kiểm tra dữ liệu.");
            }

            statusMessage = "🎉 Thêm đăng ký điểm đón thành công!";
            toast.success(statusMessage);

            setIsDialogOpen(false);
            fetchRegistrationsData();
        } catch (err) {
            statusMessage = `❌ Lỗi thêm đăng ký: ${err.message}`;
            toast.error(statusMessage);
            console.error("Lỗi API Thêm Đăng Ký:", err);
        } finally {
            setIsSubmitting(false);
        }
    };
    // =======================================================

    return (

        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Quản Lý Đăng Ký Điểm Đón</h1>

            {/* === 1. THẺ TỔNG QUAN (Giữ nguyên) === */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Đăng Ký</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">yêu cầu đăng ký trong hệ thống</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đã Duyệt</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approved}</div>
                        <p className="text-xs text-muted-foreground">đăng ký đã được chấp thuận</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Chờ Duyệt</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">đăng ký cần xem xét</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- */}

            {/* === 2. BẢNG DANH SÁCH ĐĂNG KÝ (Cập nhật hiển thị SĐT) === */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Danh sách Đăng Ký ({registrations.length})</CardTitle>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tạo Đăng Ký Mới
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Thanh tìm kiếm giữ nguyên */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Mã HS, Mã ĐD, Tên Học Sinh, Phụ Huynh..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition duration-150 shadow-sm text-base"
                        />
                    </div>

                    <div className="overflow-x-auto min-h-[200px] relative">
                        {error && (
                            <div className="flex flex-col items-center justify-center py-10 bg-red-50 border border-red-200 rounded-lg">
                                <XCircle className="h-8 w-8 text-red-600 mb-3" />
                                <p className="text-red-700 text-center font-medium px-4">{error}</p>
                                <Button onClick={fetchRegistrationsData} className="mt-4 bg-red-600 hover:bg-red-700">Thử lại</Button>
                            </div>
                        )}

                        {!error && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">IDĐK</TableHead>
                                        <TableHead className="w-[100px]">Mã HS (Lớp)</TableHead>
                                        <TableHead className="w-[150px]">Học Sinh</TableHead>
                                        <TableHead className="w-[150px]">Phụ Huynh (SĐT)</TableHead>
                                        <TableHead className="w-[200px]">Điểm Dừng</TableHead>
                                        <TableHead>Thời gian đăng ký</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRegistrations.length > 0 ? (
                                        filteredRegistrations.map((reg) => (
                                            <TableRow key={reg.id}>
                                                <TableCell className="font-semibold">{reg.id}</TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {reg.studentId}
                                                    <div className="text-xs text-muted-foreground italic">({reg.studentClass})</div>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">{reg.studentName}</TableCell>
                                                <TableCell className="text-sm">
                                                    {reg.parentName}
                                                    <div className="text-xs text-muted-foreground italic">{reg.parentPhone}</div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {reg.stopName}
                                                    <div className="text-xs text-muted-foreground italic">(ID: {reg.stopId})</div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {reg.time}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(reg.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="hover:bg-blue-100 text-blue-600 border-blue-200"
                                                            onClick={() => alert(`Sửa đăng ký ID: ${reg.id}`)}
                                                        >
                                                            <FilePenLine className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                                            onClick={() => alert(`Xóa đăng ký ID: ${reg.id}`)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                                                {searchTerm ? `Không tìm thấy đăng ký nào phù hợp với từ khóa "${searchTerm}".` : "Chưa có đăng ký điểm đón nào trong hệ thống."}
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

            {/* === 3. Component Dialog Thêm Đăng Ký Mới (Giữ nguyên) === */}
            <AddEntityDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Tạo Đăng Ký Điểm Đón Mới"
                description="Nhập Mã Học Sinh và Mã Điểm Dừng để tạo một yêu cầu đăng ký mới."
                fields={REGISTRATION_FIELDS}
                onSubmit={handleAddRegistration}
                submitButtonText={isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Thêm Đăng Ký"}
                accentColor="bg-blue-600 hover:bg-blue-700"
                isSubmitting={isSubmitting}
            />
        </div>
    );
}