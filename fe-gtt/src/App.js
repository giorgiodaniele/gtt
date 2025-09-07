import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Spinner,
  Card,
  Alert,
  Modal,
} from "react-bootstrap";
import Header from "./components/Header";
import MapView from "./components/MapView";
import StopsCarousel from "./components/StopsCarousel";

import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";

// --- API helpers ---
async function fetchVehicles(id) {
  const res = await fetch(`/api/lines/${id}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Errore HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchStops(id, direction) {
  const res = await fetch(`/api/lines/${id}/stops/${direction}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Errore HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

// --- Overlay ---
function LoadingOverlay(props) {
  return (
    <Modal show={props.show} centered backdrop="static" keyboard={false}>
      <Modal.Body className="text-center">
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "3rem", height: "3rem" }}
        />
        <p className="mt-3 fw-semibold">Caricamento in corso...</p>
      </Modal.Body>
    </Modal>
  );
}

function App() {
  const [lineId, setLineId]             = useState("");
  const [loading, setLoading]           = useState(false);
  const [vehicles, setVehicles]         = useState([]);
  const [error, setError]               = useState("");
  const [stopsOngoing, setStopsOngoing] = useState([]);
  const [stopsReturn, setStopsReturn]   = useState([]);

  async function onSearch() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchVehicles(lineId);
      setVehicles(data);

      const stopsO = await fetchStops(lineId, "ongoing");
      const stopsR = await fetchStops(lineId, "return");
      setStopsOngoing(stopsO);
      setStopsReturn(stopsR);

      if (data.length === 0) {
        setError("Nessun veicolo trovato per questa linea.");
      }
    } catch (err) {
      console.error("Errore fetch:", err);
      setError("Errore durante il caricamento dei dati.");
      setVehicles([]);
      setStopsOngoing([]);
      setStopsReturn([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container fluid className="p-0">
      <Header
        lineId={lineId}
        setLineId={setLineId}
        onSearch={onSearch}
        loading={loading}
      />

      <Container fluid className="p-3">
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <MapView
                  vehicles={vehicles}
                  stopsOngoing={stopsOngoing}
                  stopsReturn={stopsReturn}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <StopsCarousel title="Andata" stops={stopsOngoing} color="#007bff" />
        <StopsCarousel title="Ritorno" stops={stopsReturn} color="#dc3545" />
      </Container>

      {error && (
        <Container className="p-3">
          <Alert variant="danger">{error}</Alert>
        </Container>
      )}

      <LoadingOverlay show={loading} />
    </Container>
  );
}

export default App;
