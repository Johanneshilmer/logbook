import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


export default function SelektivHeader() {
  return (
    <Navbar bg="dark" data-bs-theme="dark" className='sticky-top'>
      <Container>
        <Nav className="me-auto">
          <Nav.Link href="/" className='me-2'>Home</Nav.Link>
          <Nav.Link href="#blyad-vaglodning">Blyad Våglödning</Nav.Link>
          <Nav.Link href="#blyfri-vaglodning">Blyfi Våglödning</Nav.Link>
          <Nav.Link href="#selektiv2">Selektiv2</Nav.Link>
          <Nav.Link href="#selektiv3">Selektiv3</Nav.Link>
          <Nav.Link href="#selektiv-search">Search</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}