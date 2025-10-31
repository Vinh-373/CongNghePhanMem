import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Component Dialog Đa Năng cho việc thêm mới bất kỳ đối tượng nào (Xe, Học sinh, Phụ huynh,...)
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Trạng thái đóng/mở Dialog
 * @param {function} props.onClose - Hàm đóng Dialog
 * @param {string} props.title - Tiêu đề của Dialog
 * @param {string} props.description - Mô tả của Dialog
 * @param {Array<object>} props.fields - Mảng định nghĩa các trường form:
 * [{ name: string, label: string, type: string, placeholder: string, defaultValue: any }]
 * @param {function} props.onSubmit - Hàm xử lý khi nhấn Lưu, nhận dữ liệu form đã thu thập
 * @param {string} props.submitButtonText - Text trên nút Lưu
 * @param {string} props.accentColor - Màu chủ đạo cho nút Lưu (Tailwind class)
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

    // Reset form data khi dialog mở
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

    const handleSubmit = () => {
        onSubmit(formData);
        // Sau khi submit thành công (giả định), đóng dialog và reset
        setFormData(initialData);
        // Không đóng dialog ở đây, để hàm onClose của props xử lý
    };

    // Kiểm tra xem tất cả các trường bắt buộc đã được điền chưa
    const isFormValid = fields.every(field => {
        if (field.required) {
            return formData[field.name] !== '' && formData[field.name] !== 0;
        }
        return true;
    });

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange} >
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {fields.map((field) => (
                        <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                type={field.type || 'text'}
                                value={formData[field.name]}
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
export default AddEntityDialog;