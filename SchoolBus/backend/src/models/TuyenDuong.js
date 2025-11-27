export default (sequelize, DataTypes) => {
  return sequelize.define("tuyenduong", {
    idtuyenduong: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tentuyen: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    mota: { type: DataTypes.TEXT, allowNull: true },
    loaituyen: { type: DataTypes.STRING(50), allowNull: false }, // Ví dụ: 'Đón' hoặc 'Trả'
    dsdiemdung: { type: DataTypes.TEXT, allowNull: true }, // Danh sách điểm dừng dưới dạng chuỗi JSON
    trangthai: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // 1=Hoạt động, 0=Tạm dừng
  });
};
