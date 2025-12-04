import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Truck, UserCheck, AlertTriangle, XCircle, Bell, Siren, Clock, MapPin, CheckCircle, Timer, Play } from "lucide-react";
import LeafletRoutingMap from "@/components/Map/GoogleMapDisplay";
import { io } from "socket.io-client"; // ⭐ IMPORT SOCKET.IO

// GIẢ ĐỊNH CÁC COMPONENT FORM ĐÃ ĐƯỢC IMPORT
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SOCKET_URL = "http://localhost:5001";

// =========================================================================
// --- HOOK CUSTOM: ĐỒNG HỒ THỜI GIAN THỰC ---
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
// --- HÀM GỌI API ---
// =========================================================================

const fetchCurrentTripData = async (idtaixe) => {
    if (!idtaixe) {
        console.warn("DRIVER ID chưa sẵn sàng. Bỏ qua fetchCurrentTripData.");
        return { tripsToday: [] };
    }
    const response = await fetch(`${SOCKET_URL}/schoolbus/driver/current-trip/${idtaixe}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};

// HÀM GỌI API THÊM THÔNG BÁO MỚI (NEW)
const sendDriverNotificationAPI = async (idlich, idtaixe, tieude, noidung, loai) => {
    const API_URL = `${SOCKET_URL}/schoolbus/driver/add-notification`;

    // Giả định API backend chấp nhận idnguoigui là idtaixe
    const payload = {
        idlich,
        idnguoigui: idtaixe,
        tieude,
        noidung,
        loai, // 0: Khẩn cấp (Siren/Urgent), 1: Cảnh báo (Alert/Warning)

    };

    console.log("GỌI API THÊM THÔNG BÁO:", payload);

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi HTTP! Status: ${response.status}`);
    }

    return await response.json();
};

const updateTripStatusAPI = async (idlich, newStatus) => {
    const API_URL = `${SOCKET_URL}/schoolbus/driver/trip-status`;
    const payload = {
        idlich: idlich,
        trangthai: newStatus
    };
    // ... (rest of updateTripStatusAPI logic)
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi HTTP! Status: ${response.status}`);
    }

    return await response.json();
};


const updateStudentStatusAPI = async (idlich, idhocsinh, newStatus) => {
    const API_URL = `${SOCKET_URL}/schoolbus/driver/student-status`;
    const payload = {
        idlich: idlich,
        idhocsinh: idhocsinh,
        loaitrangthai: newStatus
    };
    // ... (rest of updateStudentStatusAPI logic)
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi HTTP! Status: ${response.status}`);
    }
    return await response.json();
}

