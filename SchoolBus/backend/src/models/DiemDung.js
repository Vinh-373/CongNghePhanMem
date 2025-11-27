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
      defaultValue: 1, // Mặc định là '1' - Hoạt động
    },
  });
  return DiemDung;
};
