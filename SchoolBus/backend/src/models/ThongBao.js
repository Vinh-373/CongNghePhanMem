export default (sequelize, DataTypes) => {
  return sequelize.define("thongbao", {
    idthongbao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tieude: { type: DataTypes.STRING(255), allowNull: false },
    noidung: { type: DataTypes.TEXT, allowNull: false },
    thoigiangui: { type: DataTypes.DATE, defaultValue: DataTypes.NOW,allowNull: true },
    idnguoidung: { type: DataTypes.INTEGER, allowNull: false },
  });
};