const updateBusPositionAPI = async (idxebuyt, position) => {
    const API_URL = `${SOCKET_URL}/schoolbus/driver/update-location`;

    const payload = {
        idxebuyt: idxebuyt,
        vido: position.vido,
        kinhdo: position.kinhdo
    };
    // ... (rest of updateBusPositionAPI logic)
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi HTTP! Status: ${response.status}`);
    }
    return await response.json();
};

// =========================================================================
// --- HÀM HỖ TRỢ ---
// =========================================================================
const getStatusMap = (loaitrangthai) => {
    switch (loaitrangthai) {
        case 1:
            return { text: "Đã Đón", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle };
        case 0:
            return { text: "Đang Chờ", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock };
        case -1:
            return { text: "Vắng Mặt", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle };
        case 2:
            return { text: "Đã Tới", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle };
        default:
            return { text: "Chưa Rõ", color: "bg-gray-100 text-gray-500 border-gray-300", icon: AlertTriangle };

    }
};

const notifBadge = (loai) => {
    if (loai === 0) {
        return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">Khẩn Cấp</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600">Cảnh Báo</Badge>;
};

const formatToVietnamTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch {
        return 'Invalid Time';
    }
};


const StudentRouteList = ({ students, handleCheckin, totalPicked, totalRemaining, totalMissing, isTripRunning }) => {
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

                <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-gray-50 rounded-md border">
                    <div className="text-sm font-medium text-green-600 flex items-center">
                        <UserCheck className="w-4 h-4 mr-1" />
                        Đã đón: **{totalPicked}**
                    </div>
                    <div className="text-sm font-medium text-yellow-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Đang chờ: **{totalRemaining}**
                    </div>
                    <div className="text-sm font-medium text-red-600 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
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
                                    disabled={!isTripRunning || statusInfo.text === "Vắng Mặt"}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
            {totalRemaining === 0 && totalMissing === 0 && (
                <CardFooter className="pt-4 border-t">
                    <Badge className="w-full py-2 justify-center bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        ĐÃ ĐÓN TẤT CẢ HỌC SINH TRÊN TUYẾN
                    </Badge>
                </CardFooter>
            )}
        </Card>
    );
};

// =========================================================================
// --- COMPONENT CHÍNH: DRIVER DASHBOARD ---
// =========================================================================

const DriverDashboard = () => {

    const POLLING_INTERVAL = 3000;
    const MOVEMENT_STEP = 10;
    const { formattedTime, formattedDate } = useRealTimeClock();

    const [tripData, setTripData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [tripStatus, setTripStatus] = useState(0);
    const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
    const [realRoutePolyline, setRealRoutePolyline] = useState([]);
    const [driverId, setDriverId] = useState(null);
    const DRIVER_ID = driverId;

    // ⭐ STATE MỚI: Dữ liệu form báo cáo
    const [reportForm, setReportForm] = useState({
        tieude: '',
        noidung: '',
        loai: 1, // 1: Cảnh báo (mặc định), 0: Khẩn cấp
    });

    const [socket, setSocket] = useState(null);


    useEffect(() => {
        const idnguoidung = localStorage.getItem("idnguoidung");
        if (!idnguoidung) return;

        const fetchDriverId = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5001/schoolbus/driver/user_id/${idnguoidung}`
                );
                const data = await res.json();
                setDriverId(data?.idtaixe);
            } catch (err) {
                console.error("Lỗi lấy DRIVER_ID:", err);
                toast.error("Không lấy được thông tin tài xế");
            }
        };

        fetchDriverId();
    }, []);

    // ⭐ 1. KHỞI TẠO SOCKET CONNECTION
    useEffect(() => {
        console.log("🔌 Đang kết nối Socket.IO...");
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            console.log("✅ Socket đã kết nối với ID:", socketInstance.id);
            toast.success("Kết nối real-time thành công!");
        });

        socketInstance.on('disconnect', () => {
            console.log("❌ Socket đã ngắt kết nối");
            toast.warning("Mất kết nối real-time");
        });

        socketInstance.on('connect_error', (error) => {
            console.error("❌ Lỗi kết nối Socket:", error);
            toast.error("Lỗi kết nối real-time");
        });

        setSocket(socketInstance);

        return () => {
            console.log("🔌 Ngắt kết nối Socket...");
            socketInstance.disconnect();
        };
    }, []);

    // ⭐ HÀM XỬ LÝ GỬI BÁO CÁO SỰ CỐ (NEW)
    const handleReportSubmit = useCallback(async () => {
        if (!tripData || !DRIVER_ID) {
            toast.error("Lỗi", { description: "Không tìm thấy thông tin chuyến đi hoặc tài xế." });
            return;
        }

        const { tieude, noidung, loai } = reportForm;

        if (!tieude.trim() || !noidung.trim()) {
            toast.warning("Thiếu thông tin", { description: "Vui lòng nhập cả tiêu đề và nội dung thông báo." });
            return;
        }

        try {
            const apiResponse = await sendDriverNotificationAPI(
                tripData.idlich,
                DRIVER_ID,
                tieude,
                noidung,
                loai
            );

            // ⭐ EMIT SOCKET cho Admin/Parent
            if (socket) {
                socket.emit('newNotification', {
                    idlich: tripData.idlich,
                    tieude,
                    noidung,
                    loai
                });
            }

            // ⭐ Cập nhật trạng thái local để hiển thị ngay trên UI
            const newNotification = {
                ...apiResponse.notification || {
                    tieude,
                    noidung,
                    loai,
                    thoigiangui: new Date().toISOString()
                },
                NguoiDung: { vaitro: 1, hoten: "Tài xế (Bạn)" } // Giả định thông tin người gửi
            };

            setTripData(prev => ({
                ...prev,
                thongbao: [newNotification, ...(prev.thongbao || [])]
            }));

            toast.success("Đã gửi báo cáo!", {
                description: `Thông báo "${tieude}" đã được gửi thành công.`,
                duration: 5000
            });

            // Reset form và đóng modal
            setReportForm({ tieude: '', noidung: '', loai: 1 });
            setIsReportModalOpen(false);

        } catch (error) {
            console.error("❌ Lỗi khi gửi báo cáo sự cố:", error);
            toast.error("Lỗi Gửi Báo Cáo", { description: error.message });
        }
    }, [tripData, DRIVER_ID, reportForm, socket]);


    const emitBusPosition = useCallback((idxebuyt, position, bienso) => {
        if (!socket || !socket.connected) {
            console.warn("⚠️ Socket chưa kết nối, không thể emit");
            return;
        }

        console.log("📡 EMIT vehiclePositionUpdated:", { idxebuyt, position, bienso });

        socket.emit('vehiclePositionUpdated', {
            idxebuyt: idxebuyt,
            vitrixe: {
                vido: position.vido,
                kinhdo: position.kinhdo
            },
            bienso: bienso
        });
    }, [socket]);

    const simulateMoveBus = useCallback((currentTrip, currentIndex) => {
        if (!currentTrip || currentTrip.trangthai !== 1) {
            return { newTrip: currentTrip, newIndex: currentIndex, isFinished: false };
        }

        let routePoints = [];

        if (realRoutePolyline.length > 0) {
            routePoints = realRoutePolyline;
        } else {
            try {
                routePoints = JSON.parse(currentTrip.tuyenDuongInfo.fullroutepolyline);
            } catch (e) {
                console.error("Lỗi khi parse polyline:", e);
                return { newTrip: currentTrip, newIndex: currentIndex, isFinished: false };
            }
        }

        let newIndex = currentIndex + MOVEMENT_STEP;
        if (newIndex >= routePoints.length) {
            newIndex = routePoints.length - 1;
            currentTrip.trangthai = 2;
        }

        const newPosition = routePoints[newIndex];
        const updatedTrip = {
            ...currentTrip,
            xebuyt: {
                ...currentTrip.xebuyt,
                vitrixe: {
                    vido: newPosition.lat,
                    kinhdo: newPosition.lng
                }
            }
        };

        return {
            newTrip: updatedTrip,
            newIndex,
            isFinished: newIndex === routePoints.length - 1
        };

    }, [realRoutePolyline]);

    // ⭐ HÀM POLLING (CÓ EMIT SOCKET)
    const reFetchTripData = useCallback(async () => {
        if (!tripData || tripStatus !== 1 || !socket) return;
        // ... (rest of reFetchTripData logic)
        try {
            const { newTrip, newIndex, isFinished } = simulateMoveBus(tripData, currentRouteIndex);

            // ⭐ 1. EMIT SOCKET TRƯỚC (Để Admin nhận real-time)
            emitBusPosition(
                newTrip.idxebuyt,
                newTrip.xebuyt.vitrixe,
                newTrip.xebuyt?.bienso
            );

            // ⭐ 2. GỌI API để lưu vào DB
            await updateBusPositionAPI(newTrip.idxebuyt, newTrip.xebuyt.vitrixe);

            // ⭐ 3. Cập nhật state local
            setTripData(newTrip);
            setCurrentRouteIndex(newIndex);

            console.log(`📍 Index=${newIndex}, Lat=${newTrip.xebuyt.vitrixe.vido}, Lng=${newTrip.xebuyt.vitrixe.kinhdo}`);

            if (isFinished) {
                await updateTripStatusAPI(newTrip.idlich, 2);

                for (const student of newTrip.studentDetails) {
                    if (student.trangThaiDonTra.loaitrangthai === 1) {
                        await updateStudentStatusAPI(newTrip.idlich, student.mahocsinh, 2);

                    } else if (student.trangThaiDonTra.loaitrangthai === 0) {
                        await updateStudentStatusAPI(newTrip.idlich, student.mahocsinh, -1);
                    }
                }

                socket.emit("tripStatusChanged", {
                    idlich: newTrip.idlich,
                    idxebuyt: newTrip.idxebuyt,
                    trangthai: 2,
                    bienso: newTrip.xebuyt?.bienso,
                    tentuyen: newTrip.tuyenDuongInfo?.tentuyen,
                });

                setTripStatus(2);
                toast.success("CHUYẾN ĐI HOÀN THÀNH!", {
                    description: "Trạng thái chuyến và học sinh đã được cập nhật.",
                });
            }

        } catch (e) {
            console.error("❌ Lỗi khi polling:", e);
        }
    }, [tripStatus, tripData, currentRouteIndex, simulateMoveBus, socket, emitBusPosition]);

    // --- LẤY DỮ LIỆU CHUYẾN ĐI BAN ĐẦU ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchCurrentTripData(DRIVER_ID);
                if (data.tripsToday && data.tripsToday.length > 0) {
                    const currentTrip = data.tripsToday[0];
                    setTripData(currentTrip);
                    const initialStatus = currentTrip.trangthai || 0;
                    setTripStatus(initialStatus);

                    if (initialStatus !== 2) {
                        setCurrentRouteIndex(0);
                    }

                    if (initialStatus === 2) {
                        toast.info("Chuyến đi đã hoàn thành.", { description: "Lịch trình này đã kết thúc." });
                    }
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

        if (DRIVER_ID) {
            loadData();
        }
    }, [DRIVER_ID]);

    // --- LOGIC POLLING VỊ TRÍ XE ---
    useEffect(() => {
        let intervalId;
        if (tripStatus === 1 && socket?.connected) {
            console.log(`⏰ Kích hoạt Polling vị trí xe: ${POLLING_INTERVAL}ms`);
            intervalId = setInterval(reFetchTripData, POLLING_INTERVAL);
        }

        return () => {
            if (intervalId) {
                console.log("⏰ Dừng Polling vị trí xe.");
                clearInterval(intervalId);
            }
        };
    }, [tripStatus, reFetchTripData, POLLING_INTERVAL, socket]);

    // --- HÀM BẮT ĐẦU CHUYẾN ĐI ---
    // --- HÀM BẮT ĐẦU CHUYẾN ĐI (handleStartTrip) ---
