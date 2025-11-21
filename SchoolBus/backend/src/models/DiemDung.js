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
      allowNull: false,
    },
  });
  return DiemDung;
};
