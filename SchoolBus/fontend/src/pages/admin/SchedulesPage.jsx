import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import AddEntityDialog from "@/components/AddEntityDialog";
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
    CalendarCheck,
    Clock,
    Play,
    StopCircle,
    PlusCircle,
    FilePenLine,
    Trash2,
    BusFront,
    User,
    Route,
    ChevronLeft,
    ChevronRight,
    Users,
} from "lucide-react";
import { toast } from "sonner"; // Thêm toast để thông báo (nếu bạn sử dụng sonner)
import { Value } from "@radix-ui/react-select";


// === DỮ LIỆU HARD-CODE (MVP1) ===
const scheduleData = [
    // ... (Dữ liệu lịch trình giữ nguyên) ...
    {
        id: "TRIP001",
        date: "T.Hai, 17/11",
        route: "Tuyến Sáng 1",
        type: "Đón học sinh",
        vehicle: "51A-12345",
        driver: "Nguyễn Văn A",
        time: "06:30",
        status: "Đã hoàn thành",
        students: 35,
    },
    {
        id: "TRIP002",
        date: "T.Hai, 17/11",
        route: "Tuyến Sáng 2",
        type: "Đón học sinh",
        vehicle: "51B-67890",
        driver: "Trần Thị B",
        time: "07:00",
        status: "Đang chạy",
        students: 40,
    },
    {
        id: "TRIP003",
        date: "T.Ba, 18/11",
        route: "Tuyến Chiều 1",
        type: "Trả học sinh",
        vehicle: "51C-54321",
        driver: "Lê Văn C",
        time: "16:00",
        status: "Chờ khởi hành",
        students: 30,
    },
    {
        id: "TRIP004",
        date: "T.Năm, 20/11",
        route: "Tuyến Chiều 2",
        type: "Trả học sinh",
        vehicle: "51D-98765",
        driver: "Phạm Thị D",
        time: "16:45",
        status: "Chờ khởi hành",
        students: 28,
    },
    {
        id: "TRIP005",
        date: "T.Sáu, 21/11",
        route: "Tuyến Chiều 3",
        type: "Trả học sinh",
        vehicle: "51E-00112",
        driver: "Võ Văn E",
        time: "17:30",
        status: "Chờ khởi hành",
        students: 32,
    },
];

// Dữ liệu giả lập cho Select và Multi-select
const availableStudents = ["HS001", "HS002", "HS003", "HS004", "HS005", "HS006", "HS007"];


// 💥 CẬP NHẬT TRIP_SCHEDULE_FIELDS
const TRIP_SCHEDULE_FIELDS = [
    { name: "trip_date", label: "Ngày", type: "date", required: true, placeholder: "Chọn ngày chuyến đi" },
    { name: "trip_time", label: "Giờ Khởi hành", type: "time", required: true, placeholder: "Ví dụ: 06:30" },
    
    // 🎯 THAY ĐỔI: Mã Tuyến là SELECT
    { name: "route_id", 
        label: "Mã Tuyến", 
        type: "select", 
        required: true, 
        options: ["TUYEN01", "TUYEN02", "TUYEN03", "TUYEN04"], 
        placeholder: "Chọn Tuyến" 
    },
    
    { name: "vehicle_code", label: "Mã Xe", type: "select", required: true, options: ["51A-12345", "51B-67890", "51C-54321"] },
    { name: "driver_id", label: "Mã Tài xế", type: "select", required: true, options: ["TX001", "TX002", "TX003"] },
    { name: "status", label: "Trạng thái", type: "text", required: true, defaultValue: "Chờ khởi hành" },
    
    // 🎯 THAY ĐỔI: DS Mã HS là MULTI-SELECT
    { 
        name: "selected_students", // Đổi tên để tránh nhầm lẫn với data cũ
        label: "DS Mã HS (Chọn thủ công)", 
        type: "multi-select", 
        required: false, // Thường không bắt buộc nếu có logic tự động gán
        options: availableStudents,
        placeholder: "Chọn học sinh..." 
    },
];


