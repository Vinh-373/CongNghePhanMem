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

// --- IMPORT COMPONENT BẢN ĐỒ VÀ DIALOG ---
import LeafletRoutingMap from "@/components/Map/GoogleMapDisplay"; // Leaflet version
import AddEntityDialog from "@/components/AddEntityDialog.jsx";

export default function RoutesPage() {
  const [routesData, setRoutesData] = useState([]);
  const [totalStops, setTotalStops] = useState(0);
  const [loading, setLoading] = useState(true);

  const [stopOptions, setStopOptions] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // POPUP MAP
  const [openMap, setOpenMap] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState([]);

  const school = { lat: 10.788229, lng: 106.703970 };

  // --- Fetch dữ liệu Routes + Points ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [routesRes, pointsRes] = await Promise.all([
          axios.get("http://localhost:5001/schoolbus/admin/get-all-routes"),
          axios.get("http://localhost:5001/schoolbus/admin/get-all-pickup-points")
        ]);

        setRoutesData(routesRes.data.routes);
        setTotalStops(routesRes.data.totalStops || 0);

        if (pointsRes.data?.pickupPoints) {
          const formattedOptions = pointsRes.data.pickupPoints.map(point => ({
            value: point.iddiemdung,
            label: `${point.iddiemdung} - ${point.tendiemdon || ""}`
          }));
          setStopOptions(formattedOptions);
        }
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        toast.error("Không thể tải dữ liệu hệ thống!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Fields thêm tuyến ---
  const addRouteFields = useMemo(() => [
    {
      name: "tentuyen",
      label: "Tên tuyến đường",
      type: "text",
      placeholder: "Ví dụ: Tuyến Quận 1 - Quận 7",
      required: true,
    },
    {
      name: "mota",
      label: "Mô tả lộ trình",
      type: "text",
      placeholder: "Mô tả ngắn gọn...",
      required: false,
    },
    {
      name: "loaituyen",
      label: "Loại tuyến",
      type: "select",
      options: [
        { value: "don", label: "Đón học sinh" },
        { value: "tra", label: "Trả học sinh" },
      ],
      defaultValue: "don",
    },
    {
      name: "trangthai",
      label: "Trạng thái",
      type: "select",
      options: [
        { value: 1, label: "Hoạt động" },
        { value: 0, label: "Tạm dừng" },
      ],
      defaultValue: 1,
      required: true,
    },
    {
      name: "dsdiemdung",
      label: "Danh sách điểm dừng",
      type: "multi-select",
      options: stopOptions,
      required: false,
    }
  ], [stopOptions]);

  const handleAddNewRoute = async (formData) => {
    try {
      if (formData.dsdiemdung) {
        formData.dsdiemdung = JSON.stringify(formData.dsdiemdung);
      }
      const res = await axios.post(
        "http://localhost:5001/schoolbus/admin/add-route",
        formData
      );
      if (res.data) {
        toast.success("Thêm tuyến đường thành công!");
        const refreshRes = await axios.get("http://localhost:5001/schoolbus/admin/get-all-routes");
        setRoutesData(refreshRes.data.routes);
        setTotalStops(refreshRes.data.totalStops || 0);
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Thêm thất bại!");
    }
  };

  const getStatusBadge = (trangthai) => {
    switch (trangthai) {
      case 1: return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 0: return <Badge className="bg-yellow-100 text-yellow-800">Tạm dừng</Badge>;
      default: return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  const routeColors = [
    { polyline: "#FF0000", dot: "red" },
    { polyline: "#0000FF", dot: "blue" },
    { polyline: "#00AA00", dot: "green" },
    { polyline: "#FF00FF", dot: "purple" },
    { polyline: "#FFA500", dot: "orange" },
  ];

  const handleShowStops = (route) => {
    setSelectedRoutes([route]);
    setOpenMap(true);
  };

  const handleShowAllRoutes = () => {
    setSelectedRoutes(routesData.filter(r => r.trangthai === 1));
    setOpenMap(true);
  };

  // --- Map data: xử lý thêm điểm trường ở đầu/cuối ---
  const mapRoutesData = useMemo(() => {
  if (!selectedRoutes || selectedRoutes.length === 0) return [];

  return selectedRoutes.map((route, index) => {
    let stops = (route.diemDungDetails || []).map(stop => ({
      lat: Number(stop.vido),
      lng: Number(stop.kinhdo),
      label: stop.tendiemdon || "",
    })).filter(s => !isNaN(s.lat) && !isNaN(s.lng));

    let busPosition = null;

    if (route.loaituyen === "Đón") {
      // Đón: xe ở điểm đầu, trường cuối
      busPosition = stops[0] || null;
      stops.push({ ...school, label: "Trường học" });
    } else if (route.loaituyen === "Trả") {
      // Trả: trường đầu, xe ở trường
      stops.unshift({ ...school, label: "Trường học" });
      busPosition = { ...school };
    }

    const colors = routeColors[index % routeColors.length];

    return {
      id: route.idtuyenduong,
      name: route.tentuyen,
      color: colors.polyline,
      dotColor: colors.dot,
      stops,
      busPosition,
    };
  });
}, [selectedRoutes]);

  const busesData = useMemo(() => [], [selectedRoutes]); // Không có bus page này

  const stats = {
    totalRoutes: routesData.length,
    totalStops,
    activeRoutes: routesData.filter(r => r.trangthai === 1).length,
  };

  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;

  return (
    <div className="space-y-6">
      {/* Thống kê */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Tuyến</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoutes}</div>
            <p className="text-xs text-muted-foreground">tuyến được thiết lập</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Điểm dừng</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStops}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tuyến hoạt động</CardTitle>
            <ListChecks className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRoutes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng danh sách */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Danh sách Tuyến ({stats.totalRoutes})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShowAllRoutes}>
              <Eye className="mr-2 h-4 w-4" />
              Xem tất cả trên bản đồ
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm tuyến mới
            </Button>
          </div>
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
              {routesData.map(route => (
                <TableRow key={route.idtuyenduong}>
                  <TableCell className="font-medium">
                    T-{route.idtuyenduong.toString().padStart(3,"0")}
                  </TableCell>
                  <TableCell>{route.tentuyen}</TableCell>
                  <TableCell>{route.mota || "..."}</TableCell>
                  <TableCell className="text-center">{route.diemDungDetails?.length || 0}</TableCell>
                  <TableCell>{getStatusBadge(route.trangthai)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleShowStops(route)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => alert(`Sửa tuyến: ${route.tentuyen}`)}>
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-red-600" onClick={() => alert(`Xóa tuyến: ${route.tentuyen}`)}>
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

      <AddEntityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Thêm Tuyến Đường Mới"
        description="Nhập thông tin chi tiết và chọn điểm dừng."
        fields={addRouteFields}
        onSubmit={handleAddNewRoute}
        submitButtonText="Tạo Tuyến"
      />

      {/* Map Dialog */}
      <Dialog open={openMap} onOpenChange={setOpenMap}>
        <DialogContent className="sm:max-w-5xl lg:max-w-6xl w-full h-[80vh] flex flex-col bg-white">
          <DialogHeader>
            <DialogTitle>
              {selectedRoutes.length === 1 
                ? `Bản đồ tuyến: ${selectedRoutes[0]?.tentuyen}`
                : `Tất cả tuyến (${selectedRoutes.length})`}
            </DialogTitle>
          </DialogHeader>

          {openMap && (
            <div className="flex-grow w-full">
              <LeafletRoutingMap
                routes={mapRoutesData}
                buses={busesData}
                school={school}
                zoom={13}
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
