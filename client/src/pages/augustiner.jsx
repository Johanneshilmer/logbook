import { Container, Row, Col } from "react-bootstrap";

// Components
import Header from  '../components/Header'
import Forms from '../components/Forms'
import Timer from '../components/Timer'
import Tables from '../components/Tables'



const dataForm = [dataForm]

function Augustiner() {
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
            <Timer text="Augustiner" />
          </Col>
        </Row>

        <Row className="mt-5">
          {/* Table */}
          <Tables dataForm={dataForm} />
        </Row>
      </Container>
    </div>
  )
};

export default Augustiner;