export default (sequelize, DataTypes) => {
  return sequelize.define("vitrixe", {
    idvitri: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idxebuyt: { type: DataTypes.INTEGER, allowNull: false },
    kinhdo: { type: DataTypes.STRING, allowNull: false },
    vido: { type: DataTypes.STRING, allowNull: false },
    
  });
};
