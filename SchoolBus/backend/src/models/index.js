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
import DangKyDiemDonModel from "./DangKyDiemDon.js";
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
const DangKyDiemDon = DangKyDiemDonModel(sequelize, DataTypes);
const TrangThaiDonTra = TrangThaiDonTraModel(sequelize, DataTypes);
const ViTriXe = ViTriXeModel(sequelize, DataTypes);
const ThongBao = ThongBaoModel(sequelize, DataTypes);
const SuCo = SuCoModel(sequelize, DataTypes);

// =====================
// Thiết lập quan hệ
// =====================
// 1. Tài xế (TaiXe) liên kết với Người dùng (NguoiDung)
TaiXe.belongsTo(NguoiDung, { 
    foreignKey: "idnguoidung" ,
    as: "userInfo"
});

// 2. Phụ huynh (PhuHuynh) liên kết với Người dùng (NguoiDung)
PhuHuynh.belongsTo(NguoiDung, { 
    foreignKey: "idnguoidung", 
    as: "userInfo" 
});
// Phụ huynh (PhuHuynh) có nhiều Học sinh (HocSinh) [QUAN HỆ BỔ SUNG]
PhuHuynh.hasMany(HocSinh, {
    foreignKey: "idphuhuynh",
    as: "hocSinhs" 
});





// DiemDung có nhiều HocSinh (Quan hệ 1-nhiều: 1 điểm dừng là mặc định cho nhiều học sinh)
DiemDung.hasMany(HocSinh, {
    foreignKey: "iddiemdon",
    as: "hocSinhs"
});

// 3. Học sinh (HocSinh) liên kết với Phụ huynh (PhuHuynh)
HocSinh.belongsTo(PhuHuynh, { 
    foreignKey: "idphuhuynh", 
    as: "parentInfo" 
});

// 4. Học sinh (HocSinh) liên kết với Điểm dừng (DiemDung)
HocSinh.belongsTo(DiemDung, { 
    foreignKey: "iddiemdon", 
    as: "diemDonMacDinh",
    targetKey: 'iddiemdung' 
});

// === QUAN HỆ BỔ SUNG CHO LICH CHUYEN ===
// 5. Lịch chuyến (LichChuyen) thuộc về Tuyến đường (TuyenDuong)
LichChuyen.belongsTo(TuyenDuong, { 
    foreignKey: "idtuyenduong",
    as: "tuyenDuongInfo" // Dùng alias riêng để tránh trùng với DiemDung.belongsTo(TuyenDuong)
});

LichChuyen.belongsTo(XeBuyt, { foreignKey: "idxebuyt"});
LichChuyen.belongsTo(TaiXe, { foreignKey: "idtaixe" });

DangKyDiemDon.belongsTo(HocSinh, { foreignKey: "mahocsinh" });
DangKyDiemDon.belongsTo(DiemDung, { foreignKey: "iddiemdung" });
DangKyDiemDon.belongsTo(PhuHuynh, { foreignKey: "idphuhuynh" });


ViTriXe.belongsTo(XeBuyt, { foreignKey: "idxebuyt" });
XeBuyt.belongsTo(ViTriXe, { foreignKey: "idvitri" });
ThongBao.belongsTo(NguoiDung, { foreignKey: "idnguoidung" });
ThongBao.belongsTo(LichChuyen, { foreignKey: "idlich" });

SuCo.belongsTo(TaiXe, { foreignKey: "idtaixe" });
SuCo.belongsTo(LichChuyen, { foreignKey: "idlich" });

TrangThaiDonTra.belongsTo(HocSinh, { foreignKey: "idhocsinh" });
TrangThaiDonTra.belongsTo(LichChuyen, { foreignKey: "idlich" });

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
    DangKyDiemDon,
    TrangThaiDonTra,
    ViTriXe,
    ThongBao,
    SuCo
};