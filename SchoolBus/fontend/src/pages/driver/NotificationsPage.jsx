import { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Info, AlertTriangle, BusFront } from "lucide-react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [expandedId, setExpandedId] = useState(null); // Thông báo mở chi tiết
    const userId = localStorage.getItem("idnguoidung");


    const API_GET_NOTIFICATIONS =
        "http://localhost:5001/schoolbus/driver/notification";

    const fetchNotifications = async () => {
        try {
            
            const res = await axios.get(`${API_GET_NOTIFICATIONS}/${userId}`);
            setNotifications(res.data.data || []);
        } catch (err) {
            console.error("Lỗi tải thông báo:", err);
        }
    };

    useEffect(() => {
        if (userId) fetchNotifications();
    }, [userId]);

    return (
        <div className="space-y-2">
            {notifications.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    Chưa có thông báo nào.
                </div>
            ) : (
                notifications.map((noti) => (
                    <Card
                        key={noti.idthongbao}
                        className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        onClick={() =>
                            setExpandedId(expandedId === noti.idthongbao ? null : noti.idthongbao)
                        }
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">{noti.tieude}</h3>
                                <span className="text-gray-400 text-sm">
                                    {new Date(noti.thoigiangui).toLocaleString("vi-VN")}
                                </span>
                            </div>

                            {expandedId === noti.idthongbao && (
                                <div className="mt-2 text-gray-700 border-t pt-2">
                                    {noti.noidung}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
