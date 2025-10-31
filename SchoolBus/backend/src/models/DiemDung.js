// src/models/DiemDung.js
export default (sequelize, DataTypes) => {
  const DiemDung = sequelize.define("DiemDung", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tendiem: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diachi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return DiemDung;
};
