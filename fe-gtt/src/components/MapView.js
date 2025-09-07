import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Card,
} from "react-bootstrap";

function MapView(props) {
  const position = [45.07, 7.69];

  const busIcon = new L.Icon({
    iconUrl    : "/bus.png",
    iconSize   : [40, 40],
    iconAnchor : [20, 20],
    popupAnchor: [0, -20],
  });

  const stopIcon = new L.Icon({
    iconUrl    : "/stop.png",
    iconSize   : [20, 20],
    iconAnchor : [10, 20],
    popupAnchor: [0, -18],
  });

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

      {/* Veicoli */}
      {props.vehicles.map((v) => (
        <Marker key={`v-${v.id}`} position={[v.lat, v.lon]} icon={busIcon}>
          <Popup>
            <Card style={{ width: "16rem" }} className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="h6 mb-0">Vettura {v.id}</Card.Title>
                  {v.tipo === "B" && <span className="badge bg-primary">Bus</span>}
                  {v.tipo === "T" && <span className="badge bg-warning text-dark">Tram</span>}
                  {v.tipo === "M" && <span className="badge bg-danger">Metro</span>}
                </div>

                <Card.Text>
                  <strong>Occupazione:</strong>
                </Card.Text>
                <div className="progress mb-2" style={{ height: "8px" }}>
                  <div
                    className={`progress-bar ${
                      v.occupazione < 50
                        ? "bg-success"
                        : v.occupazione < 80
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                    role="progressbar"
                    style={{ width: `${v.occupazione}%` }}
                  />
                </div>
                <small>{v.occupazione}%</small>

                <Card.Text className="mt-2">
                  <strong>Accesso disabili:</strong>{" "}
                  {v.disabili ? "✔️ Disponibile" : "❌ Non disponibile"}
                </Card.Text>

                <Card.Footer className="bg-transparent border-0 text-muted p-0 mt-2">
                  Aggiornato: {v.aggiornamento}
                </Card.Footer>
              </Card.Body>
            </Card>
          </Popup>
        </Marker>
      ))}

      {/* Fermate Andata */}
      {props.stopsOngoing.map((s, i) => (
        <Marker key={`o-${s.codice || i}`} position={[s.lat, s.lon]} icon={stopIcon}>
          <Popup>
            <strong>{s.nome}</strong>
            <br />
            Codice: {s.codice}
          </Popup>
        </Marker>
      ))}

      {/* Fermate Ritorno */}
      {props.stopsReturn.map((s, i) => (
        <Marker key={`r-${s.codice || i}`} position={[s.lat, s.lon]} icon={stopIcon}>
          <Popup>
            <strong>{s.nome}</strong>
            <br />
            Codice: {s.codice}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}


export default MapView;