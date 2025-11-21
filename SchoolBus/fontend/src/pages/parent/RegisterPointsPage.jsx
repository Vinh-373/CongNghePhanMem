import { Card } from "@/components/ui/card.jsx";
import GoogleMapDisplay from "@/components/Map/GoogleMapDisplay";
export default function PointsRegisterPage() {
  return (
    <div>
      <h1>Đăng ký điểm đón cho học sinh</h1>
      <Card className="md:col-span-2 h-[520px] p-0 overflow-hidden shadow-2xl">
          <GoogleMapDisplay 
            school={{ lat: 10.788223, lng:106.70397 }}
            zoom={14}
          />
        </Card>
    </div>
  );
}