const handleStartTrip = useCallback(async () => {
    if (!tripData || tripStatus !== 0 || !DRIVER_ID) {
        toast.error("Lỗi", { description: "Không tìm thấy thông tin chuyến đi hoặc tài xế." });
        return;
    }

    // ⭐ 1. LẤY THÔNG TIN USER TỪ LOCALSTORAGE
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        toast.error("Lỗi xác thực", { description: "Không tìm thấy thông tin người dùng trong bộ nhớ cục bộ." });
        return;
    }
    const user = JSON.parse(userStr);
    const driverName = user.hoten || "Tài xế"; // Lấy tên tài xế
    
    try {
        // 2. CẬP NHẬT TRẠNG THÁI CHUYẾN ĐI TRÊN DB
        await updateTripStatusAPI(tripData.idlich, 1);

        // 3. GỬI THÔNG BÁO XE BẮT ĐẦU CHẠY
        const notificationTitle = "Xe đã bắt đầu chạy";
        const notificationContent = `Xe ${tripData.xebuyt?.bienso || 'N/A'} do ${driverName} điều khiển đã khởi hành vào lúc ${new Date().toLocaleTimeString('vi-VN')}.`;
        
        const apiResponse = await sendDriverNotificationAPI(
            tripData.idlich,
            DRIVER_ID,
            notificationTitle,
            notificationContent,
            1 // Loại 1: Cảnh báo/Thông báo thường
        );
        
        // ⭐ 4. CẬP NHẬT THÔNG BÁO VÀO LOCAL STATE
        const newNotification = {
            // Sử dụng dữ liệu trả về từ API hoặc giả lập
            ...apiResponse.notification || { 
                tieude: notificationTitle, 
                noidung: notificationContent, 
                loai: 1, 
                thoigiangui: new Date().toISOString() 
            },
            NguoiDung: { vaitro: user.vaitro || 1, hoten: driverName } 
        };
        
        setTripData(prev => ({
            ...prev,
            thongbao: [newNotification, ...(prev.thongbao || [])]
        }));


        // 5. EMIT SOCKET VÀ CẬP NHẬT STATE TRẠNG THÁI
        if(socket) {
            socket.emit('tripStatusChanged', {
                idlich: tripData.idlich,
                idxebuyt: tripData.idxebuyt,
                trangthai: 1,
                bienso: tripData.xebuyt?.bienso,
                tentuyen: tripData.tuyenDuongInfo?.tentuyen
            });
        }
        
        setTripStatus(1);
        setCurrentRouteIndex(0);

        // 6. CẬP NHẬT VỊ TRÍ BAN ĐẦU TRÊN MAP
        if (tripData.tuyenDuongInfo?.fullroutepolyline) {
            const routePoints = JSON.parse(tripData.tuyenDuongInfo.fullroutepolyline);
            if (routePoints.length > 0) {
                const initialPos = routePoints[0];
                const initialPosData = { vido: initialPos.lat, kinhdo: initialPos.lng };

                emitBusPosition(tripData.idxebuyt, initialPosData, tripData.xebuyt?.bienso);
                await updateBusPositionAPI(tripData.idxebuyt, initialPosData);

                setTripData(prev => ({
                    ...prev,
                    trangthai: 1,
                    xebuyt: {
                        ...prev.xebuyt,
                        vitrixe: initialPosData
                    }
                }));
            }
        }

        // ⭐ 7. TOAST THÀNH CÔNG CUỐI CÙNG
        toast.success("CHUYẾN ĐI ĐÃ BẮT ĐẦU!", {
            description: `Thông báo khởi hành đã được gửi thành công đến phụ huynh và điều hành.`,
            duration: 5000
        });

    } catch (error) {
        console.error("❌ Lỗi khi bắt đầu chuyến đi:", error);
        toast.error("Lỗi Bắt Đầu Chuyến", { description: error.message });
    }
}, [tripData, tripStatus, DRIVER_ID, socket, emitBusPosition]);

    // --- HÀM CẬP NHẬT TRẠNG THÁI HỌC SINH ---
    const handleUpdateStudentStatus = useCallback(async (mahocsinh, newStatus) => {
        if (tripStatus !== 1) {
            toast.warning("Chuyến đi chưa bắt đầu!", { description: "Vui lòng bấm 'Bắt Đầu Chạy Tuyến' trước khi điểm danh." });
            return;
        }
        // ... (rest of handleUpdateStudentStatus logic)
        if (!tripData) return;

        const studentToUpdate = tripData.studentDetails.find(s => s.mahocsinh === mahocsinh);
        if (!studentToUpdate) return;

        try {
            await updateStudentStatusAPI(tripData.idlich, mahocsinh, newStatus);

            const newStudentDetails = tripData.studentDetails.map(student => {
                if (student.mahocsinh === mahocsinh) {
                    return {
                        ...student,
                        trangThaiDonTra: {
                            ...student.trangThaiDonTra,
                            loaitrangthai: newStatus,
                        }
                    };
                }
                return student;
            });

            setTripData(prev => ({
                ...prev,
                studentDetails: newStudentDetails
            }));

            const statusInfo = getStatusMap(newStatus);
            toast.success(`Cập nhật ${statusInfo.text} thành công!`, { description: `Học sinh ${studentToUpdate.hoten} đã được cập nhật.` });

        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            toast.error("Lỗi Cập Nhật", { description: error.message || "Không thể cập nhật trạng thái học sinh. Vui lòng kiểm tra kết nối." });
        }
    }, [tripData, tripStatus]);

    // --- CHUYỂN ĐỔI DỮ LIỆU SANG PROPS CỦA MAP ---
    const mapProps = useMemo(() => {
        if (!tripData) return { routes: [], buses: [], school: null };
        // ... (rest of mapProps logic)
        const stops = tripData.tuyenDuongInfo?.diemDungDetails || [];
        const busPositionData = tripData.xebuyt?.vitrixe;

        let polylineData = [];
        try {
            if (tripData.tuyenDuongInfo?.fullroutepolyline) {
                polylineData = JSON.parse(tripData.tuyenDuongInfo.fullroutepolyline);
            }
        } catch (e) {
            console.error("Lỗi parse fullroutepolyline:", e);
        }

        const schoolLocation = { lat: 10.788229, lng: 106.703970 };

        let stopsForMap = stops.map((stop, index) => ({
            lat: parseFloat(stop.vido),
            lng: parseFloat(stop.kinhdo),
            label: `${index + 1}. ${stop.tendiemdon}`,
        }));

        if (tripData.tuyenDuongInfo?.loaituyen === "Đón") {
            stopsForMap.push({
                ...schoolLocation,
                label: `${stopsForMap.length + 1}. Trường Học`
            });
        } else if (tripData.tuyenDuongInfo?.loaituyen === "Trả") {
            stopsForMap.unshift({
                ...schoolLocation,
                label: `1. Trường Học`
            });
        }

        const routes = [{
            id: tripData.idlich,
            name: tripData.tuyenDuongInfo?.tentuyen,
            color: "#0066CC",
            dotColor: "blue",
            polyline: polylineData.map(p => [p.lat, p.lng]),
            stops: stopsForMap,
        }];

        const buses = busPositionData ? [{
            id: tripData.idxebuyt,
            routeId: tripData.idlich,
            position: {
                lat: parseFloat(busPositionData.vido),
                lng: parseFloat(busPositionData.kinhdo)
            },
            label: `Xe ${tripData.xebuyt?.bienso}`,
        }] : [];

        return {
            routes,
            buses,
            school: schoolLocation,
            defaultCenter: busPositionData ? { lat: parseFloat(busPositionData.vido), lng: parseFloat(busPositionData.kinhdo) } : { lat: 10.77, lng: 106.7 },
        };
    }, [tripData]);

    // --- TÍNH TOÁN THỐNG KÊ ---
    const students = tripData?.studentDetails || [];
    const totalPicked = students.filter(s => s.trangThaiDonTra?.loaitrangthai === 1).length;
    const totalRemaining = students.filter(s => s.trangThaiDonTra?.loaitrangthai === 0).length;
    const totalMissing = students.filter(s => s.trangThaiDonTra?.loaitrangthai === 2).length;

    if (isLoading) {
        return <div className="p-10 min-h-screen flex items-center justify-center text-xl text-blue-600">Đang tải dữ liệu chuyến đi...</div>;
    }

    if (!tripData) {
        return <div className="p-10 min-h-screen flex items-center justify-center text-xl text-gray-500">Không có chuyến đi nào được giao cho ngày hôm nay.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toaster position="top-right" richColors />

            {/* HEADER */}
            <div className='flex justify-between items-center mb-6'>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Truck className="w-7 h-7 mr-3 text-blue-600" />
                    {tripData.tuyenDuongInfo?.tentuyen || "Chuyến đi không tên"}
                </h1>

                <div className='flex items-center space-x-4'>
                    {tripStatus === 0 && (
                        <Button
                            className='bg-green-600 hover:bg-green-700 text-white shadow-lg font-bold'
                            onClick={handleStartTrip}
                        >
                            <Play className='w-4 h-4 mr-2' />
                            BẮT ĐẦU CHẠY TUYẾN
                        </Button>
                    )}
                    {tripStatus === 1 && (
                        <Badge className='bg-blue-600 hover:bg-blue-600 text-white text-lg font-bold py-2 px-4'>
                            <Truck className='w-5 h-5 mr-2 animate-pulse' />
                            ĐANG CHẠY TUYẾN
                        </Badge>
                    )}
                    {tripStatus === 2 && (
                        <Badge className='bg-gray-500 hover:bg-gray-600 text-white text-lg font-bold py-2 px-4'>
                            <CheckCircle className='w-5 h-5 mr-2' />
                            ĐÃ HOÀN THÀNH
                        </Badge>
                    )}

                    <Card className='p-3 bg-white shadow-md border-l-4 border-blue-400'>
                        <div className='flex items-center space-x-2 text-gray-700'>
                            <Timer className='w-5 h-5 text-blue-600' />
                            <div>
                                <p className='text-xs font-medium text-gray-500'>{formattedDate}</p>
                                <p className='text-xl font-extrabold text-blue-800'>{formattedTime}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            {/* END HEADER */}

            {/* THÔNG TIN TÓM TẮT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                    <div className="flex-1" style={{ minHeight: '400px',zIndex: 1 }}>
                        <LeafletRoutingMap
                            routes={mapProps.routes}
                            buses={mapProps.buses}
                            school={mapProps.school}
                            // zoom={13}
                            defaultCenter={mapProps.defaultCenter}
                            setRealPolyline={setRealRoutePolyline}
                        />
                    </div>

                    {/* Danh sách Điểm dừng */}
                    <div className="p-4 lg:w-80 flex flex-col border-t lg:border-t-0 lg:border-l bg-blue-50 max-h-[400px] overflow-y-auto">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <MapPin className='w-4 h-4 mr-2' />
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
                    <Card className="shadow-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
                                <Bell className="w-5 h-5 mr-2" />
                                Thông Báo & Sự Cố
                            </CardTitle>
                            <CardDescription>
                                Vui lòng kiểm tra các thông báo khẩn cấp hoặc sự cố cần báo cáo.
                            </CardDescription>
                        </CardHeader>

                        {/* --- NỘI DUNG THÔNG BÁO ĐỘNG --- */}
                        <CardContent className="flex-1 max-h-[35vh] overflow-y-auto ">

                            {tripData?.thongbao && tripData.thongbao.length > 0 ? (
                                <div className="space-y-3">
                                    {/* Hiển thị danh sách thông báo */}
                                    {tripData.thongbao.map((n) => (
                                        <div
                                            key={n.idthongbao || Math.random()}
                                            className={`flex items-start gap-3 p-3 rounded-lg border 
                                ${n.loai === 0 ? 'border-red-300 bg-red-50 text-red-800' : 'border-yellow-300 bg-yellow-50 text-yellow-800'}
                            `}
                                        >
                                            {n.loai === 0
                                                ? <Bell className="h-5 w-5 mt-0.5 text-red-600 flex-shrink-0" />
                                                : <XCircle className="h-5 w-5 mt-0.5 text-yellow-600 flex-shrink-0" />
                                            }

                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <p className="font-semibold text-sm">{n.tieude || "Thông báo hệ thống"}</p>
                                                    <div className="flex-shrink-0">{notifBadge(n.loai)}</div>
                                                </div>
                                                <p className="text-xs">{n.noidung || "Nội dung đang được cập nhật..."}</p>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {n.thoigiangui ? formatToVietnamTime(n.thoigiangui) : "Vừa xong"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // --- HIỂN THỊ TRẠNG THÁI ỔN ĐỊNH KHI KHÔNG CÓ THÔNG BÁO NÀO ---
                                <div className="flex items-start space-x-3 p-4 border border-green-300 rounded-lg bg-green-50 text-green-800">
                                    <CheckCircle className="h-5 w-5 mt-0.5 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-green-700">Tình hình ổn định</p>
                                        <p className="text-sm">
                                            Hiện tại không có sự cố khẩn cấp hay cảnh báo nào trên tuyến đường.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        {/* --- FOOTER (Nút Báo Cáo) --- */}
                        <CardFooter className="pt-0">
                            <Button
                                className="w-full bg-amber-700"
                                variant="destructive"
                                onClick={() => {
                                    // Reset form khi mở modal
                                    setReportForm({ tieude: '', noidung: '', loai: 1 });
                                    setIsReportModalOpen(true);
                                }}
                                disabled={tripStatus !== 1} // Chỉ báo cáo khi đang chạy
                            >
                                <Siren className="w-4 h-4 mr-2" />
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
                        isTripRunning={tripStatus === 1}
                    />
                </div>
            </div>

            {/* --- MODAL BÁO CÁO SỰ CỐ (ĐÃ CẬP NHẬT) --- */}
            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white ">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-xl text-red-600">
                            <Siren className="mr-2 h-5 w-5" />
                            Tạo Báo Cáo Sự Cố/Thông Báo
                        </DialogTitle>
                        <DialogDescription>
                            Gửi thông báo đến bộ phận điều hành và các phụ huynh khác.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='py-4 space-y-4'>
                        {/* INPUT TIÊU ĐỀ */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Tiêu đề thông báo <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={reportForm.tieude}
                                onChange={(e) => setReportForm({ ...reportForm, tieude: e.target.value })}
                                placeholder="Ví dụ: Kẹt xe tại đường X, Xe bị hỏng"
                                maxLength={100}
                            />
                        </div>

                        {/* INPUT NỘI DUNG */}
                        <div className="space-y-2">
                            <Label htmlFor="content">Nội dung chi tiết <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="content"
                                value={reportForm.noidung}
                                onChange={(e) => setReportForm({ ...reportForm, noidung: e.target.value })}
                                placeholder="Mô tả chi tiết sự cố và giải pháp nếu có."
                                rows={4}
                            />
                        </div>

                        {/* LOẠI THÔNG BÁO */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="urgent"
                                checked={reportForm.loai === 0}
                                onCheckedChange={(checked) => setReportForm({ ...reportForm, loai: checked ? 0 : 1 })}
                                className="border-red-500 data-[state=checked]:bg-red-600"
                            />
                            <label
                                htmlFor="urgent"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-600"
                            >
                                <AlertTriangle className='w-4 h-4 mr-1 inline-block' /> Đánh dấu KHẨN CẤP (Ưu tiên cao)
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsReportModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            className={"bg-amber-700"}
                            variant={reportForm.loai === 0 ? "destructive" : "default"}
                            onClick={handleReportSubmit}
                        >
                            {reportForm.loai === 1 ? <Siren className='w-4 h-4 mr-2' /> : <Bell className='w-4 h-4 mr-2' />}
                            Gửi Thông Báo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DriverDashboard;