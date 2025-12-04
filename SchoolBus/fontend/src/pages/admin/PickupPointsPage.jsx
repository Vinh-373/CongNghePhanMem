// ===== IMPORTS =====
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import axios from "axios";

// Components UI từ Shadcn
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Icons
import {
    MapPin,
    Clock,
    PlusCircle,
    FilePenLine,
    Trash2,
    Search,
} from "lucide-react";

import AddEntityDialog from "@/components/AddEntityDialog";

// =====================================
// PAGE CHÍNH
// =====================================
export default function PickupPointsPage() {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Dialog thêm
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    
    // Dialog sửa
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPoint, setEditingPoint] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    // ===== CẤU HÌNH FORM ĐIỂM ĐÓN =====
    const PICKUP_POINT_FIELDS = [
        { name: 'tendiemdon', label: 'Tên điểm đón', type: 'text', placeholder: 'Điểm đón A', required: true },
        { name: 'diachi', label: 'Địa chỉ', type: 'text', placeholder: '123 Đường ABC, Quận 1, TP.HCM', required: true },
        { name: 'kinhdo', label: 'Kinh độ', type: 'text', placeholder: '106.6297', required: false },
        { name: 'vido', label: 'Vĩ độ', type: 'text', placeholder: '10.8231', required: false },
        { name: 'trangthai', label: 'Trạng thái', type: 'select', options: [{ value: "1", label: "Hoạt động" }, { value: "0", label: "Tạm dừng" }], defaultValue: "1", required: true },
    ];

    // ===== Fetch API LẤY DANH SÁCH ĐIỂM ĐÓN =====
    const fetchPickupPoints = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5001/schoolbus/admin/get-all-pickup-points");
            setPoints(res.data.pickupPoints || []);
            console.log("🚀 Điểm đón đã tải:", res.data.pickupPoints);
        } catch (err) {
            console.error("❌ Lỗi lấy điểm đón:", err);
            setError("Không thể tải danh sách điểm đón!");
            toast.error("🚫 Không thể tải danh sách điểm đón!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPickupPoints();
    }, []);

    // ===== XỬ LÝ THÊM ĐIỂM ĐÓN MỚI =====
    const handleAddPickupPoint = async (formData) => {
        try {
            // Convert trangthai to number
            const dataToSend = {
                ...formData,
                trangthai: Number(formData.trangthai)
            };

            const res = await axios.post("http://localhost:5001/schoolbus/admin/add-pickup-point", dataToSend);
            toast.success("✅ Thêm điểm đón thành công!");
            console.log("🚀 Điểm đón mới:", res.data);

            setPoints((prevPoints) => [...prevPoints, res.data.newPoint]);
            setIsAddDialogOpen(false);
        } catch (err) {
            console.error("❌ Lỗi thêm điểm đón:", err);
            toast.error(err.response?.data?.message || "🚫 Không thể thêm điểm đón!");
        }
    };

    // ===== XỬ LÝ SỬA ĐIỂM ĐÓN =====
    const handleUpdatePickupPoint = async (formData) => {
        try {
            if (!editingPoint) return;

            const dataToSend = {
                ...formData,
                trangthai: Number(formData.trangthai)
            };

            const res = await axios.put(
                `http://localhost:5001/schoolbus/admin/update-pickup-point/${editingPoint.iddiemdung}`,
                dataToSend
            );

            toast.success("✅ Cập nhật điểm đón thành công!");
            console.log("🚀 Điểm đón đã cập nhật:", res.data);

            // Cập nhật danh sách
            setPoints((prevPoints) =>
                prevPoints.map((p) =>
                    p.iddiemdung === editingPoint.iddiemdung ? res.data.pickupPoint : p
                )
            );

            setIsEditDialogOpen(false);
            setEditingPoint(null);
        } catch (err) {
            console.error("❌ Lỗi cập nhật điểm đón:", err);
            toast.error(err.response?.data?.message || "🚫 Không thể cập nhật điểm đón!");
        }
    };

    // ===== XỬ LÝ XÓA MỀM ĐIỂM ĐÓN =====
    const handleSoftDeletePickupPoint = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa mềm điểm đón "${name}" không?`)) {
            return;
        }

        try {
            const res = await axios.put(
                `http://localhost:5001/schoolbus/admin/delete-pickup-point/${id}`
            );

            toast.success("✅ Xóa mềm điểm đón thành công!");
            console.log("🚀 Điểm đón đã xóa mềm:", res.data);

            // Cập nhật danh sách
            setPoints((prevPoints) =>
                prevPoints.map((p) =>
                    p.iddiemdung === id ? { ...p, trangthai: -1 } : p
                )
            );
        } catch (err) {
            console.error("❌ Lỗi xóa mềm điểm đón:", err);
            toast.error(err.response?.data?.message || "🚫 Không thể xóa mềm điểm đón!");
        }
    };

    // ===== Hàm mở dialog sửa =====
    const handleEditClick = (point) => {
        setEditingPoint(point);
        setIsEditDialogOpen(true);
    };

    // ===== Chuẩn bị initialData cho dialog sửa =====
    const getInitialDataForEdit = (point) => {
        return {
            tendiemdon: point.tendiemdon || "",
            diachi: point.diachi || "",
            kinhdo: point.kinhdo || "",
            vido: point.vido || "",
            trangthai: String(point.trangthai) || "1",
        };
    };

    // ===== LỌC DANH SÁCH DỰA TRÊN SEARCH TERM =====
    const filteredPoints = useMemo(() => {
        if (!searchTerm) return points;

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return points.filter(point =>
            (point.tendiemdon && point.tendiemdon.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (point.diachi && point.diachi.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }, [points, searchTerm]);

    // ===== Badge theo trạng thái =====
    const getStatusBadge = (status) => {
        if (status === 1) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoạt động</Badge>;
        }
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Tạm dừng</Badge>;
    };

    // ===== Màn hình loading / lỗi =====
    if (loading) return <p className="text-gray-500">⏳ Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    // --- UI ---
    return (
        <div className="space-y-6">

            {/* === 1. THẺ TỔNG QUAN === */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số điểm đón</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{points.length}</div>
                        <p className="text-xs text-muted-foreground">điểm đang được quản lý</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
                        <MapPin className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{points.filter(p => p.trangthai === 1).length}</div>
                        <p className="text-xs text-muted-foreground">điểm đang đón học sinh</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tạm dừng</CardTitle>
                        <Clock className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{points.filter(p => p.trangthai === 0).length}</div>
                        <p className="text-xs text-muted-foreground">điểm không được sử dụng</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- PHÂN CÁCH --- */}
            <hr className="my-6" />

            {/* === 2. BẢNG ĐIỂM ĐÓN === */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle>Danh sách Điểm Đón ({filteredPoints.length} / {points.length})</CardTitle>
                        <Button
                            className="hover:bg-green-600 bg-green-500"
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm Điểm Đón mới
                        </Button>
                    </div>

                    {/* THANH TÌM KIẾM */}
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo Tên điểm đón hoặc Địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã</TableHead>
                                <TableHead>Tên Điểm Đón</TableHead>
                                <TableHead>Địa Chỉ Chi Tiết</TableHead>
                                <TableHead>Tọa Độ</TableHead>
                                <TableHead>Trạng Thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredPoints.length > 0 ? (
                                filteredPoints.map((point) => (
                                    <TableRow key={point.iddiemdung}>
                                        <TableCell className="font-medium">{point.iddiemdung}</TableCell>
                                        <TableCell className="font-medium">{point.tendiemdon}</TableCell>
                                        <TableCell className="text-sm">{point.diachi}</TableCell>
                                        <TableCell className="text-xs">
                                            K: {point.kinhdo || 'N/A'} <br /> V: {point.vido || 'N/A'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(point.trangthai)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* NÚT SỬA */}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="hover:bg-blue-100"
                                                    onClick={() => handleEditClick(point)}
                                                >
                                                    <FilePenLine className="h-4 w-4" />
                                                </Button>
                                                {/* NÚT XÓA MỀM */}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                                    onClick={() => handleSoftDeletePickupPoint(point.iddiemdung, point.tendiemdon)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                        Không tìm thấy điểm đón nào phù hợp với từ khóa "{searchTerm}".
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* === Dialog Thêm Điểm Đón === */}
            <AddEntityDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                title="Thêm điểm dừng"
                description="Điền thông tin điểm dừng mới vào form bên dưới."
                fields={PICKUP_POINT_FIELDS}
                onSubmit={handleAddPickupPoint}
                submitButtonText="Thêm Điểm Đón"
                accentColor="bg-yellow-400 hover:bg-yellow-500"
            />

            {/* === Dialog Sửa Điểm Đón === */}
            {editingPoint && (
                <AddEntityDialog
                    key={editingPoint.iddiemdung}
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setEditingPoint(null);
                    }}
                    title={`Sửa Điểm Đón: ${editingPoint.tendiemdon}`}
                    description="Cập nhật thông tin điểm đón."
                    fields={PICKUP_POINT_FIELDS}
                    initialData={getInitialDataForEdit(editingPoint)}
                    onSubmit={handleUpdatePickupPoint}
                    submitButtonText="Cập nhật"
                    accentColor="bg-blue-500 hover:bg-blue-600"
                />
            )}
        </div>
    );
}