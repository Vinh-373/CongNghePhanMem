import { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    Clock,
    Info,
    AlertTriangle,
    MessageSquare, // Dùng cho Tiêu đề
    User, // Dùng cho Người gửi
    Loader2, // Icon Loading
    Search, // Icon Tìm kiếm
} from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button"; 
// Thêm Input component từ Shadcn-ui để tạo ô tìm kiếm
import { Input } from "@/components/ui/input"; // Giả định bạn có component Input

// =================================================================
// --- HÀM HỖ TRỢ: XÁC ĐỊNH LOẠI VÀ ICON THÔNG BÁO ---
// =================================================================
const getNotificationType = (noti) => {
    // Giá trị loai: 0 (Khẩn cấp), 1 (Cảnh báo), 2 (Thông báo chung)
    // Lưu ý: Đã đổi case 0 và case 1 trong logic ban đầu, tôi sẽ giữ nguyên theo logic của bạn.
    switch (noti.loai) {
        
        case 1:
            return {
                label: "Sự cố",
                icon: Info, // Đã đổi icon từ Info sang AlertTriangle cho phù hợp hơn
                badgeClass: "bg-yellow-500 text-yellow-900 hover:bg-yellow-600",
            };
        case 0:
            return {
                label: "Thông báo",
                icon: Bell,
                badgeClass: "bg-blue-500 text-white hover:bg-blue-600",
            };
        default:
            return {
                label: "Khác",
                icon: Bell,
                badgeClass: "bg-gray-500 text-white hover:bg-gray-600",
            };
    }
};

