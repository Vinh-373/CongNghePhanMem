// src/components/StudentDetailDialog.jsx

import React from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"; 
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, Loader2 } from 'lucide-react'; 

// --- StudentListTable: Component hiển thị bảng (Giữ nguyên logic bảng) ---
const StudentListTable = ({ students }) => {
    if (!students || students.length === 0) {
        return <div className="text-center p-4 text-gray-500">Không có học sinh nào được chỉ định cho chuyến này.</div>
    }
    console.log("Rendering StudentListTable with students:", students);
    return (
        <div className="max-h-96 overflow-y-auto mt-4 border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Mã HS</TableHead>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Lớp</TableHead>
                        <TableHead>Năm sinh</TableHead>
                        <TableHead>Ảnh</TableHead> 
                        <TableHead className="w-[200px]">Thông tin Phụ huynh</TableHead> 
                        <TableHead className="w-[250px]">Điểm đón Mặc định</TableHead> 
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.mahocsinh}>
                            <TableCell className="font-medium">{student.mahocsinh}</TableCell>
                            <TableCell className="font-medium text-slate-700">{student.hoten}</TableCell>
                            <TableCell>{student.lop || 'N/A'}</TableCell>
                            <TableCell>{new Date(student.namsinh).toLocaleDateString('vi-VN')}</TableCell>
                            
                            <TableCell>
                                {student.anhdaidien ? (
                                    <img 
                                        src={`http://localhost:5001/uploads/avatars/${student.anhdaidien}`} 
                                        alt="Avatar" 
                                        className="h-8 w-8 rounded-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src="/path/to/default/avatar.png" }}
                                    />
                                ) : (
                                    <User className="h-6 w-6 text-gray-400" />
                                )}
                            </TableCell>

                            <TableCell className="text-xs">
                                {student.parentInfo && student.parentInfo.userInfo ? (
                                    <div className="space-y-1">
                                        <p className="font-semibold">{student.parentInfo.userInfo.hoten}</p>
                                        <p className="flex items-center gap-1 text-gray-600">
                                            <Phone className="h-3 w-3" /> 
                                            {student.parentInfo.userInfo.sodienthoai}
                                        </p>
                                        <p className="text-gray-500 truncate">{student.parentInfo.diachi}</p>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 italic">Chưa cập nhật</span>
                                )}
                            </TableCell>

                            <TableCell className="text-sm">
                                {student.diemDonMacDinh && student.diemDonMacDinh.tendiemdon ? (
                                    <div className="flex items-start gap-1">
                                        <MapPin className="h-4 w-4 flex-shrink-0 text-red-500 mt-1" />
                                        <span>{student.diemDonMacDinh.tendiemdon}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 italic">Không có điểm đón</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
// ----------------------------------------------------------------------------


const StudentDetailDialog = ({ isOpen, onClose, trip }) => {
    if (!trip) return null;
    
    const title = `Học sinh Tuyến ${trip.idlich} - ${trip.tentuyen}`;
    const description = `Tổng số: ${trip.tong_hocsinh} học sinh. Ngày: ${new Date(trip.ngaydi).toLocaleDateString('vi-VN')} - ${trip.giobatdau.substring(0, 5)}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* ⭐️ ĐÃ TĂNG KÍCH THƯỚC CHIỀU RỘNG TỐI ĐA LÊN 7XL (hoặc bạn có thể dùng w-[1200px]) */}
            <DialogContent className="sm:max-w-5xl lg:max-w-6xl w-full h-[80vh] bg-white"> 
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <StudentListTable students={trip.danhsachhocsinh_chi_tiet || []} />

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StudentDetailDialog;