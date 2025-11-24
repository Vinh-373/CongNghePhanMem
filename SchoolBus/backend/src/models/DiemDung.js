// src/models/DiemDung.js
export default (sequelize, DataTypes) => {
  const DiemDung = sequelize.define("DiemDung", {
    iddiemdung: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tendiemdon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diachi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idtuyenduong: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    thutu: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    kinhdo: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    vido: {
      type: DataTypes.DOUBLE,   
      allowNull: true,
    },
    trangthai: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    freezeTableName: true,   // Không tự thêm "s"
    tableName: "diemdung",   // GHI ĐÚNG TÊN BẢNG TRONG DB
    timestamps: false        // Nếu bảng không có createdAt, updatedAt
  });

  return DiemDung;
};
