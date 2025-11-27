export default (sequelize, DataTypes) => {
  return sequelize.define("xebuyt", {
    idxebuyt: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bienso: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    soghe: { type: DataTypes.INTEGER, allowNull: false },
  hangsanxuat: { type: DataTypes.STRING(100), allowNull: true },
loainhienlieu: { type: DataTypes.STRING(50), allowNull: true },
idvitri: { type: DataTypes.INTEGER, allowNull: true },
    trangthai: { type: DataTypes.INTEGER, allowNull: false},
  }, { timestamps: false });
};
