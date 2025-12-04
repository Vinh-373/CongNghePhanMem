import React, { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input"; // Thêm Input component
import {
    Bell,
    Search, // Thêm icon Search
    Clock,
    MessageSquare,
    Loader2,
    User,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5001/schoolbus/user";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedNoti, setSelectedNoti] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // State cho từ khóa tìm kiếm

    const fetchNotifications = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE_URL}/get-all-notification`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Lỗi tải dữ liệu.");
            const data = await res.json();
            setNotifications(data || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error("Không thể tải thông báo");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Loại thông báo
    const getNotificationType = (noti) => {
        if (noti.loai === 1) return { label: "Báo cáo sự cố", icon: AlertCircle, className: "bg-red-100 text-red-800 hover:bg-red-200" };
        return { label: "Thông báo thường", icon: MessageSquare, className: "bg-blue-100 text-blue-800 hover:bg-blue-200" };
    };

    // Lọc thông báo dựa trên từ khóa tìm kiếm
    const filteredNotifications = useMemo(() => {
        if (!searchTerm) return notifications;

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return notifications.filter((noti) => {
            // Tìm kiếm trong Tiêu đề (tieude)
            const titleMatch = noti.tieude && noti.tieude.toLowerCase().includes(lowerCaseSearchTerm);

            // Tìm kiếm trong Nội dung (noidung)
            const contentMatch = noti.noidung && noti.noidung.toLowerCase().includes(lowerCaseSearchTerm);
            
            // Tìm kiếm trong tên người gửi (nếu có)
            const senderMatch = noti.NguoiDung && noti.NguoiDung.hoten && noti.NguoiDung.hoten.toLowerCase().includes(lowerCaseSearchTerm);

            return titleMatch || contentMatch || senderMatch;
        });
    }, [notifications, searchTerm]);

    const stats = useMemo(() => {
        if (isLoading) return { total: 0 };
        return {
            total: notifications.length,
        };
    }, [notifications, isLoading]);

    return (
        <div className="space-y-6 p-6">

            {/* Thẻ thống kê */}
            <Card>
                <CardHeader className="flex justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Tổng số Thông báo</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : stats.total}
                    </div>
                </CardContent>
            </Card>

            {/* Danh sách thông báo */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách thông báo</CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Thanh tìm kiếm */}
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, nội dung, hoặc người gửi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                            disabled={isLoading}
                        />
                    </div>
                    {/* Kết thúc Thanh tìm kiếm */}

                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Đang tải...
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-8">{error}</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            {searchTerm ? "Không tìm thấy thông báo nào phù hợp." : "Không có thông báo nào"}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tiêu đề</TableHead>
                                        <TableHead>Người gửi</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Thời gian gửi</TableHead>
                                        <TableHead className="text-right">Xem</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredNotifications.map((noti) => {
                                        const typeInfo = getNotificationType(noti);
                                        const TypeIcon = typeInfo.icon;

                                        return (
                                            <TableRow key={noti.idthongbao}>
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
                                                                {noti.NguoiDung
                                                                    ? (noti.NguoiDung.vaitro === 0
                                                                        ? "Admin"
                                                                        : noti.NguoiDung.vaitro === 1
                                                                            ? "Tài xế"
                                                                            : "Phụ huynh")
                                                                    : "Hệ thống"}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {noti.NguoiDung
                                                                    ? (noti.NguoiDung.hoten || "N/A")
                                                                    : "Thông báo tự động"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Loại */}
                                                <TableCell>
                                                    <Badge className={typeInfo.className}>
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

            {/* Popup xem thông báo */}
            {selectedNoti && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3 border-b pb-2">
                            <h2 className="text-xl font-bold">{selectedNoti.tieude}</h2>
                            <Badge className={getNotificationType(selectedNoti).className}>
                                <TypeIcon className="h-3 w-3 mr-1" />
                                {getNotificationType(selectedNoti).label}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line mb-4">
                            {selectedNoti.noidung}
                        </p>

                        <div className="text-xs text-gray-500 mb-4 border-t pt-2">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="inline h-3 w-3" />
                                <span>
                                    Người gửi: **
                                    {selectedNoti.NguoiDung
                                        ? (selectedNoti.NguoiDung.hoten || "N/A")
                                        : "Thông báo tự động (Hệ thống)"}
                                    **
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="inline h-3 w-3" />
                                <span>Thời gian: {new Date(selectedNoti.thoigiangui).toLocaleString("vi-VN")}</span>
                            </div>
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