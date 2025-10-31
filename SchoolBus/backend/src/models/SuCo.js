export default (sequelize, DataTypes) => {
  return sequelize.define("suco", {
    idsuco: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mota: { type: DataTypes.TEXT, allowNull: false },
    thoigian: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    idtaixe: { type: DataTypes.INTEGER, allowNull: false },
    idlich: { type: DataTypes.INTEGER, allowNull: false }
  });
};
