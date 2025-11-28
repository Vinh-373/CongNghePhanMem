import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast, Toaster } from "sonner"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Truck, UserCheck, AlertTriangle, XCircle, Bell, Siren, Clock, MapPin, CheckCircle, Timer } from "lucide-react"; 
// ⚠️ Thay thế import GoogleMapDisplay bằng LeafletRoutingMap
import LeafletRoutingMap from "@/components/Map/GoogleMapDisplay"; // <-- Thay bằng Leaflet


// =========================================================================
// --- HOOK CUSTOM: ĐỒNG HỒ THỜI GIAN THỰC (GIỮ NGUYÊN) ---
// =========================================================================
const useRealTimeClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    const formattedTime = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDate = time.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    return { formattedTime, formattedDate };
};


// =========================================================================
// --- HÀM GIẢ LẬP GỌI API (GIỮ NGUYÊN) ---
// =========================================================================
const fetchCurrentTripData = async (idtaixe) => {
    // --- DỮ LIỆU MÔ PHỎNG ĐẦY ĐỦ (Dựa trên cấu trúc backend) ---
    const response = await fetch(`http://localhost:5001/schoolbus/driver/current-trip/${idtaixe}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Dữ liệu chuyến đi nhận được từ API:", data);
    return data;

    // return {
    //     message: "Lấy thông tin chuyến đi trong ngày của tài xế thành công!",
    //     tripsToday: [
    //         {
    //             thu: "Thứ Sáu",
    //             idlich: 8,
    //             idxebuyt: 6,
    //             idtaixe: 1,
    //             giobatdau: "17:30:00",
    //             trangthai: 0,
    //             danhsachhocsinh: "[13,10,7]",
    //             idtuyenduong: 1,
    //             ngaydi: "2025-11-28",
    //             tuyenDuongInfo: {
    //                 tentuyen: "Tuyến 06 - Đón Quận 5",
    //                 loaituyen: "Đón",
    //                 dsdiemdung: "[2,3,4,8,1]",
    //                 diemDungDetails: [
    //                     { iddiemdung: 2, tendiemdon: "Bệnh Viện Nguyễn Tri Phương", diachi: "111 An Dương Vương", kinhdo: "106.670479", vido: "10.756781", trangthai: 1 },
    //                     { iddiemdung: 3, tendiemdon: "Đại học Sài Gòn", diachi: "280 An Dương Vương", kinhdo: "106.682221", vido: "10.760711", trangthai: 1 },
    //                     { iddiemdung: 4, tendiemdon: "Bệnh Viện Từ Dũ", diachi: "293 Nguyễn Thị Minh Khai", kinhdo: "106.684924", vido: "10.768775", trangthai: 1 },
    //                     { iddiemdung: 8, tendiemdon: "Nhà Văn Hóa Lao Động", diachi: "55 Nguyễn Thị Minh Khai", kinhdo: "106.692685", vido: "10.777085", trangthai: 1 },
    //                     { iddiemdung: 1, tendiemdon: "Đinh Tiên Hoàng", diachi: "16 Nguyễn Thị Minh Khai", kinhdo: "106.701251", vido: "10.786242", trangthai: 1 }
    //                 ]
    //             },
    //             xebuyt: {
    //                 bienso: "54A-12345",
    //                 vitrixe: { kinhdo: "106.770183", vido: "10.695417" } // Vị trí xe buýt hiện tại
    //             },
    //             studentDetails: [
    //                 { mahocsinh: 13, hoten: "Nguyễn Thị Hoa", lop: "8A2", iddiemdon: 8, anhdaidien: "avt1.jpg", trangThaiDonTra: { loaitrangthai: 0 } }, // 0: Đang chờ
    //                 { mahocsinh: 10, hoten: "Nguyễn Quang Hoàng", lop: "7A3", iddiemdon: 3, anhdaidien: "kkk", trangThaiDonTra: { loaitrangthai: 1 } }, // 1: Đã lên xe
    //                 { mahocsinh: 7, hoten: "Lê Thị Mai Chi", lop: "5A", iddiemdon: 3, anhdaidien: "avt.jpg", trangThaiDonTra: { loaitrangthai: 0 } }
    //             ]
    //         }
    //     ]
    // };
};

// =========================================================================
// --- HÀM HỖ TRỢ CHUYỂN ĐỔI DỮ LIỆU (GIỮ NGUYÊN) ---
// =========================================================================
const getStatusMap = (loaitrangthai) => {
    switch (loaitrangthai) {
        case 1:
            return { text: "Đã Đón", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle };
        case 0:
            return { text: "Đang Chờ", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock };
        case 2:
            return { text: "Vắng Mặt", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle };
        default:
            return { text: "Chưa Rõ", color: "bg-gray-100 text-gray-500 border-gray-300", icon: AlertTriangle };
    }
};

// =========================================================================
// --- COMPONENT CON: DANH SÁCH HỌC SINH TOÀN TUYẾN (GIỮ NGUYÊN) ---
// =========================================================================

const StudentRouteList = ({ students, handleCheckin, totalPicked, totalRemaining, totalMissing }) => {
    
    // Sắp xếp: Vắng/Chưa đón lên đầu, Đã đón xuống cuối
    const sortedStudents = useMemo(() => {
        return [...students].sort((a, b) => {
            const statusA = a.trangThaiDonTra?.loaitrangthai || 0;
            const statusB = b.trangThaiDonTra?.loaitrangthai || 0;

            if (statusA === 2 && statusB !== 2) return -1;
            if (statusA !== 2 && statusB === 2) return 1;
            if (statusA === 0 && statusB === 1) return -1;
            if (statusA === 1 && statusB === 0) return 1;
            
            return 0; 
        });
    }, [students]);


    return (
        <Card className="shadow-lg h-full">
            <CardHeader className="border-b">
                <CardTitle className="text-xl flex items-center">
                    <ListChecks className="w-5 h-5 mr-2 text-blue-600" />
                    📋 Điểm Danh Học Sinh Toàn Tuyến
                </CardTitle>
                <CardDescription>
                    Tổng cộng: **{students.length}** học sinh. Click vào ô check để cập nhật trạng thái **Lên xe**.
                </CardDescription>
                
                {/* Thống kê Tổng quan */}
                <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-gray-50 rounded-md border">
                    <div className="text-sm font-medium text-green-600 flex items-center">
                        <UserCheck className="w-4 h-4 mr-1"/>
                        Đã đón: **{totalPicked}**
                    </div>
                    <div className="text-sm font-medium text-yellow-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1"/>
                        Đang chờ: **{totalRemaining}**
                    </div>
                     <div className="text-sm font-medium text-red-600 flex items-center">
                        <XCircle className="w-4 h-4 mr-1"/>
                        Vắng: **{totalMissing}**
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 max-h-96 overflow-y-auto">
                {sortedStudents.map((student) => {
                    const statusInfo = getStatusMap(student.trangThaiDonTra?.loaitrangthai);
                    const isChecked = statusInfo.text === "Đã Đón";
                    
                    return (
                        <div 
                            key={student.mahocsinh} 
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all 
                                ${isChecked ? 'bg-green-50' : 'bg-white hover:bg-yellow-50'}
                                ${statusInfo.text === "Vắng Mặt" ? 'border-red-400 bg-red-50' : ''}
                            `}
                        >
                            <div className="flex items-center space-x-3 min-w-0">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                                    {student.hoten ? student.hoten[0] : 'N/A'}
                                </div>
                                <div className='min-w-0'>
                                    <p className={`font-medium truncate ${isChecked ? 'text-green-700' : 'text-gray-800'}`}>{student.hoten} - Lớp: {student.lop}</p>
                                    <p className="text-xs text-gray-500 truncate">ID Điểm Đón: {student.iddiemdon}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 flex-shrink-0">
                                <Badge className={statusInfo.color}>
                                    {statusInfo.text}
                                </Badge>
                                <Checkbox
                                    id={`student-${student.mahocsinh}`}
                                    checked={isChecked}
                                    onCheckedChange={() => handleCheckin(student.mahocsinh, isChecked ? 0 : 1)}
                                    className={`h-5 w-5 border-2 ${isChecked ? 'data-[state=checked]:bg-green-500' : 'data-[state=checked]:bg-yellow-500'}`}
                                    disabled={statusInfo.text === "Vắng Mặt"}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
            {totalRemaining === 0 && totalMissing === 0 && (
                <CardFooter className="pt-4 border-t">
                    <Badge className="w-full py-2 justify-center bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-2"/>
                        ĐÃ ĐÓN TẤT CẢ HỌC SINH TRÊN TUYẾN
                    </Badge>
                </CardFooter>
            )}
        </Card>
    );
};


