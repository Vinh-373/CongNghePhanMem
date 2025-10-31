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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  UserPlus,
  PlusCircle,
  FilePenLine,
  Trash2,
} from "lucide-react";

// === DỮ LIỆU HARD-CODE (MVP1) ===
// Dữ liệu này giả lập việc join bảng nguoidung và taixe
const driversData = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://placehold.co/40x40/F5C247/000000?text=A",
    phone: "0901234567",
    email: "vana@schoolbus.com",
    license: "B2-123456",
    experience: 5,
    status: "Đang chạy",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://placehold.co/40x40/175E7A/FFFFFF?text=B",
    phone: "0908765432",
    email: "thib@schoolbus.com",
    license: "D-987654",
    experience: 8,
    status: "Sẵn sàng",
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: "https://placehold.co/40x40/F5C247/000000?text=C",
    phone: "0912345678",
    email: "vanc@schoolbus.com",
    license: "B2-543210",
    experience: 3,
    status: "Sẵn sàng",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    avatar: "https://placehold.co/40x40/175E7A/FFFFFF?text=D",
    phone: "0987654321",
    email: "thid@schoolbus.com",
    license: "D-112233",
    experience: 10,
    status: "Đang chạy",
  },
];

export default function DriversPage() {
 

  // Helper để lấy badge màu theo trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "Đang chạy":
        return <Badge className="bg-green-100 text-green-800">Đang chạy</Badge>;
      case "Sẵn sàng":
        return <Badge className="bg-blue-100 text-blue-800">Sẵn sàng</Badge>;
      default:
        return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  const stats = {
    total: driversData.length,
    active: driversData.filter((d) => d.status === "Đang chạy").length,
    ready: driversData.filter((d) => d.status === "Sẵn sàng").length,
  };

  return (
    
      <div className="space-y-6">
        {/* === 1. THẺ TỔNG QUAN === */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Tổng số tài xế */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng tài xế</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">tài xế trong hệ thống</p>
            </CardContent>
          </Card>

          {/* Tài xế đang chạy */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đang chạy</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">tài xế đang thực hiện chuyến</p>
            </CardContent>
          </Card>

          {/* Tài xế sẵn sàng */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sẵn sàng</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ready}</div>
              <p className="text-xs text-muted-foreground">tài xế có thể nhận chuyến</p>
            </CardContent>
          </Card>
        </div>

        {/* === 2. BẢNG DANH SÁCH TÀI XẾ === */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách tài xế ({stats.total})</CardTitle>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm tài xế mới
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Thông tin liên lạc</TableHead>
                  <TableHead>Mã bằng lái</TableHead>
                  <TableHead className="text-center">Kinh nghiệm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driversData.map((driver) => (
                  <TableRow key={driver.id}>
                    {/* Họ tên & Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={driver.avatar} alt={driver.name} />
                          <AvatarFallback>
                            {driver.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{driver.name}</span>
                      </div>
                    </TableCell>

                    {/* Thông tin liên lạc */}
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>{driver.phone}</span>
                        <span className="text-muted-foreground">{driver.email}</span>
                      </div>
                    </TableCell>

                    {/* Bằng lái */}
                    <TableCell className="font-mono">{driver.license}</TableCell>
                    
                    {/* Kinh nghiệm */}
                    <TableCell className="text-center">
                      {driver.experience} năm
                    </TableCell>
                    
                    {/* Trạng thái */}
                    <TableCell>{getStatusBadge(driver.status)}</TableCell>

                    {/* Hành động */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-blue-100"
                          onClick={() => alert(`Sửa tài xế: ${driver.name}`)}
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => alert(`Xóa tài xế: ${driver.name}`)}
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

