export default (sequelize, DataTypes) => {
  return sequelize.define("hocsinh", {
    mahocsinh: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idphuhuynh: { type: DataTypes.INTEGER, allowNull: true },
    hoten: { type: DataTypes.STRING(255), allowNull: false },
    lop: { type: DataTypes.STRING(50), allowNull: false },
    namsinh: { type: DataTypes.DATE, allowNull: false },
    gioitinh: { type: DataTypes.STRING(10), allowNull: false },
    anhdaidien: { type: DataTypes.STRING(500), allowNull: false },
    iddiemdon: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }

  });
};
