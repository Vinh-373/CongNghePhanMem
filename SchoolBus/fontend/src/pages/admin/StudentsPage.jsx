// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import MainLayout from "@/components/layout/MainLayout";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Users,
//   UserCheck,
//   UserPlus,
//   PlusCircle,
//   FilePenLine,
//   Trash2,
//   Phone,
//   Loader2,
//   Search,
//   XCircle,
// } from "lucide-react";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { AvatarImage } from "@radix-ui/react-avatar";
// import AddEntityDialog from "@/components/AddEntityDialog";
// import { toast } from "sonner";

// const API_BASE_URL = "http://localhost:5001/schoolbus/admin";
// const STUDENTS_ENDPOINT = `${API_BASE_URL}/get-all-students`;
// const ADD_STUDENT_ENDPOINT = `${API_BASE_URL}/add-student`;

// const STUDENT_FIELDS = [
//   { name: "hoten", label: "Họ và tên", type: "text", placeholder: "Nguyễn Văn A", required: true },
//   { name: "lop", label: "Lớp", type: "text", placeholder: "3A1", required: true },
//   { name: "gioitinh", label: "Giới tính", type: "text", placeholder: "Nam / Nữ", required: true },
//   { name: "namsinh", label: "Năm sinh", type: "date", required: true },
//   { name: "idphuhuynh", label: "ID phụ huynh", type: "text", placeholder: "1", required: false },
//   { name: "iddiemdon", label: "ID điểm đón", type: "text", placeholder: "1", required: false },
//   { name: "anhdaidien", label: "Ảnh đại diện", type: "file", required: true },
// ];

// export default function StudentsPage() {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');

//   const fetchStudentsData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setLoading(false);
//       return setError("Không tìm thấy token");
//     }
//     try {
//       const res = await fetch(STUDENTS_ENDPOINT, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
//       const data = await res.json();
//       setStudents(data.students || []);
//       // console.log("Dữ liệu học sinh:", data.students);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStudentsData();
//   }, [fetchStudentsData]);

//   const getInitials = (fullName) =>
//     fullName
//       ? fullName
//           .split(" ")
//           .map((n) => n[0])
//           .join("")
//           .toUpperCase()
//           .substring(0, 2)
//       : "NN";

//   const handleAddStudent = async (formData) => {
//     try {
//       const token = localStorage.getItem("token");
//       const fd = new FormData();
//       for (const key in formData) {
//         // Xử lý file ảnh đại diện (anhdaidien) và các trường khác
//         if (key === 'anhdaidien' && formData[key] instanceof File) {
//              fd.append(key, formData[key], formData[key].name);
//         } else if (formData[key] !== null && formData[key] !== undefined) {
//              fd.append(key, formData[key]);
//         }
//       }

//       const res = await fetch(ADD_STUDENT_ENDPOINT, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Thêm thất bại");

//       toast.success("🎉 Thêm học sinh thành công!");
//       setIsDialogOpen(false);
//       fetchStudentsData();
//     } catch (err) {
//       toast.error(`❌ Lỗi thêm học sinh: ${err.message}`);
//     }
//   };

//   // Logic lọc dữ liệu theo Tên, Lớp, Điểm dừng, Phụ huynh và Trạng thái
//   const filteredStudents = useMemo(() => {
//     if (loading) return [];
//     if (!searchTerm) return students;

//     const lowerCaseSearch = searchTerm.toLowerCase();

//     return students.filter(student => {
//         // 1. Tên Học sinh (hoten)
//         const nameMatch = student.hoten?.toLowerCase().includes(lowerCaseSearch);

//         // 2. Lớp học (lop)
//         const classMatch = student.lop?.toLowerCase().includes(lowerCaseSearch);

