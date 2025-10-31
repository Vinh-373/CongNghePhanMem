import MainLayout from "@/components/layout/MainLayout";
import { useState } from 'react';
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
  Bus,
  Wrench,
  CheckCircle,
  PlusCircle,
  FilePenLine,
  Trash2,
} from "lucide-react";
import AddEntityDialog from "@/components/AddEntityDialog";

// === DỮ LIỆU HARD-CODE (MVP1) ===
// Dữ liệu này giả lập việc join bảng xebuyt, lichchuyen, taixe, nguoidung, tuyenduong
const vehiclesData = [
  {
    id: 1,
    plate: "51A-12345",
    driver: "Nguyễn Văn A",
    route: "Tuyến Đông",
    seats: 40,
    status: "Đang chạy",
  },
  {
    id: 2,
    plate: "51B-67890",
    driver: "Trần Thị B",
    route: "Tuyến Tây",
    seats: 29,
    status: "Sẵn sàng",
  },
  {
    id: 3,
    plate: "51C-54321",
    driver: "Lê Văn C",
    route: "Tuyến Nam",
    seats: 40,
    status: "Bảo trì",
  },
  {
    id: 4,
    plate: "51D-98765",
    driver: "Phạm Thị D",
    route: "Tuyến Bắc",
    seats: 29,
    status: "Sẵn sàng",
  },
  {
    id: 5,
    plate: "51E-11223",
    driver: "Vũ Văn E",
    route: "Tuyến Đông",
    seats: 40,
    status: "Sẵn sàng",
  },
];
const VEHICLE_FIELDS = [
  { name: 'plate', label: 'Biển số xe', type: 'text', placeholder: '51Z-00000', required: true },
  { name: 'driver', label: 'Tài xế hiện tại', type: 'text', placeholder: 'Nguyễn Văn A', required: true },
  { name: 'route', label: 'Tuyến đường', type: 'text', placeholder: 'Tuyến Đông', required: true },
  { name: 'seats', label: 'Số ghế', type: 'number', placeholder: '40', defaultValue: 40, min: 1, required: true },
];
export default function VehiclesPage() {
 
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleOpenDialog() {
    setIsDialogOpen(true);
  }



  // Helper để lấy badge màu theo trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "Đang chạy":
        return <Badge className="bg-green-100 text-green-800">Đang chạy</Badge>;
      case "Sẵn sàng":
        return <Badge className="bg-blue-100 text-blue-800">Sẵn sàng</Badge>;
      case "Bảo trì":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Bảo trì</Badge>
        );
      default:
        return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  const stats = {
    total: vehiclesData.length,
    running: vehiclesData.filter((v) => v.status === "Đang chạy").length,
    maintenance: vehiclesData.filter((v) => v.status === "Bảo trì").length,
  };

  return (
   
      <div className="space-y-6">
        
        {/* === 1. THẺ TỔNG QUAN === */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Tổng số xe */}
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

          {/* Xe đang chạy */}
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

          {/* Xe bảo trì */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bảo trì</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maintenance}</div>
              <p className="text-xs text-muted-foreground">xe đang tạm dừng</p>
            </CardContent>
          </Card>
        </div>

        {/* === 2. BẢNG DANH SÁCH XE === */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách xe buýt ({stats.total})</CardTitle>
            <Button className="hover:bg-orange-500 bg-amber-200"
              onClick={handleOpenDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm xe buýt mới
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Tài xế hiện tại</TableHead>
                  <TableHead>Tuyến đường</TableHead>
                  <TableHead className="text-center">Số ghế</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiclesData.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.plate}</TableCell>
                    <TableCell>{vehicle.driver}</TableCell>
                    <TableCell>{vehicle.route}</TableCell>
                    <TableCell className="text-center">{vehicle.seats}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-blue-100"
                          onClick={() => alert(`Sửa xe: ${vehicle.plate}`)}
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() =>
                            alert(`Xóa xe: ${vehicle.plate}`)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Thêm Xe Dialog */}
        <AddEntityDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Thêm Xe Buýt Mới"
          fields={VEHICLE_FIELDS}
          submitButtonText="Lưu Xe"
          accentColor="bg-amber-500 hover:bg-amber-600"
        />
      </div>

  );
}
