// ===== IMPORTS =====
import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect, useMemo } from "react"; // Thêm useMemo
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
import { Input } from "@/components/ui/input"; // Import Input

import {
  Bus,
  Wrench,
  CheckCircle,
  PlusCircle,
  FilePenLine,
  Trash2,
  Search, // Import Search icon
} from "lucide-react";

import AddEntityDialog from "@/components/AddEntityDialog";

// === FORM THÊM XE (dialog) ===
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // 🆕 STATE cho thanh tìm kiếm
  const [searchTerm, setSearchTerm] = useState(""); 

  // ===== Fetch API LẤY DANH SÁCH XE =====
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get("http://localhost:5001/schoolbus/admin/get-all-vehicles");
        setVehicles(res.data.vehicles); // Backend Sequelize trả dạng { vehicles: [...] }
      } catch (err) {
        console.error("❌ Lỗi lấy xe:", err);
        setError("Không thể tải danh sách xe!");
        toast.error("🚫 Không thể tải danh sách xe!");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // ===== LỌC DANH SÁCH XE DỰA TRÊN SEARCH TERM (dùng useMemo để tối ưu) =====
  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return vehicles.filter(vehicle => 
      vehicle.bienso.toLowerCase().includes(lowerCaseSearchTerm) ||
      vehicle.hangsanxuat.toLowerCase().includes(lowerCaseSearchTerm) ||
      vehicle.loainhienlieu.toLowerCase().includes(lowerCaseSearchTerm)
      // Có thể thêm các trường khác nếu muốn
    );
  }, [vehicles, searchTerm]);
  
  // ===== Badge theo trạng thái =====
  const getStatusBadge = (status) => {
    switch (status) {
      case 2:
        return <Badge className="bg-green-100 text-green-800">Đang chạy</Badge>;
      case 1:
        return <Badge className="bg-blue-100 text-blue-800">Sẵn sàng</Badge>;
      case 0:
        return <Badge className="bg-yellow-100 text-yellow-800">Bảo trì / Hỏng</Badge>;
      default:
        return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  // ===== Thống kê (dựa trên danh sách gốc) =====
  const stats = {
    total: vehicles.length,
    running: vehicles.filter(v => v.trangthai === 2).length,
    maintenance: vehicles.filter(v => v.trangthai === 0).length,
  };

  // ===== Màn hình loading / lỗi =====
  if (loading) return <p className="text-gray-500">⏳ Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // ===== Hàm gọi API thêm xe =====
  const handleAddVehicle = async (formData) => {
    try {
      const res = await axios.post(
        "http://localhost:5001/schoolbus/admin/add-vehicle",
        formData
      );

      // 🟢 Reload list sau khi thêm thành công
      setVehicles((prev) => [...prev, res.data.vehicle]);
      setIsDialogOpen(false);
      toast.success("🎉 Thêm xe thành công!");
    } catch (err) {
      console.error("❌ Lỗi thêm xe:", err);

      // Lấy thông báo lỗi từ response của server nếu có
      const message = err.response?.data?.message || "Lỗi không xác định!";
      toast.error(`🚫 ${message}`);
    }
  };

  // ===== UI =====
  return (
    <div className="space-y-6">
      
      {/* === 1. THẺ TỔNG QUAN === */}
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
            <CardTitle className="text-sm font-medium">Đang chạy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.running}</div>
            <p className="text-xs text-muted-foreground">xe đang thực hiện chuyến</p>
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

      {/* === 2. BẢNG XE === */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between mb-4">
                <CardTitle>Danh sách xe buýt ({filteredVehicles.length} / {stats.total})</CardTitle>
                <Button 
                    className="hover:bg-orange-500 bg-amber-200"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Thêm xe buýt mới
                </Button>
            </div>
            
            {/* 🆕 THANH TÌM KIẾM */}
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
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.bienso}</TableCell>
                    <TableCell>{vehicle.hangsanxuat}</TableCell>
                    <TableCell>{vehicle.loainhienlieu}</TableCell>
                    <TableCell className="text-center">{vehicle.soghe}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.trangthai)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="hover:bg-blue-100">
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-600 hover:bg-red-100 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
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
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Thêm Xe Buýt Mới"
        fields={VEHICLE_FIELDS}
        submitButtonText="Lưu Xe"
        accentColor="bg-amber-500 hover:bg-amber-600"
        onSubmit={handleAddVehicle}
      />
    </div>
  );
}