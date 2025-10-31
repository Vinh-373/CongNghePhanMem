export default (sequelize, DataTypes) => {
  return sequelize.define("tuyenduong", {
    idtuyenduong: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tentuyen: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    mota: { type: DataTypes.TEXT, allowNull: true }
  });
};
