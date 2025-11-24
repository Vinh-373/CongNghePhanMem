export default (sequelize, DataTypes) => {
  return sequelize.define("tuyenduong", {
    idtuyenduong: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    tentuyen: { 
      type: DataTypes.STRING(255), 
      allowNull: false, 
      unique: true 
    },
    loaituyen: { 
      type: DataTypes.STRING(50), // ví dụ: "Đón" hoặc "Trả"
      allowNull: false,
      defaultValue: "Đón",
      comment: "Loại tuyến: Đón / Trả"
    },
    dsdiemdung: { 
      type: DataTypes.TEXT, // lưu danh sách điểm dừng dưới dạng JSON string
      allowNull: true,
      comment: "Danh sách ID điểm dừng (JSON string)"
    },
    mota: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    trangthai: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 1, // 1=Hoạt động, 0=Tạm dừng
      comment: "Trạng thái tuyến: 1=Hoạt động, 0=Tạm dừng"
    }
  });
};
