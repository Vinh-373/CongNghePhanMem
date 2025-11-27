export default (sequelize, DataTypes) => {
  return sequelize.define("dangkydiemdon", {
    iddangky: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mahocsinh: { type: DataTypes.INTEGER, allowNull: false },
    iddiemdung: { type: DataTypes.INTEGER, allowNull: false },
    idphuhuynh: { type: DataTypes.INTEGER, allowNull: false },
    thoigiandangky: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    trangthai: { type: DataTypes.STRING(50), allowNull: false }
  });
};
