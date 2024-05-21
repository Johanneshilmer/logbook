import { Container, Row, Col } from "react-bootstrap";

// Components
import Header from  '../components/Header'
import Forms from '../components/Forms'
import Timer from '../components/Timer'
import Tables from '../components/Tables'

function Mackmyra() {
  return(
    <div>
            <Header />
      
      <Container className="mt-4">
        <Row>
          <Col>
          {/* Form here */}
            <Forms />
          </Col>
          <Col>
          {/* Timer here */}
            <Timer text="Mackmyra" />
          </Col>
        </Row>

        <Row className="mt-5">
          {/* Table */}
          <Tables />
        </Row>
      </Container>
    </div>
  )
};

export default Mackmyra;