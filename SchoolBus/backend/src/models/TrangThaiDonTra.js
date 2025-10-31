export default (sequelize, DataTypes) => {
  return sequelize.define("trangthaidontra", {
    idtrangthai: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    iddangky: { type: DataTypes.INTEGER, allowNull: false },
    thoigiandon: { type: DataTypes.TIME, allowNull: true },
    thoigiantra: { type: DataTypes.TIME, allowNull: true },
    trangthai: { type: DataTypes.STRING(100), allowNull: false }
  });
};