// =================================================================
// --- COMPONENT CHÍNH ---
// =================================================================

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ total: 0 });
    const [selectedNoti, setSelectedNoti] = useState(null); 
    // 👉 State mới cho chức năng tìm kiếm
    const [searchTerm, setSearchTerm] = useState(""); 

    // Lấy ID người dùng từ localStorage
    const userId = localStorage.getItem("idnguoidung");

    // Endpoint API (Sử dụng endpoint getNotificationByUser)
    const API_GET_NOTIFICATIONS =
        "http://localhost:5001/schoolbus/driver/notification"; 

    const fetchNotifications = async () => {
        if (!userId) {
            setError("Không tìm thấy ID người dùng.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Gọi API
            const res = await axios.get(`${API_GET_NOTIFICATIONS}/${userId}`);
            
            // Lấy dữ liệu từ trường 'data' theo cấu trúc response backend
            const fetchedNotifications = res.data.notifications || []; 
            console.log('fhdshd',fetchedNotifications)
            setNotifications(fetchedNotifications);
            setStats({ total: fetchedNotifications.length });

        } catch (err) {
            console.error("Lỗi tải thông báo:", err);
            setError("Không thể tải thông báo. Vui lòng kiểm tra kết nối server.");
            setNotifications([]);
            setStats({ total: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchNotifications();
        } else {
            setError("Thiếu ID người dùng để tải thông báo.");
        }
    }, [userId]); 

    
    // Hàm xác định Tên và Vai trò người gửi
    const renderSenderInfo = (noti) => {
        // Trường NguoiDung chứa thông tin của NGƯỜI GỬI (idnguoigui)
        if (noti.NguoiDung) {
            let role = "Người dùng";
            switch (noti.NguoiDung.vaitro) {
                case 0: role = "Admin"; break;
                case 1: role = "Tài xế"; break;
                case 2: role = "Phụ huynh"; break;
                default: role = "N/A";
            }
            return {
                role: role,
                name: noti.NguoiDung.hoten || "Không tên",
            };
        }
        
        // Trường hợp không có NguoiDung (ví dụ: thông báo được tạo trực tiếp qua hệ thống không qua người dùng nào)
        return {
            role: "Hệ thống",
            name: "Thông báo tự động",
        };
    };
    
    // 👉 LỌC DANH SÁCH THÔNG BÁO DỰA TRÊN CHUỖI TÌM KIẾM
    const filteredNotifications = notifications.filter((noti) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
        // Kiểm tra Tiêu đề
        const titleMatch = noti.tieude && noti.tieude.toLowerCase().includes(lowerCaseSearchTerm);
        // Kiểm tra Nội dung
        const contentMatch = noti.noidung && noti.noidung.toLowerCase().includes(lowerCaseSearchTerm);
        // Kiểm tra Người gửi (Tên và Vai trò)
        const senderInfo = renderSenderInfo(noti);
        const senderMatch = (senderInfo.name && senderInfo.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                            (senderInfo.role && senderInfo.role.toLowerCase().includes(lowerCaseSearchTerm));
        
        // Kiểm tra Loại thông báo
        const typeInfo = getNotificationType(noti);
        const typeMatch = typeInfo.label.toLowerCase().includes(lowerCaseSearchTerm);
        
        return titleMatch || contentMatch || senderMatch || typeMatch;
    });

    return (
        <div className="space-y-6 p-6">
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Thẻ thống kê */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tổng số Thông báo</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : stats.total}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Đã nhận
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Danh sách thông báo */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách thông báo</CardTitle>
                </CardHeader>

                <CardContent>
                    {/* 👉 Ô TÌM KIẾM */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tiêu đề, nội dung, người gửi hoặc loại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {/* --- Kết thúc Ô TÌM KIẾM --- */}
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Đang tải...
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-8">{error}</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            {searchTerm ? `Không tìm thấy thông báo nào khớp với "${searchTerm}"` : "Không có thông báo nào"}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[150px]">Tiêu đề</TableHead>
                                        <TableHead className="min-w-[150px]">Người gửi</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead className="min-w-[180px]">Thời gian gửi</TableHead>
                                        <TableHead className="text-right">Xem</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {/* 👉 SỬ DỤNG filteredNotifications THAY VÌ notifications */}
                                    {filteredNotifications.map((noti) => { 
                                        const typeInfo = getNotificationType(noti);
                                        const TypeIcon = typeInfo.icon;
                                        const senderInfo = renderSenderInfo(noti);

                                        return (
                                            <TableRow 
                                                key={noti.idthongbao} 
                                                className={noti.trangthai === 0 ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"} 
                                            >
                                                {/* Tiêu đề */}
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                        {noti.tieude}
                                                    </div>
                                                </TableCell>
                                                
                                                {/* Người gửi */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                        <div className="flex flex-col text-xs">
                                                            <span className="font-medium">
                                                                {senderInfo.role}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {senderInfo.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Loại */}
                                                <TableCell>
                                                    <Badge className={typeInfo.badgeClass}>
                                                        <TypeIcon className="h-3 w-3 mr-1" />
                                                        {typeInfo.label}
                                                    </Badge>
                                                </TableCell>

                                                {/* Thời gian */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        {new Date(noti.thoigiangui).toLocaleString("vi-VN")}
                                                    </div>
                                                </TableCell>

                                                {/* Nút xem */}
                                                <TableCell className="text-right">
                                                    <Button size="sm" onClick={() => setSelectedNoti(noti)}>
                                                        Xem chi tiết
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Popup xem thông báo (giữ nguyên) */}
            {selectedNoti && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl relative">
                        <h2 className="text-xl font-bold mb-2">{selectedNoti.tieude}</h2>
                        
                        

                        {/* Người gửi */}
                        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                                **{renderSenderInfo(selectedNoti).role}**: {renderSenderInfo(selectedNoti).name}
                            </span>
                        </div>

                        {/* Nội dung */}
                        <p className="text-sm text-gray-700 whitespace-pre-line mb-4 border-l-4 border-blue-500 pl-3 py-1 bg-gray-50 rounded-sm">
                            {selectedNoti.noidung}
                        </p>

                        {/* Thời gian */}
                        <div className="text-xs text-gray-500 mb-6">
                            <Clock className="inline h-3 w-3 mr-1" />
                            Gửi lúc: {new Date(selectedNoti.thoigiangui).toLocaleString("vi-VN")}
                        </div>

                        <Button className="w-full" onClick={() => setSelectedNoti(null)}>
                            Đóng
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}