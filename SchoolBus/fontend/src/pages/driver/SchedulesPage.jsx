import React, { useState } from "react";
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

// === DỮ LIỆU HARD-CODE CHO TÀI XẾ (MVP1) ===
// Thông tin tài xế đăng nhập
const driverInfo = {
    id: "TX001",
    name: "Nguyễn Văn An",
    code: "TX-2024-001",
    phone: "0912345678",
};

// Lịch trình làm việc của tài xế trong tuần
const driverScheduleData = [
    {
        id: "TRIP001",
        date: "2025-11-17",
        dayName: "Thứ Hai",
        displayDate: "17/11",
        routeNumber: "32",
        routeName: "Bến xe Miền Đông - Bến Thành",
        type: "Đón học sinh",
        startTime: "06:00",
        endTime: "12:00",
        vehicle: "51B-12345",
        status: "Đã hoàn thành",
        students: 35,
        breakTime: "09:00 - 09:15",
        checkInTime: "05:55",
    },
    {
        id: "TRIP002",
        date: "2025-11-17",
        dayName: "Thứ Hai",
        displayDate: "17/11",
        routeNumber: "32",
        routeName: "Bến xe Miền Đông - Bến Thành",
        type: "Trả học sinh",
        startTime: "14:00",
        endTime: "20:00",
        vehicle: "51B-12345",
        status: "Đã hoàn thành",
        students: 35,
        breakTime: "17:00 - 17:15",
        checkInTime: "13:55",
    },
    {
        id: "TRIP003",
        date: "2025-11-18",
        dayName: "Thứ Ba",
        displayDate: "18/11",
        routeNumber: "32",
        routeName: "Bến xe Miền Đông - Bến Thành",
        type: "Đón học sinh",
        startTime: "06:00",
        endTime: "12:00",
        vehicle: "51B-12345",
        status: "Đang chạy",
        students: 38,
        breakTime: "09:00 - 09:15",
        checkInTime: "05:58",
    },
    {
        id: "TRIP004",
        date: "2025-11-18",
        dayName: "Thứ Ba",
        displayDate: "18/11",
        routeNumber: "32",
        routeName: "Bến xe Miền Đông - Bến Thành",
        type: "Trả học sinh",
        startTime: "14:00",
        endTime: "20:00",
        vehicle: "51B-12345",
        status: "Chờ khởi hành",
        students: 38,
        breakTime: "17:00 - 17:15",
    },
    {
        id: "TRIP005",
        date: "2025-11-19",
        dayName: "Thứ Tư",
        displayDate: "19/11",
        routeNumber: "32",
        routeName: "Bến xe Miền Đông - Bến Thành",
        type: "Đón học sinh",
        startTime: "06:00",
        endTime: "12:00",
        vehicle: "51B-12345",
        status: "Chờ khởi hành",
        students: 36,
        breakTime: "09:00 - 09:15",
    },
    {
        id: "TRIP006",
        date: "2025-11-19",
        dayName: "Thứ Tư",
        displayDate: "19/11",
        routeNumber: "32",
        routeName: "Bến xe Miền Đông - Bến Thành",
        type: "Trả học sinh",
        startTime: "14:00",
        endTime: "20:00",
        vehicle: "51B-12345",
        status: "Chờ khởi hành",
        students: 36,
        breakTime: "17:00 - 17:15",
    },
    {
        id: "TRIP007",
        date: "2025-11-20",
        dayName: "Thứ Năm",
        displayDate: "20/11",
        routeNumber: "109",
        routeName: "Sân bay Tân Sơn Nhất - Bến xe Miền Tây",
        type: "Đón học sinh",
        startTime: "07:00",
        endTime: "13:00",
        vehicle: "51B-67890",
        status: "Chờ khởi hành",
        students: 30,
        breakTime: "10:00 - 10:15",
    },
    {
        id: "TRIP008",
        date: "2025-11-21",
        dayName: "Thứ Sáu",
        displayDate: "21/11",
        routeNumber: "32",
        routeName: "Bến xe Miền Đông - Bến Thành",
        type: "Đón học sinh",
        startTime: "06:00",
        endTime: "12:00",
        vehicle: "51B-12345",
        status: "Chờ khởi hành",
        students: 34,
        breakTime: "09:00 - 09:15",
    },
    {
        id: "TRIP009",
        date: "2025-11-21",
        dayName: "Thứ Sáu",
        displayDate: "21/11",
        routeNumber: "32",
        routeName: "Bến xe Miền Đông - Bến Thành",
        type: "Trả học sinh",
        startTime: "14:00",
        endTime: "20:00",
        vehicle: "51B-12345",
        status: "Chờ khởi hành",
        students: 34,
        breakTime: "17:00 - 17:15",
    },
    {
        id: "TRIP010",
        date: "2025-11-22",
        dayName: "Thứ Bảy",
        displayDate: "22/11",
        routeNumber: "109",
        routeName: "Sân bay Tân Sơn Nhất - Bến xe Miền Tây",
        type: "Đón học sinh",
        startTime: "07:00",
        endTime: "13:00",
        vehicle: "51B-67890",
        status: "Chờ khởi hành",
        students: 25,
        breakTime: "10:00 - 10:15",
    },
];

