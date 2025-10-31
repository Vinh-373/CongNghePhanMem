export default (sequelize, DataTypes) => {
  return sequelize.define("dangkychuyen", {
    iddangky: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mahocsinh: { type: DataTypes.INTEGER, allowNull: false },
    idlich: { type: DataTypes.INTEGER, allowNull: false },
    trangthai: { type: DataTypes.STRING(50), allowNull: false }
  });
};
