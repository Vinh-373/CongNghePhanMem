import MainLayout from "@/components/layout/MainLayout";
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
  MapPin,
  Route,
  BusFront,
  PlusCircle,
  FilePenLine,
  Trash2,
  ListChecks,
} from "lucide-react";

// === DỮ LIỆU HARD-CODE (MVP1) ===
const totalStops = 50; // Tổng số điểm dừng độc lập
const routesData = [
  {
    id: 1,
    name: "Tuyến Sáng Đông",
    driver: "Nguyễn Văn A",
    vehicle: "51A-12345",
    stops: 8,
    status: "Hoạt động",
  },
  {
    id: 2,
    name: "Tuyến Chiều Tây",
    driver: "Trần Thị B",
    vehicle: "51B-67890",
    stops: 10,
    status: "Hoạt động",
  },
  {
    id: 3,
    name: "Tuyến Sáng Nam",
    driver: "Lê Văn C",
    vehicle: "51C-54321",
    stops: 12,
    status: "Hoạt động",
  },
  {
    id: 4,
    name: "Tuyến Chiều Bắc",
    driver: "Phạm Thị D",
    vehicle: "51D-98765",
    stops: 9,
    status: "Tạm dừng",
  },
];

export default function RoutesPage() {
 

  // Helper để lấy badge màu theo trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "Hoạt động":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case "Tạm dừng":
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm dừng</Badge>;
      default:
        return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  const stats = {
    totalRoutes: routesData.length,
    totalStops: totalStops,
    activeRoutes: routesData.filter((r) => r.status === "Hoạt động").length,
  };

  return (
   
      <div className="space-y-6">
        {/* === 1. THẺ TỔNG QUAN === */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Tổng số Tuyến đường */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng Tuyến đường</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoutes}</div>
              <p className="text-xs text-muted-foreground">tuyến được thiết lập</p>
            </CardContent>
          </Card>

          {/* Tổng số Điểm dừng */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng Điểm dừng</CardTitle>
              <MapPin className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStops}</div>
              <p className="text-xs text-muted-foreground">điểm dừng độc lập</p>
            </CardContent>
          </Card>

          {/* Tuyến hoạt động */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tuyến hoạt động</CardTitle>
              <ListChecks className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRoutes}</div>
              <p className="text-xs text-muted-foreground">đang được sử dụng trong lịch trình</p>
            </CardContent>
          </Card>
        </div>

        {/* === 2. BẢNG DANH SÁCH TUYẾN ĐƯỜNG === */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách Tuyến đường ({stats.totalRoutes})</CardTitle>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm tuyến đường mới
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên tuyến</TableHead>
                  <TableHead>Xe buýt</TableHead>
                  <TableHead>Tài xế phụ trách</TableHead>
                  <TableHead className="text-center">Số điểm dừng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routesData.map((route) => (
                  <TableRow key={route.id}>
                    {/* Tên tuyến */}
                    <TableCell className="font-medium">{route.name}</TableCell>

                    {/* Xe buýt */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BusFront className="h-4 w-4 text-muted-foreground" />
                        <span>{route.vehicle}</span>
                      </div>
                    </TableCell>

                    {/* Tài xế */}
                    <TableCell>{route.driver}</TableCell>

                    {/* Số điểm dừng */}
                    <TableCell className="text-center">{route.stops}</TableCell>

                    {/* Trạng thái */}
                    <TableCell>{getStatusBadge(route.status)}</TableCell>

                    {/* Hành động */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-blue-100"
                          onClick={() => alert(`Sửa tuyến: ${route.name}`)}
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => alert(`Xóa tuyến: ${route.name}`)}
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
      </div>

  );
}