//         // 3. Điểm dừng (tendiemdon, diachi)
//         const stopName = student.diemDonMacDinh?.tendiemdon?.toLowerCase();
//         const stopAddress = student.diemDonMacDinh?.diachi?.toLowerCase();
//         const stopMatch = stopName?.includes(lowerCaseSearch) || stopAddress?.includes(lowerCaseSearch);

//         // 4. Thông tin phụ huynh (Tên, SĐT)
//         const parentName = student.parentInfo?.userInfo?.hoten?.toLowerCase();
//         const parentPhone = student.parentInfo?.userInfo?.sodienthoai?.toLowerCase();
//         const parentMatch = parentName?.includes(lowerCaseSearch) || parentPhone?.includes(lowerCaseSearch);

//         // 5. Trạng thái ("Đang học")
//         const statusMatch = "đang học".includes(lowerCaseSearch);

//         return nameMatch || classMatch || stopMatch || parentMatch || statusMatch;
//     });
//   }, [searchTerm, students, loading]);


//   return (
//     <div className="space-y-6">
//       {/* Thống kê */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card>
//           <CardHeader className="flex justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Tổng số Học sinh</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{students.length}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Đang đi học</CardTitle>
//             <UserCheck className="h-4 w-4 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {students.filter((s) => s.status === "Đang học").length}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Học sinh mới</CardTitle>
//             <UserPlus className="h-4 w-4 text-blue-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">+0</div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Danh sách học sinh */}
//       <Card>
//         <CardHeader className="flex justify-between">
//           <CardTitle>Danh sách Học sinh ({students.length})</CardTitle>
//           <Button onClick={() => setIsDialogOpen(true)}>
//             <PlusCircle className="mr-2 h-4 w-4" />
//             Thêm học sinh mới
//           </Button>
//         </CardHeader>

//         <CardContent>
//            {/* Thanh tìm kiếm */}
//             <div className="relative mb-4">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input 
//                     type="text" 
//                     placeholder="Tìm kiếm theo Tên, Lớp, Phụ huynh, Điểm dừng..." 
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#175e7a] focus:border-[#175e7a] transition duration-150 shadow-sm text-base"
//                 />
//             </div>

//           {loading ? (
//             <div className="flex justify-center py-10">
//               <Loader2 className="h-6 w-6 animate-spin mr-2" />
//               Đang tải dữ liệu...
//             </div>
//           ) : error ? (
//             <div className="flex flex-col items-center justify-center py-10 bg-red-50 border border-red-200 rounded-lg">
//                 <XCircle className="h-8 w-8 text-red-600 mb-3" />
//                 <p className="text-red-700 text-center font-medium px-4">{error}</p>
//                 <Button onClick={() => fetchStudentsData()} className="mt-4 bg-red-600 hover:bg-red-700">Thử lại</Button>
//             </div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Thông tin Học sinh</TableHead>
//                   <TableHead>Lớp học</TableHead>
//                   <TableHead>Phụ huynh & Liên hệ</TableHead>
//                   <TableHead>Điểm dừng</TableHead>
//                   <TableHead>Trạng thái</TableHead>
//                   <TableHead className="text-right">Hành động</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {filteredStudents.length > 0 ? ( 
//                   filteredStudents.map((student) => (
//                   <TableRow key={student.mahocsinh}>
//                     <TableCell className="font-medium flex items-center gap-3">
//                       <Avatar className="h-8 w-8">
//                         {student.anhdaidien ? (
//                           <AvatarImage
//                             src={`http://localhost:5001/uploads/avatars/${student.anhdaidien}`}
//                             alt={student.hoten}
//                             onError={(e) => {
//                               e.currentTarget.onerror = null;
//                               e.currentTarget.style.display = "none";
//                             }}
//                           />
//                         ) : null}
//                         <AvatarFallback>{getInitials(student.hoten)}</AvatarFallback>
//                       </Avatar>
//                       {student.hoten}
//                     </TableCell>

//                     <TableCell>
//                       <Badge className="bg-gray-200 text-gray-800">{student.lop}</Badge>
//                     </TableCell>

