export default (sequelize, DataTypes) => {
  return sequelize.define("phuhuynh", {
    idphuhuynh: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idnguoidung: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    diachi: { type: DataTypes.STRING(500), allowNull: false }
  });
};
