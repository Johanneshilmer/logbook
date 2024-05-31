import { Container, Row, Col } from "react-bootstrap";
import React, { useState } from "react";

// Components
import Header from  '../components/Header'
import Forms from '../components/Forms'
import Timer from '../components/Timer'
import Tables from '../components/Tables'



const dataForms = [
]

function Mackmyra() {

  const [dataList, setDataList] = useState(dataForms)
  console.log('app.js', dataList);

  return(
    <div>
      <Header />
      
      <Container className="mt-4">
        <Row>
          <Col>
          {/* Form here */}
            <Forms dataForms={dataList} setDataForms={setDataList} />
          </Col>
          <Col>
          {/* Timer here */}
            <Timer text="Mackmyra" />
          </Col>
        </Row>

        <Row className="mt-5">
          {/* Table */}
          <Tables dataForms={dataList} />
        </Row>
      </Container>
    </div>
  )
};

export default Mackmyra;