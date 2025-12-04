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
    PlusCircle,
    FilePenLine,
    Trash2,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    Loader2,
    User,
    Car,
    MapPin,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import AddEntityDialog from "@/components/AddEntityDialog"; // ✅ Import component thực

const API_BASE_URL = "http://localhost:5001/schoolbus/admin";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchNotifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/get-all-notification`);
            if (!res.ok) throw new Error("Lỗi tải dữ liệu.");
            const data = await res.json();
            setNotifications(data.notifications || []);
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

    // ===== HÀM HỖ TRỢ =====

    // Xác định loại thông báo
    const getNotificationType = (noti) => {
        if (noti.loai === 1) return { label: "Báo cáo sự cố", icon: AlertCircle };
        return { label: "Thông báo thường", icon: MessageSquare };
    };

    // Xác định người nhận với xuống dòng
    const getRecipientLabel = (noti) => {
        if (noti.idvaitro === 0) {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Tất cả</span>
                    <span className="text-xs opacity-75">Người dùng</span>
                </div>
            );
        }
        if (noti.idvaitro === 1) {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Tất cả</span>
                    <span className="text-xs opacity-75">Tài xế</span>
                </div>
            );
        }
        if (noti.idvaitro === 2) {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Tất cả</span>
                    <span className="text-xs opacity-75">Phụ huynh</span>
                </div>
            );
        }

        if (noti.taixe) {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Tài xế</span>
                    <span className="text-xs opacity-75">{noti.taixe.userInfo?.hoten || 'N/A'}</span>
                </div>
            );
        }
        if (noti.phuhuynh) {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Phụ huynh</span>
                    <span className="text-xs opacity-75">{noti.phuhuynh.userInfo?.hoten || 'N/A'}</span>
                </div>
            );
        }
        if (noti.lichchuyen) {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Chuyến</span>
                    <span className="text-xs opacity-75">{noti.lichchuyen.tuyenDuongInfo?.tentuyen || 'N/A'}</span>
                </div>
            );
        }

        return <span className="font-medium">Hệ thống</span>;
    };

    // Lấy icon người nhận
    const getRecipientIcon = (noti) => {
        if (noti.idvaitro === 2 || noti.idvaitro === 0) return Users;
        if (noti.idvaitro === 1) return Car;
        if (noti.taixe) return Car;
        if (noti.phuhuynh) return Users;
        if (noti.lich) return MapPin;
        return Bell;
    };

    // Xác định trạng thái
    const getStatusBadge = (trangthai) => {
        switch (trangthai) {
            case 1:
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Đã gửi</Badge>;
            case 0:
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Đang chờ</Badge>;
            default:
                return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Thất bại</Badge>;
        }
    };

    // Tính thống kê
    const stats = useMemo(() => {
        if (isLoading) return { total: 0, sent: 0, failed: 0 };
        return {
            total: notifications.length,
            sent: notifications.filter(n => n.trangthai === 1).length,
            failed: notifications.filter(n => n.trangthai !== 1).length,
        };
    }, [notifications, isLoading]);

    // ===== XỬ LÝ DIALOG =====

    const handleOpenDialog = (noti = null) => {
        setEditData(noti);
        setIsDialogOpen(true);
    };

    const determineVaitro = (idPhuhuynh, idTaixe, idLich) => {
    // Convert thành số, nếu không có value (undefined/null/"") thì dùng null
    const ph = idPhuhuynh ? parseInt(idPhuhuynh) : null;
    const tx = idTaixe ? parseInt(idTaixe) : null;
    const lich = idLich ? parseInt(idLich) : null;

    console.log("🔍 determineVaitro input:", { ph, tx, lich });

    // Nếu có lịch chuyến -> không xác định vaitro (đặc biệt)
    if (lich !== null) {
        return { vaitro: null, ph: null, tx: null, lich };
    }

    // Cả hai phụ huynh và tài xế đều = 0 -> toàn hệ thống (vaitro = 2)
    if (ph === 0 && tx === 0) {
        return { vaitro: "0", ph: null, tx: null, lich: null };
    }

    // Phụ huynh = 0 (tất cả phụ huynh) - tài xế bị xóa hoặc không chọn
    if (ph === 0 && (tx === null || tx === undefined)) {
        return { vaitro: "2", ph: null, tx: null, lich: null };
    }

    // Tài xế = 0 (tất cả tài xế) - phụ huynh bị xóa hoặc không chọn
    if (tx === 0 && (ph === null || ph === undefined)) {
        return { vaitro: "1", ph: null, tx: null, lich: null };
    }

    // Phụ huynh có ID cụ thể
    if (ph !== null && ph !== 0) {
        return { vaitro: null, ph, tx: null, lich: null };
    }

    // Tài xế có ID cụ thể
    if (tx !== null && tx !== 0) {
        return { vaitro: null, ph: null, tx, lich: null };
    }

    // Không xác định được
    return { vaitro: "-1", ph: null, tx: null, lich: null };
};

const handleSubmitDialog = async (data) => {
    try {
        // // Xóa fields rỗng TRƯỚC khi xử lý
        // if(data.idlichchuyen === "" || data.idlichchuyen === null) delete data.idlichchuyen;
        // if(data.idphuhuynh === "" || data.idphuhuynh === null) delete data.idphuhuynh;
        // if(data.idtaixe === "" || data.idtaixe === null) delete data.idtaixe;

        // console.log("📝 Data sau khi xóa empty:", data);

        // Xác định idvaitro dựa trên những field còn lại
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            console.warn("⚠️ Không tìm thấy user trong localStorage");
            return null;
        }
        const user = JSON.parse(userStr);
data.idnguoigui = parseInt(user.id) || null; // Nếu không có, set null
        const result = determineVaitro(data.idphuhuynh, data.idtaixe, data.idlich);
        
        console.log("🎯 Vaitro result:", result);

        // Gán giá trị vào data
        if (result.vaitro !== null && result.vaitro !== undefined) {
            data.idvaitro = result.vaitro;
        }
        data.idphuhuynh = result.ph;
        data.idtaixe = result.tx;
        data.idlich = result.lich;

        console.log("✅ Final data to send:", data);

        let url = `${API_BASE_URL}/add-notification`;
        let method = "POST";

        if (editData) {
            url = `${API_BASE_URL}/update-notification/${editData.idthongbao}`;
            method = "PUT";
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Lỗi lưu dữ liệu");

        toast.success(editData ? "Cập nhật thông báo thành công" : "Tạo thông báo thành công");
        setIsDialogOpen(false);
        fetchNotifications();
    } catch (err) {
        console.error(err);
        toast.error(err.message || "Lỗi");
    }
};

    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/delete-notification/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Xóa thất bại");
            toast.success("Xóa thông báo thành công");
            fetchNotifications();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Lỗi xóa");
        }
    };

    // ===== CẤU HÌNH FIELDS =====

    const fields = [
        { name: "tieude", label: "Tiêu đề", type: "text", required: true, placeholder: "Nhập tiêu đề" },
        { name: "noidung", label: "Nội dung", type: "text", required: true, placeholder: "Nhập nội dung" },
        {
            name: "idphuhuynh", label: "Phụ huynh nhận", type: "text", 
            
            required: false,
            placeholder: "Nhập 0 để gửi tất cả"
        },
        {
            name: "idtaixe", label: "Tài xế nhận", type: "text", 
            
            required: false,
            placeholder: "Nhập 0 để gửi tất cả"
        },
        {
            name: "idlich", label: "Chuyến đi nhận", type: "text", 
            
            required: false,
            placeholder: "nhập id lịch chuyến"
        },
        {
            name: "loai", label: "Loại thông báo", type: "select", 
            options: [
                { value: 0, label: "Thông báo thường" },
                { value: 1, label: "Báo cáo sự cố" },
            ], 
            required: true,
            placeholder: "Chọn loại"
        },
        {
            name: "trangthai", label: "Trạng thái", type: "select", 
            options: [
                { value: 0, label: "Đang chờ" },
                { value: 1, label: "Đã gửi" },
                { value: -1, label: "Thất bại" },
            ], 
            required: true,
            placeholder: "Chọn trạng thái"
        },
    ];

    // ===== RENDER =====

    return (
        <div className="space-y-6 p-6">
            {/* Thẻ thống kê */}
            <div className="grid gap-4 md:grid-cols-3">
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
                <Card>
                    <CardHeader className="flex justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Đã gửi thành công</CardTitle>
                        <Send className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : stats.sent}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Thất bại/Lỗi</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : stats.failed}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bảng thông báo */}
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Danh sách Thông báo ({stats.total})</CardTitle>
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tạo thông báo mới
                    </Button>
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
                        <div className="text-gray-500 text-center py-8">Hiện tại không có thông báo nào</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tiêu đề</TableHead>
                                        <TableHead>Người gửi</TableHead>
                                        <TableHead>Đối tượng nhận</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Thời gian gửi</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notifications.map(noti => {
                                        const typeInfo = getNotificationType(noti);
                                        const TypeIcon = typeInfo.icon;
                                        const RecipientIcon = getRecipientIcon(noti);

                                        return (
                                            <TableRow key={noti.idthongbao}>
                                                {/* Tiêu đề */}
                                                <TableCell className="font-medium max-w-xs">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                        <span className="truncate">{noti.tieude}</span>
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

                                                {/* Đối tượng nhận */}
                                                <TableCell>
                                                    <Badge className="bg-blue-100 text-blue-800 flex items-start gap-2 h-auto py-1.5 px-2">
                                                        <RecipientIcon className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                                        {getRecipientLabel(noti)}
                                                    </Badge>
                                                </TableCell>

                                                {/* Loại thông báo */}
                                                <TableCell>
                                                    <Badge className={noti.loai === 1 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
                                                        <TypeIcon className="h-3 w-3 mr-1" />
                                                        {typeInfo.label}
                                                    </Badge>
                                                </TableCell>

                                                {/* Thời gian gửi */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                                                        <Clock className="h-4 w-4" />
                                                        {new Date(noti.thoigiangui).toLocaleString('vi-VN')}
                                                    </div>
                                                </TableCell>

                                                {/* Trạng thái */}
                                                <TableCell>{getStatusBadge(noti.trangthai)}</TableCell>

                                                {/* Hành động */}
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="outline" title="Sửa" onClick={() => handleOpenDialog(noti)}>
                                                            <FilePenLine className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="outline" className="text-red-600 hover:bg-red-100" title="Xóa" onClick={() => handleDelete(noti.idthongbao)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
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

            {/* Dialog Thêm/Sửa */}
            <AddEntityDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={editData ? "Sửa Thông báo" : "Tạo Thông báo mới"}
                description="Điền thông tin thông báo"
                fields={fields}
                initialData={editData}
                onSubmit={handleSubmitDialog}
            />
        </div>
    );
}