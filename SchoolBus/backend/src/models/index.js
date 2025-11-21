// src/models/index.js
import sequelize from "../config/sequelize.js";
import { DataTypes } from "sequelize";

// Import tất cả các model
import NguoiDungModel from "./NguoiDung.js";
import TaiXeModel from "./TaiXe.js";
import PhuHuynhModel from "./PhuHuynh.js";
import HocSinhModel from "./HocSinh.js";
import TuyenDuongModel from "./TuyenDuong.js";
import DiemDungModel from "./DiemDung.js";
import XeBuytModel from "./XeBuyt.js";
import LichChuyenModel from "./LichChuyen.js";
import DangKyChuyenModel from "./DangKyChuyen.js";
import TrangThaiDonTraModel from "./TrangThaiDonTra.js";
import ViTriXeModel from "./ViTriXe.js";
import ThongBaoModel from "./ThongBao.js";
import SuCoModel from "./SuCo.js";

// Khởi tạo các model
const NguoiDung = NguoiDungModel(sequelize, DataTypes);
const TaiXe = TaiXeModel(sequelize, DataTypes);
const PhuHuynh = PhuHuynhModel(sequelize, DataTypes);
const HocSinh = HocSinhModel(sequelize, DataTypes);
const TuyenDuong = TuyenDuongModel(sequelize, DataTypes);
const DiemDung = DiemDungModel(sequelize, DataTypes);
const XeBuyt = XeBuytModel(sequelize, DataTypes);
const LichChuyen = LichChuyenModel(sequelize, DataTypes);
const DangKyChuyen = DangKyChuyenModel(sequelize, DataTypes);
const TrangThaiDonTra = TrangThaiDonTraModel(sequelize, DataTypes);
const ViTriXe = ViTriXeModel(sequelize, DataTypes);
const ThongBao = ThongBaoModel(sequelize, DataTypes);
const SuCo = SuCoModel(sequelize, DataTypes);

// =====================
// Thiết lập quan hệ
// =====================
// 1. Tài xế (TaiXe) liên kết với Người dùng (NguoiDung)
TaiXe.belongsTo(NguoiDung, { 
    foreignKey: "idnguoidung" 
});

// 2. Phụ huynh (PhuHuynh) liên kết với Người dùng (NguoiDung)
// Cần alias 'userInfo' để JOIN từ Học sinh -> Phụ huynh -> Người dùng (như trong Controller)
PhuHuynh.belongsTo(NguoiDung, { 
    foreignKey: "idnguoidung", 
    as: "userInfo" 
});
// TuyenDuong có nhiều DiemDung
TuyenDuong.hasMany(DiemDung, { 
  foreignKey: "idtuyenduong", 
  as: "diemDungs"   // alias bắt buộc
});

// DiemDung thuộc về TuyenDuong
DiemDung.belongsTo(TuyenDuong, { 
  foreignKey: "idtuyenduong",
  as: "tuyenDuong"  // alias bắt buộc
});
// 3. Học sinh (HocSinh) liên kết với Phụ huynh (PhuHuynh)
// Cần alias 'parentInfo'
HocSinh.belongsTo(PhuHuynh, { 
    foreignKey: "idphuhuynh", 
    as: "parentInfo" 
});

// 4. Học sinh (HocSinh) liên kết với Điểm dừng (DiemDung)
// Cần alias 'diemDonMacDinh' (Đây là nguyên nhân gây lỗi chính)
HocSinh.belongsTo(DiemDung, { 
    foreignKey: "iddiemdon", 
    as: "diemDonMacDinh",
    targetKey: 'iddiemdung' // 🔑 Khóa chính của DiemDung là iddiemdung
});

// Các quan hệ còn lại giữ nguyên
DiemDung.belongsTo(TuyenDuong, { foreignKey: "idtuyenduong" });

LichChuyen.belongsTo(XeBuyt, { foreignKey: "idxebuyt" });
LichChuyen.belongsTo(TaiXe, { foreignKey: "idtaixe" });

DangKyChuyen.belongsTo(HocSinh, { foreignKey: "mahocsinh" });
DangKyChuyen.belongsTo(LichChuyen, { foreignKey: "idlich" });

TrangThaiDonTra.belongsTo(DangKyChuyen, { foreignKey: "iddangky" });
ViTriXe.belongsTo(XeBuyt, { foreignKey: "idxebuyt" });

ThongBao.belongsTo(NguoiDung, { foreignKey: "idnguoidung" });
ThongBao.belongsTo(LichChuyen, { foreignKey: "idlich" });

SuCo.belongsTo(TaiXe, { foreignKey: "idtaixe" });
SuCo.belongsTo(LichChuyen, { foreignKey: "idlich" });




// =====================
// Xuất tất cả model
// =====================
export {
  sequelize,
  NguoiDung,
  TaiXe,
  PhuHuynh,
  HocSinh,
  TuyenDuong,
  DiemDung,
  XeBuyt,
  LichChuyen,
  DangKyChuyen,
  TrangThaiDonTra,
  ViTriXe,
  ThongBao,
  SuCo
};
