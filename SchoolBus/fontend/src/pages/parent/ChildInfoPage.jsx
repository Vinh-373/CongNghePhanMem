import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { School, Calendar, Plus, Loader2, AlertCircle, RefreshCw, User, Hash } from "lucide-react";
import { toast } from "sonner";

/**
 * Component Dialog Đa Năng cho việc thêm mới bất kỳ đối tượng nào.
 */
function AddEntityDialog({
    isOpen,
    onClose,
    title,
    description,
    fields,
    onSubmit,
    submitButtonText = "Lưu và Thêm",
    accentColor = "bg-blue-500 hover:bg-blue-600",
    isSubmitting = false
}) {
    const initialData = fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || (field.type === 'number' ? 0 : '');
        return acc;
    }, {});

    const [formData, setFormData] = useState(initialData);

    const handleOpenChange = (open) => {
        if (!open) {
            setFormData(initialData);
            onClose();
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? Number(value) : value 
        }));
    };

    const isFormValid = fields.every(field => {
        if (field.required) {
            const value = formData[field.name];
            return value !== '' && value !== 0 && value !== null && value !== undefined;
        }
        return true;
    });

    const handleSubmit = () => {
        if (isFormValid) {
            onSubmit(formData);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                    {fields.map((field) => (
                        <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                type={field.type || 'text'}
                                value={formData[field.name] || ''}
                                onChange={handleInputChange}
                                placeholder={field.placeholder}
                                min={field.type === 'number' && field.min !== undefined ? field.min : undefined}
                                disabled={isSubmitting}
                            />
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        className={accentColor}
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            submitButtonText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Component hiển thị thông tin chi tiết
 */
const InfoItem = ({ icon: IconComponent, label, value, colorClass = "text-gray-700" }) => (
    <div className="flex items-center space-x-2 text-sm">
        <IconComponent className="h-4 w-4 text-gray-400" />
        <span className="font-medium text-gray-500">{label}:</span>
        <span className={colorClass}>{value}</span>
    </div>
);

/**
 * Component chính - Quản lý thông tin học sinh
 */
export default function ChildInfo() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [children, setChildren] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Gọi API khi component mount
    useEffect(() => {
        fetchChildren();
    }, []);

    /**
     * Hàm gọi API lấy danh sách học sinh
     * Endpoint: GET /api/user/my-children
     */
    const fetchChildren = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để xem danh sách học sinh!');
            }
            
            const response = await fetch('http://localhost:5001/schoolbus/user/my-children', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                }
                throw new Error(`Lỗi ${response.status}: Không thể tải danh sách học sinh`);
            }

            const data = await response.json();
            console.log('✅ Dữ liệu từ API:', data);
            
            // Map dữ liệu từ BE sang format FE
            const mappedChildren = data.children.map(child => ({
                id: child.mahocsinh, // Dùng mahocsinh làm id
                name: child.hoten,
                grade: child.lop,
                gender: child.gioitinh,
                dob: child.namsinh,
                studentId: child.mahocsinh,
                avatar: child.anhdaidien || `https://i.pravatar.cc/150?u=${child.mahocsinh}`,
            }));
            console.log('🔄 Danh sách học sinh đã map:', mappedChildren);
            
            setChildren(mappedChildren);
            
        } catch (err) {
            console.error('❌ Lỗi khi tải danh sách học sinh:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Xử lý thêm học sinh mới
     * QUAN TRỌNG: API này chỉ kiểm tra học sinh có tồn tại
     * Không tạo mới học sinh, chỉ liên kết với phụ huynh
     */
    const handleSaveChild = async (newChildData) => {
        try {
            setIsSubmitting(true);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Vui lòng đăng nhập!');
            }
            
            // Bước 1: Kiểm tra học sinh có tồn tại không
            const checkResponse = await fetch(`http://localhost:5001/schoolbus/user/check-student?studentId=${newChildData.studentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const checkData = await checkResponse.json();

            if (!checkResponse.ok || !checkData.exists) {
                throw new Error(checkData.message || 'Mã học sinh không tồn tại trong hệ thống!');
            }

            // Bước 2: Kiểm tra học sinh đã được liên kết chưa
            if (checkData.parentLinked.exists) {
                throw new Error(`Học sinh này đã được liên kết với phụ huynh: ${checkData.parentLinked.parentInfo.hoten}`);
                
            }

            // Bước 3: Gọi API liên kết học sinh với phụ huynh (cần tạo endpoint này)
            const linkResponse = await fetch('http://localhost:5001/schoolbus/user/link-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    studentId: newChildData.studentId 
                }),
            });

            if (!linkResponse.ok) {
                const errorData = await linkResponse.json();
                throw new Error(errorData.message || 'Không thể liên kết học sinh!');
            }

            const linkedStudent = await linkResponse.json();
            console.log("✅ Đã liên kết học sinh:", linkedStudent);
            
            // Reload danh sách học sinh
            await fetchChildren();
            
            // Đóng modal
            setIsModalOpen(false);
            
            alert('✅ Liên kết học sinh thành công!');
            
        } catch (err) {
            console.error('❌ Lỗi khi thêm học sinh:', err);
            alert(`❌ ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddChild = () => {
        setIsModalOpen(true);
    };

    // Định nghĩa các trường cần thiết cho form Thêm học sinh
    // CHÚ Ý: Chỉ cần mã học sinh để kiểm tra và liên kết
    const addChildFields = [
        { 
            name: 'studentId', 
            label: 'Mã học sinh', 
            type: 'text', 
            placeholder: 'Nhập mã học sinh (ví dụ: HS2024001)', 
            required: true 
        },
    ];

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            
            {/* HEADER VÀ NÚT THÊM HỌC SINH */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Học Sinh</h1>
                    <p className="text-gray-600 mt-1">Danh sách học sinh được liên kết với tài khoản của bạn</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        onClick={fetchChildren} 
                        variant="outline"
                        className="text-gray-700"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                    <Button 
                        onClick={handleAddChild} 
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md transition-transform duration-200 ease-in-out transform hover:scale-[1.02]"
                        disabled={isLoading}
                    >
                        <Plus size={20} className="mr-2" />
                        Liên kết Học Sinh
                    </Button>
                </div>
            </div>

            {/* TRẠNG THÁI LOADING */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Đang tải danh sách học sinh...</p>
                        <p className="text-gray-400 text-sm mt-1">Vui lòng đợi trong giây lát</p>
                    </div>
                </div>
            )}

            {/* TRẠNG THÁI LỖI */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start space-x-4 shadow-sm">
                    <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-red-800 text-lg mb-1">Không thể tải dữ liệu</h3>
                        <p className="text-red-600 text-sm mb-3">{error}</p>
                        <Button 
                            onClick={fetchChildren} 
                            variant="outline" 
                            size="sm" 
                            className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Thử lại
                        </Button>
                    </div>
                </div>
            )}

            {/* DANH SÁCH HỌC SINH */}
            {!isLoading && !error && (
                <>
                    {children.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                                <School className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    Chưa có học sinh nào
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Bạn chưa có thông tin học sinh nào được liên kết với tài khoản.
                                </p>
                                <Button 
                                    onClick={handleAddChild}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    <Plus size={20} className="mr-2" />
                                    Liên kết Học Sinh Đầu Tiên
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                          
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {children.map((child) => (
                                    <Card 
                                        key={child.id} 
                                        className="flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl"
                                    >
                                        <CardHeader className="flex flex-row items-center space-x-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-b rounded-t-xl">
                                            <Avatar className="h-16 w-16 border-2 border-blue-500 shadow-md">
                                                <AvatarImage src={`http://localhost:5001/uploads/avatars/${child.avatar}`}alt={child.name} />
                                                <AvatarFallback className="bg-blue-500 text-white font-semibold text-lg">
                                                    {child.name?.[0] || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                                    {child.name}
                                                </h2>
                                                <p className="text-base text-blue-600 font-semibold mt-1">
                                                    {child.grade}
                                                </p>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-5 space-y-4 flex-grow bg-white">
                                            {/* THÔNG TIN CƠ BẢN */}
                                            <div className="space-y-3 pb-3 border-b border-gray-100">
                                                <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                                                    Thông tin cơ bản
                                                </h3>
                                                <InfoItem 
                                                    icon={Hash} 
                                                    label="Mã học sinh" 
                                                    value={child.studentId} 
                                                    colorClass="text-gray-900 font-bold"
                                                />
                                                <InfoItem 
                                                    icon={Calendar} 
                                                    label="Năm sinh" 
                                                    value= {child.dob } 
                                                />
                                                <InfoItem 
                                                    icon={User} 
                                                    label="Giới tính" 
                                                    value={child.gender} 
                                                    colorClass={
                                                        child.gender?.toLowerCase().includes('nam') 
                                                            ? 'text-blue-500 font-medium' 
                                                            : 'text-pink-500 font-medium'
                                                    }
                                                />
                                                
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* MODAL THÊM HỌC SINH */}
            <AddEntityDialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Liên kết Học Sinh"
                description="Nhập mã học sinh để liên kết với tài khoản phụ huynh của bạn. Hệ thống sẽ kiểm tra học sinh có tồn tại hay không."
                fields={addChildFields}
                onSubmit={handleSaveChild}
                submitButtonText="Kiểm tra và Liên kết"
                accentColor="bg-green-600 hover:bg-green-700"
                isSubmitting={isSubmitting}
            />
        </div>
    );
}