import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Users, UserCheck, Clock, PlusCircle, FilePenLine, Trash2, Search, Loader2, XCircle, ChevronDown, X
} from "lucide-react";

// --- START: Mock UI Components (Thay thế bằng các components UI thực tế) ---
const Card = ({ children, className = "" }) => <div className={`rounded-xl border bg-white shadow-md ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Button = ({ children, onClick, variant = "default", size = "default", className = "", disabled = false, title = "" }) => {
    let baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    let sizeStyles = "h-10 px-4 py-2";
    if (size === "icon") sizeStyles = "h-9 w-9 p-0";
    if (size === "sm") sizeStyles = "h-9 rounded-md px-3";

    let variantStyles = "";
    switch (variant) {
        case "default":
            variantStyles = "bg-[#175e7a] text-white hover:bg-[#134c62] focus:ring-[#175e7a]";
            break;
        case "outline":
            variantStyles = "border border-gray-300 bg-white hover:bg-gray-50 focus:ring-gray-300";
            break;
        case "destructive":
            variantStyles = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600";
            break;
        default:
            variantStyles = "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-800";
    }

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
            disabled={disabled}
            title={title}
        >
            {children}
        </button>
    );
};

const Badge = ({ children, className = "bg-gray-100 text-gray-800" }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${className}`}>
        {children}
    </span>
);

const Avatar = ({ children, className = "" }) => (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
        {children}
    </div>
);
const AvatarImage = ({ src, alt }) => (
    <img src={src} alt={alt} className="aspect-square h-full w-full" />
);
const AvatarFallback = ({ children, className = "" }) => (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-sm font-semibold ${className}`}>
        {children}
    </div>
);

const Table = ({ children, className = "" }) => <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>;
const TableHeader = ({ children, className = "" }) => <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>;
const TableBody = ({ children, className = "" }) => <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>;
const TableRow = ({ children, className = "" }) => <tr className={`border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100 ${className}`}>{children}</tr>;
const TableHead = ({ children, className = "" }) => <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>;
const TableCell = ({ children, className = "" }) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>;
// --- END: Mock UI Components ---


// =========================================================================================
// 🎯 ADD ENTITY DIALOG COMPONENT (Updated)
// =========================================================================================

// Placeholder cho Dialog components
const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            // FIX: Sử dụng onOpenChange để đóng khi click vào backdrop
            onClick={() => onOpenChange(false)} 
        >
            {/* Ngăn chặn sự kiện click lan truyền từ nội dung dialog lên backdrop */}
            <div onClick={(e) => e.stopPropagation()}>{children}</div> 
        </div>
    );
};
const DialogContent = ({ children, className }) => <div className={`relative max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-2xl transition-all duration-300 ${className}`}>{children}</div>;
const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-2xl font-semibold leading-none tracking-tight">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-sm text-gray-500">{children}</p>;
const DialogFooter = ({ children }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 border-t pt-4">{children}</div>;

// Placeholder cho Input, Label
const Input = ({ id, name, type, value, onChange, placeholder, accept, min }) => (
    <input 
        id={id} 
        name={name} 
        type={type} 
        value={type !== 'file' ? value : undefined} 
        onChange={onChange} 
        placeholder={placeholder} 
        accept={accept}
        min={min}
        className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#175e7a] disabled:cursor-not-allowed disabled:opacity-50"
    />
);
const Label = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {children}
    </label>
);

// Placeholder cho Select components
const Select = ({ onValueChange, value, name, children }) => (
    <select 
        name={name} 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)} 
        className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#175e7a] disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat bg-[length:1.2rem] bg-[position:right_0.5rem_center]"
        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m4 6 4 4 4-4"/></svg>')` }}
    >
        {children}
    </select>
);
// FIX: Đảm bảo className được sử dụng trong template literal để tránh cảnh báo.
const SelectTrigger = ({ children, className = "" }) => <div className={`select-trigger-base ${className}`}>{children}</div>; 
const SelectValue = ({ placeholder }) => <option value="" disabled hidden>{placeholder}</option>;
const SelectContent = ({ children }) => <div>{children}</div>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>; 


