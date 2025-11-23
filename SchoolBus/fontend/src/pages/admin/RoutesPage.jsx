import { useState, useEffect, useMemo } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  MapPin,
  Route,
  ListChecks,
  PlusCircle,
  FilePenLine,
  Trash2,
  Eye,
} from "lucide-react";

// SỬA LỖI ĐƯỜNG DẪN IMPORT: 
// Quay lại sử dụng alias tuyệt đối vì đường dẫn tương đối bị lỗi.
// LƯU Ý: Nếu lỗi biên dịch vẫn xảy ra, bạn cần thay thế đường dẫn này 
// bằng đường dẫn tương đối chính xác dựa trên vị trí thực tế của file GoogleMapDisplay
import GoogleMapDisplay from "@/components/Map/GoogleMapDisplay"; 


export default function RoutesPage() {
  const [routesData, setRoutesData] = useState([]);
  const [totalStops, setTotalStops] = useState(0);
  const [loading, setLoading] = useState(true);

  // POPUP MAP
  const [openMap, setOpenMap] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);

  // Fetch API danh sách tuyến đường
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/schoolbus/admin/get-all-routes"
        );
        setRoutesData(res.data.routes);
        setTotalStops(res.data.totalStops || 0);
        
        console.log("✅ Danh sách tuyến đường:", res.data.routes);
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

  // Xem chi tiết điểm dừng
  const handleShowStops = (route) => {
    // 1. Cập nhật tuyến đường đang được chọn
    setCurrentRoute(route);
    // 2. Mở Popup
    setOpenMap(true);
  };

  // TÍNH TOÁN DỮ LIỆU ĐIỂM DỪNG CHO MAP
  const busStopsArray = useMemo(() => {
    if (!currentRoute?.diemDungs || currentRoute.diemDungs.length === 0) {
      return [];
    }
    
    // Đảm bảo dữ liệu là kiểu số (Number) và lọc bỏ các giá trị không hợp lệ (NaN)
    return currentRoute.diemDungs
      .map((stop) => {
        const lng = Number(stop.kinhdo);
        const lat = Number(stop.vido);
        const label = stop.tendiemdon || "";
        return { lat, lng, label };
      })
      .filter(stop => 
        // Lọc bỏ các giá trị không phải là số (NaN)
        !isNaN(stop.lat) && 
        !isNaN(stop.lng)
      );
  }, [currentRoute]); // Chỉ tính toán lại khi currentRoute thay đổi
console.log("🚏 Điểm dừng cho bản đồ:", busStopsArray);
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
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routesData.map((route) => (
                <TableRow key={route.idtuyenduong}>
                  <TableCell className="font-medium">
                    T-{route.idtuyenduong.toString().padStart(3, "0")}
                  </TableCell>
                  <TableCell>{route.tentuyen}</TableCell>
                  <TableCell>{route.mota || "..."}</TableCell>
                  <TableCell className="text-center">
                    {route.diemDungs ? route.diemDungs.length : 0}
                  </TableCell>
                  <TableCell>{getStatusBadge(route.trangthai)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* nút xem bản đồ */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleShowStops(route)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* nút Sửa */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => alert(`Sửa tuyến: ${route.tentuyen}`)}
                      >
                        <FilePenLine className="h-4 w-4" />
                      </Button>

                      {/* nút Xóa */}
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

      {/* === POPUP Map === */}
      <Dialog open={openMap} onOpenChange={setOpenMap} className="w-5xl">
        {/* SỬA 1: Dùng flex-col và h-[80vh] cho DialogContent */}
        <DialogContent className="sm:max-w-5xl lg:max-w-6xl w-full h-[80vh] flex flex-col bg-white">
          
          {/* Header cố định chiều cao */}
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              Bản đồ tuyến: {currentRoute?.tentuyen || ""}
            </DialogTitle>
          </DialogHeader>
          
          {/* SỬA 2: Bọc Map trong div chiếm hết không gian còn lại (flex-grow) 
              Và chỉ render khi openMap là true để đảm bảo Map được khởi tạo đúng kích thước
          */}
          {openMap && (
            <div className="flex-grow w-full">
                <GoogleMapDisplay
                    // Dữ liệu đã được map từ kinhdo/vido sang lat/lng và đảm bảo là số hợp lệ
                    busStops={busStopsArray} 
                    school={{ lat: 10.788229, lng: 106.703970 }}
                    // Cần đảm bảo busPosition cũng là số hợp lệ, dùng điểm dừng đầu tiên nếu có, nếu không thì dùng tọa độ mặc định
                    busPosition={busStopsArray.length > 0 ? busStopsArray[0] : { lat: 10.788229, lng: 106.703970 }} 
                    studentPickup={busStopsArray.length > 0 ? busStopsArray[0] : { lat: 10.788229, lng: 106.703970 }}
                    zoom={15}
                    className="w-full h-full"
                />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}