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
TaiXe.belongsTo(NguoiDung, { foreignKey: "idnguoidung" });
PhuHuynh.belongsTo(NguoiDung, { foreignKey: "idnguoidung" });

HocSinh.belongsTo(PhuHuynh, { foreignKey: "idphuhuynh" });
HocSinh.belongsTo(DiemDung, { foreignKey: "iddiemdon" });

DiemDung.belongsTo(TuyenDuong, { foreignKey: "idtuyenduong" });
XeBuyt.belongsTo(TuyenDuong, { foreignKey: "idtuyenduong" });

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
