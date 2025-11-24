import React, { useState, useEffect } from "react";
import axios from "axios";
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
    CalendarCheck,
    Clock,
    Play,
    StopCircle,
    ChevronLeft,
    ChevronRight,
    BusFront,
    Route,
    Coffee,
    MapPin,
    Users,
    CheckCircle2,
    Calendar,
    User,
} from "lucide-react";
import { toast } from "sonner";

// === API endpoints ===
const API_GET_DRIVER_ID = "http://localhost:5001/schoolbus/driver/user_id";
const API_DRIVER_SCHEDULE = "http://localhost:5001/schoolbus/driver/schedule";

export default function SchedulesPage() {
    const [driverId, setDriverId] = useState(null);
    const [driverScheduleData, setDriverScheduleData] = useState([]);
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    const today = new Date().toISOString().split("T")[0];
    const userId = localStorage.getItem("idnguoidung"); // lấy id người dùng từ localStorage

    // === Lấy id tài xế từ userId ===
    useEffect(() => {
        const fetchDriverId = async () => {
            if (!userId) return;
            try {
                const res = await axios.get(`${API_GET_DRIVER_ID}/${userId}`);
                setDriverId(res.data.idtaixe);
            } catch (error) {
                console.error("Lấy id tài xế thất bại:", error);
                toast.error("Không thể lấy thông tin tài xế.");
            }
        };
        fetchDriverId();
    }, [userId]);

    // === Lấy lịch trình theo tuần ===
    useEffect(() => {
        console.log("DriverId hiện tại:", driverId);

        const fetchSchedule = async () => {
            if (!driverId) return;
            try {
                const res = await axios.get(`${API_DRIVER_SCHEDULE}/${driverId}`, {
                    params: { weekOffset: currentWeekOffset },
                });
                console.log("Type of res.data:", typeof res.data);
                console.log("Is Array?", Array.isArray(res.data));
                console.log("res.data.data:", res.data.data);
                console.log("Is res.data.data Array?", Array.isArray(res.data.data));
                const scheduleArray = Array.isArray(res.data.schedule) ? res.data.schedule : [];
                setDriverScheduleData(scheduleArray);
                console.log("Sau khi xử lý thành mảng:", scheduleArray);
            } catch (error) {
                console.error("Lấy lịch trình thất bại:", error);
                toast.error("Không thể tải lịch trình tuần này.");
            }
        };
        fetchSchedule();
    }, [driverId, currentWeekOffset]);

    // === Helper hiển thị badge trạng thái ===
    const getStatusBadge = (status) => {
        switch (status) {
            case "Hoàn thành":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Hoàn thành
                    </Badge>
                );
            case "Đang chạy":
                return (
                    <Badge className="bg-blue-100 text-blue-800 animate-pulse hover:bg-blue-200">
                        <Play className="h-3 w-3 mr-1" />
                        Đang chạy
                    </Badge>
                );
            case "Chưa chạy":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Chưa chạy
                    </Badge>
                );
            case "Nghỉ":
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        <Coffee className="h-3 w-3 mr-1" />
                        Nghỉ
                    </Badge>
                );
            default:
                return <Badge variant="outline">Không rõ</Badge>;
        }
    };

    // Xác nhận ca làm việc
    const handleConfirmShift = (tripId) => {
        toast.success(`Đã xác nhận ca làm việc ${tripId}`);
        console.log(`Xác nhận ca: ${tripId}`);
        // TODO: Gọi API xác nhận ca
    };

    // Thống kê
    const stats = {
        totalTrips: Array.isArray(driverScheduleData) ? driverScheduleData.length : 0,
        completedTrips: Array.isArray(driverScheduleData)
            ? driverScheduleData.filter((s) => s.trangThai === "Hoàn thành").length
            : 0,
        inProgressTrips: Array.isArray(driverScheduleData)
            ? driverScheduleData.filter((s) => s.trangThai === "Đang chạy").length
            : 0,
        upcomingTrips: Array.isArray(driverScheduleData)
            ? driverScheduleData.filter((s) => s.trangThai === "Chưa chạy").length
            : 0,
    };


    // Lấy tuần hiện tại
    const getCurrentWeekRange = () => {
        const today = new Date();
        const currentDay = today.getDay();
        const monday = new Date(today);
        monday.setDate(
            today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + currentWeekOffset * 7
        );

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        return `${formatDate(monday)} - ${formatDate(sunday)}`;
    };

    const currentWeek = getCurrentWeekRange();

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Tài xế</h1>
                                <p className="text-blue-100">ID: {driverId || "..."}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-2">
                                <Calendar className="h-5 w-5" />
                                <span className="font-semibold">
                                    {new Date().toLocaleDateString("vi-VN", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-blue-100">Chào mừng trở lại!</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Thẻ thống kê */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Ca Làm Việc</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTrips}</div>
                        <p className="text-xs text-muted-foreground">ca trong tuần này</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đã Hoàn Thành</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completedTrips}</div>
                        <p className="text-xs text-muted-foreground">ca đã hoàn thành</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đang Làm Việc</CardTitle>
                        <Play className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.inProgressTrips}</div>
                        <p className="text-xs text-muted-foreground">ca đang thực hiện</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bảng lịch trình */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <CardTitle className="text-xl">Lịch Trình Làm Việc Trong Tuần</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold text-sm w-48 text-center">Tuần: {currentWeek}</span>
                            <Button variant="outline" size="icon" onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {currentWeekOffset !== 0 && (
                        <Button variant="outline" onClick={() => setCurrentWeekOffset(0)}>Về tuần hiện tại</Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Thứ</TableHead>
                                <TableHead>Ngày</TableHead>
                                <TableHead>Tuyến</TableHead>
                                <TableHead>Loại Ca</TableHead>
                                <TableHead>Giờ Bắt Đầu</TableHead>
                                <TableHead>Xe</TableHead>
                                <TableHead>Số Điểm Dừng</TableHead>
                                <TableHead>Số HS</TableHead>
                                <TableHead>Trạng Thái</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {driverScheduleData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                        Không có lịch trình nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                driverScheduleData.map((trip) => {
                                    const isToday = new Date(trip.date).toDateString() === new Date().toDateString();
                                    return (
                                        <TableRow key={trip.id} className={isToday ? "bg-blue-50" : ""}>
                                            <TableCell>{trip.thu}</TableCell>
                                            <TableCell>{trip.ngay}</TableCell>
                                            <TableCell>{trip.tenTuyen}</TableCell>
                                            <TableCell>{trip.loaituyen}</TableCell>
                                            <TableCell>{trip.gioBatDau}</TableCell>
                                            <TableCell>{trip.bienSoXe}</TableCell>
                                            <TableCell>{trip.soDiemDung}</TableCell>
                                            <TableCell>{trip.soLuongHocSinh}</TableCell>
                                            <TableCell>{getStatusBadge(trip.trangThai)}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