//                     <TableCell>
//                       <p>{student.parentInfo?.userInfo?.hoten || "Chưa gán"}</p>
//                       <div className="flex items-center text-sm text-muted-foreground mt-1">
//                         <Phone className="h-3 w-3 mr-1 text-green-500" />
//                         {student.parentInfo?.userInfo?.sodienthoai || "N/A"}
//                       </div>
//                     </TableCell>

//                     <TableCell>
//                       {student.diemDonMacDinh
//                         ? student.diemDonMacDinh.tendiemdon || student.diemDonMacDinh.diachi
//                         : "Chưa gán"}
//                     </TableCell>

//                     <TableCell>
//                       <Badge className="bg-green-100 text-green-800">Đang học</Badge>
//                     </TableCell>

//                     <TableCell className="text-right flex gap-2 justify-end">
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => alert(`Sửa học sinh: ${student.hoten}`)}
//                       >
//                         <FilePenLine className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         className="text-red-600 hover:bg-red-100 hover:text-red-700"
//                         onClick={() => alert(`Xóa học sinh: ${student.hoten}`)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                   )) // ⬅️ SỬA LỖI: Thêm dấu đóng ngoặc tròn cho map
//                 ) : (
//                    <TableRow>
//                         <TableCell colSpan={6} className="h-24 text-center text-gray-500">
//                             Không tìm thấy học sinh nào phù hợp với từ khóa "{searchTerm}".
//                         </TableCell>
//                     </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>

//       <AddEntityDialog
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         title="Thêm học sinh"
//         description="Điền thông tin học sinh"
//         fields={STUDENT_FIELDS}
//         onSubmit={handleAddStudent}
//         submitButtonText="Thêm học sinh"
//         accentColor="bg-yellow-400 hover:bg-yellow-500"
//       />
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Search,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import AddEntityDialog from "@/components/AddEntityDialog";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5001/schoolbus/admin";
const STUDENTS_ENDPOINT = `${API_BASE_URL}/get-all-students`;
const ADD_STUDENT_ENDPOINT = `${API_BASE_URL}/add-student`;
const DELETE_STUDENT_ENDPOINT = `${API_BASE_URL}/delete-student`;

// 🚨 ĐIỂM MỚI: Endpoint cho API Edit
const EDIT_STUDENT_ENDPOINT = `${API_BASE_URL}/edit-student`;

