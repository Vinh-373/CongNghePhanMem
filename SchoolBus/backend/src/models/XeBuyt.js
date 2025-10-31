export default (sequelize, DataTypes) => {
  return sequelize.define("xebuyt", {
    idxebuyt: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    biensoxe: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    socho: { type: DataTypes.INTEGER, allowNull: false },
    idtuyenduong: { type: DataTypes.INTEGER, allowNull: false }
  });
};
