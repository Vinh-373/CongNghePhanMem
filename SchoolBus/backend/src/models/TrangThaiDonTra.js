export default (sequelize, DataTypes) => {
  return sequelize.define("trangthaidontra", {
    idtrangthai: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idlich: { type: DataTypes.INTEGER, allowNull: false },
    idhocsinh: { type: DataTypes.INTEGER, allowNull: false },
    loaitrangthai: { type: DataTypes.TINYINT, allowNull: false }, // 1: Đã trả, 2: Chưa trả
  });
};
