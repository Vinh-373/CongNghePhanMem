export default (sequelize, DataTypes) => {
  return sequelize.define("lichchuyen", {
    idlich: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ngaychuyen: { type: DataTypes.DATEONLY, allowNull: false },
    giochay: { type: DataTypes.TIME, allowNull: false },
    idxebuyt: { type: DataTypes.INTEGER, allowNull: false },
    idtaixe: { type: DataTypes.INTEGER, allowNull: false }
  });
};
