import React from 'react'
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import '../App.css'

export default function Home() {
  return (
<div>
  <Navbar className="site-header sticky-top" bg="dark" variant="dark" expand="md">
    <Container>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="d-flex justify-content-between">
        <Nav>
          <Nav.Link href="#augustiner">Augustiner</Nav.Link>
          <Nav.Link href="#franziskaner">Franziskaner</Nav.Link>
          <Nav.Link href="#mackmyra">Mackmyra</Nav.Link>
          <Nav.Link href="#smt-search">Search</Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link href="#blyad-vaglodning">Blyad Våglödning</Nav.Link>
          <Nav.Link href="#blyfri-vaglodning">Blyfi Våglödning</Nav.Link>
          <Nav.Link href="#selektiv2">Selektiv2</Nav.Link>
          <Nav.Link href="#selektiv3">Selektiv3</Nav.Link>
          <Nav.Link href="#selektiv-search">Search</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>

  <Container className="my-5">
    <Row id='home-main' className="flex-md-equal">
      {/* Left Column */}
      <Col className="text-center p-5">
        <h2 className="display-5"><strong>SMT</strong></h2>
        <div id='home-content' className="bg-dark text-white box-shadow mx-auto py-5" style={{ width: '85%', height: '350px', borderRadius: '25px', }}>
          <a id='home-item' href="#augustiner" className="d-block mb-3 fs-4 text-white text-decoration-none hover-link">Augustiner</a>
          <a id='home-item' href="#franziskaner" className="d-block mb-3 fs-4 text-white text-decoration-none hover-link">Franziskaner</a>
          <a id='home-item' href="#mackmyra" className="d-block mb-3 fs-4 text-white text-decoration-none hover-link">Mackmyra</a>
          <a id='home-item' href="#smt-search" className="d-block fs-4 text-white text-decoration-none hover-link">Search</a>
        </div>
      </Col>

      {/* Right Column */}
      <Col className="text-center p-5">
        <h2 className="display-5"><strong>Selektiv/Våglödning</strong></h2>
        <div id='home-content' className="bg-dark text-white box-shadow mx-auto py-5" style={{ width: '85%',height: '350px',borderRadius: '25px', }}>
          <a id='home-item' href="#blyad-vaglodning" className="d-block mb-3 fs-4 text-white text-decoration-none hover-link">Blyad Våglödning</a>
          <a id='home-item' href="#blyfri-vaglodning" className="d-block mb-3 fs-4 text-white text-decoration-none hover-link">Blyfri Våglödning</a>
          <a id='home-item' href="#selektiv2" className="d-block mb-3 fs-4 text-white text-decoration-none hover-link">Selektiv2</a>
          <a id='home-item' href="#selektiv3" className="d-block mb-3 fs-4 text-white text-decoration-none hover-link"> Selektiv3</a>
          <a id='home-item' href="#selektiv-search" className="d-block fs-4 text-white text-decoration-none hover-link">Search</a>
        </div>
      </Col>
    </Row>
  </Container>
</div>
  )
}
