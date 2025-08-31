import { Marker, Popup } from "react-leaflet";
import { Card, Badge }   from "react-bootstrap";
import { BusFrontFill, ClockFill, PersonWheelchair } from "react-bootstrap-icons";

// src/mapIcons.js
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Default Leaflet marker icon fix
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize   : [25, 41],
  iconAnchor : [12, 41],
  popupAnchor: [1, -34],
  shadowSize : [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function Vehicle({ vehicle }) {
  return (
    <Marker position={[vehicle.lat, vehicle.lon]}>
      <Popup>
        <Card style={{ minWidth: "220px" }} className="shadow-sm">
          <Card.Body>

            <Card.Title>
              <BusFrontFill className="me-2 text-primary" /> Vehicle {vehicle.id}
            </Card.Title>

            <Card.Text>
              <PersonWheelchair className="me-2" />
              {vehicle.disabili ? (
                <Badge bg="success">Wheelchair Accessible</Badge>
              ) : (
                <Badge bg="secondary">Not Accessible</Badge>
              )}
            </Card.Text>

            <Card.Text>
              <ClockFill className="me-2" />
              Last update: {vehicle.aggiornamento}
            </Card.Text>
          </Card.Body>
        </Card>
      </Popup>
    </Marker>
  );
}

export default Vehicle;
