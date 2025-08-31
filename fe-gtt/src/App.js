import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";

// Components
import Stop    from "./components/Stop";
import Vehicle from "./components/Vehicle";

// API
import { getStops, getVehicles, getPath } from "./services/api";

function App() {
  const [line,  setLine]  = useState("");
  const [buses, setBuses] = useState([]);
  const [paths, setPaths] = useState({ As: [], Di: [] });
  const [stops, setStops] = useState([]);

  // Load stops at startup
  useEffect(() => {
    getStops().then(setStops).catch(console.error);
  }, []);

  // Load data for a line
  const loadLineData = (lineNumber) => {
    if (!lineNumber) return;
    setLine(lineNumber);
    getVehicles(lineNumber).then(setBuses).catch(console.error);
    getPath(lineNumber).then(setPaths).catch(console.error);
  };

  // Refresh vehicles every 2 seconds
  useEffect(() => {
    if (!line) return;
    const interval = setInterval(() => {
      getVehicles(line).then(setBuses).catch(console.error);
    }, 2000);
    return () => clearInterval(interval);
  }, [line]);

  // Stops of the selected line
  const normalizeCode = (c) => String(c).trim();
  const seen          = new Set();
  const lineStops     = [...paths.As, ...paths.Di]
    .map((ps) => {
      const code = normalizeCode(ps.code);
      return stops.find((s) => normalizeCode(s.code || s.codice) === code);
    })
    .filter((s) => {
      if (!s) return false;
      if (seen.has(s.codice || s.code)) return false;
      seen.add(s.codice || s.code);
      return true;
    });

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (line) loadLineData(line);
  };

  return (
    <Container fluid className="p-4 bg-light min-vh-100">

      {/* Header */}
      <Row className="mb-4">
        <Col className="d-flex justify-content-center align-items-center">
          <img 
              src={process.env.PUBLIC_URL + "/Logo_GTT.png"} 
              style={{ width: "100px", height: "50px", marginRight: "10px" }}
            />
          <h1 className="fw-bold text-primary d-flex align-items-center">
            Line Tracking
          </h1>
        </Col>
      </Row>

      {/* Search bar */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <div className="card shadow-sm p-3">
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Enter line number..."
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                />
                <Button variant="primary" type="submit">
                  Search
                </Button>
              </InputGroup>
            </Form>
          </div>
        </Col>
      </Row>

      {/* Map */}
      <Row>
        <Col>
          <div className="card shadow-lg">
            <MapContainer
              center={[45.0703, 7.6869]}
              zoom={13}
              style={{ height: "600px", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Buses */}
              {buses.map((v) => (
                <Vehicle key={v.id} vehicle={v} />
              ))}

              {/* Paths */}
              {paths.As.length > 0 && (
                <Polyline
                  positions={paths.As.map((s) => [s.lat, s.lon])}
                  color="blue"
                  weight={4}
                  opacity={0.6}
                />
              )}
              {paths.Di.length > 0 && (
                <Polyline
                  positions={paths.Di.map((s) => [s.lat, s.lon])}
                  color="red"
                  weight={4}
                  opacity={0.6}
                />
              )}

              {/* Stops */}
              {lineStops.map((stop) => (
                <Stop key={stop.code || stop.codice} stop={stop} />
              ))}

            </MapContainer>
          </div>
        </Col>
      </Row>

      {/* Footer */}
      <Row className="mt-4">
        <Col className="text-center text-muted">
          <small>
            GTT Tracking – realtime public transport | &copy;{" "}
            {new Date().getFullYear()} | v1.0
          </small>
        </Col>
      </Row>

    </Container>
  );
}

export default App;
