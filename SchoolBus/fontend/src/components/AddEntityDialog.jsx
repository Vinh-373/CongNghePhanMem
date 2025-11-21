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
import { Badge } from "@/components/ui/badge"; // Cần cho Multi-select
import { ChevronDown, X } from 'lucide-react'; // Icons cho Select và Multi-select
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; 

// ----------------------------------------------------------------------------------
// 🎯 Placeholder cho Multi-Select Combobox (Giữ nguyên)
// ----------------------------------------------------------------------------------
const MultiSelectCombobox = ({ value, options, onChange, placeholder, fieldName }) => {
    // Giá trị 'value' là một mảng các item đã chọn (ví dụ: ["ID_1", "ID_2"])
    const availableOptions = options.filter(opt => !value.includes(opt));
    
    // Xóa một item
    const handleRemove = (itemToRemove) => {
        onChange(fieldName, value.filter(item => item !== itemToRemove));
    };

    // Thêm một item
    const handleAdd = (itemToAdd) => {
        onChange(fieldName, [...value, itemToAdd]);
    };

    return (
        <div className="border rounded-md p-2 min-h-[40px] flex flex-wrap gap-2 items-start">
            {value.length === 0 && (
                <span className="text-muted-foreground text-sm py-1 px-2">{placeholder}</span>
            )}
            
            {/* Hiển thị các mục đã chọn */}
            {value.map(item => (
                <Badge key={item} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    {item}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemove(item)} />
                </Badge>
            ))}

            {/* Dropdown để chọn thêm */}
            {availableOptions.length > 0 && (
                <Select onValueChange={handleAdd}>
                    <SelectTrigger className="h-7 w-[100px] text-xs">
                        <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent>
                        {availableOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};
// ----------------------------------------------------------------------------------

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
    const initialData = fields.reduce((acc, field) => {
        // Khởi tạo Multi-select với mảng rỗng
        if (field.type === 'multi-select') {
             acc[field.name] = [];
        } else {
             acc[field.name] = field.defaultValue || (field.type === 'number' ? 0 : '');
        }
        return acc;
    }, {});

    const [formData, setFormData] = useState(initialData);
    const [filePreviews, setFilePreviews] = useState({});

    // Cập nhật lại initialData khi fields thay đổi
    useState(() => {
        setFormData(initialData);
    }, [fields]);


    const handleOpenChange = (open) => {
        if (!open) {
            setFormData(initialData);
            setFilePreviews({});
            onClose();
        }
    };

    // 🎯 HÀM CHUNG CẬP NHẬT FORM DATA (bao gồm select và multi-select)
    const handleDataChange = (name, value) => {
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        handleDataChange(name, type === 'number' ? Number(value) : value);
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            handleDataChange(fieldName, file);
            if (file.type.startsWith('image/')) {
                setFilePreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
            }
        }
    };

    const handleSubmit = () => {
        onSubmit(formData);
        setFormData(initialData);
        setFilePreviews({});
    };

    const isFormValid = fields.every(field => {
        if (field.required) {
            const value = formData[field.name];
            // Kiểm tra cho các loại cơ bản
            if (field.type !== 'multi-select' && (value === '' || value === 0 || value === null)) {
                return false;
            }
            // Kiểm tra cho multi-select (phải có ít nhất 1 item)
            if (field.type === 'multi-select' && Array.isArray(value) && value.length === 0) {
                return false;
            }
        }
        return true;
    });

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {/* Tăng kích thước dialog và THAY ĐỔI CSS Grid */}
            <DialogContent className="sm:max-w-[600px] bg-white"> 
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                
                {/* 💥 THAY ĐỔI TẠI ĐÂY: Sử dụng grid 2 cột cho màn hình vừa (sm) trở lên */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 py-4">
                    {fields.map((field) => (
                        <div 
                            key={field.name} 
                            className={`space-y-2 ${field.type === 'multi-select' ? 'sm:col-span-2' : ''}`}
                        >
                            <Label htmlFor={field.name}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>

                            {/* 🎯 XỬ LÝ LOẠI SELECT */}
                            {field.type === 'select' && field.options ? (
                                <Select 
                                    onValueChange={(value) => handleDataChange(field.name, value)} 
                                    value={formData[field.name]}
                                    name={field.name}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={field.placeholder || "Chọn một mục..."} />
                                    </SelectTrigger>
                                    <SelectContent className={'bg-white'}>
                                        {field.options.map(option => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) :
                            
                            /* 🎯 XỬ LÝ LOẠI MULTI-SELECT */
                            field.type === 'multi-select' && field.options ? (
                                <MultiSelectCombobox
                                    fieldName={field.name}
                                    value={formData[field.name] || []}
                                    options={field.options}
                                    onChange={handleDataChange}
                                    placeholder={field.placeholder || "Chọn nhiều mục..."}
                                />
                            ) :
                            
                            /* XỬ LÝ LOẠI FILE */
                            field.type === 'file' ? (
                                <>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="file"
                                        accept={field.accept || 'image/*'}
                                        onChange={(e) => handleFileChange(e, field.name)}
                                    />
                                    {filePreviews[field.name] && (
                                        <img
                                            src={filePreviews[field.name]}
                                            alt="preview"
                                            className="w-24 h-24 rounded-full mt-2 object-cover border-2 border-yellow-400"
                                        />
                                    )}
                                </>
                            ) : 
                            
                            /* XỬ LÝ CÁC LOẠI CƠ BẢN (text, number, date, time) */
                            (
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type || 'text'}
                                    value={formData[field.name]}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    min={field.type === 'number' && field.min !== undefined ? field.min : undefined}
                                />
                            )}
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