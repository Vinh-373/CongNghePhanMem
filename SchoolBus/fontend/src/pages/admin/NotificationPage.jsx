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
import { Input } from "@/components/ui/input"; // ✅ Import Input
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
    AlertCircle,
    Search, // ✅ Import Search
} from "lucide-react";
import { toast } from "sonner";
import AddEntityDialog from "@/components/AddEntityDialog"; 

const API_BASE_URL = "http://localhost:5001/schoolbus/admin";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // ✅ Thêm state tìm kiếm

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

    // ✅ Logic lọc danh sách (thêm mới)
    const filteredNotifications = useMemo(() => {
        if (!searchTerm) return notifications;
        // Chuẩn hóa và chuyển đổi sang chữ thường để tìm kiếm không dấu
        const lowerCaseSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
        
        return notifications.filter(noti =>
            noti.tieude.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lowerCaseSearchTerm) ||
            noti.noidung.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lowerCaseSearchTerm)
        );
    }, [notifications, searchTerm]);

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

    // Nếu có lịch chuyến -> không xác định vaitro (đặc biệt)
    if (lich !== null) {
        return { vaitro: null, ph: null, tx: null, lich };
    }

    // Cả hai phụ huynh và tài xế đều = 0 -> toàn hệ thống (vaitro = 0)
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
        // Xóa các trường trống không cần thiết trước khi xử lý
        // Dùng giá trị null/"" làm giá trị không hợp lệ (không chọn)
        const processData = { ...data };
        for (const key of ['idphuhuynh', 'idtaixe', 'idlich']) {
             // Chuyển đổi chuỗi rỗng thành null
            if (processData[key] === "") {
                processData[key] = null;
            }
        }
        
        // Lấy id người gửi từ localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            toast.error("Lỗi: Không tìm thấy thông tin người dùng!");
            return;
        }
        const user = JSON.parse(userStr);
        processData.idnguoigui = parseInt(user.id) || null;

        // Xác định idvaitro dựa trên những field còn lại
        const result = determineVaitro(processData.idphuhuynh, processData.idtaixe, processData.idlich);

        // Gán giá trị đã chuẩn hóa vào data
        if (result.vaitro !== null && result.vaitro !== undefined) {
            processData.idvaitro = result.vaitro;
        } else {
             // Nếu không có vai trò chung, xóa idvaitro
            delete processData.idvaitro;
        }
        processData.idphuhuynh = result.ph;
        processData.idtaixe = result.tx;
        processData.idlich = result.lich;
        
        // Xóa idlichchuyen cũ (nếu có) và dùng idlich mới
        if (processData.idlichchuyen) delete processData.idlichchuyen;

        let url = `${API_BASE_URL}/add-notification`;
        let method = "POST";

        if (editData) {
            url = `${API_BASE_URL}/update-notification/${editData.idthongbao}`;
            method = "PUT";
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(processData),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Lỗi lưu dữ liệu");
        }

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
            name: "idphuhuynh", label: "ID Phụ huynh nhận", type: "text", 
            hint: "Để trống nếu gửi toàn bộ Tài xế hoặc Chuyến. Nhập ID cụ thể, hoặc 0 để gửi tất cả Phụ huynh.",
            required: false,
            placeholder: "ID phụ huynh (hoặc 0/trống)"
        },
        {
            name: "idtaixe", label: "ID Tài xế nhận", type: "text", 
            hint: "Để trống nếu gửi toàn bộ Phụ huynh hoặc Chuyến. Nhập ID cụ thể, hoặc 0 để gửi tất cả Tài xế.",
            required: false,
            placeholder: "ID tài xế (hoặc 0/trống)"
        },
        {
            name: "idlich", label: "ID Lịch chuyến nhận", type: "text", 
            hint: "Nếu điền, chỉ gửi cho người liên quan đến lịch chuyến này. Ưu tiên hơn ID Tài xế/Phụ huynh.",
            required: false,
            placeholder: "ID lịch chuyến"
        },
        {
            name: "loai", label: "Loại thông báo", type: "select", 
            options: [
                { value: 0, label: "Thông báo thường" },
                { value: 1, label: "Báo cáo sự cố" },
            ], 
            required: true,
            placeholder: "Chọn loại",
            defaultValue: editData ? editData.loai : 0, // Set default value
        },
        {
            name: "trangthai", label: "Trạng thái", type: "select", 
            options: [
                { value: 0, label: "Đang chờ" },
                { value: 1, label: "Đã gửi" },
                { value: -1, label: "Thất bại" },
            ], 
            required: true,
            placeholder: "Chọn trạng thái",
            defaultValue: editData ? editData.trangthai : 0, // Set default value
        },
    ];

    // ===== RENDER =====

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Quản lý Thông báo</h1>

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
                <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                        <CardTitle>Danh sách Thông báo ({filteredNotifications.length} / {stats.total})</CardTitle>
                        <Button onClick={() => handleOpenDialog(null)} className="bg-blue-500 hover:bg-blue-600">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tạo thông báo mới
                        </Button>
                    </div>

                    {/* ✅ Thanh tìm kiếm (Thêm mới) */}
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo Tiêu đề, Nội dung..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
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
                                    {filteredNotifications.length > 0 ? filteredNotifications.map(noti => { // ✅ Sử dụng filteredNotifications
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
                                                                {/* * KIỂM TRA ĐIỀU KIỆN: 
                 * 1. Nếu noti.NguoiDung TỒN TẠI: Dùng logic vai trò (vaitro)
                 * 2. Nếu noti.NguoiDung KHÔNG TỒN TẠI: Gán là "Hệ thống"
                 */}
                                                                {noti.NguoiDung
                                                                    ? (noti.NguoiDung.vaitro === 0
                                                                        ? "Admin"
                                                                        : noti.NguoiDung.vaitro === 1
                                                                            ? "Tài xế"
                                                                            : "Phụ huynh")
                                                                    : "Hệ thống"}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {/* Nếu là Hệ thống thì hiển thị text mô tả, nếu không thì hiển thị tên */}
                                                                {noti.NguoiDung
                                                                    ? (noti.NguoiDung.hoten || "N/A")
                                                                    : "Thông báo tự động"}
                                                            </span>
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
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                                                Không tìm thấy thông báo nào phù hợp với từ khóa "{searchTerm}".
                                            </TableCell>
                                        </TableRow>
                                    )}
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
                description="Điền thông tin thông báo và đối tượng nhận"
                fields={fields}
                initialData={editData}
                onSubmit={handleSubmitDialog}
            />
        </div>
    );
}