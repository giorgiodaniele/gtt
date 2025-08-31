import { Marker, Popup } from "react-leaflet";
import { GeoAltFill }    from "react-bootstrap-icons";
import L from "leaflet";

// Green square stop icon
const StopIcon = L.divIcon({
  html: '<div style="background:green; width:14px; height:14px; border:2px solid black; box-shadow:0 0 2px rgba(0,0,0,0.5)"></div>',
  className : "",
  iconSize  : [14, 14],
  iconAnchor: [7, 7],
});

function Stop({ stop }) {
  return (
    <Marker position={[stop.lat, stop.lon]} icon={StopIcon}>
      <Popup>
        <p className="mb-1">
          <GeoAltFill className="me-2 text-success" />
          <strong>{stop.name || stop.nome}</strong>
        </p>
      </Popup>
    </Marker>
  );
}

export default Stop;
