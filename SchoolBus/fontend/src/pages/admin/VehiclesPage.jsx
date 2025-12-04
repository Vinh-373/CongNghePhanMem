// ===== IMPORTS =====
import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";

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
  Bus,
  Wrench,
  CheckCircle,
  PlusCircle,
  FilePenLine,
  Trash2,
  Search,
  RefreshCw,
} from "lucide-react";

import AddEntityDialog from "@/components/AddEntityDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// === FORM THÊM / UPDATE XE (dialog) ===
const VEHICLE_FIELDS = [
  { name: 'bienso', label: 'Biển số xe', type: 'text', placeholder: '51Z-00000', required: true },
  { name: 'hangsanxuat', label: 'Hãng sản xuất', type: 'text', placeholder: 'Toyota', required: true },
  { name: 'loainhienlieu', label: 'Loại nhiên liệu', type: 'text', placeholder: 'Dầu Diesel', required: true },
  { name: 'soghe', label: 'Số ghế', type: 'number', placeholder: '40', defaultValue: 40, min: 1, required: true },
  { name: 'trangthai', label: 'Trạng thái', type: 'number', placeholder: '1', defaultValue: 1, min: 0, max: 2, required: true },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editVehicleRaw, setEditVehicleRaw] = useState(null);

  const [deleteVehicleId, setDeleteVehicleId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // ===== Fetch danh sách xe =====
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/schoolbus/admin/get-all-vehicles");
      setVehicles(res.data.vehicles || []);
      setError(null);
    } catch (err) {
      console.error("❌ Lỗi lấy xe:", err);
      setError("Không thể tải danh sách xe!");
      toast.error("🚫 Không thể tải danh sách xe!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // ===== Lọc danh sách theo search =====
  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return vehicles.filter(vehicle =>
      vehicle.bienso.toLowerCase().includes(lowerCaseSearchTerm) ||
      vehicle.hangsanxuat.toLowerCase().includes(lowerCaseSearchTerm) ||
      vehicle.loainhienlieu.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [vehicles, searchTerm]);

  // ===== Badge trạng thái =====
  const getStatusBadge = (status) => {
    switch (status) {
      case 1: return <Badge className="bg-green-100 text-green-800">Hoạt Động</Badge>;
      case 0: return <Badge className="bg-yellow-100 text-yellow-800">Bảo trì / Hỏng</Badge>;
      default: return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  // ===== Thống kê =====
  const stats = {
    total: vehicles.length,
    running: vehicles.filter(v => v.trangthai === 1).length,
    maintenance: vehicles.filter(v => v.trangthai === 0).length,
  };

  // ===== API Thêm xe =====
  const handleAddVehicle = async (formData) => {
    try {
      await axios.post("http://localhost:5001/schoolbus/admin/add-vehicle", formData);
      setIsAddDialogOpen(false);
      toast.success("🎉 Thêm xe thành công!");
      await fetchVehicles();
    } catch (err) {
      console.error("❌ Lỗi thêm xe:", err);
      const message = err.response?.data?.message || "Lỗi không xác định!";
      toast.error(`🚫 ${message}`);
    }
  };

  // ===== API Update xe =====
  const handleUpdateVehicle = async (formData) => {
    try {
      if (!editVehicleRaw?.idxebuyt) {
        toast.error("❌ Không tìm thấy ID xe!");
        return;
      }

      console.log("Updating vehicle ID:", editVehicleRaw.idxebuyt);
      console.log("Form data:", formData);

      await axios.put(
        `http://localhost:5001/schoolbus/admin/update-vehicle/${editVehicleRaw.idxebuyt}`,
        formData
      );

      // Reset form
      setIsEditDialogOpen(false);
      setEditVehicle(null);
      setEditVehicleRaw(null);
      
      toast.success("🔧 Cập nhật xe thành công!");
      await fetchVehicles();
    } catch (err) {
      console.error("❌ Lỗi cập nhật xe:", err);
      toast.error("🚫 Cập nhật thất bại!");
    }
  };

  // ===== API Xóa xe =====
  const handleDeleteVehicle = async () => {
    try {
      await axios.delete(`http://localhost:5001/schoolbus/admin/delete-vehicle/${deleteVehicleId}`);
      setIsDeleteDialogOpen(false);
      setDeleteVehicleId(null);
      toast.success("🗑️ Xóa xe thành công!");
      await fetchVehicles();
    } catch (err) {
      console.error("❌ Lỗi xóa xe:", err);
      toast.error("🚫 Xóa xe thất bại!");
    }
  };

  // ===== Mở dialog sửa =====
  const openEditDialog = (vehicle) => {
    setEditVehicleRaw(vehicle);
    const initialData = VEHICLE_FIELDS.reduce((acc, field) => {
      acc[field.name] = vehicle[field.name] ?? (field.defaultValue ?? (field.type === 'number' ? 0 : ''));
      return acc;
    }, {});
    setEditVehicle(initialData);
    setIsEditDialogOpen(true);
  };

  // ===== UI =====
  if (loading) return <p className="text-gray-500">⏳ Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      {/* === 1. Thẻ tổng quan === */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số xe</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">xe đang được quản lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.running}</div>
            <p className="text-xs text-muted-foreground">xe đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bảo trì / Hỏng</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">xe đang tạm dừng</p>
          </CardContent>
        </Card>
      </div>

      {/* === 2. Bảng xe === */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Danh sách xe buýt ({filteredVehicles.length} / {stats.total})</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => fetchVehicles()}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
              <Button 
                className="hover:bg-orange-500 bg-amber-200"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm xe buýt mới
              </Button>
            </div>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo Biển số, Hãng sản xuất, Loại nhiên liệu..."
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
                <TableHead>Biển số</TableHead>
                <TableHead>Hãng sản xuất</TableHead>
                <TableHead>Loại nhiên liệu</TableHead>
                <TableHead className="text-center">Số ghế</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredVehicles.length > 0 ? filteredVehicles.map(vehicle => (
                <TableRow key={vehicle.idxebuyt}>
                  <TableCell className="font-medium">{vehicle.bienso}</TableCell>
                  <TableCell>{vehicle.hangsanxuat}</TableCell>
                  <TableCell>{vehicle.loainhienlieu}</TableCell>
                  <TableCell className="text-center">{vehicle.soghe}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.trangthai)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-blue-100"
                        onClick={() => openEditDialog(vehicle)}
                      >
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => { 
                          setDeleteVehicleId(vehicle.idxebuyt); 
                          setIsDeleteDialogOpen(true); 
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    Không tìm thấy xe nào phù hợp với từ khóa "{searchTerm}".
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* === Dialog Thêm Xe === */}
      <AddEntityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Thêm Xe Buýt Mới"
        fields={VEHICLE_FIELDS}
        submitButtonText="Lưu Xe"
        accentColor="bg-amber-500 hover:bg-amber-600"
        onSubmit={handleAddVehicle}
      />

      {/* === Dialog Cập nhật Xe === */}
      {editVehicle && (
        <AddEntityDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditVehicle(null);
            setEditVehicleRaw(null);
          }}
          title="Cập nhật thông tin xe"
          fields={VEHICLE_FIELDS}
          submitButtonText="Lưu thay đổi"
          accentColor="bg-blue-500 hover:bg-blue-600"
          onSubmit={handleUpdateVehicle}
          initialData={editVehicle}
        />
      )}

      {/* === Dialog Xóa Xe === */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Bạn có chắc chắn muốn xóa xe này không?
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteVehicle}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}