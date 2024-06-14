import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

import Header from  '../components/Header'

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [parent, setParent] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get('/api/search', { params: { query, parent } });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching data:', error);
    }
  };

  return (
    <div>
      <Header/>
      <Container className="mt-4">
        <Row>
          <Col>
            <h2>Search</h2>
            <Form>
              <Form.Group controlId="searchQuery">
                <Form.Label>Query</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter search query"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="searchParent">
                <Form.Label>Parent</Form.Label>
                <Form.Control
                  as="select"
                  value={parent}
                  onChange={e => setParent(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="augustiner">Augustiner</option>
                  <option value="mackmyra">Mackmyra</option>
                  <option value="franziskaner">Franziskaner</option>
                </Form.Control>
              </Form.Group>

              <Button variant="primary" className="mt-2" onClick={handleSearch}>
                Search
              </Button>
            </Form>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <h3>Results</h3>
            {results.length > 0 ? (
              <Table striped bordered hover responsive="xl">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>Order</th>
                    <th>Program</th>
                    <th>TOP/BOT/SETUP</th>
                    <th>Work Time</th>
                    <th>ST</th>
                    <th>ID</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>{item.workOrder}</td>
                      <td>{item.program}</td>
                      <td>{item.radios}</td>
                      <td>{item.workTime}</td>
                      <td>{item.solderTest ? "Y" : "N"}</td>
                      <td>{item.name}</td>
                      <td>{item.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>No results found</p>
            )}
          </Col>
        </Row>
      </Container>
    </div>

  );
};

export default SearchPage;
