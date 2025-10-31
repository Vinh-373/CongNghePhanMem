export default (sequelize, DataTypes) => {
  return sequelize.define("vitrixe", {
    idvitrixe: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idxebuyt: { type: DataTypes.INTEGER, allowNull: false },
    lat: { type: DataTypes.DOUBLE, allowNull: false },
    lng: { type: DataTypes.DOUBLE, allowNull: false },
    thoigian: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
};
