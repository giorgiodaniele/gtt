import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

function Clock() {
  const map = useMap();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const clock = L.control({ position: "topright" });
    clock.onAdd = () => {
      const div = L.DomUtil.create("div", "info clock");
      div.style.background = "white";
      div.style.padding = "6px 12px";
      div.style.borderRadius = "8px";
      div.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)";
      div.style.fontSize = "14px";
      div.innerHTML = time.toLocaleTimeString();
      return div;
    };
    clock.addTo(map);

    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clock.remove();
    };
  }, [map]);

  useEffect(() => {
    const el = document.querySelector(".info.clock");
    if (el) el.innerHTML = time.toLocaleTimeString();
  }, [time]);

  return null;
}

export default Clock;