export default function SchedulesPage() {
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    // Helper để lấy badge màu theo trạng thái
    const getStatusBadge = (status) => {
        switch (status) {
            case "Đã hoàn thành":
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
            case "Chờ khởi hành":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Chờ khởi hành
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

    // Xử lý xác nhận ca làm việc
    const handleConfirmShift = (tripId) => {
        toast.success(`Đã xác nhận ca làm việc ${tripId}`);
        console.log(`Xác nhận ca: ${tripId}`);
        // TODO: Gọi API để xác nhận
    };

    // Tính toán thống kê
    const stats = {
        totalTrips: driverScheduleData.length,
        completedTrips: driverScheduleData.filter((s) => s.status === "Đã hoàn thành").length,
        inProgressTrips: driverScheduleData.filter((s) => s.status === "Đang chạy").length,
        upcomingTrips: driverScheduleData.filter((s) => s.status === "Chờ khởi hành").length,
        totalHours: driverScheduleData.reduce((sum, trip) => {
            if (trip.status === "Đã hoàn thành" || trip.status === "Đang chạy") {
                const [startH] = trip.startTime.split(':').map(Number);
                const [endH] = trip.endTime.split(':').map(Number);
                return sum + (endH - startH);
            }
            return sum;
        }, 0),
    };

    // Lấy tuần hiện tại
    const getCurrentWeekRange = () => {
        const today = new Date();
        const currentDay = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + (currentWeekOffset * 7));
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };
        
        return `${formatDate(monday)} - ${formatDate(sunday)}`;
    };

    const currentWeek = getCurrentWeekRange();

    // Lấy ngày hôm nay để đánh dấu
    const today = new Date().toISOString().split('T')[0];

    return (
            <div className="space-y-6">
                {/* === HEADER THÔNG TIN TÀI XẾ === */}
                <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{driverInfo.name}</h1>
                                    <p className="text-blue-100">Mã NV: {driverInfo.code}</p>
                                    <p className="text-blue-100 text-sm">SĐT: {driverInfo.phone}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 justify-end mb-2">
                                    <Calendar className="h-5 w-5" />
                                    <span className="font-semibold">
                                        {new Date().toLocaleDateString('vi-VN', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-100">Chào mừng trở lại!</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* === THẺ THỐNG KÊ === */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Tổng số ca trong tuần */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Tổng Ca Làm Việc
                            </CardTitle>
                            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTrips}</div>
                            <p className="text-xs text-muted-foreground">
                                ca trong tuần này
                            </p>
                        </CardContent>
                    </Card>

                    {/* Ca đã hoàn thành */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Đã Hoàn Thành
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completedTrips}</div>
                            <p className="text-xs text-muted-foreground">
                                ca đã hoàn thành
                            </p>
                        </CardContent>
                    </Card>

                    {/* Ca đang chạy */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Đang Làm Việc</CardTitle>
                            <Play className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.inProgressTrips}</div>
                            <p className="text-xs text-muted-foreground">
                                ca đang thực hiện
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* === BẢNG LỊCH TRÌNH === */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <CardTitle className="text-xl">Lịch Trình Làm Việc Trong Tuần</CardTitle>
                            <div className="flex items-center space-x-2">
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="font-semibold text-sm w-48 text-center">
                                    Tuần: {currentWeek}
                                </span>
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {currentWeekOffset !== 0 && (
                            <Button 
                                variant="outline"
                                onClick={() => setCurrentWeekOffset(0)}
                            >
                                Về tuần hiện tại
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ngày</TableHead>
                                    <TableHead>Tuyến</TableHead>
                                    <TableHead>Loại Ca</TableHead>
                                    <TableHead>Giờ Làm Việc</TableHead>
                                    <TableHead>Giờ Nghỉ</TableHead>
                                    <TableHead>Xe</TableHead>
                                    <TableHead>Số HS</TableHead>
                                    <TableHead>Trạng Thái</TableHead>
                                    <TableHead>Check-in</TableHead>
                                    <TableHead className="text-right">Hành Động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {driverScheduleData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                            Không có lịch trình nào trong tuần này
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    driverScheduleData.map((trip) => {
                                        const isToday = trip.date === today;
                                        return (
                                            <TableRow 
                                                key={trip.id}
                                                className={isToday ? "bg-blue-50" : ""}
                                            >
                                                {/* Ngày */}
                                                <TableCell>
                                                    <div className="font-semibold">
                                                        <div className="text-sm text-indigo-700">{trip.dayName}</div>
                                                        <div className="text-xs text-muted-foreground">{trip.displayDate}</div>
                                                        {isToday && (
                                                            <Badge variant="outline" className="mt-1 text-xs bg-blue-100 text-blue-700 border-blue-300">
                                                                Hôm nay
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Tuyến */}
                                                <TableCell>
                                                    <div className="flex items-start gap-2">
                                                        <Route className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                                                        <div>
                                                            <div className="font-semibold text-sm">Tuyến {trip.routeNumber}</div>
                                                            <div className="text-xs text-muted-foreground max-w-[200px]">
                                                                {trip.routeName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Loại ca */}
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                                                    >
                                                        {trip.type}
                                                    </Badge>
                                                </TableCell>

                                                {/* Giờ làm việc */}
                                                <TableCell className="font-bold">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4 text-orange-500" />
                                                        <span>{trip.startTime} - {trip.endTime}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Giờ nghỉ */}
                                                <TableCell>
                                                    {trip.breakTime ? (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Coffee className="h-4 w-4 text-amber-600" />
                                                            <span className="text-xs">{trip.breakTime}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>

                                                {/* Xe */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <BusFront className="h-4 w-4 text-blue-500" />
                                                        <span className="font-medium">{trip.vehicle}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Số học sinh */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                                        <Users className="h-4 w-4 text-green-600" />
                                                        <span>{trip.students} HS</span>
                                                    </div>
                                                </TableCell>

                                                {/* Trạng thái */}
                                                <TableCell>{getStatusBadge(trip.status)}</TableCell>

                                                {/* Check-in */}
                                                <TableCell>
                                                    {trip.checkInTime ? (
                                                        <div className="text-sm">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600 inline mr-1" />
                                                            <span className="text-xs font-medium">{trip.checkInTime}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Chưa check-in</span>
                                                    )}
                                                </TableCell>

                                                {/* Hành động */}
                                                <TableCell className="text-right">
                                                    {trip.status === "Chờ khởi hành" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="hover:bg-green-100 text-green-700 border-green-300"
                                                            onClick={() => handleConfirmShift(trip.id)}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                            Xác nhận
                                                        </Button>
                                                    )}
                                                    {trip.status === "Đang chạy" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="hover:bg-red-100 text-red-700 border-red-300"
                                                            onClick={() => {
                                                                toast.info(`Kết thúc ca ${trip.id}`);
                                                            }}
                                                        >
                                                            <StopCircle className="h-4 w-4 mr-1" />
                                                            Kết thúc
                                                        </Button>
                                                    )}
                                                    {trip.status === "Đã hoàn thành" && (
                                                        <span className="text-xs text-green-600 font-medium">✓ Hoàn tất</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* === CHÚ THÍCH === */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Chú thích</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm text-gray-600">Chờ khởi hành</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-gray-600">Đang làm việc</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600">Đã hoàn thành</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                <span className="text-sm text-gray-600">Ngày nghỉ</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
    );
}