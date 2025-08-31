import { 
  useState, 
  useEffect, 
  useMemo 
}                             from "react";

import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  InputGroup, 
  Badge, 
  ListGroup 
}                             from "react-bootstrap";

import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline 
}                             from "react-leaflet";

import L                      from "leaflet";
import { renderToString }     from "react-dom/server";

import { 
  GeoAltFill, 
  BusFrontFill, 
  PersonWheelchair 
}                             from "react-bootstrap-icons";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";

// API
import { 
  getStops, 
  getVehicles, 
  getLines 
}                             from "./services/api";

// ---------------------- COMPONENTS ----------------------

function Vehicle({ vehicle }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className : "vehicle-icon",
        html      : renderToString(
          <BusFrontFill className="fs-3" style={{ color: "#000000ff" }} />
        ),
        iconSize  : [32, 32],
        iconAnchor: [16, 32],
      }),
    []
  );

  return (
    <Marker position={[vehicle.lat, vehicle.lon]} icon={icon}>
      <Popup>
        <p className="mb-1">
          <strong>Vettura {vehicle.id}</strong>
        </p>
      </Popup>
    </Marker>
  );
}

function Stops({ stops, color }) {
  const stopIcon = useMemo(
    () =>
      L.divIcon({
        className : "stop-icon",
        html      : renderToString(
          <GeoAltFill className="fs-4" style={{ color }} />
        ),
        iconSize  : [24, 24],
        iconAnchor: [12, 24],
      }),
    [color]
  );

  const positions = stops.map((s) => [s.lat, s.lon]);

  return (
    <>
      <Polyline positions={positions} color={color} weight={4} />
      {stops.map((stop) => (
        <Marker 
          key={stop.codice} 
          position={[stop.lat, stop.lon]} 
          icon={stopIcon}
        >
          <Popup>
            <strong>{stop.nome}</strong>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// ---------------------- CLOCK ----------------------

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time.toLocaleTimeString("it-IT")}</span>;
}

// ---------------------- LEGEND ----------------------

function Legend() {
  return (
    <div>
      <h6 className="fw-bold mb-2">Legenda</h6>
      <ul className="list-unstyled mb-0">
        <li className="d-flex align-items-center mb-1">
          <BusFrontFill className="me-2" style={{ color: "#000000ff" }} />
          <span>Vettura</span>
        </li>
        <li className="d-flex align-items-center mb-1">
          <div
            style={{
              width      : 20,
              height     : 4,
              background : "rgba(0, 60, 255, 1)",
              marginRight: 8,
            }}
          />
          <span>Percorso Andata</span>
        </li>
        <li className="d-flex align-items-center mb-1">
          <div
            style={{
              width      : 20,
              height     : 4,
              background : "rgba(255, 0, 0, 1)",
              marginRight: 8,
            }}
          />
          <span>Percorso Ritorno</span>
        </li>
      </ul>
    </div>
  );
}

// ---------------------- MAIN APP ----------------------

function App() {
  const [lines,        setLines]        = useState([]);
  const [line,         setLine]         = useState("");
  const [vehicles,     setVehicles]     = useState([]);
  const [ongoingStops, setOngoingStops] = useState([]);
  const [returnStops,  setReturnStops]  = useState([]);

  useEffect(() => {
    getLines().then(setLines).catch(console.error);
  }, []);

  useEffect(() => {
    if (!line) return;
    Promise.all([
      getVehicles(line), 
      getStops(line, "ongoing"), 
      getStops(line, "return")
    ])
      .then(([veh, ongoing, ret]) => {
        setVehicles(veh);
        setOngoingStops(ongoing);
        setReturnStops(ret);
      })
      .catch(console.error);
  }, [line]);


  // Update veichles every 5 seconds
  useEffect(() => {
    if (line === "") return;
    const interval = setInterval(() => {
      getVehicles(line).then(setVehicles).catch(console.error);
    }, 2000);
    return () => clearInterval(interval);
  }, [line]);

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      {/* Header */}
      <Row className="mb-4">
        <Col className="d-flex justify-content-center align-items-center">
          <img
            src={process.env.PUBLIC_URL + "/Logo_GTT.png"}
            alt="Logo GTT"
            style={{ width: 100, height: 50, marginRight: 10 }}
          />
          <h1 className="fw-bold text-primary">Tracciamento linee</h1>
        </Col>
      </Row>

      {/* Layout with sidebar and map */}
      <Row style={{ height: "600px" }}>
        {/* Sidebar */}
        <Col md={3} className="mb-4 h-100">
          <div className="card shadow-sm p-3 h-100 d-flex flex-column">
            {/* Search input */}
            <Form onSubmit={(e) => e.preventDefault()} className="mb-3">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Digita linea..."
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                />
                <Button variant="primary" type="submit">
                  Cerca
                </Button>
              </InputGroup>
            </Form>

            {/* Lines list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <ListGroup>
                {lines.map((l) => (
                  <ListGroup.Item
                    key={l}
                    action
                    active={l === line}
                    onClick={() => setLine(l)}
                  >
                    {l}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        </Col>

        {/* Map + Overlays */}
        <Col md={9} className="h-100 d-flex flex-column">
          <div className="card shadow-lg flex-grow-1 position-relative">
            {/* Map */}
            <MapContainer
              center={[45.0703, 7.6869]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {vehicles && vehicles.map((v) => (
                <Vehicle key={v.id} vehicle={v} />
              ))}
              <Stops stops={ongoingStops} color="rgba(0, 30, 255, 0.5)" />
              <Stops stops={returnStops}  color="rgba(255, 0, 0, 0.5)" />
            </MapContainer>

            {/* Legend overlay (right side) */}
            <div
              style={{
                position        : "absolute",
                top             : "50%",
                right           : 10,
                transform       : "translateY(-50%)",
                background      : "rgba(255,255,255,0.95)",
                padding         : "12px 16px",
                borderRadius    : "10px",
                boxShadow       : "0 2px 8px rgba(0, 0, 0, 1)",
                fontSize        : "0.9rem",
                zIndex          : 1000,
                maxWidth        : "200px",
              }}
            >
              <Legend />
            </div>

            {/* Clock overlay (top-right corner) */}
            <div
              style={{
                position        : "absolute",
                top             : 10,
                right           : 10,
                background      : "rgba(255,255,255,0.9)",
                padding         : "6px 12px",
                borderRadius    : "8px",
                fontWeight      : "bold",
                boxShadow       : "0 2px 6px rgba(0,0,0,0.2)",
                color           : "#000000ff",
                zIndex          : 1000,
              }}
            >
              <Clock />
            </div>
          </div>
        </Col>
      </Row>

      {/* Footer */}
      <Row className="mt-4">
        <Col className="text-center text-muted">
          <small>
            Inseguitore linee GTT | Vetture in tempo reale | &copy; {new Date().getFullYear()} | v1.3
          </small>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
