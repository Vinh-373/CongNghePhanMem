import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import AddEntityDialog from "@/components/AddEntityDialog";
import {
    Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CalendarCheck, Clock, Play, StopCircle, PlusCircle,
    FilePenLine, Trash2, BusFront, User, Route,
    ChevronLeft, ChevronRight, Users, Loader2,
    CookingPot,
} from "lucide-react";
import { toast } from "sonner"; 

// --- ⚙️ CẤU HÌNH API ---
const API_BASE_URL = "http://localhost:5001/schoolbus/admin/get-all-schedules"; 
const ADD_SCHEDULE_API_URL = "http://localhost:5001/schoolbus/admin/add-schedule";
const API_GET_STUDENTS_URL = "http://localhost:5001/schoolbus/admin/get-all-students";
const API_GET_ROUTES_URL = "http://localhost:5001/schoolbus/admin/get-all-routes";
const API_GET_VEHICLES_URL = "http://localhost:5001/schoolbus/admin/get-all-vehicles";
const API_GET_DRIVERS_URL = "http://localhost:5001/schoolbus/admin/get-all-drivers";

/**
 * Helper: Tính toán ngày bắt đầu và kết thúc của tuần dựa trên offset (0 là tuần hiện tại)
 * Trả về định dạng 'DD/MM/YYYY'
 */
const getWeekRange = (offset) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const startDate = new Date(today);
    const diff = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); 
    startDate.setDate(today.getDate() - diff + (offset * 7));

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const formatter = (date) => date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });

    return {
        start: formatter(startDate),
        end: formatter(endDate)
    };
};

