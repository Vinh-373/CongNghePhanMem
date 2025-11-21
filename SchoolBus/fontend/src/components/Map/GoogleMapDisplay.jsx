import { useState, useEffect, useRef, useMemo } from "react";

/**
 * Hook tải Google Maps Script
 */
const useGoogleMapsScript = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;

    script.onerror = () =>
      setLoadError("Could not load Google Maps script. Check API Key.");

    script.onload = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        setLoadError(
          "Google Maps script loaded, but 'window.google.maps' is undefined."
        );
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  return { isLoaded, loadError };
};

/**
 * Component bản đồ Google hoàn thiện
 */
const GoogleMapDisplay = ({
  busPosition,
  studentPickup,
  busStops,
  routeCoordinates,
  school,
  apiKey = "AIzaSyA_JStH-ku5M_jeUjakhpWBT1m7P6_s-w4",
  className = "",
  zoom = 14,
  showZoomControl = true,
  defaultCenter = { lat: 10.776, lng: 106.702 },
}) => {
  const { isLoaded, loadError } = useGoogleMapsScript(apiKey);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  const memoizedDefaultCenter = useMemo(() => defaultCenter, [defaultCenter]);

  useEffect(() => {
    if (!isLoaded || loadError || !mapRef.current) return;
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API is not available.");
      return;
    }

    const mapCenter = school || busPosition || memoizedDefaultCenter;

    // Khởi tạo bản đồ lần đầu
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: zoom,
        disableDefaultUI: true,
        zoomControl: showZoomControl,
        fullscreenControl: false,
      });
    }

    const map = mapInstanceRef.current;

    // Set tâm bản đồ nếu có trường
    if (school) map.setCenter(school);

    // Xóa marker cũ
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Xóa polyline cũ
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // ⭐ Marker TRƯỜNG HỌC
    if (school) {
      const schoolMarker = new window.google.maps.Marker({
        position: school,
        map,
        title: "Trường học",
        icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
      });
      markersRef.current.push(schoolMarker);
    }

    // ⭐ Marker XE BUÝT với icon xe bus
    if (busPosition) {
      const busMarker = new window.google.maps.Marker({
        position: busPosition,
        map,
        title: "Vị trí xe buýt",
        icon: {
          url: "https://img.icons8.com/color/48/bus.png",
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });
      markersRef.current.push(busMarker);
    }

    // ⭐ Marker ĐÓN HỌC SINH
    if (studentPickup) {
      const pickupMarker = new window.google.maps.Marker({
        position: studentPickup,
        map,
        title: "Điểm đón học sinh",
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      });
      markersRef.current.push(pickupMarker);
    }
    if ( busStops ) {
      busStops.forEach((stop, index) => {
        const stopMarker = new window.google.maps.Marker({
          position: stop,
          map,
          title: `Điểm dừng ${index + 1}`,
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });
        markersRef.current.push(stopMarker);
      });
    }

    // ⭐ Vẽ polyline tuyến đường nếu có
    if (routeCoordinates && routeCoordinates.length > 0) {
      polylineRef.current = new window.google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map: map,
      });
    }
  }, [
    isLoaded,
    loadError,
    school,
    busPosition,
    studentPickup,
    routeCoordinates,
    zoom,
    showZoomControl,
    memoizedDefaultCenter,
  ]);

  if (loadError) {
    return (
      <div className={`p-4 text-red-600 ${className}`}>
        Lỗi: {loadError} (Kiểm tra API Key)
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`p-4 text-blue-600 flex items-center justify-center h-full ${className}`}
      >
        Đang tải bản đồ...
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", borderRadius: "0.5rem" }}
      className={className}
    />
  );
};

export default GoogleMapDisplay;
