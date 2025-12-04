import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Input } from "@/components/ui/input";
import {
    Users,
    UserCheck,
    Clock,
    PlusCircle,
    FilePenLine,
    Trash2,
    Search,
    Loader2,
    XCircle,
    RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Giả định component AddEntityDialog đã được định nghĩa
import AddEntityDialog from "@/components/AddEntityDialog"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";

// --- CẤU HÌNH API ---
const API_BASE_URL = "http://localhost:5001/schoolbus/admin";
const PARENTS_ENDPOINT = `${API_BASE_URL}/get-all-parents`;
const ADD_PARENT_ENDPOINT = `${API_BASE_URL}/add-parent`;
const UPDATE_PARENT_ENDPOINT = `${API_BASE_URL}/update-parent`; // ✅ KHÔNG CÓ ID TRONG URL
const DELETE_PARENT_ENDPOINT = `${API_BASE_URL}/delete-parent`;
const MAX_RETRIES = 3;
const AVATAR_BASE_URL = "http://localhost:5001";

/**
 * Maps the numeric status code from the API to a display string.
 */
const mapStatus = (code) => {
    switch (code) {
        case 1: return "Chờ duyệt";
        case 2: return "Hoạt động";
        case 3: return "Ngưng hoạt động";
        case -1: return "Đã xóa mềm"; // Bổ sung trạng thái xóa mềm
        default: return "Không rõ";
    }
};

/**
 * Maps the display string to numeric status code for API
 */
const STATUS_STRING_TO_CODE = {
    "Chờ duyệt": 1,
    "Hoạt động": 2,
    "Ngưng hoạt động": 3,
};

const PARENT_FIELDS = [
    { name: "hoten", label: "Họ và tên", type: "text", placeholder: "Nguyễn Văn A", required: true },
    { name: "sodienthoai", label: "Số điện thoại", type: "tel", placeholder: "0987654321", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "a.nguyen@gmail.com", required: true },
    // Mật khẩu bắt buộc khi thêm, không bắt buộc khi sửa
    { name: "matkhau", label: "Mật khẩu", type: "password", placeholder: "Tối thiểu 6 ký tự", required: true }, 
    { name: "diachi", label: "Địa chỉ", type: "text", placeholder: "123 đường ABC, Quận XYZ", required: false, fullWidth: true },
    {
        name: "trangthai",
        label: "Trạng thái tài khoản",
        type: "select",
        options: ["Chờ duyệt", "Hoạt động", "Ngưng hoạt động"],
        defaultValue: "Chờ duyệt",
        required: true,
    },
    { name: "anhdaidien", label: "Ảnh đại diện", type: "file", accept: "image/*", required: false, fullWidth: true },
];

export default function ParentsPage() {
    const [parentsData, setParentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingParent, setEditingParent] = useState(null);
    const [deleteParentId, setDeleteParentId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const getInitials = (fullName) =>
        fullName
            ? fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)
            : "PH";

    // ===== Fetch danh sách phụ huynh =====
    const fetchParentsData = useCallback(async (retryCount = 0) => {
        setLoading(true);
        setError(null);

        const delay = Math.pow(2, retryCount) * 1000;
        if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Không tìm thấy token");
                setLoading(false);
                return;
            }

            const res = await axios.get(PARENTS_ENDPOINT, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Endpoint get-all-parents đã được thiết lập để loại trừ trạng thái -1 ở backend
            const parentsList = Array.isArray(res.data.parents) ? res.data.parents : [];

            const processedList = parentsList.map(parent => {
                const userInfo = parent.userInfo || {};
                const displayStatus = mapStatus(userInfo.trangthai);

                // Xử lý đường dẫn ảnh
                const avatarUrl = userInfo.anhdaidien
                    ? userInfo.anhdaidien.startsWith("http")
                        ? userInfo.anhdaidien
                        : `${AVATAR_BASE_URL}${userInfo.anhdaidien}`
                    : null;

                return {
                    id: parent.idphuhuynh,
                    name: userInfo.hoten || "Phụ huynh chưa đặt tên",
                    avatar: avatarUrl,
                    phone: userInfo.sodienthoai || "N/A",
                    email: userInfo.email || "N/A",
                    address: parent.diachi || "Chưa cập nhật",
                    status: displayStatus,
                    statusCode: userInfo.trangthai,
                };
            });

            setParentsData(processedList);
        } catch (err) {
            console.error("❌ Lỗi lấy phụ huynh:", err);
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying fetch... Attempt ${retryCount + 1}`);
                fetchParentsData(retryCount + 1);
            } else {
                setError("Không thể kết nối đến API. Vui lòng kiểm tra server!");
                toast.error("🚫 Không thể tải danh sách phụ huynh!");
            }
        } finally {
            if (retryCount === 0 || retryCount === MAX_RETRIES) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchParentsData();
    }, [fetchParentsData]);

    // ===== Lọc dữ liệu theo tìm kiếm =====
    const filteredParents = useMemo(() => {
        if (!searchTerm) return parentsData;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return parentsData.filter(parent =>
            parent.name.toLowerCase().includes(lowerCaseSearch) ||
            parent.phone.includes(searchTerm) ||
            (parent.email && parent.email.toLowerCase().includes(lowerCaseSearch)) ||
            parent.status.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchTerm, parentsData]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "Hoạt động":
                return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
            case "Chờ duyệt":
                return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
            case "Ngưng hoạt động":
                return <Badge className="bg-red-100 text-red-800">Ngưng hoạt động</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-500">Không rõ</Badge>;
        }
    };

    const stats = useMemo(() => ({
        total: parentsData.length,
        active: parentsData.filter((p) => p.status === "Hoạt động").length,
        pending: parentsData.filter((p) => p.status === "Chờ duyệt").length,
    }), [parentsData]);

    // ===== API Thêm phụ huynh =====
    const handleAddParent = async (newParentData) => {
        setIsSubmitting(true);

        const fd = new FormData();

        const processedData = {
            ...newParentData,
            trangthai: STATUS_STRING_TO_CODE[newParentData.trangthai] !== undefined ? STATUS_STRING_TO_CODE[newParentData.trangthai] : newParentData.trangthai,
        };

        for (const key in processedData) {
            if (Object.prototype.hasOwnProperty.call(processedData, key)) {
                const value = processedData[key];
                if (key === "anhdaidien" && value instanceof File) {
                    fd.append(key, value, value.name);
                } else if (value !== null && value !== undefined && value !== "") {
                    fd.append(key, value);
                }
            }
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(ADD_PARENT_ENDPOINT, fd, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    // Khi gửi FormData có file, trình duyệt tự đặt Content-Type
                }, 
            });

            toast.success("🎉 Thêm phụ huynh thành công!");
            setIsDialogOpen(false);
            await fetchParentsData();
        } catch (err) {
            console.error("❌ Lỗi thêm phụ huynh:", err);
            const message = err.response?.data?.message || "Lỗi không xác định!";
            toast.error(`🚫 ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ===== API Cập nhật phụ huynh =====
    const handleUpdateParent = async (updatedParentData) => {
        setIsSubmitting(true);

        const fd = new FormData();
        const parentId = updatedParentData.id;

        const dataToSend = { ...updatedParentData };
        // Chỉ gửi mật khẩu nếu có nhập (tức là không phải chuỗi rỗng)
        if (dataToSend.matkhau === "") {
            delete dataToSend.matkhau;
        }

        const processedData = {
            ...dataToSend,
            trangthai: STATUS_STRING_TO_CODE[dataToSend.trangthai] !== undefined ? STATUS_STRING_TO_CODE[dataToSend.trangthai] : dataToSend.trangthai,
        };

        for (const key in processedData) {
            if (Object.prototype.hasOwnProperty.call(processedData, key)) {
                const value = processedData[key];
                
                // 1. Xử lý File mới (Multer)
                if (key === "anhdaidien" && value instanceof File) {
                    fd.append(key, value, value.name);
                } 
                // 2. Xử lý đường dẫn ảnh cũ (chuỗi)
                else if (key === "anhdaidien" && typeof value === "string" && value.trim() !== "") {
                    // Gửi đường dẫn ảnh cũ lên, bao gồm cả URL tuyệt đối nếu có
                    fd.append(key, value); 
                } 
                // 3. Xử lý các trường dữ liệu khác
                else if (key !== "anhdaidien" && value !== null && value !== undefined) {
                    fd.append(key, value);
                }
            }
        }

        // Truyền ID phụ huynh qua body (FormData) để backend sử dụng
        fd.append("idphuhuynh", parentId); 

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                UPDATE_PARENT_ENDPOINT, // ✅ ĐÃ SỬA: Dùng endpoint gốc /update-parent, không có ID trong URL
                fd,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("✅ Cập nhật phụ huynh thành công!");
            setIsDialogOpen(false);
            setEditingParent(null);
            await fetchParentsData();
        } catch (err) {
            console.error("❌ Lỗi cập nhật phụ huynh:", err);
            const message = err.response?.data?.message || "Cập nhật thất bại!";
            toast.error(`🚫 ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ===== API Xóa phụ huynh (Xóa mềm: trạng thái = -1) =====
    const handleDeleteParent = async () => {
        if (!deleteParentId) return;

        setDeletingId(deleteParentId);

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${DELETE_PARENT_ENDPOINT}/${deleteParentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("🗑️ Xóa mềm phụ huynh thành công!");
            setIsDeleteDialogOpen(false);
            setDeleteParentId(null);
            await fetchParentsData();
        } catch (err) {
            console.error("❌ Lỗi xóa phụ huynh:", err);
            const message = err.response?.data?.message || "Xóa thất bại!";
            toast.error(`🚫 ${message}`);
        } finally {
            setDeletingId(null);
        }
    };

    // ===== Mở dialog sửa =====
    const handleEditClick = (parent) => {
        const initialDataForEdit = {
            id: parent.id, // ID gốc của phụ huynh (cho mục đích PUT request)
            hoten: parent.name,
            matkhau: "", // Để trống, không bắt buộc nhập lại
            sodienthoai: parent.phone,
            email: parent.email,
            diachi: parent.address,
            trangthai: parent.status,
            anhdaidien: parent.avatar, // Lưu đường dẫn ảnh hiện tại
        };

        setEditingParent(initialDataForEdit);
        setIsDialogOpen(true);
    };

    // Dynamic fields (mật khẩu không bắt buộc khi sửa)
    const dynamicFields = useMemo(() => {
        const isEditMode = !!editingParent;
        return PARENT_FIELDS.map(field =>
            field.name === "matkhau" && isEditMode
                ? { ...field, required: false }
                : field
        );
    }, [editingParent]);

    return (
        <div className="space-y-6">
            {/* Thống kê */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Phụ huynh</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">phụ huynh trong hệ thống</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">đã xác minh và sử dụng</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">yêu cầu đăng ký mới</p>
                    </CardContent>
                </Card>
            </div>

            {/* Danh sách phụ huynh */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle>Danh sách Phụ huynh ({filteredParents.length} / {stats.total})</CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchParentsData(0)}
                                disabled={loading || isSubmitting || deletingId}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                    setIsDialogOpen(true);
                                    setEditingParent(null);
                                }}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Thêm phụ huynh mới
                            </Button>
                        </div>
                    </div>

                    {/* Thanh tìm kiếm */}
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo Tên, SĐT, Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Loading / Error / Data Table */}
                    <div className="overflow-x-auto min-h-[200px] relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                                <Loader2 className="h-8 w-8 text-[#175e7a] animate-spin" />
                                <span className="ml-3 text-lg font-medium text-gray-600">Đang tải dữ liệu...</span>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="flex flex-col items-center justify-center py-10 bg-red-50 border border-red-200 rounded-lg">
                                <XCircle className="h-8 w-8 text-red-600 mb-3" />
                                <p className="text-red-700 text-center font-medium px-4">{error}</p>
                                <Button onClick={() => fetchParentsData(0)} className="mt-4 bg-red-600 hover:bg-red-700">Thử lại</Button>
                            </div>
                        )}

                        {!loading && !error && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Thông tin Phụ huynh</TableHead>
                                        <TableHead>Liên hệ</TableHead>
                                        <TableHead>Địa chỉ</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredParents.length > 0 ? (
                                        filteredParents.map((parent) => (
                                            <TableRow key={parent.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage
                                                                src={parent.avatar}
                                                                alt={parent.name}
                                                            />
                                                            <AvatarFallback className="bg-gray-200 text-gray-800">
                                                                {getInitials(parent.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{parent.name}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span>{parent.phone}</span>
                                                        <span className="text-muted-foreground">{parent.email}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-sm text-gray-600">
                                                    {parent.address}
                                                </TableCell>

                                                <TableCell>
                                                    {getStatusBadge(parent.status)}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="hover:bg-blue-100 text-blue-600 border-blue-200"
                                                            onClick={() => handleEditClick(parent)}
                                                            disabled={isSubmitting || deletingId}
                                                        >
                                                            <FilePenLine className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                                            onClick={() => {
                                                                setDeleteParentId(parent.id);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                            disabled={deletingId === parent.id || isSubmitting}
                                                        >
                                                            {deletingId === parent.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                                {searchTerm ? `Không tìm thấy phụ huynh nào phù hợp với từ khóa "${searchTerm}".` : "Chưa có phụ huynh nào trong hệ thống."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* === Dialog Thêm/Sửa Phụ huynh === */}
            <AddEntityDialog
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingParent(null);
                }}
                title={editingParent ? "Chỉnh Sửa Phụ Huynh" : "Thêm Phụ Huynh Mới"}
                description={editingParent
                    ? `Cập nhật thông tin phụ huynh ${editingParent.hoten}.`
                    : "Nhập thông tin chi tiết của phụ huynh để thêm vào hệ thống."
                }
                fields={dynamicFields}
                onSubmit={editingParent ? handleUpdateParent : handleAddParent}
                initialData={editingParent}
                submitButtonText={
                    isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...</>
                    ) : (
                        editingParent ? "Cập Nhật" : "Thêm Phụ Huynh"
                    )
                }
                accentColor={editingParent ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                isSubmitting={isSubmitting}
            />

            {/* === Dialog Xác nhận Xóa === */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] bg-white">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Bạn có chắc chắn muốn xóa mềm (vô hiệu hóa) phụ huynh này không? Tài khoản sẽ được chuyển sang trạng thái "Đã xóa mềm" (-1).
                    </div>
                    <DialogFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deletingId}
                        >
                            Hủy
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteParent}
                            disabled={deletingId}
                        >
                            {deletingId ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xóa...</>
                            ) : (
                                "Xác nhận Xóa mềm"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}