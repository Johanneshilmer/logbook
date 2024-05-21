import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Container } from 'react-bootstrap';


export default function Timer(props) {
  return (
    <Container>
      <Row>
        <Col sm={12} className='mb-5'>
          <h1>{props.text}</h1>
        </Col>
        <Col className='d-flex justify-content-center mt-5'>
          <span>00:00:00</span>
        </Col>
      </Row>
    </Container>
    
  )
}