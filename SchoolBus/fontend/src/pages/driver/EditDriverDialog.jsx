// src/components/driver/EditDriverDialog.jsx (ĐÃ CHỈNH SỬA)

import React from 'react';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

/**
 * Component Dialog dùng để chỉnh sửa thông tin Tài xế (Driver) và Người dùng (UserInfo).
 *
 * @param {object} props - Props của component.
 * @param {object} props.editForm - State chứa dữ liệu form hiện tại.
 * @param {function} props.handleEditChange - Hàm xử lý sự kiện thay đổi Input.
 * @param {function} props.handleUpdate - Hàm xử lý sự kiện submit form (gọi API cập nhật).
 */
export default function EditDriverDialog({ editForm, handleEditChange, handleUpdate }) {
    return (
        <DialogContent className="sm:max-w-xl bg-white">
            <DialogHeader className="text-center items-center">
                <DialogTitle>Chỉnh sửa Hồ sơ Tài xế</DialogTitle>
            </DialogHeader>

            {/* Form submit sẽ gọi hàm handleUpdate từ component cha */}
            <form onSubmit={handleUpdate}>
                <div className="grid gap-4 py-4">
                    
                    {/* HỌ VÀ TÊN (userInfo.hoten) */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="hoten" className="text-right">Họ và Tên</Label>
                        <Input 
                            id="hoten" 
                            name="hoten" 
                            value={editForm.hoten} 
                            onChange={handleEditChange} 
                            className="col-span-3" 
                            required 
                        />
                    </div>
                    
                    {/* SỐ ĐIỆN THOẠI (userInfo.sodienthoai) */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sodienthoai" className="text-right">SĐT</Label>
                        <Input 
                            id="sodienthoai" 
                            name="sodienthoai" 
                            value={editForm.sodienthoai} 
                            onChange={handleEditChange} 
                            className="col-span-3" 
                            required 
                        />
                    </div>
                    
                    {/* EMAIL (userInfo.email) */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={editForm.email} 
                            onChange={handleEditChange} 
                            className="col-span-3" 
                            required 
                        />
                    </div>
                    
                    {/* TRƯỜNG MẬT KHẨU ĐÃ ĐƯỢC XÓA Ở ĐÂY */}
                    
                    {/* SỐ NĂM KINH NGHIỆM (kinhnghiem) */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kinhnghiem" className="text-right">Năm KN</Label>
                        <Input 
                            id="kinhnghiem" 
                            name="kinhnghiem" 
                            type="number" 
                            value={editForm.kinhnghiem} 
                            onChange={handleEditChange} 
                            className="col-span-3" 
                            min="0"
                            required 
                        />
                    </div>
                    
                    {/* SỐ GPLX (mabang) */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mabang" className="text-right">Số GPLX</Label>
                        <Input 
                            id="mabang" 
                            name="mabang" 
                            value={editForm.mabang} 
                            onChange={handleEditChange} 
                            className="col-span-3" 
                            required 
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit">
                        <Save className="h-4 w-4 mr-2" /> Lưu thay đổi
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}