// ----------------------------------------------------------------------------------
// ⚠️ MultiSelectCombobox KHÔNG CÒN ĐƯỢC SỬ DỤNG
// ----------------------------------------------------------------------------------
const MultiSelectCombobox = ({ value, options, onChange, placeholder, fieldName }) => {
    // Giữ lại component này nhưng nó sẽ không được gọi trong trường hợp này.
    const availableOptions = options.filter(opt => !value.includes(opt));
    
    const handleRemove = (itemToRemove) => {
        onChange(fieldName, value.filter(item => item !== itemToRemove));
    };

    const handleAdd = (itemToAdd) => {
        onChange(fieldName, [...value, itemToAdd]);
    };

    return (
        <div className="border rounded-lg p-2 min-h-[40px] flex flex-wrap gap-2 items-start">
            {value.length === 0 && (
                <span className="text-gray-400 text-sm py-1 px-2">{placeholder}</span>
            )}
            
            {value.map(item => (
                <Badge key={item} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    {item}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleRemove(item)} />
                </Badge>
            ))}

            {availableOptions.length > 0 && (
                <Select onValueChange={handleAdd}>
                    <SelectTrigger className="h-7 w-[100px] text-xs">
                        <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    {availableOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>
                            {opt}
                        </SelectItem>
                    ))}
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
    accentColor = "bg-[#175e7a] hover:bg-[#134c62]",
    // Thêm prop để quản lý trạng thái đang gửi
    isSubmitting = false 
}) {
    
    // Khởi tạo initialData sử dụng useMemo để tránh việc tạo lại liên tục
    const initialData = useMemo(() => fields.reduce((acc, field) => {
        if (field.type === 'multi-select') {
             acc[field.name] = [];
        } else {
             // Chuyển defaultValue sang string nếu là select (API thường nhận string)
             acc[field.name] = field.defaultValue !== undefined && field.type === 'select' 
                ? String(field.defaultValue) 
                : (field.defaultValue || (field.type === 'number' ? 0 : ''));
        }
        return acc;
    }, {}), [fields]);


    const [formData, setFormData] = useState(initialData);
    const [filePreviews, setFilePreviews] = useState({});

    // Cập nhật lại formData khi fields (tức là initialData) thay đổi
    useEffect(() => {
         setFormData(initialData);
         setFilePreviews({}); // Reset preview khi cấu trúc form thay đổi
    }, [initialData]);


    const handleOpenChange = (open) => {
        if (!open) {
            // Khi dialog đóng, reset form data
            setFormData(initialData);
            setFilePreviews({});
            onClose();
        }
    };

    const handleDataChange = (name, value) => {
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        // Xử lý giá trị khi input type=text/email/password...
        if (type !== 'number') {
            handleDataChange(name, value);
        } else {
            // Xử lý giá trị khi input type=number
             handleDataChange(name, Number(value));
        }
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

    const handleSubmit = async () => {
        if (isFormValid) {
            // onSubmit (handleAddParentSubmit) sẽ chịu trách nhiệm gọi API
            await onSubmit(formData);
            // Dialog sẽ đóng sau khi API call hoàn tất thành công hoặc thất bại.
            // Để đơn giản, ta đóng dialog ngay sau khi submit được gọi.
            // Tuy nhiên, việc đóng dialog nên phụ thuộc vào kết quả API. 
            // Tôi sẽ giữ logic đóng trong hàm gọi API để đảm bảo UX tốt hơn.
            // Nhưng theo cấu trúc hiện tại, AddEntityDialog.handleSubmit gọi onSubmit(formData)
            // và sau đó gọi handleOpenChange(false). Ta sẽ điều chỉnh lại ở hàm gọi API.
            handleOpenChange(false);
        }
    };

    const isFormValid = fields.every(field => {
        if (field.required) {
            const value = formData[field.name];
            
            // Trường File
             if (field.type === 'file') {
                // Nếu trường file là bắt buộc và không có file nào được chọn, hoặc giá trị không phải là File object
                if (field.required && !value) return false;
                if (field.required && !(value instanceof File)) return false;
                
                // Trường file không bắt buộc thì luôn hợp lệ
                return true; 
            }
            
            // Trường Multi-select (nếu còn)
            if (field.type === 'multi-select' && Array.isArray(value)) {
                return value.length > 0;
            }

            // Trường cơ bản (text, email, password, select)
            if (value === '' || value === null || value === undefined) {
                return false;
            }
            
            // Trường number
            if (field.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 py-4">
                    {fields.map((field) => (
                        <div 
                            key={field.name} 
                            // 🎯 ĐIỀU CHỈNH: Chỉ Địa chỉ (address) và Multi-select (nếu có) là fullWidth
                            className={`space-y-2 ${field.fullWidth || field.type === 'multi-select' ? 'sm:col-span-2' : ''}`}
                        >
                            <Label htmlFor={field.name}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>

                            {/* 🎯 XỬ LÝ LOẠI SELECT */}
                            {field.type === 'select' && field.options ? (
                                <Select 
                                    onValueChange={(value) => handleDataChange(field.name, value)} 
                                    // Giá trị phải là string để Select hoạt động đúng
                                    value={String(formData[field.name])} 
                                    name={field.name}
                                >
                                    <SelectValue placeholder={field.placeholder || "Chọn một mục..."} />
                                    {field.options.map(option => (
                                        // Sử dụng option.value và option.label
                                        <SelectItem key={option.value} value={String(option.value)}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                            ) :
                            
                            /* 🎯 XỬ LÝ LOẠI MULTI-SELECT (Nếu có) */
                            field.type === 'multi-select' && field.options ? (
                                <MultiSelectCombobox
                                    fieldName={field.name}
                                    value={formData[field.name] || []}
                                    options={field.options.map(o => o.value)} 
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
                                        disabled={isSubmitting}
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
                            
                            /* XỬ LÝ CÁC LOẠI CƠ BẢN (text, number, date, time, password) */
                            (
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type || 'text'}
                                    value={formData[field.name]}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    min={field.type === 'number' && field.min !== undefined ? field.min : undefined}
                                    disabled={isSubmitting}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button 
                        onClick={handleSubmit}
                        className={accentColor}
                        disabled={!isFormValid || isSubmitting} // ⬅️ Vô hiệu hóa khi đang gửi
                    >
                        {isSubmitting ? (
                             <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...</>
                        ) : (
                            submitButtonText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
// =========================================================================================
// 🎯 KẾT THÚC COMPONENT AddEntityDialog
// =========================================================================================


// API Endpoint
const API_URL = "http://localhost:5001/schoolbus/admin/get-all-parents";
const ADD_PARENT_API_URL = "http://localhost:5001/schoolbus/admin/add-parent"; // ⬅️ Thêm hằng số cho API thêm mới
const MAX_RETRIES = 3;

/**
 * Maps the numeric status code from the API to a display string.
 */
const mapStatus = (code) => {
    switch(code) {
        case 1: return 'Pending'; // Chờ duyệt
        case 2: return 'Active'; // Hoạt động
        case 3: return 'Inactive'; // Ngưng hoạt động (ví dụ)
        default: return 'Unknown';
    }
}

/**
 * Main application component for Parents Management
 */
export default function App() {
    const [parentsData, setParentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // 🎯 State quản lý Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // 🎯 State quản lý trạng thái đang gửi (submit)
    const [isSubmitting, setIsSubmitting] = useState(false);


    const fetchData = useCallback(async (retryCount = 0) => {
        setLoading(true);
        setError(null);
        
        const delay = Math.pow(2, retryCount) * 1000;
        if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            const parentsList = Array.isArray(data.parents) ? data.parents : [];

            const processedList = parentsList.map(parent => {
                const userInfo = parent.userInfo || {};
                const rawPhone = userInfo.sodienthoai || 'N/A';
                
                const avatarBaseUrl = 'http://localhost:5001'; 
                // Xử lý để hiển thị đường dẫn avatar chính xác từ API
                const avatarUrl = userInfo.anhdaidien 
                    ? (userInfo.anhdaidien.startsWith('http') ? userInfo.anhdaidien : `${avatarBaseUrl}${userInfo.anhdaidien}`) 
                    : `https://placehold.co/40x40/175E7A/FFFFFF?text=${userInfo.hoten ? userInfo.hoten.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase() : 'PH'}`;

                return {
                    id: parent.idphuhuynh,
                    name: userInfo.hoten || 'Phụ huynh chưa đặt tên',
                    avatar: avatarUrl,
                    phone: rawPhone.length > 3 ? rawPhone.slice(0, -3) + 'xxx' : rawPhone,
                    email: userInfo.email || 'N/A',
                    address: parent.diachi || 'Chưa cập nhật',
                    status: mapStatus(userInfo.trangthai)
                };
            });

            setParentsData(processedList);
        } catch (err) {
            console.error("Fetch error:", err);
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying fetch... Attempt ${retryCount + 1}`);
                fetchData(retryCount + 1);
            } else {
                setError(`Không thể kết nối đến API: ${API_URL}. Vui lòng kiểm tra server hoặc cấu trúc dữ liệu trả về. Chi tiết lỗi: ${err.message}`);
            }
        } finally {
            if (retryCount === 0 || retryCount === MAX_RETRIES) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Lọc dữ liệu theo từ khóa tìm kiếm
    const filteredParents = useMemo(() => {
        if (loading) return [];
        return parentsData.filter(parent =>
            parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.phone.includes(searchTerm) ||
            (parent.email && parent.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, parentsData, loading]);

    // Helper để lấy badge màu theo trạng thái
    const getStatusBadge = (status) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Hoạt động</Badge>;
            case "Pending":
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Chờ duyệt</Badge>;
            case "Inactive":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Ngưng hoạt động</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">Không rõ</Badge>;
        }
    };

    const stats = useMemo(() => ({
        total: parentsData.length,
        active: parentsData.filter((p) => p.status === "Active").length,
        pending: parentsData.filter((p) => p.status === "Pending").length,
    }), [parentsData]);

    // Hàm xử lý hành động
    const handleAction = (action, name) => {
        console.log(`${action}: ${name}`);
        // Logic thực tế (mở Modal/Dialog)
    };
    
    // --- Cấu hình Form Dialog cho Phụ huynh ---
    const parentFields = useMemo(() => [
        { name: 'hoten', label: 'Họ và Tên', type: 'text', placeholder: 'Nguyễn Văn A', required: true, fullWidth: false },
        { name: 'sodienthoai', label: 'Số điện thoại', type: 'text', placeholder: '09xx-xxx-xxx', required: true, fullWidth: false },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'a.nguyen@gmail.com', required: true, fullWidth: false },
        { name: 'matkhau', label: 'Mật khẩu', type: 'password', placeholder: 'Tối thiểu 6 ký tự', required: true, fullWidth: false }, 
        
        // Địa chỉ chiếm hết hàng
        { name: 'diachi', label: 'Địa chỉ', type: 'text', placeholder: '123 Đường ABC, Quận XYZ', required: false, fullWidth: true },
        
        { 
            name: 'trangthai', 
            label: 'Trạng thái Tài khoản', 
            type: 'select', 
            options: [
                {label: 'Hoạt động', value: '2'}, 
                {label: 'Chờ duyệt', value: '1'}, 
                {label: 'Ngưng hoạt động', value: '3'}
            ],
            defaultValue: '1',
            required: true, 
            fullWidth: false 
        },
        { name: 'avatar', label: 'Ảnh đại diện', type: 'file', accept: 'image/*', required: false, fullWidth: false },
    ], []); // Dùng useMemo để tránh việc tạo lại liên tục

    
    // =================================================================
    // 🎯 HÀM XỬ LÝ SUBMIT FORM (ĐÃ VIẾT LẠI)
    // =================================================================
    const handleAddParentSubmit = useCallback(async (formData) => {
        console.log("Dữ liệu phụ huynh mới:", formData);
        
        setIsSubmitting(true);

        const dataToSend = new FormData();

        // Chuẩn bị FormData để gửi dữ liệu bao gồm cả File (avatar)
        for (const key in formData) {
            const value = formData[key];
            
            // Xử lý giá trị '0' (number) thành '0' (string) cho API
            const finalValue = (typeof value === 'number' && key !== 'trangthai') ? String(value) : value; 

            if (finalValue instanceof File) {
                // Thêm File object (avatar)
                dataToSend.append('anhdaidien', finalValue, finalValue.name); // ⬅️ Đổi tên field thành 'anhdaidien'
            } else if (finalValue !== null && finalValue !== undefined) {
                // Thêm các trường dữ liệu khác. 
                // Cần đảm bảo key đúng với API, ví dụ: 'matkhau' thay vì 'password'
                // Ở đây, tôi giữ nguyên key từ form: hoten, sodienthoai, email, matkhau, diachi, trangthai
                dataToSend.append(key, finalValue);
            }
        }
        
        try {
            const response = await fetch(ADD_PARENT_API_URL, {
                method: 'POST',
                // KHÔNG cần đặt Content-Type khi dùng FormData
                body: dataToSend, 
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Thêm phụ huynh thành công:", result);
                alert("Thêm phụ huynh thành công!");
                
                // Cập nhật danh sách sau khi thêm thành công
                fetchData(); 
            } else {
                // Xử lý lỗi từ server (4xx, 5xx)
                let errorMessage = `Lỗi HTTP ${response.status}`;
                try {
                    const errorResult = await response.json();
                    errorMessage = errorResult.message || errorMessage;
                } catch (jsonError) {
                    jsonError;
                    // Nếu response không phải JSON
                    errorMessage += `. Không thể đọc chi tiết lỗi từ server.`;
                }
                
                console.error("Lỗi khi thêm phụ huynh:", errorMessage);
                alert(`Lỗi khi thêm phụ huynh: ${errorMessage}`);
            }

        } catch (error) {
            // Xử lý lỗi mạng/kết nối
            console.error("Lỗi gửi request:", error);
            alert("Lỗi kết nối. Không thể thêm phụ huynh.");
        } finally {
            setIsSubmitting(false);
            // setIsDialogOpen(false); // AddEntityDialog tự đóng khi handleSubmit hoàn thành
        }
    }, [fetchData]); // Thêm fetchData vào dependency list

    // =================================================================
    // 🎯 KẾT THÚC HÀM XỬ LÝ SUBMIT FORM
    // =================================================================


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Quản lý Phụ huynh</h1>
            
            <div className="space-y-6">
                
                {/* === 1. THẺ TỔNG QUAN === */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Tổng số Phụ huynh */}
                    <Card className="hover:shadow-xl transition duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Tổng số Phụ huynh</CardTitle>
                            <Users className="h-5 w-5 text-[#175e7a]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-gray-900">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">tài khoản trong hệ thống</p>
                        </CardContent>
                    </Card>

                    {/* Phụ huynh Đang hoạt động */}
                    <Card className="hover:shadow-xl transition duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Đang hoạt động</CardTitle>
                            <UserCheck className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-green-700">{stats.active}</div>
                            <p className="text-xs text-muted-foreground mt-1">đã xác minh và sử dụng</p>
                        </CardContent>
                    </Card>

                    {/* Phụ huynh Chờ duyệt */}
                    <Card className="hover:shadow-xl transition duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Chờ duyệt</CardTitle>
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-yellow-700">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground mt-1">yêu cầu đăng ký mới</p>
                        </CardContent>
                    </Card>
                </div>

                {/* === 2. BẢNG DANH SÁCH PHỤ HUYNH === */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle className="text-2xl font-bold text-gray-800">Danh sách Phụ huynh ({stats.total})</CardTitle>
                            <Button 
                                className="bg-[#175e7a] hover:bg-[#134c62] shadow-md"
                                onClick={() => setIsDialogOpen(true)} // 🎯 Mở Dialog
                            >
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
                                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#175e7a] focus:border-[#175e7a] transition duration-150 shadow-sm text-base"
                            />
                        </div>

                        {/* Loading / Error / Data Table */}
                        <div className="overflow-x-auto min-h-[200px] relative">
                            {loading && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                                    <Loader2 className="h-8 w-8 text-[#175e7a] animate-spin" />
                                    <span className="ml-3 text-lg font-medium text-gray-600">Đang tải dữ liệu...</span>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="flex flex-col items-center justify-center py-10 bg-red-50 border border-red-200 rounded-lg">
                                    <XCircle className="h-8 w-8 text-red-600 mb-3" />
                                    <p className="text-red-700 text-center font-medium px-4">{error}</p>
                                    <Button onClick={() => fetchData(0)} className="mt-4 bg-red-600 hover:bg-red-700">Thử lại</Button>
                                </div>
                            )}

                            {!loading && !error && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px]">Họ tên</TableHead>
                                            <TableHead className="w-[250px]">Thông tin liên lạc</TableHead>
                                            <TableHead>Địa Chỉ</TableHead>
                                            <TableHead className="w-[120px]">Trạng thái</TableHead>
                                            <TableHead className="text-right w-[120px]">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredParents.length > 0 ? (
                                            filteredParents.map((parent) => (
                                                <TableRow key={parent.id}>
                                                    {/* Họ tên & Avatar */}
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={parent.avatar} alt={parent.name} />
                                                                <AvatarFallback className="bg-[#175e7a] text-white text-base">
                                                                    {parent.name.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-800">{parent.name}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Thông tin liên lạc */}
                                                    <TableCell>
                                                        <div className="flex flex-col text-sm">
                                                            <span className="font-mono text-gray-700">{parent.phone}</span>
                                                            <span className="text-muted-foreground text-xs">{parent.email}</span>
                                                        </div>
                                                    </TableCell>

                                                    {/* Địa Chỉ */}
                                                    <TableCell className="text-sm text-gray-600">
                                                        {parent.address}
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
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* 🎯 DIALOG THÊM PHỤ HUYNH */}
            <AddEntityDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Thêm Phụ huynh Mới"
                description="Điền đầy đủ thông tin chi tiết để tạo tài khoản phụ huynh mới."
                fields={parentFields}
                onSubmit={handleAddParentSubmit}
                submitButtonText="Thêm Phụ huynh"
                accentColor="bg-green-600 hover:bg-green-700"
                isSubmitting={isSubmitting} // ⬅️ Truyền trạng thái đang gửi
            />
        </div>
    );
}