const STUDENT_FIELDS = [
  { name: "hoten", label: "Họ và tên", type: "text", placeholder: "Nguyễn Văn A", required: true },
  { name: "lop", label: "Lớp", type: "text", placeholder: "3A1", required: true },
  { name: "gioitinh", label: "Giới tính", type: "text", placeholder: "Nam / Nữ", required: true },
  { name: "namsinh", label: "Năm sinh", type: "date", required: true },
  { name: "idphuhuynh", label: "ID phụ huynh", type: "text", placeholder: "1", required: false },
  { name: "iddiemdon", label: "ID điểm đón", type: "text", placeholder: "1", required: false },
  // 🚨 CHÚ Ý: Ảnh đại diện không bắt buộc khi chỉnh sửa
  { name: "anhdaidien", label: "Ảnh đại diện", type: "file", required: false },
];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // 🚨 Đổi tên state cho rõ ràng
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // 🚨 ĐIỂM MỚI: State cho Dialog Edit
  const [editingStudent, setEditingStudent] = useState(null); // 🚨 ĐIỂM MỚI: State lưu thông tin HS đang chỉnh sửa
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudentsData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  const getInitials = (fullName) =>
    fullName
      ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
      : "NN";

  // Hàm xử lý Thêm Học sinh (Không thay đổi)
  const handleAddStudent = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      for (const key in formData) {
        if (key === 'anhdaidien' && formData[key] instanceof File) {
          fd.append(key, formData[key], formData[key].name);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          fd.append(key, formData[key]);
        }
      }

      const res = await fetch(ADD_STUDENT_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Thêm thất bại");

      toast.success("🎉 Thêm học sinh thành công!");
      setIsAddDialogOpen(false); // 🚨 SỬA: Đóng dialog Add
      fetchStudentsData();
    } catch (err) {
      toast.error(`❌ Lỗi thêm học sinh: ${err.message}`);
    }
  };

  // 🚨 ĐIỂM MỚI: Hàm xử lý Chỉnh sửa Học sinh
  const handleEditStudent = async (formData) => {
    if (!editingStudent) return;
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();

      // Lặp qua dữ liệu form
      for (const key in formData) {
        // Chỉ thêm vào FormData nếu giá trị khác null/undefined và không phải là File rỗng (nếu type là file)
        if (key === 'anhdaidien' && formData[key] instanceof File) {
          fd.append(key, formData[key], formData[key].name);
        } else if (key !== 'anhdaidien' && formData[key] !== null && formData[key] !== undefined) {
          fd.append(key, formData[key]);
        }
      }

      // 🚨 Gửi PUT request đến endpoint /edit-student/:id
      const res = await fetch(`${EDIT_STUDENT_ENDPOINT}/${editingStudent.mahocsinh}`, {
        method: "PUT", // Hoặc PATCH
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      toast.success("✅ Cập nhật học sinh thành công!");
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      fetchStudentsData(); // Tải lại dữ liệu
    } catch (err) {
      toast.error(`❌ Lỗi cập nhật học sinh: ${err.message}`);
    }
  };

  // 🚨 ĐIỂM ĐIỀU CHỈNH: Hàm xử lý Xóa mềm (sử dụng DELETE method)
  const handleDeleteStudent = async (mahocsinh, studentName) => {
    // 1. Xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA (cập nhật trạng thái thành 'Đã nghỉ') học sinh ${studentName} không?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 2. Gọi API với phương thức DELETE và ID học sinh
      // Endpoint: /schoolbus/admin/delete-student/:idStudent
      const res = await fetch(`${DELETE_STUDENT_ENDPOINT}/${mahocsinh}`, {
        method: "DELETE", // Sử dụng DELETE method
        headers: {
          "Authorization": `Bearer ${token}`
          // Không cần "Content-Type": "application/json" vì không gửi body
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xóa mềm học sinh thất bại");

      // 3. Thông báo và làm mới dữ liệu
      toast.success(`🗑️ Đã xóa mềm học sinh ${studentName} thành công!`);
      fetchStudentsData(); // Tải lại dữ liệu
    } catch (err) {
      toast.error(`❌ Lỗi xóa học sinh: ${err.message}`);
    }
  };
  // Logic lọc dữ liệu theo Tên, Lớp, Điểm dừng, Phụ huynh và Trạng thái
  const filteredStudents = useMemo(() => {
    if (loading) return [];
    if (!searchTerm) return students;

    const lowerCaseSearch = searchTerm.toLowerCase();

    return students.filter(student => {
      // 1. Tên Học sinh (hoten)
      const nameMatch = student.hoten?.toLowerCase().includes(lowerCaseSearch);

      // 2. Lớp học (lop)
      const classMatch = student.lop?.toLowerCase().includes(lowerCaseSearch);

      // 3. Điểm dừng (tendiemdon, diachi)
      const stopName = student.diemDonMacDinh?.tendiemdon?.toLowerCase();
      const stopAddress = student.diemDonMacDinh?.diachi?.toLowerCase();
      const stopMatch = stopName?.includes(lowerCaseSearch) || stopAddress?.includes(lowerCaseSearch);

      // 4. Thông tin phụ huynh (Tên, SĐT)
      const parentName = student.parentInfo?.userInfo?.hoten?.toLowerCase();
      const parentPhone = student.parentInfo?.userInfo?.sodienthoai?.toLowerCase();
      const parentMatch = parentName?.includes(lowerCaseSearch) || parentPhone?.includes(lowerCaseSearch);

      // 5. Trạng thái ("Đang học")
      const statusMatch = "đang học".includes(lowerCaseSearch);

      return nameMatch || classMatch || stopMatch || parentMatch || statusMatch;
    });
  }, [searchTerm, students, loading]);

  // 🚨 ĐIỂM MỚI: Hàm mở dialog Edit
  const openEditDialog = (student) => {
    // Chuyển đổi namsinh sang định dạng yyyy-mm-dd cho input type="date"
    const formattedNamsinh = student.namsinh ? new Date(student.namsinh).toISOString().split('T')[0] : '';

    // Tạo object initial values cho form Edit
    const initialValues = {
      hoten: student.hoten,
      lop: student.lop,
      namsinh: formattedNamsinh, // Đã format
      gioitinh: student.gioitinh,
      idphuhuynh: student.idphuhuynh || '',
      iddiemdon: student.iddiemdon || '',
      // Không cần truyền 'anhdaidien' (là File) vào initial state
    };

    setEditingStudent(student);
    setIsEditDialogOpen(true);
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
          <Button onClick={() => setIsAddDialogOpen(true)}> {/* 🚨 SỬA: Dùng state mới */}
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm học sinh mới
          </Button>
        </CardHeader>

        <CardContent>
          {/* Thanh tìm kiếm */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên, Lớp, Phụ huynh, Điểm dừng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#175e7a] focus:border-[#175e7a] transition duration-150 shadow-sm text-base"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Đang tải dữ liệu...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mb-3" />
              <p className="text-red-700 text-center font-medium px-4">{error}</p>
              <Button onClick={() => fetchStudentsData()} className="mt-4 bg-red-600 hover:bg-red-700">Thử lại</Button>
            </div>
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
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
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
                          // 🚨 SỬA: Gọi hàm mở dialog Edit
                          onClick={() => openEditDialog(student)}
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          // 🚨 SỬA ĐIỂM NÀY: Gọi hàm xóa
                          onClick={() => handleDeleteStudent(student.mahocsinh, student.hoten)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                      Không tìm thấy học sinh nào phù hợp với từ khóa "{searchTerm}".
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 🚨 DIALOG THÊM MỚI (Add) */}
      <AddEntityDialog
        isOpen={isAddDialogOpen} // 🚨 SỬA: Dùng state mới
        onClose={() => setIsAddDialogOpen(false)} // 🚨 SỬA: Dùng state mới
        title="Thêm học sinh"
        description="Điền thông tin học sinh"
        fields={STUDENT_FIELDS}
        onSubmit={handleAddStudent}
        submitButtonText="Thêm học sinh"
        accentColor="bg-yellow-400 hover:bg-yellow-500"
      />

      {/* 🚨 ĐIỂM MỚI: DIALOG CHỈNH SỬA (Edit) */}
      {editingStudent && (
        <AddEntityDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingStudent(null);
          }}
          title={`Chỉnh sửa: ${editingStudent.hoten}`}
          description="Cập nhật thông tin học sinh"
          fields={STUDENT_FIELDS}
          onSubmit={handleEditStudent}
          submitButtonText="Lưu thay đổi"
          accentColor="bg-blue-600 hover:bg-blue-700"
          // Truyền dữ liệu hiện tại vào form
          initialData={{
            hoten: editingStudent.hoten,
            lop: editingStudent.lop,
            gioitinh: editingStudent.gioitinh,
            // Định dạng ngày sinh cho input type="date"
            namsinh: editingStudent.namsinh ? new Date(editingStudent.namsinh).toISOString().split('T')[0] : '',
            idphuhuynh: editingStudent.idphuhuynh || '',
            iddiemdon: editingStudent.iddiemdon || '',
            // Không cần trường anhdaidien
          }}
        />
      )}
    </div>
  );
}