// src/models/NguoiDung.js
export default (sequelize, DataTypes) => {
  const NguoiDung = sequelize.define(
    "NguoiDung",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      hoten: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sodienthoai: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      matkhau: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      vaitro: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "0=Admin, 1=Tài xế, 2=Phụ huynh",
      },
      anhdaidien: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      ngaytao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      trangthai: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      tableName: "nguoidung",
      timestamps: false,
    }
  );

  return NguoiDung;
};
