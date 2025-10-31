import MainLayout from "@/components/layout/MainLayout"; // Đã sửa đường dẫn import để giải quyết lỗi
import { useState, useMemo } from 'react';
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
    Clock,
    UserPlus,
    PlusCircle,
    FilePenLine,
    Trash2,
    Search,
} from "lucide-react";

// === DỮ LIỆU HARD-CODE (MVP1) ===
const rawParentsData = [
    { 
        id: 1, 
        name: 'Trần Văn Mạnh', 
        avatar: "https://placehold.co/40x40/175E7A/FFFFFF?text=TM",
        phone: '0901234xxx', 
        email: 'manh.tran@gmail.com',
        childName: 'Trần Thị Mai', 
        childID: 'HS1001',
        status: 'Active' 
    },
    { 
        id: 2, 
        name: 'Lê Thị Thu', 
        avatar: "https://placehold.co/40x40/F5C247/000000?text=LT",
        phone: '0908765xxx', 
        email: 'thu.le@gmail.com',
        childName: 'Lê Văn Khang', 
        childID: 'HS1002',
        status: 'Pending' 
    },
    { 
        id: 3, 
        name: 'Phạm Quang Minh', 
        avatar: "https://placehold.co/40x40/175E7A/FFFFFF?text=PM",
        phone: '0912345xxx', 
        email: 'minh.pham@gmail.com',
        childName: 'Phạm Ngọc Anh', 
        childID: 'HS1003',
        status: 'Active' 
    },
    { 
        id: 4, 
        name: 'Nguyễn Thanh Tùng', 
        avatar: "https://placehold.co/40x40/F5C247/000000?text=NT",
        phone: '0987654xxx', 
        email: 'tung.nguyen@gmail.com',
        childName: 'Nguyễn Thu Huyền', 
        childID: 'HS1004',
        status: 'Active' 
    },
];

export default function ParentsPage() {
    // Giả lập user và notification để MainLayout hoạt động
    
    const [searchTerm, setSearchTerm] = useState('');

    // Lọc dữ liệu theo từ khóa tìm kiếm
    const parentsData = useMemo(() => {
        return rawParentsData.filter(parent => 
            parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.phone.includes(searchTerm) ||
            parent.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Helper để lấy badge màu theo trạng thái
    const getStatusBadge = (status) => {
        switch (status) {
            case "Active":
                // Đã chỉnh màu Badge để có độ tương phản và phù hợp với Tailwind CSS
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Hoạt động</Badge>;
            case "Pending":
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Chờ duyệt</Badge>;
            default:
                return <Badge variant="outline">Không rõ</Badge>;
        }
    };

    const stats = {
        total: rawParentsData.length,
        active: rawParentsData.filter((p) => p.status === "Active").length,
        pending: rawParentsData.filter((p) => p.status === "Pending").length,
    };

    // Hàm xử lý hành động (thay thế alert() bằng console.log())
    const handleAction = (action, name) => {
        console.log(`${action}: ${name}`);
        // Logic thực tế (mở modal chỉnh sửa/xác nhận xóa) sẽ được đặt ở đây
    };

    return (
        
        
            <div className="space-y-6">
                
                {/* === 1. THẺ TỔNG QUAN === */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Tổng số Phụ huynh */}
                    <Card className="hover:shadow-lg transition duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Tổng số Phụ huynh</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">tài khoản trong hệ thống</p>
                        </CardContent>
                    </Card>

                    {/* Phụ huynh Đang hoạt động */}
                    <Card className="hover:shadow-lg transition duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">đã xác minh và sử dụng</p>
                        </CardContent>
                    </Card>

                    {/* Phụ huynh Chờ duyệt */}
                    <Card className="hover:shadow-lg transition duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">yêu cầu đăng ký mới</p>
                        </CardContent>
                    </Card>
                </div>

                {/* === 2. BẢNG DANH SÁCH PHỤ HUYNH === */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="text-xl font-semibold text-gray-800">Danh sách Phụ huynh ({stats.total})</CardTitle>
                            <Button className="bg-[#175e7a] hover:bg-[#134c62]">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Thêm Phụ huynh mới
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Thanh tìm kiếm */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm theo Tên, SĐT, hoặc Email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#175e7a] focus:border-[#175e7a] transition duration-150 shadow-sm text-sm"
                            />
                        </div>

                        {/* Bảng dữ liệu */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Họ tên</TableHead>
                                        <TableHead>Thông tin liên lạc</TableHead>
                                        <TableHead>Học sinh</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parentsData.length > 0 ? (
                                        parentsData.map((parent) => (
                                            <TableRow key={parent.id}>
                                                {/* Họ tên & Avatar */}
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={parent.avatar} alt={parent.name} />
                                                            <AvatarFallback className="bg-[#175e7a] text-white">
                                                                {parent.name.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{parent.name}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Thông tin liên lạc */}
                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span>{parent.phone}</span>
                                                        <span className="text-muted-foreground">{parent.email}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Học sinh */}
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-medium">{parent.childName}</span>
                                                        <span className="text-muted-foreground text-xs">{parent.childID}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Trạng thái */}
                                                <TableCell>{getStatusBadge(parent.status)}</TableCell>

                                                {/* Hành động */}
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="hover:bg-blue-100 text-blue-600 border-blue-200"
                                                            onClick={() => handleAction("Chỉnh sửa", parent.name)}
                                                            title="Chỉnh sửa thông tin"
                                                        >
                                                            <FilePenLine className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                                            onClick={() => handleAction("Xóa", parent.name)}
                                                            title="Xóa phụ huynh"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                                Không tìm thấy phụ huynh nào phù hợp với từ khóa "{searchTerm}".
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

    );
}
