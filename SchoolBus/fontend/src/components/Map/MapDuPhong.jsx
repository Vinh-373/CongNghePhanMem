// import { useState, useEffect, useRef, useMemo } from "react";

// /**
//  * Hook tải Google Maps Script
//  */
// const useGoogleMapsScript = (apiKey) => {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [loadError, setLoadError] = useState(null);

//   useEffect(() => {
//     if (window.google) {
//       setIsLoaded(true);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
//     script.async = true;

//     script.onerror = () =>
//       setLoadError("Could not load Google Maps script. Check API Key.");

//     script.onload = () => {
//       if (window.google && window.google.maps) {
//         setIsLoaded(true);
//       } else {
//         setLoadError(
//           "Google Maps script loaded, but 'window.google.maps' is undefined."
//         );
//       }
//     };

//     document.head.appendChild(script);

//     return () => {
//       if (document.head.contains(script)) {
//         document.head.removeChild(script);
//       }
//     };
//   }, [apiKey]);

//   return { isLoaded, loadError };
// };

// /**
//  * Component bản đồ Google với nhiều tuyến đường
//  * 
//  * Props:
//  * - routes: Array of route objects, each containing:
//  *   {
//  *     id: string,
//  *     name: string,
//  *     color: string (hex color for polyline),
//  *     dotColor: string (marker color URL or hex),
//  *     stops: Array of {lat, lng, label?}
//  *   }
//  * - buses: Array of bus objects:
//  *   {
//  *     id: string,
//  *     routeId?: string (optional, để liên kết với route),
//  *     position: {lat, lng},
//  *     label?: string,
//  *     icon?: string (custom icon URL)
//  *   }
//  * - school: {lat, lng} - Vị trí trường học
//  * - apiKey: Google Maps API key
//  */
// const GoogleMapDisplay = ({
//   routes = [],
//   buses = [],
//   school,
//   apiKey = "AIzaSyA_JStH-ku5M_jeUjakhpWBT1m7P6_s-w4",
//   className = "",
//   zoom = 13,
//   showZoomControl = true,
//   defaultCenter = { lat: 10.776, lng: 106.702 },
// }) => {
//   const { isLoaded, loadError } = useGoogleMapsScript(apiKey);
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markersRef = useRef([]);
//   const polylinesRef = useRef([]);

//   const memoizedDefaultCenter = useMemo(() => defaultCenter, [defaultCenter]);

//   // Màu mặc định cho các tuyến
//   const defaultColors = [
//     { polyline: "#FF0000", dot: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" },
//     { polyline: "#0000FF", dot: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
//     { polyline: "#00FF00", dot: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" },
//     { polyline: "#FF00FF", dot: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png" },
//     { polyline: "#FFA500", dot: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png" },
//   ];

//   useEffect(() => {
//     if (!isLoaded || loadError || !mapRef.current) return;
//     if (!window.google || !window.google.maps) {
//       console.error("Google Maps API is not available.");
//       return;
//     }

//     console.log("🗺️ Map Effect - routes:", routes);
//     console.log("🚌 Map Effect - buses:", buses);

//     const mapCenter = school || memoizedDefaultCenter;

//     // Khởi tạo bản đồ lần đầu
//     if (!mapInstanceRef.current) {
//       mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
//         center: mapCenter,
//         zoom: zoom,
//         disableDefaultUI: true,
//         zoomControl: showZoomControl,
//         fullscreenControl: false,
//       });
//     }

//     const map = mapInstanceRef.current;

//     // Set tâm bản đồ
//     if (school) map.setCenter(school);

//     // Xóa tất cả markers cũ
//     markersRef.current.forEach((marker) => marker.setMap(null));
//     markersRef.current = [];

//     // Xóa tất cả polylines cũ
//     polylinesRef.current.forEach((polyline) => polyline.setMap(null));
//     polylinesRef.current = [];

//     // ⭐ Marker TRƯỜNG HỌC
//     if (school) {
//       const schoolMarker = new window.google.maps.Marker({
//         position: school,
//         map,
//         title: "Trường học",
//         icon: {
//           url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
//           scaledSize: new window.google.maps.Size(32, 32),
//         },
//         zIndex: 1000,
//       });
//       markersRef.current.push(schoolMarker);
//     }

