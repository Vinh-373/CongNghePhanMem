import React, { useState, useCallback } from 'react';
import { toast, Toaster } from "sonner"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Truck, CalendarCheck, UserCheck, AlertTriangle, XCircle, Bell, Siren, Clock, MapPin, CheckCircle } from "lucide-react"; 

// --- DỮ LIỆU MẪU (DEMO) ---
const INITIAL_STUDENT_DATA = [
    { id: 1, name: "Nguyễn Văn An", class: "3A", checked: false, address: "123 P. Mai, Q.1" },
    { id: 2, name: "Trần Thị Bình", class: "4C", checked: false, address: "456 Đ. Lê, Q.1" },
    { id: 3, name: "Lê Văn Cường", class: "2B", checked: false, address: "789 Đ. Cường, Q.3" }, 
    { id: 4, name: "Phạm Thu Dung", class: "1A", checked: false, address: "789 Đ. Cường, Q.3" },
    { id: 5, name: "Hoàng Mỹ Linh", class: "5B", checked: false, address: "202 Đ. Linh, Q.Thủ Đức" },
];

// --- COMPONENT CON: DANH SÁCH HỌC SINH TOÀN TUYẾN (Chế độ tự do) ---
const StudentRouteList = ({ students, handleCheckin, totalPicked, totalRemaining }) => {
    const getStatusColor = (checked) => (checked ? "bg-green-100 text-green-700 border-green-300" : "bg-yellow-100 text-yellow-700 border-yellow-300");
    const getStatusText = (checked) => (checked ? "Đã Đón" : "Chưa Đón");
    
    // Sắp xếp: Học sinh chưa đón lên đầu
    const sortedStudents = [...students].sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? 1 : -1));

    return (
        <Card className="shadow-lg h-full">
            <CardHeader className="border-b">
                <CardTitle className="text-xl flex items-center">
                    <ListChecks className="w-5 h-5 mr-2 text-blue-600" />
                    📋 Điểm Danh Học Sinh Toàn Tuyến
                </CardTitle>
                <CardDescription>
                    Tổng cộng: **{students.length}** học sinh. Click vào ô check để điểm danh.
                </CardDescription>
                
                {/* Thống kê Tổng quan */}
                <div className="flex justify-between items-center mt-2 p-2 bg-gray-50 rounded-md border">
                    <div className="text-sm font-medium text-green-600 flex items-center">
                        <UserCheck className="w-4 h-4 mr-1"/>
                        Đã đón: **{totalPicked}**
                    </div>
                    <div className="text-sm font-medium text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1"/>
                        Còn lại: **{totalRemaining}**
                    </div>
                    <div className="text-sm font-medium text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1"/>
                        Điểm đón
                    </div>
                </div>

            </CardHeader>
            <CardContent className="pt-4 space-y-3 max-h-96 overflow-y-auto">
                {sortedStudents.map((student) => (
                    <div 
                        key={student.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${student.checked ? 'bg-green-50' : 'bg-white hover:bg-yellow-50'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                {student.name[0]}
                            </div>
                            <div>
                                <p className={`font-medium ${student.checked ? 'text-green-700' : 'text-gray-800'}`}>{student.name}</p>
                                <p className="text-xs text-gray-500">{student.address} - Lớp: {student.class}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(student.checked)}>
                                {getStatusText(student.checked)}
                            </Badge>
                            <Checkbox
                                id={`student-${student.id}`}
                                checked={student.checked}
                                onCheckedChange={() => handleCheckin(student.id)}
                                className="h-5 w-5 border-2 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
            {totalRemaining === 0 && (
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


// --- COMPONENT CHÍNH ---
const DriverDashboard = () => {
    const [students, setStudents] = useState(INITIAL_STUDENT_DATA);
    const [currentStopName, setCurrentStopName] = useState("Tạp Hóa ABC"); // Tên điểm đón đang chờ
    const [isArrived, setIsArrived] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    


    const handleToggleCheckin = useCallback((studentId) => {
        setStudents(prevStudents => {
            const updatedStudents = prevStudents.map(s =>
                s.id === studentId ? { ...s, checked: !s.checked } : s
            );
            
            const student = updatedStudents.find(s => s.id === studentId);

            if (student.checked) {
                toast.success("Điểm danh thành công!", { description: `Học sinh ${student.name} đã lên xe.` });
            } else {
                 toast.info("Hủy điểm danh", { description: `Học sinh ${student.name} chưa lên xe.` });
            }

            return updatedStudents;
        });
    }, []);

    const handleArriveConfirmation = useCallback(() => {
        if (isArrived) {
            toast.info("Thông báo", { description: `Bạn đã xác nhận đến điểm ${currentStopName} rồi. Tiếp tục điểm danh.` });
            return;
        }

        setIsArrived(true);
        toast.success("Xác nhận thành công!", { 
            description: `Đã xác nhận đến điểm đón **${currentStopName}** lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit'})}.`, 
            duration: 4000
        });
        
        // Mô phỏng chuyển sang điểm đón tiếp theo sau 5 giây
        setTimeout(() => {
            setCurrentStopName("202 Đ. Linh, Q.Thủ Đức");
            setIsArrived(false); 
            toast.info("Điểm đón tiếp theo", { 
                description: "Vui lòng lái xe tới điểm: **202 Đ. Linh, Q.Thủ Đức**." 
            });
        }, 50000); // 50 giây cho demo
    }, [isArrived, currentStopName]);
    
    // Thống kê chung cho Dashboard
    const totalPicked = students.filter(s => s.checked).length;
    const totalRemaining = students.length - totalPicked;


    // --- RENDER GIAO DIỆN CHÍNH ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <Toaster position="top-right" richColors /> 
            
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    BẢNG ĐIỀU KHIỂN TÀI XẾ
                </h1>
                <Badge variant="secondary" className="text-md py-1 px-3">
                    <CalendarCheck className="w-4 h-4 mr-1" />
                    20/11/2025
                </Badge>
            </header>

            {/* PHẦN 1: BẢN ĐỒ & XÁC NHẬN ĐIỂM ĐÓN */}
            <Card className="mb-6 shadow-xl relative border-l-4 border-blue-600">
                <CardHeader className="pb-0">
                    <CardTitle className='flex items-center text-blue-700'>
                         <MapPin className='w-5 h-5 mr-2'/>
                         📍 Vị Trí Xe & Điểm Đón
                    </CardTitle>
                    <CardDescription>
                        Điểm đón tiếp theo: **{currentStopName}**
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="p-0 flex flex-col md:flex-row">
                    {/* Bản Đồ Demo */}
                    <div className="flex-1 h-64 bg-gray-300 flex items-center justify-center text-gray-600 font-medium p-4 relative">
                        
                        Map Demo - Vị trí xe
                    </div>

                    {/* Nút Hành động */}
                    <div className="p-4 md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l bg-blue-50">
                        <h3 className="font-semibold text-blue-800 mb-2">Hành động:</h3>
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700" 
                            onClick={handleArriveConfirmation}
                            disabled={isArrived}
                        >
                            <Truck className="w-4 h-4 mr-2"/>
                            {isArrived ? 'ĐANG CHỜ TIẾP THEO' : `ĐÃ TỚI ${currentStopName}`}
                        </Button>
                        {isArrived && (
                            <p className="text-xs text-center text-blue-600 mt-2 font-medium">Đã xác nhận thành công.</p>
                        )}
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
                        handleCheckin={handleToggleCheckin}
                        totalPicked={totalPicked}
                        totalRemaining={totalRemaining}
                    />
                </div>
            </div>

            {/* --- MODAL BÁO CÁO SỰ CỐ --- */}
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