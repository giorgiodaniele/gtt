import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

function Legend() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.style.background   = "white";
      div.style.padding      = "8px";
      div.style.borderRadius = "8px";
      div.style.boxShadow    = "0 0 6px rgba(0,0,0,0.3)";
      div.innerHTML = `
        <div><span style="display:inline-block;width:20px;height:4px;background:blue;margin-right:6px;"></span> Outbound</div>
        <div><span style="display:inline-block;width:20px;height:4px;background:red;margin-right:6px;"></span> Inbound</div>
      `;
      return div;
    };
    legend.addTo(map);
    return () => legend.remove();
  }, [map]);

  return null;
}

export default Legend;
