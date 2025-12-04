export default (sequelize, DataTypes) => {
  return sequelize.define("thongbao", {
    idthongbao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tieude: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noidung: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thoigiangui: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    // Trường ID chuyến đi: NULL nếu là thông báo cá nhân/chung
    idlich: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      comment: 'ID chuyến đi liên quan (NULL nếu không liên quan đến chuyến)',
    },
    // Trường ID tài xế: NULL nếu là thông báo chung/phụ huynh
    idtaixe: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID tài xế nhận thông báo (NULL nếu là thông báo chung)',
    },
    // Trường ID phụ huynh: NULL nếu là thông báo chung/tài xế
    idphuhuynh: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID phụ huynh nhận thông báo (NULL nếu là thông báo chung)',
    },
    // Trường Loại (0:thông báo, 1:sự cố)
    loai: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, 
      comment: '0: Thông báo, 1: Sự cố',
    },
    // Trường Vai trò (2:Tất cả PH, 1:Tất cả TX, 0:Tất cả)
    idvaitro: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID vai trò (0: PH, 1: TX, 2: Tất cả). Chỉ dùng khi các trường ID cá nhân/lịch là NULL.',
    },
    trangthai: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    idnguoigui:{
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'thongbao', // Tên bảng trong DB (tùy chọn)
    timestamps: false,     // Tùy chọn: Nếu bạn không muốn Sequelize tự động thêm createdAt/updatedAt
  });
};
