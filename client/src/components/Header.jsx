import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


export default function Header() {
  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Nav className="me-auto">
          <Nav.Link href="/">Augustiner</Nav.Link>
          <Nav.Link href="#franziskaner">Franziskaner</Nav.Link>
          <Nav.Link href="#mackmyra">Mackmyra</Nav.Link>
          <Nav.Link href="#search">Search</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}