//     // ⭐ Vẽ từng tuyến đường
//     routes.forEach((route, routeIndex) => {
//       console.log(`🎨 Drawing route ${routeIndex}:`, route);
//       const { stops = [], color, dotColor, name } = route;
      
//       console.log(`  - Stops count: ${stops.length}`);
//       console.log(`  - Color: ${color}`);
//       console.log(`  - Dot color: ${dotColor}`);

//       // Lấy màu mặc định nếu không có
//       const colors = defaultColors[routeIndex % defaultColors.length];
//       const polylineColor = color || colors.polyline;
//       const markerColor = dotColor || colors.dot;

//       // Vẽ các điểm dừng
//       stops.forEach((stop, stopIndex) => {
//         console.log(`    📍 Creating marker ${stopIndex}:`, stop);
//         const stopMarker = new window.google.maps.Marker({
//           position: { lat: stop.lat, lng: stop.lng },
//           map,
//           title: stop.label || `${name || `Tuyến ${routeIndex + 1}`} - Điểm ${stopIndex + 1}`,
//           icon: markerColor,
//           zIndex: 100,
//         });
//         markersRef.current.push(stopMarker);
//         console.log(`    ✅ Marker created at lat=${stop.lat}, lng=${stop.lng}`);
//       });

//       console.log(`  - Total markers created: ${stops.length}`);

//       // Vẽ polyline nối các điểm dừng trong cùng tuyến
//       if (stops.length > 1) {
//         const path = stops.map(stop => ({ lat: stop.lat, lng: stop.lng }));
        
//         console.log(`  🛣️ Creating polyline with ${path.length} points`);
//         const polyline = new window.google.maps.Polyline({
//           path: path,
//           geodesic: true,
//           strokeColor: polylineColor,
//           strokeOpacity: 0.7,
//           strokeWeight: 4,
//           map: map,
//         });
//         polylinesRef.current.push(polyline);
//         console.log(`  ✅ Polyline created`);
//       }
//     });

//     console.log(`✅ Total stop markers: ${markersRef.current.length}`);
//     console.log(`✅ Total polylines: ${polylinesRef.current.length}`);

//     // ⭐ Vẽ các xe buýt (tách riêng)
//     buses.forEach((bus, busIndex) => {
//       console.log(`🚌 Creating bus marker ${busIndex}:`, bus);
      
//       const busMarker = new window.google.maps.Marker({
//         position: bus.position,
//         map,
//         title: bus.label || `Xe buýt ${bus.id || busIndex + 1}`,
//         icon: bus.icon || {
//           url: "https://img.icons8.com/color/48/bus.png",
//           scaledSize: new window.google.maps.Size(40, 40),
//         },
//         zIndex: 500,
//       });
//       markersRef.current.push(busMarker);
//       console.log(`  ✅ Bus marker created at lat=${bus.position.lat}, lng=${bus.position.lng}`);
//     });

//     console.log(`✅ Total bus markers: ${buses.length}`);

//     // Auto fit bounds nếu có nhiều điểm
//     if (routes.length > 0 || buses.length > 0) {
//       const bounds = new window.google.maps.LatLngBounds();
      
//       if (school) bounds.extend(school);
      
//       routes.forEach(route => {
//         route.stops?.forEach(stop => {
//           bounds.extend({ lat: stop.lat, lng: stop.lng });
//         });
//       });

//       buses.forEach(bus => {
//         if (bus.position) {
//           bounds.extend(bus.position);
//         }
//       });

//       map.fitBounds(bounds);
//     }

//   }, [
//     isLoaded,
//     loadError,
//     school,
//     routes,
//     buses,
//     zoom,
//     showZoomControl,
//     memoizedDefaultCenter,
//   ]);

//   if (loadError) {
//     return (
//       <div className={`p-4 text-red-600 ${className}`}>
//         Lỗi: {loadError} (Kiểm tra API Key)
//       </div>
//     );
//   }

//   if (!isLoaded) {
//     return (
//       <div
//         className={`p-4 text-blue-600 flex items-center justify-center h-full ${className}`}
//       >
//         Đang tải bản đồ...
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={mapRef}
//       style={{ width: "100%", height: "100%", borderRadius: "0.5rem" }}
//       className={className}
//     />
//   );
// };

// export default GoogleMapDisplay;