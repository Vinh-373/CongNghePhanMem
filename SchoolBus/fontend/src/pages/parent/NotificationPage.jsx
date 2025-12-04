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
import {
    Bell,
    Send,
    Users,
    Clock,
    MessageSquare,
    Loader2,
    User,
    Car,
    MapPin,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5001/schoolbus/user";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedNoti, setSelectedNoti] = useState(null);

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
        if (noti.loai === 1) return { label: "Báo cáo sự cố", icon: AlertCircle };
        return { label: "Thông báo thường", icon: MessageSquare };
    };

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
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Đang tải...
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-8">{error}</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">Không có thông báo nào</div>
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
                                    {notifications.map((noti) => {
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
                                                                                                                {noti.NguoiDung?.vaitro === 0 ? "Admin" : noti.NguoiDung?.vaitro === 1 ? "Tài xế" : "Phụ huynh"}
                                                                                                            </span>
                                                                                                            <span className="text-muted-foreground">{noti.NguoiDung?.hoten || "N/A"}</span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </TableCell>

                                                {/* Loại */}
                                                <TableCell>
                                                    <Badge className={noti.loai === 1 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-2">{selectedNoti.tieude}</h2>
                        <p className="text-sm text-gray-700 whitespace-pre-line mb-4">
                            {selectedNoti.noidung}
                        </p>

                        <div className="text-xs text-gray-500 mb-4">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {new Date(selectedNoti.thoigiangui).toLocaleString("vi-VN")}
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
