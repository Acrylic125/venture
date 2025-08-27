"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Home() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYWNyeWxpYzEyNSIsImEiOiJjbWV0cmVjeTIwMXVlMmtxd2g4a2hqamZ0In0.MdrYjEgRpsJITY3L8Bqygw";

    // Marina Bay Sands coordinates [lng, lat]
    // const marinaBaySands: [number, number] = [103.8607, 1.2834];
    const marinaBaySands: [number, number] = [103.8607, 1.2834];

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: marinaBaySands,
      zoom: 15,
    });

    mapRef.current.on("load", () => {
      new mapboxgl.Marker()
        .setLngLat(marinaBaySands)
        .addTo(mapRef.current as mapboxgl.Map);

      // Add a visible green circle at Marina Bay Sands
      const map = mapRef.current as mapboxgl.Map;
      if (!map.getSource("mbs-point")) {
        map.addSource("mbs-point", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: marinaBaySands,
                },
              },
            ],
          },
        });
      }

      if (!map.getLayer("mbs-circle")) {
        map.addLayer({
          id: "mbs-circle",
          type: "circle",
          source: "mbs-point",
          paint: {
            "circle-radius": 40,
            "circle-color": "#22c55e", // Tailwind green-500
            "circle-stroke-width": 2,
            "circle-stroke-color": "#065f46", // darker green stroke
          },
        });
      }

      // Interactivity: log coordinates when the circle is clicked
      map.on("click", "mbs-circle", (event) => {
        const feature = event.features && event.features[0];
        const coordinates =
          (feature &&
            feature.geometry &&
            (feature.geometry as GeoJSON.Point).coordinates) ||
          marinaBaySands;
        // GeoJSON Point coordinates are [lng, lat]
        const [lng, lat] = coordinates as [number, number];
        console.log("MBS clicked at:", { lng, lat });
      });

      // Change cursor to pointer on hover
      map.on("mouseenter", "mbs-circle", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "mbs-circle", () => {
        map.getCanvas().style.cursor = "";
      });

      // Add a marker for the user's current geolocation (if available)
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLngLat: [number, number] = [
              position.coords.longitude,
              position.coords.latitude,
            ];
            console.log("User's current location:", {
              lng: userLngLat[0],
              lat: userLngLat[1],
            });
            new mapboxgl.Marker({ color: "#3b82f6" }) // blue marker
              .setLngLat(userLngLat)
              .addTo(map);
          },
          (error) => {
            console.warn("Geolocation error:", error.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.warn("Geolocation not supported in this browser.");
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <main className="w-full flex flex-col items-center">
      <div className="w-full max-w-screen-lg p-4">
        <div
          id="map-container"
          ref={mapContainerRef}
          className="w-full aspect-video"
        />
      </div>
    </main>
  );
}
