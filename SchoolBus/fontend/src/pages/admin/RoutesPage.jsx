import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

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
  ListChecks,
  PlusCircle,
  FilePenLine,
  Trash2,
} from "lucide-react";

export default function RoutesPage() {
  const [routesData, setRoutesData] = useState([]);
  const [totalStops, setTotalStops] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch API danh sách tuyến đường
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/schoolbus/admin/get-all-routes"
        );
        // Backend trả về: { routes: [...], totalStops: number }
        setRoutesData(res.data.routes);
        setTotalStops(res.data.totalStops || 0);
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách tuyến đường:", err);
        toast.error("Không thể tải danh sách tuyến đường!");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // Badge trạng thái 0/1
  const getStatusBadge = (trangthai) => {
    switch (trangthai) {
      case 1:
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 0:
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm dừng</Badge>;
      default:
        return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  // Thống kê
  const stats = {
    totalRoutes: routesData.length,
    totalStops: totalStops,
    activeRoutes: routesData.filter((r) => r.trangthai === 1).length,
  };

  if (loading) return <p className="text-gray-500">⏳ Đang tải dữ liệu...</p>;

  return (
    <div className="space-y-6">
      {/* === Thẻ thống kê === */}
      <div className="grid gap-4 md:grid-cols-3">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tuyến hoạt động</CardTitle>
            <ListChecks className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRoutes}</div>
            <p className="text-xs text-muted-foreground">
              đang được sử dụng trong lịch trình
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === Bảng danh sách tuyến đường === */}
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
                <TableHead>Mã tuyến</TableHead>
                <TableHead>Tên tuyến</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Số điểm dừng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routesData.map((route) => (
                <TableRow key={route.idtuyenduong}>
                  <TableCell className="font-medium">
                    T-{route.idtuyenduong.toString().padStart(3, "0")}
                  </TableCell>
                  <TableCell className="font-medium">{route.tentuyen}</TableCell>
                  <TableCell>{route.mota || "..."}</TableCell>
                  <TableCell className="text-center">
                    {route.diemDungs ? route.diemDungs.length : 0}
                  </TableCell>
                  <TableCell>{getStatusBadge(route.trangthai)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-blue-100"
                        onClick={() => alert(`Sửa tuyến: ${route.tentuyen}`)}
                      >
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => alert(`Xóa tuyến: ${route.tentuyen}`)}
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
