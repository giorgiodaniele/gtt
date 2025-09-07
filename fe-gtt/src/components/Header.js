import {
  Container,
  Row,
  Col,
  Button,
  Form,
} from "react-bootstrap";

function Header(props) {
  return (
    <Container fluid className="bg-primary text-white p-3 shadow-sm">
      <h1 className="h4 mb-3">FE-GTT</h1>
      <Row className="g-2">
        <Col xs={9}>
          <Form.Control
            type="text"
            value={props.lineId}
            onChange={(e) => props.setLineId(e.target.value)}
            placeholder="Inserisci codice linea (es. 15)"
          />
        </Col>
        <Col xs={3}>
          <Button
            variant="light"
            className="w-100"
            onClick={props.onSearch}
            disabled={props.loading || props.lineId.trim() === ""}
          >
            Cerca
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Header;