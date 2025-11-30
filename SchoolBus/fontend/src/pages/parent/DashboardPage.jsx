import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Bus,
  Clock,
  MapPin,
  Phone,
  Bell,
  CheckCircle,
  XCircle,
  Home,
  Map,
  Calendar,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";
import LeafletRoutingMap from "@/components/Map/GoogleMapDisplay";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001";
const THRESHOLD_DISTANCE_KM = 3.0;

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const ClockDisplay = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDateTime.toLocaleDateString('vi-VN', dateOptions);
    const formattedTime = currentDateTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <div className="flex flex-col items-end text-right text-gray-700">
            <div className="flex items-center text-3xl font-bold text-blue-600 mb-1">
                <Clock className="h-6 w-6 mr-2 text-blue-500" />
                {formattedTime}
            </div>
            <div className="flex items-center text-sm font-medium">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                {formattedDate}
            </div>
        </div>
    );
};

export default function ParentDashboardPage() {
    const [selectedTrip, setSelectedTrip] = useState("go");
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [busesRealTimePosition, setBusesRealTimePosition] = useState({});
    
    // ⭐ Dùng object để lưu trạng thái thông báo cho mỗi chuyến
    const [tripNotifications, setTripNotifications] = useState({});
    
    // ⭐ Dùng useRef để track thông báo đã được gửi (không trigger re-render)
    const notificationSentRef = useRef({});

    const school = {
        lat: 10.788233,
        lng: 106.703972,
        label: "Trường Tiểu học Nguyễn Bỉnh Khiêm"
    };

    // --- KHỞI TẠO SOCKET CONNECTION ---
    useEffect(() => {
        console.log("🔌 Đang kết nối Socket.IO Parent...");
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            console.log("✅ Parent Socket đã kết nối với ID:", socketInstance.id);
            toast.success("Kết nối real-time thành công!");
        });

        socketInstance.on('disconnect', () => {
            console.log("❌ Parent Socket đã ngắt kết nối");
            toast.warning("Mất kết nối real-time");
        });

        socketInstance.on('connect_error', (error) => {
            console.error("❌ Lỗi kết nối Socket:", error);
        });

        setSocket(socketInstance);

        return () => {
            console.log("🔌 Ngắt kết nối Parent Socket...");
            socketInstance.disconnect();
        };
    }, []);

    // --- LẮNG NGHE VỊ TRÍ XE REAL-TIME & THÔNG BÁO ---
    useEffect(() => {
        if (!socket || !scheduleData || scheduleData.schedules.length === 0) return;

        const activeTrip = scheduleData.schedules.find(s => s.trangthai === 1);
        
        if (!activeTrip) return;

        const scheduleId = activeTrip.idlich;
        const isGoTrip = activeTrip.tuyenDuongInfo?.loaituyen === "Đón";

        // 📍 Lấy thông tin điểm đón/trả của học sinh
        let studentPickupPoint = null;
        if (activeTrip.myChildren && activeTrip.myChildren.length > 0) {
            const firstChild = activeTrip.myChildren[0];
            const pickupId = firstChild.iddiemdon;
            const pickupInfo = activeTrip.tuyenDuongInfo?.diemDungDetails.find(d => d.iddiemdung === pickupId);

            if (pickupInfo) {
                studentPickupPoint = {
                    lat: parseFloat(pickupInfo.vido),
                    lng: parseFloat(pickupInfo.kinhdo),
                    name: pickupInfo.tendiemdon,
                };
            }
        }
        
        const handleVehiclePositionUpdate = (data) => {
            console.log("📍 Parent nhận vị trí xe real-time:", data);
            
            const newLat = parseFloat(data.vitrixe.vido);
            const newLng = parseFloat(data.vitrixe.kinhdo);

            // Cập nhật vị trí xe
            setBusesRealTimePosition((prev) => ({
                ...prev,
                [data.idxebuyt]: {
                    lat: newLat,
                    lng: newLng,
                    bienso: data.bienso,
                    timestamp: new Date().toLocaleTimeString('vi-VN')
                }
            }));

            // ⭐ LOGIC THÔNG BÁO GẦN ĐIỂM ĐÓN - CHỈ GỬI MỘT LẦN
            if (isGoTrip && studentPickupPoint && data.idxebuyt === activeTrip.idxebuyt) {
                const distance = calculateDistance(
                    newLat, 
                    newLng, 
                    studentPickupPoint.lat, 
                    studentPickupPoint.lng
                );

                console.log(`📏 Khoảng cách đến điểm đón: ${distance.toFixed(2)}km (Ngưỡng: ${THRESHOLD_DISTANCE_KM}km)`);

                // ✅ Kiểm tra: nếu lần đầu vào vùng cảnh báo và chưa gửi thông báo
                if (distance <= THRESHOLD_DISTANCE_KM && distance > 0.1) {
                    // Kiểm tra ref để xác định thông báo đã được gửi chưa
                    if (!notificationSentRef.current[scheduleId]) {
                        console.log("🔔 Kích hoạt thông báo gần điểm đón!");
                        
                        // Gửi toast notification
                        toast.warning("⏰ Xe sắp tới điểm đón!", {
                            description: `Xe ${data.bienso} còn cách điểm đón ~${distance.toFixed(2)}km tại ${studentPickupPoint.name}. Vui lòng chuẩn bị cho bé ra điểm đón!`,
                            duration: 15000,
                        });
                        
                        // ⭐ Đánh dấu thông báo đã được gửi (dùng ref không trigger re-render)
                        notificationSentRef.current[scheduleId] = true;
                        
                        // Cập nhật state để hiển thị thông báo trong card
                        setTripNotifications((prev) => ({
                            ...prev,
                            [scheduleId]: {
                                type: "pickup_alert",
                                distance: distance.toFixed(2),
                                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            }
                        }));
                    }
                }
            }
        };

        const handleTripStatusChange = (data) => {
            console.log("🚦 Parent nhận trạng thái chuyến:", data);
            
            if (data.trangthai === 1) {
                console.log("✅ Chuyến bắt đầu - Reset cờ thông báo");
                // Reset khi chuyến bắt đầu
                notificationSentRef.current[data.idlich] = false;
                setTripNotifications((prev) => {
                    const newNotifs = { ...prev };
                    delete newNotifs[data.idlich];
                    return newNotifs;
                });
                
                toast.info(`🚌 Chuyến "${data.tentuyen}" đã bắt đầu`, {
                    description: `Xe ${data.bienso} đang trên đường`
                });
            } else if (data.trangthai === 2) {
                console.log("✅ Chuyến hoàn thành");
                
                // ⭐ Cập nhật thông báo hoàn thành
                setTripNotifications((prev) => ({
                    ...prev,
                    [data.idlich]: {
                        type: "trip_complete",
                        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    }
                }));
                
                toast.success(`✅ Chuyến "${data.tentuyen}" đã hoàn thành`, {
                    description: `Xe ${data.bienso} đã về đích`,
                    duration: 10000
                });
            }
        };

        socket.on("vehiclePositionUpdated", handleVehiclePositionUpdate);
        socket.on("tripStatusChanged", handleTripStatusChange);

        return () => {
            console.log("🔌 Ngắt kết nối lắng nghe socket");
            socket.off("vehiclePositionUpdated", handleVehiclePositionUpdate);
            socket.off("tripStatusChanged", handleTripStatusChange);
        };
    }, [socket, scheduleData]);

    // --- Fetch dữ liệu từ API ---
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('Chưa có token đăng nhập');
                }

                const response = await fetch('http://localhost:5001/schoolbus/user/schedules-by-my-children', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Lỗi khi gọi API');
                }
                
                const data = await response.json();
                console.log('📦 API Response:', data);
                setScheduleData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    const getStudentStatus = (status) => {
        if (status === 1) return "Trên xe";
        if (status === 0) return "Chờ xe";
        if (status === 2) return "Đã tới";
        if (status === -1) return "Vắng"
        return "Chưa cập nhật";
    };

    const createRouteFromSchedule = useCallback((schedule, isGoTrip = true) => {
        if (!schedule) return null;

        const routeInfo = schedule.tuyenDuongInfo;
        const diemDung = routeInfo?.diemDungDetails || [];
        const children = schedule.myChildren || [];
        
        const studentStatusList = children.map(child => ({
            id: child.mahocsinh, 
            name: child.hoten,
            avatar: child.userInfo?.anhdaidien || "", 
            status: getStudentStatus(child.trangThaiDonTra?.loaitrangthai),
        }));
        
        const studentNames = children.map(c => c.hoten).join(", ") || "Chưa có thông tin";
        
        const routePoints = diemDung.map(stop => ({
            lat: parseFloat(stop.vido),
            lng: parseFloat(stop.kinhdo),
            label: stop.tendiemdon
        }));

        let fullRoute;
        if (isGoTrip) {
            fullRoute = [...routePoints, school];
        } else {
            fullRoute = [school, ...routePoints];
        }

        let studentPickup = null;
        if (children.length > 0 && children[0].iddiemdon) {
            const pickupPoint = diemDung.find(stop => stop.iddiemdung === children[0].iddiemdon);
            if (pickupPoint) {
                studentPickup = {
                    lat: parseFloat(pickupPoint.vido),
                    lng: parseFloat(pickupPoint.kinhdo),
                    label: pickupPoint.tendiemdon,
                };
            }
        }

        const realTimePosition = busesRealTimePosition[schedule.idxebuyt];
        const apiPosition = schedule.xebuyt?.vitrixe
            ? {
                lat: parseFloat(schedule.xebuyt.vitrixe.vido),
                lng: parseFloat(schedule.xebuyt.vitrixe.kinhdo)
            }
            : null;

        const busPosition = realTimePosition 
            ? { lat: realTimePosition.lat, lng: realTimePosition.lng }
            : (apiPosition || { lat: school.lat, lng: school.lng });

        // ⭐ Xây dựng notifications dựa trên tripNotifications state
        const scheduleNotifications = [
            {
                id: 1,
                message: schedule.trangthai === 1
                    ? "Xe đang trên đường"
                    : "Xe chưa khởi hành",
                time: schedule.giobatdau.substring(0, 5),
                type: schedule.trangthai === 1 ? "success" : "info"
            }
        ];

        // ⭐ Thêm thông báo gần điểm đón (nếu có)
        if (tripNotifications[schedule.idlich]?.type === "pickup_alert") {
            scheduleNotifications.push({
                id: 2,
                message: `Xe đang cách điểm đón ${tripNotifications[schedule.idlich].distance}km`,
                time: tripNotifications[schedule.idlich].timestamp,
                type: "warning"
            });
        }

        // ⭐ Thêm thông báo hoàn thành (nếu chuyến đã xong)
        if (tripNotifications[schedule.idlich]?.type === "trip_complete") {
            scheduleNotifications.push({
                id: 3,
                message: "Xe hoàn thành chuyến đi",
                time: tripNotifications[schedule.idlich].timestamp,
                type: "success"
            });
        }

        return {
            student: { 
                name: studentNames,
                status: studentStatusList.length > 0 ? studentStatusList[0].status : "N/A"
            },
            studentList: studentStatusList,
            bus: schedule.xebuyt?.bienso || "N/A",
            driver: {
                name: schedule.taixe?.userInfo?.hoten || "N/A",
                phone: schedule.taixe?.userInfo?.sodienthoai || "N/A",
                exp: schedule.taixe?.kinhnghiem ? `${schedule.taixe.kinhnghiem} năm` : "N/A",
                avatar: schedule.taixe?.userInfo?.anhdaidien || "", 
            },
            route: fullRoute,
            pickupPoint: studentPickup
                ? `${studentPickup.label} – ${schedule.giobatdau.substring(0, 5)}`
                : "Chưa có thông tin điểm đón",
            schedule: [
                {
                    time: schedule.giobatdau.substring(0, 5),
                    event: isGoTrip ? "Xe xuất phát" : "Xe khởi hành từ trường",
                    icon: <Bus className="h-4 w-4 text-blue-600" />
                },
                {
                    time: "??:??",
                    event: isGoTrip ? "Bé đã lên xe" : "Bé đã xuống xe",
                    icon: <CheckCircle className="h-4 w-4 text-green-600" />
                },
                {
                    time: "??:??",
                    event: isGoTrip ? "Đến trường" : "Về đến nhà",
                    icon: <CheckCircle className="h-4 w-4 text-green-600" />
                },
            ],
            notifications: scheduleNotifications,
            busPosition: busPosition,
            studentPickup: studentPickup,
            busStops: fullRoute.slice(1, fullRoute.length - 1),
            origin: fullRoute[0],
            destination: fullRoute[fullRoute.length - 1],
            routeName: routeInfo?.tentuyen || "N/A",
            idlich: schedule.idlich,
        };
    }, [busesRealTimePosition, school, tripNotifications]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center text-red-600">
                            <XCircle className="h-5 w-5 mr-2" />
                            <span className="font-medium">Lỗi: {error}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const schedules = scheduleData?.schedules || [];
    const goSchedule = schedules.find(s => s.tuyenDuongInfo?.loaituyen === "Đón");
    const returnSchedule = schedules.find(s => s.tuyenDuongInfo?.loaituyen === "Trả");

    const tripData = {
        go: goSchedule ? createRouteFromSchedule(goSchedule, true) : null,
        return: returnSchedule ? createRouteFromSchedule(returnSchedule, false) : null,
    };

    if (!goSchedule && !returnSchedule) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                        Không có lịch trình đón/trả hôm nay
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentSelectedTrip = tripData[selectedTrip] || tripData.go || tripData.return;

    if (!currentSelectedTrip) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                        Không có dữ liệu chuyến đi được chọn
                    </CardContent>
                </Card>
            </div>
        );
    }

    const trip = currentSelectedTrip;

    const notifBadge = (type) => {
        if (type === "success") return <Badge className="bg-green-100 text-green-800">An toàn</Badge>;
        if (type === "warning") return <Badge className="bg-yellow-100 text-yellow-800">Cảnh báo</Badge>;
        return <Badge variant="secondary">Thông tin</Badge>;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-inter space-y-6">
            <Toaster position="top-right" richColors />
            
            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 pt-2">
                    {tripData.go && (
                        <button
                            onClick={() => setSelectedTrip("go")}
                            className={`px-4 py-2 rounded-full font-medium transition flex items-center ${
                                selectedTrip === "go"
                                    ? "bg-blue-600 text-white shadow"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <Map className="inline h-4 w-4 mr-2" /> Chuyến đi
                        </button>
                    )}

                    {tripData.return && (
                        <button
                            onClick={() => setSelectedTrip("return")}
                            className={`px-4 py-2 rounded-full font-medium transition flex items-center ${
                                selectedTrip === "return"
                                    ? "bg-orange-500 text-white shadow"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <Home className="inline h-4 w-4 mr-2" /> Chuyến về
                        </button>
                    )}
                    
                    {socket?.connected && (
                        <Badge className="bg-green-500 text-white ml-auto animate-pulse">
                            🟢 Live Tracking
                        </Badge>
                    )}
                </div>

                <ClockDisplay />
            </div>

            {/* Top 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-md">
                    <CardHeader className="flex items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Trạng thái học sinh: {trip.student.name}
                        </CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[140px] overflow-y-auto">
                        {trip.studentList && trip.studentList.length > 0 ? (
                            trip.studentList.map((student) => (
                                <div key={student.id} className="flex items-center justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={student.avatar ? `http://localhost:5001${student.avatar}` : undefined}
                                                alt={student.name}
                                            />
                                            <AvatarFallback className="text-sm">
                                                {student.name.split(' ').pop().charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-md font-semibold text-gray-900">{student.name}</div>
                                    </div>
                                    <div
                                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            student.status === "Vắng"
                                                ? "bg-red-100 text-red-600"
                                                : student.status.includes("Chờ") || student.status.includes("Chưa cập nhật")
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {student.status}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-sm text-gray-500">Không có thông tin học sinh</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader className="flex items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Xe & Tuyến</CardTitle>
                        <Bus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900">{trip.bus}</div>
                        <div className="text-sm text-gray-500 mt-1">{trip.routeName}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader className="flex items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tài xế</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage
                                src={trip.driver.avatar ? `http://localhost:5001${trip.driver.avatar}` : undefined}
                                alt={trip.driver.name}
                            />
                            <AvatarFallback>{trip.driver.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold text-gray-900">{trip.driver.name}</div>
                            <div className="text-sm text-gray-500">
                                <Phone className="inline h-3 w-3 mr-1" /> {trip.driver.phone}
                            </div>
                            <div className="text-sm text-gray-500">Kinh nghiệm: {trip.driver.exp}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Map + stops */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2 h-[420px] p-0 overflow-hidden shadow-2xl">
                    <LeafletRoutingMap
                        routes={[
                            {
                                id: "main-route",
                                name: trip.routeName,
                                color: selectedTrip === "go" ? "#2563eb" : "#f97316",
                                dotColor: selectedTrip === "go"
                                    ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                                    : "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
                                stops: trip.route
                            }
                        ]}
                        buses={[
                            {
                                id: "bus-1",
                                position: trip.busPosition,
                                label: `Xe ${trip.bus}`,
                                icon: "https://img.icons8.com/color/48/bus.png"
                            }
                        ]}
                        school={school}
                        zoom={13}
                        apiKey="AIzaSyA_JStH-ku5M_jeUjakhpWBT1m7P6_s-w4"
                    />
                </Card>

                <Card className="shadow-sm md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Danh sách điểm dừng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[360px] overflow-y-auto">
                        {trip.route.map((r, i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2">
                                    {r.label.includes("Trường") ? (
                                        <MapPin className="h-4 w-4 text-yellow-600" />
                                    ) : (
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                    )}
                                    <div className="text-gray-800 text-sm">{r.label}</div>
                                </div>
                            </div>
                        ))}

                        <div className="mt-4 pt-3 border-t">
                            <div className="text-xs text-gray-500 mb-1">
                                Điểm {selectedTrip === "go" ? "đón" : "trả"} của học sinh
                            </div>
                            <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-500" />
                                {trip.pickupPoint}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Schedule + Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bus className="h-5 w-5" /> Lịch trình
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Sự kiện</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trip.schedule.map((s, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{s.time}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            {s.icon}
                                            {s.event}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5" /> Thông báo
                            </div>
                            <Button variant="outline" size="sm">Xem tất cả</Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {trip.notifications.map((n) => (
                                <div key={n.id} className="flex items-center gap-3">
                                    {n.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                                    {n.type === "warning" && <XCircle className="h-4 w-4 text-yellow-600" />}
                                    {n.type === "info" && <Bell className="h-4 w-4 text-blue-600" />}

                                    <div className="flex-1">
                                        <div className="text-sm">{n.message}</div>
                                        <div className="text-xs text-muted-foreground">{n.time}</div>
                                    </div>

                                    <div>{notifBadge(n.type)}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}