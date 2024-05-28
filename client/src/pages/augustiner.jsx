import { Container, Row, Col } from "react-bootstrap";
import React, { useState } from "react";

// Components
import Header from  '../components/Header'
import Forms from '../components/Forms'
import Timer from '../components/Timer'
import Tables from '../components/Tables'



const dataForms = [
  {id: 1,},
  {id: 2},
]

function Augustiner() {

  const [dataList, setDataList] = useState(dataForms)
  console.log('app.js', dataList);

  return(
    <div>
            <Header />
      
      <Container className="mt-4">
        <Row>
          <Col>
          {/* Form here */}
            <Forms dataForms={dataForms} setDataForms={setDataList} />
          </Col>
          <Col>
          {/* Timer here */}
            <Timer text="Augustiner" />
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

export default Augustiner;