export default function SchedulesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Xử lý việc gửi form từ AddEntityDialog (placeholder)
    const handleAddTrip = (formData) => {
        console.log("Dữ liệu chuyến đi mới:", formData);
        console.log("Các học sinh đã chọn:", formData.selected_students);
        
        // Placeholder cho API call
        toast.success(`Đã lên lịch chuyến cho tuyến ${formData.route_id} với ${formData.selected_students.length} học sinh.`);
        
        setIsDialogOpen(false);
        // Sau khi gọi API thành công, bạn sẽ fetch lại dữ liệu thực tế
    };


    // Helper để lấy badge màu theo trạng thái
    const getStatusBadge = (status) => {
        // ... (Logic giữ nguyên) ...
        switch (status) {
            case "Đã hoàn thành":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Hoàn thành
                    </Badge>
                );
            case "Đang chạy":
                return (
                    <Badge className="bg-blue-100 text-blue-800 animate-pulse hover:bg-blue-200">
                        Đang chạy
                    </Badge>
                );
            case "Chờ khởi hành":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        Chờ khởi hành
                    </Badge>
                );
            default:
                return <Badge variant="outline">Không rõ</Badge>;
        }
    };

    const isActionDisabled = (status) => {
        return status === "Đã hoàn thành" || status === "Đang chạy";
    };


    const stats = {
        totalTrips: scheduleData.length,
        completedTrips: scheduleData.filter((s) => s.status === "Đã hoàn thành")
            .length,
        inProgressTrips: scheduleData.filter((s) => s.status === "Đang chạy")
            .length,
    };

    const currentWeek = "17/11/2025 - 23/11/2025";

    return (
       
            <div className="space-y-6">
                {/* === 1. THẺ TỔNG QUAN === */}
                {/* ... (Phần UI Thẻ tổng quan giữ nguyên) ... */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Tổng số Chuyến trong tuần */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Tổng số Chuyến (Tuần)
                            </CardTitle>
                            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTrips}</div>
                            <p className="text-xs text-muted-foreground">
                                chuyến đã được lên lịch trong tuần
                            </p>
                        </CardContent>
                    </Card>

                    {/* Chuyến đã hoàn thành (Tuần) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Đã Hoàn thành (Tuần)
                            </CardTitle>
                            <StopCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completedTrips}</div>
                            <p className="text-xs text-muted-foreground">
                                chuyến đã kết thúc thành công
                            </p>
                        </CardContent>
                    </Card>

                    {/* Chuyến đang chạy (Hôm nay/Tuần) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Đang Chạy</CardTitle>
                            <Play className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.inProgressTrips}</div>
                            <p className="text-xs text-muted-foreground">
                                chuyến đang diễn ra
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* === 2. BẢNG DANH SÁCH LỊCH TRÌNH THEO TUẦN === */}
                {/* ... (Phần UI Bảng giữ nguyên) ... */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <CardTitle className="text-xl">Lịch trình Chuyến đi</CardTitle>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="icon">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="font-semibold text-sm w-40 text-center">
                                    Tuần: {currentWeek}
                                </span>
                                <Button variant="outline" size="icon">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Thêm Chuyến Mới
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã chuyến</TableHead>
                                    <TableHead>Ngày</TableHead>
                                    <TableHead>Tuyến đường</TableHead>
                                    <TableHead>Loại Chuyến</TableHead>
                                    <TableHead>Giờ</TableHead>
                                    <TableHead>Xe</TableHead>
                                    <TableHead>Tài xế</TableHead>
                                    <TableHead>DS học sinh</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scheduleData.map((trip) => (
                                    <TableRow key={trip.id}>
                                        {/* Mã chuyến */}
                                        <TableCell className="font-medium text-xs text-slate-600">
                                            {trip.id}
                                        </TableCell>

                                        {/* Ngày */}
                                        <TableCell className="font-semibold text-sm text-indigo-700">
                                            {trip.date}
                                        </TableCell>

                                        {/* Tuyến đường */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Route className="h-4 w-4 text-muted-foreground" />
                                                <span>{trip.route}</span>
                                            </div>
                                        </TableCell>

                                        {/* Loại chuyến */}
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                                            >
                                                {trip.type}
                                            </Badge>
                                        </TableCell>

                                        {/* Giờ khởi hành */}
                                        <TableCell className="font-bold">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4 text-orange-500" />
                                                {trip.time}
                                            </div>
                                        </TableCell>

                                        {/* Xe */}
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <BusFront className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium">{trip.vehicle}</span>
                                            </div>
                                        </TableCell>

                                        {/* Tài xế */}
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-green-500" />
                                                <span>{trip.driver}</span>
                                            </div>
                                        </TableCell>

                                        {/* DS học sinh */}
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                <Users className="h-4 w-4 text-orange-500" />
                                                <span>{trip.students || 0} HS</span>
                                            </div>
                                        </TableCell>

                                        {/* Trạng thái */}
                                        <TableCell>{getStatusBadge(trip.status)}</TableCell>

                                        {/* Hành động */}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Nút Cập nhật */}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hover:bg-blue-100"
                                                    onClick={() => {
                                                        console.log(`Cập nhật chuyến: ${trip.id}`);
                                                    }}
                                                    title="Chỉnh sửa chuyến đi"
                                                    disabled={isActionDisabled(trip.status)}
                                                >
                                                    <FilePenLine className={`h-4 w-4 ${isActionDisabled(trip.status) ? 'text-gray-400' : 'text-blue-600'}`} />
                                                </Button>
                                                {/* Nút Xóa */}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hover:bg-red-100"
                                                    onClick={() => {
                                                        console.log(`Xóa chuyến: ${trip.id}`);
                                                    }}
                                                    title="Xóa chuyến đi"
                                                    disabled={isActionDisabled(trip.status)}
                                                >
                                                    <Trash2 className={`h-4 w-4 ${isActionDisabled(trip.status) ? 'text-gray-400' : 'text-red-600'}`} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 3. DIALOG THÊM MỚI (Đã sử dụng component import thực tế) */}
                <AddEntityDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    title="Thêm Lịch trình mới"
                    description="Điền thông tin chi tiết của chuyến xe mới. Mã Tuyến và Danh sách HS đã được chuyển sang dạng chọn."
                    fields={TRIP_SCHEDULE_FIELDS}
                    onSubmit={handleAddTrip}
                    submitButtonText="Lưu Lịch trình"
                    accentColor="bg-amber-500 hover:bg-amber-600"
                />
            </div>
 
    );
}