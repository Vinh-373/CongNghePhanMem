export default (sequelize, DataTypes) => {
  return sequelize.define("lichchuyen", {
    idlich: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID lịch chuyến (Khóa chính)',
      },
      // Khóa ngoại: ID xe buýt
      idxebuyt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID xe buýt liên quan (Khóa ngoại)',
      },
      // Khóa ngoại: ID tài xế
      idtaixe: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID tài xế liên quan (Khóa ngoại)',
      },
      // Giờ xe bắt đầu chạy (theo cột 'giobatdau' trong ảnh)
      giobatdau: { 
        type: DataTypes.TIME,
        allowNull: false,
        comment: 'Giờ xe khởi hành',
      },
      // Loại chuyến: Đón hoặc Trả
      loaichuyen: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Loại chuyến: Đón hoặc Trả',
      },
      // Trạng thái: 0=Chưa chạy, 1=Đang chạy, 2=Hoàn thành, 3=Trễ
      trangthai: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '0=Chưa chạy, 1=Đang chạy, 2=Hoàn thành, 3=Trễ',
      },
      // Danh sách ID học sinh (Lưu dưới dạng chuỗi JSON hoặc Text)
      danhsachhocsinh: {
        // Sử dụng TEXT để lưu chuỗi JSON lớn hơn, nếu cần
        type: DataTypes.TEXT,
        comment: 'Danh sách ID học sinh trong chuyến (JSON string)',
      },
      // Khóa ngoại: ID tuyến đường
      idtuyenduong: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID tuyến đường',
      },
      // Ngày chuyến đi (theo cột 'ngaydi' trong ảnh)
      ngaydi: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Ngày chuyến đi',
      },
      // Cột VIRTUAL: Thứ trong tuần (Tự động tính toán và trả về tên tiếng Việt)
      thu: {
        type: DataTypes.VIRTUAL,
        get() {
          const ngayDi = this.getDataValue('ngaydi');
          if (!ngayDi) return null;
          
          // JavaScript Date() tính Chủ Nhật là 0, Thứ Hai là 1, ..., Thứ Bảy là 6
          const date = new Date(ngayDi);
          const dayIndex = date.getDay(); 
          
          const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
          
          // Trả về tên thứ trong tuần bằng tiếng Việt
          return days[dayIndex];
        },
        comment: 'Thứ trong tuần (Cột ảo, tự động tính từ ngaydi, trả về tên tiếng Việt)',
      }
  });
};