export default function SchedulesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [scheduleData, setScheduleData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State cho dữ liệu dropdown - KHỞI TẠO GIÁ TRỊ MẶC ĐỊNH
    const [availableStudents, setAvailableStudents] = useState([]);
    const [availableRoutes, setAvailableRoutes] = useState([]);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
    
    const [weekOffset, setWeekOffset] = useState(0); 
    const currentWeekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

    // --- FETCH DỮ LIỆU CHO DROPDOWNS ---
    const loadDropdownData = async () => {
        setIsLoadingDropdowns(true);
        try {
            // Gọi tất cả API song song
            const [studentsRes, routesRes, vehiclesRes, driversRes] = await Promise.all([
                fetch(API_GET_STUDENTS_URL),
                fetch(API_GET_ROUTES_URL),
                fetch(API_GET_VEHICLES_URL),
                fetch(API_GET_DRIVERS_URL)
            ]);

            // Xử lý Students
            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                console.log("Dữ liệu học sinh nhận được:", studentsData);
                // API trả về: { message: "...", students: [{mahocsinh, hoten}, ...] }
                const studentOptions = (studentsData.students || []).map(s => ({
                    value: s.mahocsinh.toString(),
                    label: `${s.mahocsinh} - ${s.hoten || 'N/A'}`
                }));
                console.log("Options học sinh:", studentOptions);
                setAvailableStudents(studentOptions);
            }

            // Xử lý Routes
            if (routesRes.ok) {
                const routesData = await routesRes.json();
                console.log("Dữ liệu tuyến đường nhận được:", routesData);
                // API trả về: { message: "...", routes: [{idtuyenduong, tentuyen}, ...] }
                const routeOptions = (routesData.routes || []).map(r => ({
                    value: r.idtuyenduong.toString(),
                    label: `Tuyến ${r.idtuyenduong} - ${r.tentuyen}`
                }));
                console.log("Options tuyến đường:", routeOptions);
                setAvailableRoutes(routeOptions);
            }

            // Xử lý Vehicles
            if (vehiclesRes.ok) {
                const vehiclesData = await vehiclesRes.json();
                console.log("Dữ liệu xe nhận được:", vehiclesData);
                // API trả về: { message: "...", vehicles: [{idxebuyt, bienso}, ...] }
                const vehicleOptions = (vehiclesData.vehicles || []).map(v => ({
                    value: v.idxebuyt.toString(),
                    label: v.bienso
                }));
                console.log("Options xe:", vehicleOptions);
                setAvailableVehicles(vehicleOptions);
            }

            // Xử lý Drivers
            if (driversRes.ok) {
                const driversData = await driversRes.json();
                console.log("Dữ liệu tài xế nhận được:", driversData);
                // API trả về: { message: "...", drivers: [{idtaixe, userInfo: {hoten}}, ...] }
                const driverOptions = (driversData.drivers || [])
                    .filter(d => d.userInfo?.trangthai === 2) // Chỉ lấy tài xế đang hoạt động
                    .map(d => ({
                        value: d.idtaixe.toString(),
                        label: `${d.idtaixe} - ${d.userInfo?.hoten || 'N/A'}`
                    }));
                console.log("Options tài xế:", driverOptions);
                setAvailableDrivers(driverOptions);
            }

            
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu dropdown:", error);
            
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    // CẤU TRÚC FORM (Dynamic based on loaded data)
    const TRIP_SCHEDULE_FIELDS = useMemo(() => {
        // Đảm bảo tất cả options đều là array hợp lệ
        const safeRoutes = Array.isArray(availableRoutes) ? availableRoutes : [];
        const safeVehicles = Array.isArray(availableVehicles) ? availableVehicles : [];
        const safeDrivers = Array.isArray(availableDrivers) ? availableDrivers : [];
        const safeStudents = Array.isArray(availableStudents) ? availableStudents : [];

        return [
            { name: "trip_date", label: "Ngày", type: "date", required: true, placeholder: "Chọn ngày chuyến đi" },
            { name: "trip_time", label: "Giờ Khởi hành", type: "time", required: true, placeholder: "Ví dụ: 06:30" },
            { 
                name: "trip_type", 
                label: "Loại Chuyến", 
                type: "select", 
                required: true, 
                options: ["Đón", "Trả"], 
                placeholder: "Chọn loại chuyến" 
            },
            { 
                name: "route_id", 
                label: "Tuyến đường", 
                type: "select", 
                required: true, 
                options: safeRoutes, 
                placeholder: safeRoutes.length > 0 ? "Chọn tuyến đường" : "Đang tải tuyến đường..."
            },
            { 
                name: "vehicle_code", 
                label: "Biển Số Xe", 
                type: "select", 
                required: true, 
                options: safeVehicles,
                placeholder: safeVehicles.length > 0 ? "Chọn xe" : "Đang tải xe..."
            },
            { 
                name: "driver_id", 
                label: "Tài xế", 
                type: "select", 
                required: true, 
                options: safeDrivers,
                placeholder: safeDrivers.length > 0 ? "Chọn tài xế" : "Đang tải tài xế..."
            },
            { 
                name: "status_text", 
                label: "Trạng thái", 
                type: "text", 
                required: true, 
                defaultValue: "Chờ khởi hành", 
                // disabled: true 
            },
            { 
                name: "selected_students", 
                label: "Danh sách Học sinh", 
                type: "multi-select", 
                required: false,
                options: safeStudents,
                placeholder: safeStudents.length > 0 ? "Chọn học sinh..." : "Đang tải học sinh..."
            },
        ];
    }, [availableStudents, availableRoutes, availableVehicles, availableDrivers]);

    // --- FETCH SCHEDULES ---
    const loadSchedules = async () => {
        setIsLoading(true);
        console.log(`Đang tải dữ liệu cho tuần: ${currentWeekRange.start} - ${currentWeekRange.end}`);

        try {
            const response = await fetch(`${API_BASE_URL}`); 
            
            if (!response.ok) {
                throw new Error("Lỗi mạng hoặc server không phản hồi.");
            }

            const apiResponse = await response.json(); 
            const data = apiResponse.schedules || [];

            // Helper để parse ngày từ DD/MM/YYYY sang YYYY-MM-DD cho Date
            const parseDate = (str) => {
                const [day, month, year] = str.split('/');
                return new Date(`${year}-${month}-${day}`);
            };

            const startDate = parseDate(currentWeekRange.start);
            const endDate = parseDate(currentWeekRange.end);

            // Lọc dữ liệu theo tuần
            const filteredData = data.filter(trip => {
                const tripDate = new Date(trip.ngaydi);
                return tripDate >= startDate && tripDate <= endDate;
            });
            
            setScheduleData(filteredData);
           
        } catch (error) {
            console.error("Lỗi khi tải lịch trình:", error);
           
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDropdownData(); // Load dropdown data khi component mount
    }, []);

    useEffect(() => {
        loadSchedules();
    }, [weekOffset]);

    // --- Xử lý chuyển tuần ---
    const handlePrevWeek = () => {
        setWeekOffset(prev => prev - 1);
    };

    const handleNextWeek = () => {
        setWeekOffset(prev => prev + 1);
    };

    // --- THÊM MỚI SCHEDULE ---
    const handleAddTrip = async (formData) => {
        setIsDialogOpen(false); 
        toast.loading(`Đang tạo lịch trình cho tuyến ${formData.route_id}...`, { id: 'addTripToast' });
        
        // Helper function để lấy value từ option
        const getValueFromOption = (data) => {
            if (typeof data === 'object' && data !== null && 'value' in data) {
                return data.value;
            }
            return data;
        };
        let dshs = '[' + (formData.selected_students || []).map(s => getValueFromOption(s)).join(',') + ']'; 
        const payload = {
            ngaydi: formData.trip_date, 
            giobatdau: formData.trip_time + ':00', 
            loaichuyen: formData.trip_type, 
            idtuyenduong: parseInt(getValueFromOption(formData.route_id)), 
            idxebuyt: parseInt(getValueFromOption(formData.vehicle_code)),
            idtaixe: parseInt(getValueFromOption(formData.driver_id)), 
            danhsachhocsinh: dshs,
            trangthai: 0, 
            trangthai_text: "Chưa chạy" 
        };

        console.log("Payload gửi lên:", payload);

        try {
            const response = await fetch(ADD_SCHEDULE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi khi tạo lịch trình.");
            }

            await loadSchedules();
            toast.success(`Đã thêm lịch trình chuyến đi thành công!`, { id: 'addTripToast' });

        } catch (error) {
            console.error("Lỗi khi thêm chuyến đi:", error);
            toast.error(error.message || "Không thể thêm lịch trình. Vui lòng kiểm tra dữ liệu.", { id: 'addTripToast' });
        }
    };
    
    // Helper để lấy badge màu theo trạng thái
    const getStatusBadge = (statusText) => {
        switch (statusText) {
            case "Đã hoàn thành":
                return (<Badge className="bg-green-100 text-green-800 hover:bg-green-200">Hoàn thành</Badge>);
            case "Đang chạy":
                return (<Badge className="bg-blue-100 text-blue-800 animate-pulse hover:bg-blue-200">Đang chạy</Badge>);
            case "Chưa chạy":
            case "Chờ khởi hành": 
                return (<Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Chờ khởi hành</Badge>);
            default:
                return <Badge variant="outline">{statusText}</Badge>;
        }
    };

    const isActionDisabled = (statusText) => {
        return statusText === "Đã hoàn thành" || statusText === "Đang chạy";
    };

    const stats = {
        totalTrips: scheduleData.length,
        completedTrips: scheduleData.filter((s) => s.trangthai_text === "Đã hoàn thành").length,
        inProgressTrips: scheduleData.filter((s) => s.trangthai_text === "Đang chạy").length,
    };

    return (
        <div className="space-y-6">
            {/* === 1. THẺ TỔNG QUAN === */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số Chuyến (Tuần)</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalTrips}</div>
                        <p className="text-xs text-muted-foreground">chuyến đã được lên lịch trong tuần</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đã Hoàn thành (Tuần)</CardTitle>
                        <StopCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.completedTrips}</div>
                        <p className="text-xs text-muted-foreground">chuyến đã kết thúc thành công</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đang Chạy</CardTitle>
                        <Play className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.inProgressTrips}</div>
                        <p className="text-xs text-muted-foreground">chuyến đang diễn ra</p>
                    </CardContent>
                </Card>
            </div>

            <hr className="my-6" />

            {/* === 2. BẢNG DANH SÁCH LỊCH TRÌNH === */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <CardTitle className="text-xl">Lịch trình Chuyến đi</CardTitle>
                        
                        <div className="flex items-center space-x-1 border rounded-md p-1 bg-gray-50/50">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handlePrevWeek} 
                                aria-label="Tuần trước"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium px-2 py-1 text-indigo-700">
                                {currentWeekRange.start} - {currentWeekRange.end}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleNextWeek} 
                                aria-label="Tuần sau"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Button 
                        onClick={() => setIsDialogOpen(true)} 
                        disabled={isLoading || isLoadingDropdowns}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Thêm Chuyến Mới
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8 text-lg font-medium text-gray-500">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Đang tải lịch trình...
                        </div>
                    ) : scheduleData.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            Không có lịch trình chuyến đi nào trong tuần này.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã</TableHead>
                                        <TableHead>Ngày</TableHead>
                                        <TableHead>Tuyến đường</TableHead>
                                        <TableHead>Loại</TableHead>
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
                                        <TableRow key={trip.idlich}> 
                                            <TableCell className="font-medium text-xs text-slate-600">{trip.idlich}</TableCell>
                                            <TableCell className="font-semibold text-sm text-indigo-700 whitespace-nowrap">
                                                {trip.thu} {new Date(trip.ngaydi).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <Route className="h-4 w-4 text-muted-foreground" />
                                                    <span>{trip.tentuyen}</span> 
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">{trip.loaichuyen}</Badge>
                                            </TableCell>
                                            <TableCell className="font-bold whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-orange-500" />
                                                    {trip.giobatdau.substring(0, 5)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <BusFront className="h-4 w-4 text-blue-500" />
                                                    <span className="font-medium">{trip.bienso}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="h-4 w-4 text-green-500" />
                                                    <span>{trip.tentaixe}</span> 
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
                                                    <Users className="h-4 w-4 text-orange-500" />
                                                    <span>{trip.tong_hocsinh || 0} HS</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(trip.trangthai_text)}</TableCell>

                                            <TableCell className="text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="hover:bg-blue-100"
                                                        title="Chỉnh sửa chuyến đi"
                                                        disabled={isActionDisabled(trip.trangthai_text)}
                                                    >
                                                        <FilePenLine className={`h-4 w-4 ${isActionDisabled(trip.trangthai_text) ? 'text-gray-400' : 'text-blue-600'}`} />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="hover:bg-red-100"
                                                        title="Xóa chuyến đi"
                                                        disabled={isActionDisabled(trip.trangthai_text)}
                                                    >
                                                        <Trash2 className={`h-4 w-4 ${isActionDisabled(trip.trangthai_text) ? 'text-gray-400' : 'text-red-600'}`} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* 3. DIALOG THÊM MỚI */}
            <AddEntityDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Thêm Lịch trình mới"
                description="Điền thông tin chi tiết của chuyến xe mới."
                fields={TRIP_SCHEDULE_FIELDS}
                onSubmit={handleAddTrip}
                submitButtonText="Thêm Lịch trình"
                accentColor="bg-amber-500 hover:bg-amber-600"
            />
        </div>
    );
}