export default (sequelize, DataTypes) => {
  return sequelize.define("tuyenduong", {
    idtuyenduong: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tentuyen: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    mota: { type: DataTypes.TEXT, allowNull: true },
    trangthai: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // 1=Hoạt động, 0=Tạm dừng
  });
};
