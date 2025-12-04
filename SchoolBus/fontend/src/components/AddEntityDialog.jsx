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
    console.log("🔍 MultiSelectCombobox - value:", value, "type:", Array.isArray(value) ? "array" : typeof value);

    // Đảm bảo value luôn là mảng
    const selectedValues = Array.isArray(value) ? value : [];

    // Tìm label cho một value đã chọn
    const getLabelForValue = (val) => {
        const option = options.find(opt => getOptionValue(opt) === val);
        return option ? getOptionLabel(option) : val;
    };

    // Lọc các options chưa được chọn
    const availableOptions = options.filter(opt => {
        const optValue = getOptionValue(opt);
        return !selectedValues.includes(optValue);
    });

    // ✅ FIX: Xóa một item - nhận value của item cần xóa
    const handleRemove = (itemToRemove) => {
        console.log("🗑️ Removing item:", itemToRemove);
        const updatedValues = selectedValues.filter(item => item !== itemToRemove);
        console.log("📝 Updated values:", updatedValues);
        onChange(fieldName, updatedValues);
    };

    // Thêm một item
    const handleAdd = (itemToAdd) => {
        console.log("➕ Adding item:", itemToAdd);
        const updatedValues = [...selectedValues, itemToAdd];
        console.log("📝 Updated values:", updatedValues);
        onChange(fieldName, updatedValues);
    };

    return (
        <div className="border rounded-md p-2 min-h-[40px] flex flex-wrap gap-2 items-start">
            {selectedValues.length === 0 && (
                <span className="text-muted-foreground text-sm py-1 px-2">{placeholder}</span>
            )}

            {/* Hiển thị các mục đã chọn */}
            {selectedValues.map(item => (
                <div
                    key={item}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1"
                >
                    <span className="text-sm">{getLabelForValue(item)}</span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("🗑️ Removing item:", item);
                            handleRemove(item);
                        }}
                        className="ml-1 hover:text-purple-900 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
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
    accentColor = "bg-blue-500 hover:bg-blue-600",
    initialData = null,
}) {
    // Khởi tạo dữ liệu mặc định
    const initialDataFallback = fields.reduce((acc, field) => {
        if (field.type === 'multi-select') acc[field.name] = [];
        else acc[field.name] = field.defaultValue || (field.type === 'number' ? 0 : '');
        return acc;
    }, {});

    const [formData, setFormData] = useState(initialData || initialDataFallback);
    const [filePreviews, setFilePreviews] = useState({});

    // ✅ Cập nhật formData khi initialData thay đổi
    useEffect(() => {
        if (initialData) {
            console.log("📥 Setting initialData:", initialData);
            setFormData(initialData);
        } else {
            console.log("📥 Setting fallback data");
            setFormData(initialDataFallback);
        }
        setFilePreviews({});
    }, [initialData, isOpen]);

    const handleOpenChange = (open) => {
        if (!open) {
            setFormData(initialData || initialDataFallback);
            setFilePreviews({});
            onClose();
        }
    };

    // 🎯 HÀM CHUNG CẬP NHẬT FORM DATA
    const handleDataChange = (name, value) => {
        console.log(`📝 Field changed: ${name}`, value);

        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            console.log("✅ Updated formData:", updated);
            return updated;
        });

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
        console.log("✅ Submitting form data:", formData);
        onSubmit(formData);
        setFormData(initialData || initialDataFallback);
        setFilePreviews({});
    };

    const isFormValid = fields.every(field => {
        if (field.required) {
            const value = formData[field.name];
            if (field.type !== 'multi-select' && (value === '' || value === 0 || value === null || value === undefined)) {
                return false;
            }
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {fields.map((field) => (
                        <div
                            key={field.name}
                            className={`space-y-2 ${field.type === 'multi-select' ? 'sm:col-span-2' : ''}`}
                        >
                            <Label htmlFor={field.name}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>

                            {/* SELECT */}
                            {field.type === 'select' && field.options ? (
                                <Select
                                    onValueChange={(value) => handleSelectChange(field.name, value)}
                                    value={String(formData[field.name] || '')}
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
                                                <SelectItem key={optValue} value={String(optValue)}>
                                                    {optLabel}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            ) :

                            /* MULTI-SELECT */
                            field.type === 'multi-select' && field.options ? (
                                <MultiSelectCombobox
                                    fieldName={field.name}
                                    value={formData[field.name] || []}
                                    options={field.options}
                                    onChange={handleDataChange}
                                    placeholder={field.placeholder || "Chọn nhiều mục..."}
                                />
                            ) :

                            /* FILE */
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

                            /* TEXT, NUMBER, DATE, TIME */
                            (
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type || 'text'}
                                    value={formData[field.name] || ''}
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