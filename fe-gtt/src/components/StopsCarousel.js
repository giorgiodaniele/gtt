import {
  Card,
} from "react-bootstrap";

function StopsCarousel(props) {
  if (!props.stops || props.stops.length === 0) 
    return null;

  return (
    <Card className="mt-3 shadow-sm">
      <Card.Header className="fw-bold text-center">{props.title}</Card.Header>
      <Card.Body className="p-2">
        <div className="d-flex gap-2 overflow-auto pb-2">
          {props.stops.map((s, i) => (

            <Card
              key={s.codice || i}
              className="flex-shrink-0 text-center shadow-sm"
              style={{
                minWidth : "120px",
                borderTop: `4px solid ${props.color}`,
              }}
            >
              <Card.Body className="p-2">
                <div className="fw-semibold">{s.nome}</div>
                <small className="text-muted">{s.codice}</small>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}


export default StopsCarousel;