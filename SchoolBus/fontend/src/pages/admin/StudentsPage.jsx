import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import AddEntityDialog from "@/components/AddEntityDialog";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5001/schoolbus/admin";
const STUDENTS_ENDPOINT = `${API_BASE_URL}/get-all-students`;
const ADD_STUDENT_ENDPOINT = `${API_BASE_URL}/add-student`;

const STUDENT_FIELDS = [
  { name: "hoten", label: "Họ và tên", type: "text", placeholder: "Nguyễn Văn A", required: true },
  { name: "lop", label: "Lớp", type: "text", placeholder: "3A1", required: true },
  { name: "gioitinh", label: "Giới tính", type: "text", placeholder: "Nam / Nữ", required: true },
  { name: "namsinh", label: "Năm sinh", type: "date", required: true },
  { name: "idphuhuynh", label: "ID phụ huynh", type: "text", placeholder: "1", required: false },
  { name: "iddiemdon", label: "ID điểm đón", type: "text", placeholder: "1", required: false },
  { name: "anhdaidien", label: "Ảnh đại diện", type: "file", required: true },
];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchStudentsData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return setError("Không tìm thấy token");
    }
    try {
      const res = await fetch(STUDENTS_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, []);

  const getInitials = (fullName) =>
    fullName
      ? fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "NN";

  const handleAddStudent = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      for (const key in formData) {
        fd.append(key, formData[key]);
      }

      const res = await fetch(ADD_STUDENT_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Thêm thất bại");

      toast.success("🎉 Thêm học sinh thành công!");
      setIsDialogOpen(false);
      fetchStudentsData();
    } catch (err) {
      toast.error(`❌ Lỗi thêm học sinh: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Thống kê */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số Học sinh</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đang đi học</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter((s) => s.status === "Đang học").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Học sinh mới</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+0</div>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách học sinh */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Danh sách Học sinh ({students.length})</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm học sinh mới
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Đang tải dữ liệu...
            </div>
          ) : error ? (
            <div className="text-red-600 py-10">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thông tin Học sinh</TableHead>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Phụ huynh & Liên hệ</TableHead>
                  <TableHead>Điểm dừng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.mahocsinh}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {student.anhdaidien ? (
                          <AvatarImage
                            src={`http://localhost:5001/uploads/avatars/${student.anhdaidien}`}
                            alt={student.hoten}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <AvatarFallback>{getInitials(student.hoten)}</AvatarFallback>
                      </Avatar>
                      {student.hoten}
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-gray-200 text-gray-800">{student.lop}</Badge>
                    </TableCell>

                    <TableCell>
                      <p>{student.parentInfo?.userInfo?.hoten || "Chưa gán"}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3 mr-1 text-green-500" />
                        {student.parentInfo?.userInfo?.sodienthoai || "N/A"}
                      </div>
                    </TableCell>

                    <TableCell>
                      {student.diemDonMacDinh
                        ? student.diemDonMacDinh.tendiemdon || student.diemDonMacDinh.diachi
                        : "Chưa gán"}
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Đang học</Badge>
                    </TableCell>

                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => alert(`Sửa học sinh: ${student.hoten}`)}
                      >
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => alert(`Xóa học sinh: ${student.hoten}`)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddEntityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Thêm học sinh"
        description="Điền thông tin học sinh"
        fields={STUDENT_FIELDS}
        onSubmit={handleAddStudent}
        submitButtonText="Thêm học sinh"
        accentColor="bg-yellow-400 hover:bg-yellow-500"
      />
    </div>
  );
}
