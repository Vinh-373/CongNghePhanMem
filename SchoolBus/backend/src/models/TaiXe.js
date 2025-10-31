export default (sequelize, DataTypes) => {
  return sequelize.define("taixe", {
    idtaixe: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mabang: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    kinhnghiem: { type: DataTypes.INTEGER, allowNull: false },
    idnguoidung: { type: DataTypes.INTEGER, allowNull: false, unique: true }
  });
};
