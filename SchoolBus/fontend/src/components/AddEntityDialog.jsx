import { useState, useEffect } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; 

// ----------------------------------------------------------------------------------
// 🎯 Helper Functions - HỖ TRỢ CẢ STRING VÀ OBJECT
// ----------------------------------------------------------------------------------
const getOptionValue = (opt) => {
    return typeof opt === 'object' && opt !== null ? opt.value : opt;
};

const getOptionLabel = (opt) => {
    return typeof opt === 'object' && opt !== null ? opt.label : opt;
};

// ----------------------------------------------------------------------------------
// 🎯 Multi-Select Combobox - HỖ TRỢ CẢ STRING VÀ OBJECT
// ----------------------------------------------------------------------------------
const MultiSelectCombobox = ({ value, options, onChange, placeholder, fieldName }) => {
    // Tìm label cho một value đã chọn
    const getLabelForValue = (val) => {
        const option = options.find(opt => getOptionValue(opt) === val);
        return option ? getOptionLabel(option) : val;
    };

    // Lọc các options chưa được chọn
    const availableOptions = options.filter(opt => !value.includes(getOptionValue(opt)));
    
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
                    {getLabelForValue(item)}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemove(item)} />
                </Badge>
            ))}

            {/* Dropdown để chọn thêm */}
            {availableOptions.length > 0 && (
                <Select onValueChange={handleAdd}>
                    <SelectTrigger className="h-7 w-[100px] text-xs">
                        <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        {availableOptions.map(opt => {
                            const optValue = getOptionValue(opt);
                            const optLabel = getOptionLabel(opt);
                            return (
                                <SelectItem key={optValue} value={optValue}>
                                    {optLabel}
                                </SelectItem>
                            );
                        })}
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

    // Cập nhật formData khi fields thay đổi
    useEffect(() => {
        setFormData(initialData);
    }, [JSON.stringify(fields.map(f => f.name))]);

    const handleOpenChange = (open) => {
        if (!open) {
            setFormData(initialData);
            setFilePreviews({});
            onClose();
        }
    };

    // 🎯 HÀM CHUNG CẬP NHẬT FORM DATA
    const handleDataChange = (name, value) => {
        console.log(`📝 Field changed: ${name} = ${value}`);
        
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));

        // ⭐ GỌI CALLBACK onChange NẾU CÓ
        const field = fields.find(f => f.name === name);
        if (field && field.onChange) {
            console.log(`🔔 Calling onChange for ${name}`);
            field.onChange(value);
        }
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

    const handleSelectChange = (fieldName, value) => {
        console.log(`🎯 Select changed: ${fieldName} = ${value}`);
        handleDataChange(fieldName, value);
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
            if (field.type !== 'multi-select' && (value === '' || value === 0 || value === null || value === undefined)) {
                return false;
            }
            // Kiểm tra cho multi-select (phải có ít nhất 1 item nếu required)
            if (field.type === 'multi-select' && Array.isArray(value) && value.length === 0) {
                return false;
            }
        }
        return true;
    });

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white"> 
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                
                {/* Grid 2 cột với scroll nếu form dài */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {fields.map((field) => (
                        <div 
                            key={field.name} 
                            className={`space-y-2 ${field.type === 'multi-select' ? 'sm:col-span-2' : ''}`}
                        >
                            <Label htmlFor={field.name}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>

                            {/* 🎯 XỬ LÝ LOẠI SELECT - HỖ TRỢ CẢ STRING VÀ OBJECT */}
                            {field.type === 'select' && field.options ? (
                                <Select 
                                    onValueChange={(value) => handleSelectChange(field.name, value)}
                                    value={formData[field.name]}
                                    name={field.name}
                                    disabled={field.disabled || field.isLoading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={field.placeholder || "Chọn một mục..."} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-[300px]">
                                        {field.options.map(option => {
                                            const optValue = getOptionValue(option);
                                            const optLabel = getOptionLabel(option);
                                            return (
                                                <SelectItem key={optValue} value={optValue}>
                                                    {optLabel}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            ) :
                            
                            /* 🎯 XỬ LÝ LOẠI MULTI-SELECT - HỖ TRỢ CẢ STRING VÀ OBJECT */
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
                                        disabled={field.disabled}
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
                                    disabled={field.disabled}
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