// =========================================================================
// --- COMPONENT CHÍNH ---
// =========================================================================

const DriverDashboard = () => {
    const DRIVER_ID = 1; 
    const { formattedTime, formattedDate } = useRealTimeClock(); 

    const [tripData, setTripData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    
    // --- LẤY DỮ LIỆU CHUYẾN ĐI KHI COMPONENT ĐƯỢC LOAD ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchCurrentTripData(DRIVER_ID);
                if (data.tripsToday && data.tripsToday.length > 0) {
                    setTripData(data.tripsToday[0]); 
                } else {
                    setTripData(null);
                    toast.info("Không tìm thấy chuyến đi nào trong ngày!", { description: "Vui lòng kiểm tra lịch trình." });
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu chuyến đi:", error);
                toast.error("Lỗi tải dữ liệu", { description: "Không thể kết nối đến máy chủ hoặc API lỗi." });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []); 

    // --- HÀM CẬP NHẬT TRẠNG THÁI (Giả lập gọi API update) ---
    const handleUpdateStudentStatus = useCallback(async (mahocsinh, newStatus) => {
        if (!tripData) return;
        
        // 1. GỌI API CẬP NHẬT TRẠNG THÁI THỰC TẾ
        // ...

        // 2. CẬP NHẬT TRẠNG THÁI TRÊN GIAO DIỆN
        const newStudentDetails = tripData.studentDetails.map(s => {
            if (s.mahocsinh === mahocsinh) {
                const statusInfo = getStatusMap(newStatus);
                toast.success(`Cập nhật ${statusInfo.text} thành công!`, { description: `Học sinh ${s.hoten} đã được cập nhật.` });
                return { 
                    ...s, 
                    trangThaiDonTra: { ...s.trangThaiDonTra, loaitrangthai: newStatus } 
                };
            }
            return s;
        });

        setTripData(prev => ({ 
            ...prev, 
            studentDetails: newStudentDetails 
        }));
    }, [tripData]);


    // --- CHUYỂN ĐỔI DỮ LIỆU SANG PROPS CỦA LeafletRoutingMap ---
    const mapProps = useMemo(() => {
        if (!tripData) return { routes: [], buses: [], school: null };
        
        const stops = tripData.tuyenDuongInfo?.diemDungDetails || [];
        const busPositionData = tripData.xebuyt?.vitrixe;
        
        // 1. SCHOOL (Giả định vị trí trường học)
        // Trong một ứng dụng thực tế, bạn sẽ cần lấy tọa độ trường học từ một nguồn dữ liệu khác.
        const schoolLocation = { lat: 10.788229, lng: 106.703970 }; 

        // 2. ROUTES
        const routes = [{
            id: tripData.idlich,
            name: tripData.tuyenDuongInfo?.tentuyen,
            color: "#0066CC", // Màu xanh dương đậm cho tuyến hiện tại
            dotColor: "blue",
            stops: stops.map((stop, index) => ({
                lat: parseFloat(stop.vido),
                lng: parseFloat(stop.kinhdo),
                label: `${index + 1}. ${stop.tendiemdon} (${stop.diachi})`,
            })),
        }];
        
        // 3. BUSES
        const buses = busPositionData ? [{
            id: tripData.idxebuyt,
            routeId: tripData.idlich,
            position: {
                lat: parseFloat(busPositionData.vido),
                lng: parseFloat(busPositionData.kinhdo)
            },
            label: `Xe ${tripData.xebuyt?.bienso}`,
            // icon: 'URL_ICON_XE_BUYT_CUSTOM' 
        }] : [];


        return {
            routes,
            buses,
            school: schoolLocation,
            defaultCenter: { lat: 10.77, lng: 106.7 }, // Giả định trung tâm TP.HCM
        };
    }, [tripData]);


    // --- TÍNH TOÁN THỐNG KÊ (GIỮ NGUYÊN) ---
    const students = tripData?.studentDetails || [];
    const totalPicked = students.filter(s => s.trangThaiDonTra?.loaitrangthai === 1).length;
    const totalRemaining = students.filter(s => s.trangThaiDonTra?.loaitrangthai === 0).length;
    const totalMissing = students.filter(s => s.trangThaiDonTra?.loaitrangthai === 2).length; 


    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-blue-600">Đang tải dữ liệu chuyến đi...</div>;
    }

    if (!tripData) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Không có chuyến đi nào được giao cho ngày hôm nay.</div>;
    }


    // --- RENDER GIAO DIỆN CHÍNH ---
    return (
        <div className="min-h-screen bg-gray-50 ">
            <Toaster position="top-right" richColors /> 
            
            {/* HEADER CHÍNH CÓ ĐỒNG HỒ */}
            <div className='flex justify-between items-center mb-6'>
                 <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Truck className="w-7 h-7 mr-3 text-blue-600"/>
                    {tripData.tuyenDuongInfo?.tentuyen || "Chuyến đi không tên"}
                </h1>
                
                <Card className='p-3 bg-white shadow-md border-l-4 border-blue-400'>
                    <div className='flex items-center space-x-2 text-gray-700'>
                        <Timer className='w-5 h-5 text-blue-600'/>
                        <div>
                            <p className='text-xs font-medium text-gray-500'>{formattedDate}</p>
                            <p className='text-xl font-extrabold text-blue-800'>{formattedTime}</p>
                        </div>
                    </div>
                </Card>
            </div>
            {/* END HEADER */}

            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <Card className="p-3 bg-white shadow-md">
                    <CardTitle className="text-sm font-medium text-gray-500">Giờ Bắt Đầu</CardTitle>
                    <CardContent className="p-0 pt-2 text-2xl font-bold">{tripData.giobatdau}</CardContent>
                </Card>
                <Card className="p-3 bg-white shadow-md">
                    <CardTitle className="text-sm font-medium text-gray-500">Biển Số Xe</CardTitle>
                    <CardContent className="p-0 pt-2 text-2xl font-bold text-blue-600">{tripData.xebuyt?.bienso || 'N/A'}</CardContent>
                </Card>
                <Card className="p-3 bg-white shadow-md">
                    <CardTitle className="text-sm font-medium text-gray-500">Loại Tuyến</CardTitle>
                    <CardContent className="p-0 pt-2 text-2xl font-bold text-purple-600">{tripData.tuyenDuongInfo?.loaituyen || 'N/A'}</CardContent>
                </Card>
                <Card className="p-3 bg-white shadow-md">
                    <CardTitle className="text-sm font-medium text-gray-500">Học Sinh</CardTitle>
                    <CardContent className="p-0 pt-2 text-2xl font-bold text-teal-600">{students.length} HS</CardContent>
                </Card>
            </div>

            {/* PHẦN 1: BẢN ĐỒ & ĐIỂM DỪNG */}
            <Card className="mb-6 shadow-xl relative border-l-4 border-blue-600">
                <CardContent className="p-0 flex flex-col lg:flex-row">
                    {/* Bản Đồ Leaflet */}
                    <div className="flex-1" style={{ minHeight: '400px' }}>
                        <LeafletRoutingMap
                            routes={mapProps.routes}
                            buses={mapProps.buses}
                            school={mapProps.school}
                            zoom={13}
                            defaultCenter={mapProps.defaultCenter}
                        />
                    </div>

                    {/* Danh sách Điểm dừng */}
                    <div className="p-4 lg:w-80 flex flex-col border-t lg:border-t-0 lg:border-l bg-blue-50 max-h-[400px] overflow-y-auto">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <MapPin className='w-4 h-4 mr-2'/>
                            Điểm Dừng Theo Tuyến ({tripData.tuyenDuongInfo?.diemDungDetails?.length || 0})
                        </h3>
                        {tripData.tuyenDuongInfo?.diemDungDetails?.map((stop) => (
                            <div key={stop.iddiemdung} className="flex items-center space-x-2 py-2 border-b last:border-b-0">
                                <Badge className="bg-blue-600 hover:bg-blue-700 text-amber-50">{stop.iddiemdung}</Badge>
                                <div className='min-w-0'>
                                    <p className="font-medium text-sm truncate">{stop.tendiemdon}</p>
                                    <p className="text-xs text-gray-500 truncate">{stop.diachi}</p>
                                </div>
                                <div className="ml-auto text-sm font-semibold text-green-600 flex-shrink-0">
                                    {/* Số học sinh tại điểm này */}
                                    ({students.filter(s => s.iddiemdon === stop.iddiemdung).length})
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* PHẦN 3: THÔNG BÁO & SỰ CỐ */}
                <div className="lg:col-span-1">
                    <Card className="shadow-xl h-full">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
                                <Bell className="w-5 h-5 mr-2" />
                                Thông Báo & Sự Cố
                            </CardTitle>
                            <CardDescription>
                                Vui lòng kiểm tra các thông báo khẩn cấp hoặc sự cố cần báo cáo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start space-x-3 p-4 border border-green-300 rounded-lg bg-green-50 text-green-800">
                                <CheckCircle className="h-5 w-5 mt-0.5 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-green-700">Tình hình ổn định</p>
                                    <p className="text-sm">
                                        Hiện tại không có sự cố khẩn cấp hay cảnh báo ùn tắc nào trên tuyến đường.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button 
                                className="w-full" 
                                variant="destructive"
                                onClick={() => setIsReportModalOpen(true)}
                            >
                                <Siren className="w-4 h-4 mr-2"/>
                                BÁO CÁO SỰ CỐ KHẨN CẤP
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* PHẦN 2: DANH SÁCH HỌC SINH TOÀN TUYẾN */}
                <div className="lg:col-span-2">
                    <StudentRouteList 
                        students={students} 
                        handleCheckin={handleUpdateStudentStatus}
                        totalPicked={totalPicked}
                        totalRemaining={totalRemaining}
                        totalMissing={totalMissing}
                    />
                </div>
            </div>

            {/* --- MODAL BÁO CÁO SỰ CỐ (GIỮ NGUYÊN) --- */}
            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-xl text-red-600">
                            <Siren className="mr-2 h-5 w-5" />
                            Báo Cáo Sự Cố
                        </DialogTitle>
                        <DialogDescription>
                            Vui lòng chọn loại sự cố và cung cấp chi tiết để bộ phận quản lý hỗ trợ kịp thời.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='py-4 space-y-3'>
                        <Button variant="outline" className="w-full justify-start text-red-600 border-red-300">
                            <AlertTriangle className='w-4 h-4 mr-2'/> Kẹt xe nghiêm trọng
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-600 border-red-300">
                            <Truck className='w-4 h-4 mr-2'/> Xe gặp trục trặc kỹ thuật
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-600 border-red-300">
                            <UserCheck className='w-4 h-4 mr-2'/> Sự cố liên quan đến học sinh
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="destructive"
                            onClick={() => {
                                setIsReportModalOpen(false);
                                toast.error("Đã gửi báo cáo!", { description: "Bộ phận điều hành đã nhận thông báo sự cố của bạn." });
                            }}
                        >
                            Gửi Báo Cáo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DriverDashboard;