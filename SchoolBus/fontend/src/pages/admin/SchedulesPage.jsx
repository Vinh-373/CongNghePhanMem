import React, { useState, useEffect, useMemo } from "react";
import AddEntityDialog from "@/components/AddEntityDialog";
import StudentDetailDialog from "@/components/StudentDetailDialog"; 
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
    Eye
} from "lucide-react";
import { toast } from "sonner";

// --- ⚙️ CẤU HÌNH API ---
const API_BASE_URL = "http://localhost:5001/schoolbus/admin/get-all-schedules";
const ADD_SCHEDULE_API_URL = "http://localhost:5001/schoolbus/admin/add-schedule";
const API_GET_STUDENTS_URL = "http://localhost:5001/schoolbus/admin/get-all-students";
const API_GET_ROUTES_URL = "http://localhost:5001/schoolbus/admin/get-all-routes";
const API_GET_VEHICLES_URL = "http://localhost:5001/schoolbus/admin/get-all-vehicles";
const API_GET_DRIVERS_URL = "http://localhost:5001/schoolbus/admin/get-all-drivers";

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
    const [isStudentListOpen, setIsStudentListOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null); 
    const [scheduleData, setScheduleData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [availableStudents, setAvailableStudents] = useState([]);
    const [availableRoutes, setAvailableRoutes] = useState([]);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [routesWithDetails, setRoutesWithDetails] = useState([]); // ⭐ Lưu chi tiết tuyến
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedRouteId, setSelectedRouteId] = useState(null); // ⭐ Track tuyến đang chọn
    
    const currentWeekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

    // --- FETCH DỮ LIỆU CHO DROPDOWNS ---
    const loadDropdownData = async () => {
        setIsLoadingDropdowns(true);
        try {
            const [studentsRes, routesRes, vehiclesRes, driversRes] = await Promise.all([
                fetch(API_GET_STUDENTS_URL),
                fetch(API_GET_ROUTES_URL),
                fetch(API_GET_VEHICLES_URL),
                fetch(API_GET_DRIVERS_URL)
            ]);

            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                const studentOptions = (studentsData.students || []).map(s => ({
                    value: s.mahocsinh.toString(),
                    label: `${s.mahocsinh} - ${s.hoten || 'N/A'}`,
                    iddiemdon: s.iddiemdon // ⭐ Lưu iddiemdon
                }));
                setAvailableStudents(studentOptions);
            }

            if (routesRes.ok) {
                const routesData = await routesRes.json();
                setRoutesWithDetails(routesData.routes || []); // ⭐ Lưu full data
                
                const routeOptions = (routesData.routes || []).map(r => ({
                    value: r.idtuyenduong.toString(),
                    label: `Tuyến ${r.idtuyenduong} - ${r.tentuyen}`
                }));
                setAvailableRoutes(routeOptions);
            }

            if (vehiclesRes.ok) {
                const vehiclesData = await vehiclesRes.json();
                const vehicleOptions = (vehiclesData.vehicles || []).map(v => ({
                    value: v.idxebuyt.toString(),
                    label: v.bienso + ' - ' + v.soghe.toString() + ' chỗ'
                }));
                setAvailableVehicles(vehicleOptions);
            }

            if (driversRes.ok) {
                const driversData = await driversRes.json();
                const driverOptions = (driversData.drivers || [])
                    .filter(d => d.userInfo?.trangthai === 2) 
                    .map(d => ({
                        value: d.idtaixe.toString(),
                        label: `${d.idtaixe} - ${d.userInfo?.hoten || 'N/A'}`
                    }));
                setAvailableDrivers(driverOptions);
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu dropdown:", error);
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    // ⭐ LỌC HỌC SINH THEO TUYẾN ĐƯỜNG
    const getFilteredStudents = useMemo(() => {
        if (!selectedRouteId) {
            return []; // Không có học sinh nếu chưa chọn tuyến
        }

        // Tìm tuyến được chọn
        const selectedRoute = routesWithDetails.find(
            r => r.idtuyenduong.toString() === selectedRouteId
        );

        if (!selectedRoute || !selectedRoute.diemDungDetails) {
            return [];
        }

        // Lấy danh sách ID điểm dừng của tuyến
        const routeStopIds = selectedRoute.diemDungDetails.map(
            stop => stop.iddiemdung
        );

        console.log('🔍 Route Stop IDs:', routeStopIds);
        console.log('👥 All Students:', availableStudents);

        // Lọc học sinh có iddiemdon nằm trong routeStopIds
        const filtered = availableStudents.filter(student => {
            const hasValidStop = student.iddiemdon && routeStopIds.includes(student.iddiemdon);
            console.log(`Student ${student.label}: iddiemdon=${student.iddiemdon}, hasValidStop=${hasValidStop}`);
            return hasValidStop;
        });

        console.log('✅ Filtered Students:', filtered);
        return filtered;
    }, [selectedRouteId, routesWithDetails, availableStudents]);

    // CẤU TRÚC FORM
    const TRIP_SCHEDULE_FIELDS = useMemo(() => {
        const safeRoutes = Array.isArray(availableRoutes) ? availableRoutes : [];
        const safeVehicles = Array.isArray(availableVehicles) ? availableVehicles : [];
        const safeDrivers = Array.isArray(availableDrivers) ? availableDrivers : [];
        const filteredStudents = getFilteredStudents;

        return [
            { 
                name: "trip_date", 
                label: "Ngày", 
                type: "date", 
                required: true, 
                placeholder: "Chọn ngày chuyến đi" 
            },
            { 
                name: "trip_time", 
                label: "Giờ Khởi hành", 
                type: "time", 
                required: true, 
                placeholder: "Ví dụ: 06:30" 
            },
            {
                name: "route_id",
                label: "Tuyến đường",
                type: "select",
                required: true,
                options: safeRoutes,
                placeholder: safeRoutes.length > 0 ? "Chọn tuyến đường" : "Đang tải tuyến đường...",
                onChange: (value) => {
                    console.log('🚏 Selected Route ID:', value);
                    setSelectedRouteId(value);
                }
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
            },
            {
                name: "selected_students",
                label: "Danh sách Học sinh",
                type: "multi-select",
                required: false,
                options: filteredStudents,
                disabled: !selectedRouteId, // ⭐ Disable khi chưa chọn tuyến
                placeholder: !selectedRouteId 
                    ? "Vui lòng chọn tuyến đường trước" 
                    : filteredStudents.length > 0 
                        ? `${filteredStudents.length} học sinh phù hợp với tuyến này`
                        : "Không có học sinh phù hợp với tuyến này"
            },
        ];
    }, [availableRoutes, availableVehicles, availableDrivers, getFilteredStudents, selectedRouteId]);

    // --- FETCH SCHEDULES ---
    const loadSchedules = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}`);
            if (!response.ok) {
                throw new Error("Lỗi mạng hoặc server không phản hồi.");
            }

            const apiResponse = await response.json();
            const data = apiResponse.schedules || [];

            const parseDate = (str) => {
                const [day, month, year] = str.split('/');
                const date = new Date(year, month - 1, day);
                date.setHours(0, 0, 0, 0);
                return date;
            };

            const startDate = getWeekRange(weekOffset).start;
            const endDate = getWeekRange(weekOffset).end;
            const compareStartDate = parseDate(startDate);
            const compareEndDate = parseDate(endDate);

            const filteredData = data.filter(trip => {
                const tripDate = new Date(trip.ngaydi);
                tripDate.setHours(0, 0, 0, 0);
                return tripDate >= compareStartDate && tripDate <= compareEndDate;
            });

            setScheduleData(filteredData);
        } catch (error) {
            console.error("Lỗi khi tải lịch trình:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDropdownData();
    }, []);

    useEffect(() => {
        loadSchedules();
    }, [weekOffset]);

    // Reset selectedRouteId khi đóng dialog
    useEffect(() => {
        if (!isDialogOpen) {
            setSelectedRouteId(null);
        }
    }, [isDialogOpen]);

    const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
    const handleNextWeek = () => setWeekOffset(prev => prev + 1);

    const handleShowStudents = (trip) => {
        setSelectedTrip(trip);
        setIsStudentListOpen(true);
    };

    const handleAddTrip = async (formData) => {
        setIsDialogOpen(false);
        toast.loading(`Đang tạo lịch trình cho tuyến ${formData.route_id}...`, { id: 'addTripToast' });

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

        try {
            const response = await fetch(ADD_SCHEDULE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            toast.error(error.message || "Không thể thêm lịch trình.", { id: 'addTripToast' });
        }
    };

    const getStatusBadge = (statusText) => {
        switch (statusText) {
            case "Đã hoàn thành":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Hoàn thành</Badge>;
            case "Đang chạy":
                return <Badge className="bg-blue-100 text-blue-800 animate-pulse hover:bg-blue-200">Đang chạy</Badge>;
            case "Chưa chạy":
            case "Chờ khởi hành":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Chờ khởi hành</Badge>;
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
            {/* THẺ TỔNG QUAN */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số Chuyến (Tuần)</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalTrips}
                        </div>
                        <p className="text-xs text-muted-foreground">chuyến đã được lên lịch trong tuần</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đã Hoàn thành (Tuần)</CardTitle>
                        <StopCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.completedTrips}
                        </div>
                        <p className="text-xs text-muted-foreground">chuyến đã kết thúc thành công</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đang Chạy</CardTitle>
                        <Play className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.inProgressTrips}
                        </div>
                        <p className="text-xs text-muted-foreground">chuyến đang diễn ra</p>
                    </CardContent>
                </Card>
            </div>

            <hr className="my-6" />

            {/* BẢNG DANH SÁCH */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <CardTitle className="text-xl">Lịch trình Chuyến đi</CardTitle>
                        <div className="flex items-center space-x-1 border rounded-md p-1 bg-gray-50/50">
                            <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium px-2 py-1 text-indigo-700">
                                {currentWeekRange.start} - {currentWeekRange.end}
                            </span>
                            <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Button onClick={() => setIsDialogOpen(true)} disabled={isLoading || isLoadingDropdowns}>
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
                                            <TableCell className="font-medium text-xs text-slate-600">
                                                {trip.idlich}
                                            </TableCell>
                                            <TableCell className="font-semibold text-sm text-indigo-700 whitespace-nowrap">
                                                {trip.thu} {new Date(trip.ngaydi).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <Route className="h-4 w-4 text-muted-foreground" />
                                                    <span>{trip.tentuyen}</span>
                                                </div>
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
                                                        className="text-green-600 hover:bg-green-100 hover:text-green-700"
                                                        onClick={() => handleShowStudents(trip)}
                                                        title="Xem danh sách học sinh"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
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

            {/* DIALOG THÊM MỚI */}
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

            {/* DIALOG HIỂN THỊ HỌC SINH */}
            {selectedTrip && (
                <StudentDetailDialog
                    isOpen={isStudentListOpen}
                    onClose={() => setIsStudentListOpen(false)}
                    trip={selectedTrip} 
                />
            )}
        </div>
    );
}