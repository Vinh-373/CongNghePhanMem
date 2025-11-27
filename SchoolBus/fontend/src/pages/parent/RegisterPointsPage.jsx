// ===== IMPORTS =====
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LeafletRoutingMap from "@/components/Map/GoogleMapDisplay";

// =====================================
export default function PointsRegisterPage() {
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(""); 

  // ===== FETCH API =====
  useEffect(() => {
    const fetchPickupPoints = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/schoolbus/admin/get-all-pickup-points"
        );

        const convertedPoints = res.data.pickupPoints.map((point) => ({
          iddiemdung: point.iddiemdung,
          lat: parseFloat(point.vido),
          lng: parseFloat(point.kinhdo),
          label: point.tendiemdon,
          diachi: point.diachi,
        }));

        setPickupPoints(convertedPoints);
      } catch (err) {
        console.error("❌ Lỗi lấy dữ liệu điểm đón:", err);
        setError("Không thể tải dữ liệu từ backend");
        toast.error("⚠️ Không thể tải điểm đón!");
      } finally {
        setLoading(false);
      }
    };

    fetchPickupPoints();
  }, []);

  // ===== HANDLE ĐĂNG KÝ =====
  const handleRegister = async () => {
  if (!selectedPoint) {
    return toast.warning("⚠️ Vui lòng chọn điểm dừng!");
  }

  try {
    const token = localStorage.getItem("token");   // lấy token login

    const res = await axios.post(
      `http://localhost:5001/schoolbus/user/register-pickup-point/${selectedPoint}`, 
      {},   // nếu dùng params thì body rỗng
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    toast.success("🎉 Đăng ký thành công!");
    console.log("Server response:", res.data);
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err);
    toast.error("🚨 Đăng ký thất bại!");
  }
};

  // ===== LOADING / ERROR =====
  if (loading) return <p>⏳ Đang tải dữ liệu bản đồ...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Chuyển đổi pickupPoints thành định dạng buses để hiển thị như markers
  const busStopsAsBuses = pickupPoints.map((point) => ({
    id: point.iddiemdung,
    position: { lat: point.lat, lng: point.lng },
    label: `${point.label} — ${point.diachi}`,
    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Icon cho điểm dừng (có thể thay bằng icon khác nếu cần)
  }));

  // ===== UI =====
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Đăng ký điểm đón cho học sinh</h1>

      {/* MAP */}
      <Card className="md:col-span-2 h-[520px] p-0 overflow-hidden shadow-2xl">
        <LeafletRoutingMap
          school={{ lat: 10.788223, lng: 106.70397 }}
          zoom={14}
          routes={[]} // Không có routes
          buses={busStopsAsBuses} // Hiển thị điểm dừng như markers
        />
      </Card>

      {/* FORM ĐĂNG KÝ */}
      <Card className="p-4 shadow-xl">
        <h2 className="text-lg font-semibold mb-3">Chọn điểm dừng để đăng ký</h2>

        <select
          value={selectedPoint}
          onChange={(e) => setSelectedPoint(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn điểm đón --</option>
          {pickupPoints.map((p) => (
            <option key={p.iddiemdung} value={p.iddiemdung}>
              {p.label} — {p.diachi}
            </option>
          ))}
        </select>

        {selectedPoint && (
          <p className="mt-2 text-gray-600">
            ➤ Đã chọn:{" "}
            <span className="font-semibold">
              {pickupPoints.find((p) => p.iddiemdung === +selectedPoint)?.label}
            </span>
          </p>
        )}

        <Button
          onClick={handleRegister}
          disabled={!selectedPoint}
          className="mt-4 bg-amber-200 hover:bg-amber-300 text-black font-semibold"
      
        >
          Đăng ký điểm này
        </Button>
      </Card>
    </div>
  );
}