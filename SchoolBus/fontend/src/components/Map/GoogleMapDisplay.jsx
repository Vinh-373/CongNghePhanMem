
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

/**
 * Component bản đồ Leaflet với tuyến đường thực tế
 * Props:
 * - routes: [
 *     {
 *       id,
 *       name,
 *       color,       // màu polyline
 *       dotColor,    // màu điểm dừng
 *       stops: [{lat,lng,label?}]
 *     }
 *   ]
 * - buses: [
 *     { id, routeId?, position: {lat,lng}, label?, icon? }
 *   ]
 * - school: {lat,lng} - vị trí trường học
 * - zoom: số zoom mặc định
 */
const LeafletRoutingMap = ({
  routes = [],
  buses = [],
  school,
  className = "",
  zoom = 13,
  defaultCenter = { lat: 10.776, lng: 106.702 },
}) => {
  const mapRef = useRef(null);
  const routeControlsRef = useRef([]);
  const markersRef = useRef([]);

  useEffect(() => {
    // Khởi tạo bản đồ
    if (!mapRef.current) {
      mapRef.current = L.map("leaflet-map", {
        center: school || defaultCenter,
        zoom,
        zoomControl: true,
      });

      // Tile layer OpenStreetMap miễn phí
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Xóa route cũ
    routeControlsRef.current.forEach((rc) => rc.remove());
    routeControlsRef.current = [];

    // Xóa marker cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Marker trường học
    if (school) {
      const schoolMarker = L.marker([school.lat, school.lng], {
        title: "Trường học",
        icon: L.icon({
          iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          iconSize: [32, 32],
        }),
      }).addTo(map);
      markersRef.current.push(schoolMarker);
    }

    // Màu mặc định cho tuyến
    const defaultColors = [
      { polyline: "#FF0000", dot: "red" },
      { polyline: "#0000FF", dot: "blue" },
      { polyline: "#00FF00", dot: "green" },
      { polyline: "#FF00FF", dot: "purple" },
      { polyline: "#FFA500", dot: "orange" },
    ];

    // Vẽ tuyến với đường đi thực tế
    routes.forEach((route, i) => {
      if (!route.stops || route.stops.length < 2) return;

      const color = route.color || defaultColors[i % defaultColors.length].polyline;
      const dotColor = route.dotColor || defaultColors[i % defaultColors.length].dot;

      const waypoints = route.stops.map((stop) => L.latLng(stop.lat, stop.lng));

      const control = L.Routing.control({
        waypoints: waypoints,
        lineOptions: {
          styles: [{ color, weight: 4, opacity: 0.7 }],
        },
        createMarker: function (i, wp) {
          return L.circleMarker(wp.latLng, {
            radius: 6,
            color: dotColor,
            fillColor: dotColor,
            fillOpacity: 1,
          }).bindPopup(route.stops[i].label || `${route.name} - Điểm ${i + 1}`);
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        show: false,
      }).addTo(map);

      routeControlsRef.current.push(control);
    });

    // Marker xe buýt
    buses.forEach((bus) => {
      const icon = bus.icon
        ? L.icon({ iconUrl: bus.icon, iconSize: [32, 32] })
        : L.icon({ iconUrl: "https://img.icons8.com/color/48/bus.png", iconSize: [32, 32] });

      const marker = L.marker([bus.position.lat, bus.position.lng], {
        title: bus.label || `Xe buýt ${bus.id}`,
        icon,
      }).addTo(map);

      markersRef.current.push(marker);
    });

    // Auto fit bounds
    const bounds = L.latLngBounds([]);
    if (school) bounds.extend([school.lat, school.lng]);
    routes.forEach((route) => route.stops?.forEach((s) => bounds.extend([s.lat, s.lng])));
    buses.forEach((bus) => bounds.extend([bus.position.lat, bus.position.lng]));
    if (bounds.isValid()) map.fitBounds(bounds);

  }, [routes, buses, school, zoom, defaultCenter]);

  return (
    <div
      id="leaflet-map"
      style={{ width: "100%", height: "100%", borderRadius: "0.5rem" }}
      className={className}
    />
  );
};

export default LeafletRoutingMap;
