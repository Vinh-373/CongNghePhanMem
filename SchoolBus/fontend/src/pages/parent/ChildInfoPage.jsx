import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// Imports cho Dialog (Giả định các components này có sẵn)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Đã loại bỏ 'User' vì không được sử dụng
import { School, MapPin, Calendar, Home, Venus, Mars, Hash, Phone, Plus } from "lucide-react"; 

/**
 * Component Dialog Đa Năng cho việc thêm mới bất kỳ đối tượng nào.
 * NOTE: Được tích hợp trong file này theo nguyên tắc React single-file.
 */
function AddEntityDialog({
    isOpen,
    onClose,
    title,
    description,
    fields,
    onSubmit,
    submitButtonText = "Lưu và Thêm",
    accentColor = "bg-blue-500 hover:bg-blue-600"
}) {
    // Khởi tạo trạng thái form dựa trên fields được truyền vào
    const initialData = fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || (field.type === 'number' ? 0 : '');
        return acc;
    }, {});

    const [formData, setFormData] = useState(initialData);

    // Reset form data khi dialog đóng
    const handleOpenChange = (open) => {
        if (!open) {
            setFormData(initialData); // Reset data when closing
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
        // Chỉ submit nếu form hợp lệ
        if (isFormValid) {
            onSubmit(formData);
            // Hàm onSubmit sẽ xử lý việc đóng modal
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange} >
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                    {fields.map((field) => (
                        <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                type={field.type || 'text'}
                                value={formData[field.name] || ''} // Đảm bảo giá trị được kiểm soát
                                onChange={handleInputChange}
                                placeholder={field.placeholder}
                                min={field.type === 'number' && field.min !== undefined ? field.min : undefined}
                            />
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button 
                        onClick={handleSubmit}
                        className={accentColor}
                        disabled={!isFormValid}
                    >
                        {submitButtonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function ChildInfo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [children, setChildren] = useState([
    {
      id: "1",
      name: "Nguyễn Minh Khang",
      grade: "Lớp 5A",
      gender: "Nam",
      dob: "2013-09-01", 
      studentId: "SB2013001", // Mã học sinh mới
      school: "Trường Tiểu học Hòa Bình",
      pickupPoint: "Cổng phụ - 45 Nguyễn Văn Cừ, Q.5",
      avatar: "https://i.pravatar.cc/150?img=12",
      parentName: "Phạm Thị Thu", 
      parentPhone: "0901 123 456", // Số điện thoại phụ huynh mới
    },
    {
      id: "2",
      name: "Trần Bảo An",
      grade: "Lớp 3B",
      gender: "Nữ",
      dob: "2015-05-15",
      studentId: "SB2015002",
      school: "Trường Tiểu học Hòa Bình",
      pickupPoint: "Nhà sách Nguyễn Văn Cừ",
      avatar: "https://i.pravatar.cc/150?img=25",
      parentName: "Nguyễn Văn Hùng",
      parentPhone: "0902 987 654",
    },
    {
      id: "3",
      name: "Lê Văn Tùng",
      grade: "Lớp 4C",
      gender: "Nam",
      dob: "2014-03-20",
      studentId: "SB2014003",
      school: "Trường Tiểu học Nguyễn Huệ",
      pickupPoint: "Công viên Hoàng Văn Thụ",
      avatar: "https://i.pravatar.cc/150?img=10",
      parentName: "Nguyễn Thị Mai",
      parentPhone: "0903 555 123",
    },
  ]);

  // Định nghĩa các trường cần thiết cho form Thêm học sinh
  const addChildFields = [
    { name: 'name', label: 'Họ và Tên', type: 'text', placeholder: 'Nguyễn Văn A', required: true },
    { name: 'grade', label: 'Lớp', type: 'text', placeholder: 'Lớp 1A', required: true },
    { name: 'gender', label: 'Giới tính (Nam/Nữ)', type: 'text', placeholder: 'Nam hoặc Nữ', required: true },
    { name: 'dob', label: 'Ngày sinh (YYYY-MM-DD)', type: 'date', placeholder: '2015-01-01', required: true },
    { name: 'studentId', label: 'Mã học sinh', type: 'text', placeholder: 'SBxxxxxxx', required: true },
    { name: 'school', label: 'Trường học', type: 'text', placeholder: 'Trường Tiểu học...', required: true },
    { name: 'pickupPoint', label: 'Điểm đón', type: 'text', placeholder: 'Địa chỉ cụ thể', required: true },
    { name: 'parentName', label: 'Tên Phụ huynh', type: 'text', placeholder: 'Trần Thị B', required: true },
    { name: 'parentPhone', label: 'Số ĐT Phụ huynh', type: 'tel', placeholder: '09xxxxxx', required: true },
  ];

  // Component phụ trợ hiển thị thông tin chi tiết
  const InfoItem = ({ icon: Icon, label, value, colorClass = "text-gray-700" }) => (
    <div className="flex items-center space-x-2 text-sm">
      <Icon className="h-4 w-4 text-gray-400" />
      <span className="font-medium text-gray-500">{label}:</span>
      <span className={colorClass}>{value}</span>
    </div>
  );

  const handleAddChild = () => {
    setIsModalOpen(true);
  };

  const handleSaveChild = (newChildData) => {
    // Logic giả định để thêm học sinh mới vào danh sách
    const newId = (children.length + 1).toString();
    const newChild = {
      ...newChildData,
      id: newId,
      // Default avatar and parsing DOB year
      avatar: newChildData.gender && newChildData.gender.toLowerCase().includes('nam') 
        ? "https://i.pravatar.cc/150?img=11" 
        : "https://i.pravatar.cc/150?img=22",
      dob: newChildData.dob, // Keep original date string
      gender: newChildData.gender.charAt(0).toUpperCase() + newChildData.gender.slice(1).toLowerCase(),
    };
    
    setChildren(prev => [...prev, newChild]);
    console.log("Đã thêm học sinh mới:", newChild);
    setIsModalOpen(false); // Đóng modal sau khi lưu thành công
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      
      {/* HEADER VÀ NÚT THÊM HỌC SINH */}
     
        <Button 
          onClick={handleAddChild} 
          className="bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md transition-transform duration-200 ease-in-out transform hover:scale-[1.02]"
        >
          <Plus size={20} className="mr-2" />
          Thêm Học Sinh
        </Button>

      
      {children.length === 0 ? (
        <p className="text-gray-600 italic">Bạn chưa có thông tin học sinh nào được liên kết.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="flex flex-col shadow-lg transition-shadow duration-300 hover:shadow-xl rounded-xl">
              <CardHeader className="flex flex-row items-center space-x-4 p-5 bg-blue-50/50 border-b rounded-t-xl">
                <Avatar className="h-16 w-16 border-2 border-blue-500">
                  <AvatarImage src={child.avatar} alt={child.name} />
                  <AvatarFallback className="bg-blue-500 text-white font-semibold">{child.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{child.name}</h2>
                  <p className="text-base text-blue-600 font-semibold">{child.grade}</p>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 flex-grow">
                {/* 1. THÔNG TIN CƠ BẢN */}
                <div className="space-y-3 pb-3 border-b">
                    <h3 className="text-xs uppercase text-gray-400 font-bold">Thông tin cơ bản</h3>
                    <InfoItem icon={Hash} label="Mã học sinh" value={child.studentId} colorClass="text-gray-900 font-bold"/>
                    <InfoItem icon={Calendar} label="Năm sinh" value={new Date(child.dob).getFullYear()} />
                    <InfoItem 
                        icon={child.gender && child.gender.toLowerCase().includes('nam') ? Mars : Venus} 
                        label="Giới tính" 
                        value={child.gender} 
                        colorClass={child.gender && child.gender.toLowerCase().includes('nam') ? 'text-blue-500' : 'text-pink-500'}
                    />
                </div>
                
                {/* 2. THÔNG TIN LIÊN LẠC */}
                <div className="space-y-3 pb-3 border-b">
                    <h3 className="text-xs uppercase text-gray-400 font-bold">Liên hệ & Phụ huynh</h3>
                    <InfoItem icon={Home} label="Phụ huynh" value={child.parentName} colorClass="text-gray-900"/>
                    <InfoItem icon={Phone} label="Điện thoại" value={child.parentPhone} colorClass="text-green-600 font-bold"/>
                </div>

                {/* 3. THÔNG TIN TUYẾN XE */}
                <div className="space-y-3">
                    <h3 className="text-xs uppercase text-gray-400 font-bold">Logistics</h3>
                    <InfoItem icon={School} label="Trường học" value={child.school} />
                    <InfoItem icon={MapPin} label="Điểm đón" value={child.pickupPoint} colorClass="text-gray-900"/>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL THÊM HỌC SINH */}
      <AddEntityDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Học Sinh Mới"
        description="Nhập thông tin chi tiết của học sinh để thêm vào danh sách quản lý."
        fields={addChildFields}
        onSubmit={handleSaveChild}
        submitButtonText="Thêm Học Sinh"
        accentColor="bg-green-600 hover:bg-green-700"
      />
    </div>
  );
}
