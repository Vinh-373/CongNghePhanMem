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
  Users,
  UserCheck,
  UserPlus,
  PlusCircle,
  FilePenLine,
  Trash2,
  Phone,
  ClipboardList,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// === DỮ LIỆU HARD-CODE (MVP1) ===
const studentsData = [
  {
    id: 101,
    name: "Lê Minh Khôi",
    classCode: "1A",
    parentName: "Lê Văn Tám",
    contact: "0901xxxxxx",
    status: "Đang học",
    avatarInitial: "LM",
  },
  {
    id: 102,
    name: "Trần Mai Anh",
    classCode: "5B",
    parentName: "Trần Văn Chính",
    contact: "0912yyyyyy",
    status: "Nghỉ phép",
    avatarInitial: "TA",
  },
  {
    id: 103,
    name: "Phạm Gia Hân",
    classCode: "3C",
    parentName: "Phạm Văn Tài",
    contact: "0987zzzzzz",
    status: "Đang học",
    avatarInitial: "PH",
  },
  {
    id: 104,
    name: "Nguyễn Trung Hiếu",
    classCode: "2D",
    parentName: "Nguyễn Thị Hoa",
    contact: "0945aaaaaa",
    status: "Đã tốt nghiệp",
    avatarInitial: "NH",
  },
];

export default function StudentsPage() {
  

  // Helper để lấy badge màu theo trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "Đang học":
        return <Badge className="bg-green-100 text-green-800">Đang học</Badge>;
      case "Nghỉ phép":
        return <Badge className="bg-yellow-100 text-yellow-800">Nghỉ phép</Badge>;
      case "Đã tốt nghiệp":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Đã tốt nghiệp</Badge>;
      default:
        return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  const stats = {
    totalStudents: studentsData.length,
    activeStudents: studentsData.filter((s) => s.status === "Đang học").length,
    newThisMonth: 3, // Giả định có 3 học sinh mới trong tháng
  };

  return (
   
      <div className="space-y-6">
        {/* === 1. THẺ TỔNG QUAN === */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Tổng số Học sinh */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng số Học sinh</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">học sinh đang được quản lý</p>
            </CardContent>
          </Card>

          {/* Học sinh đang đi học */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đang đi học</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground">học sinh đang sử dụng dịch vụ</p>
            </CardContent>
          </Card>

          {/* Học sinh mới */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Học sinh mới (Tháng này)</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">tăng trưởng so với tháng trước</p>
            </CardContent>
          </Card>
        </div>

        {/* === 2. BẢNG DANH SÁCH HỌC SINH === */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách Học sinh ({stats.totalStudents})</CardTitle>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm học sinh mới
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thông tin Học sinh</TableHead>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Phụ huynh & Liên hệ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsData.map((student) => (
                  <TableRow key={student.id}>
                    {/* Thông tin Học sinh */}
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                                    {student.avatarInitial}
                                </AvatarFallback>
                            </Avatar>
                            {student.name}
                        </div>
                    </TableCell>

                    {/* Lớp học */}
                    <TableCell>
                        <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                            <ClipboardList className="h-3 w-3 mr-1" />
                            {student.classCode}
                        </Badge>
                    </TableCell>

                    {/* Phụ huynh & Liên hệ */}
                    <TableCell>
                        <p className="font-medium">{student.parentName}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Phone className="h-3 w-3 mr-1 text-green-500" />
                            {student.contact}
                        </div>
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell>{getStatusBadge(student.status)}</TableCell>

                    {/* Hành động */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-blue-100"
                          onClick={() => alert(`Sửa học sinh: ${student.name}`)}
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => alert(`Xóa học sinh: ${student.name}`)}
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
