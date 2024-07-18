import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Table } from 'react-bootstrap';

import Header from  '../components/Header'

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [parent, setParent] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = useCallback(async () => {
    try {
      const response = await axios.get('/api/search', { params: { query, parent } });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching data:', error);
    }
  }, [query, parent]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const sortedDataForms = [...results].sort((a, b) => {
    const dateA = new Date(`${a.date.replaceAll("/","-")}T${a.time}`);
    const dateB = new Date(`${b.date.replaceAll("/","-")}T${b.time}`);
    return dateB - dateA;
  });

  const tableRows = sortedDataForms.map(items => (
    <tr key={items.id}>
      <td>{items.date}</td>
      <td>{items.time}</td>
      <td>{items.workOrder}</td>
      <td>{items.program}</td>
      <td>{items.radios}</td>
      <td>{items.workTime}</td>
      <td>{items.solderTest ? "Y" : "N"}</td>
      <td>{items.name}</td>
      <td>{items.comment}</td>
      <td>{items.parent}</td>
    </tr>
  ));

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
                  placeholder="Enter keyword"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="searchParent">
                <Form.Label>Machine Line</Form.Label>
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
                    <th>Site</th>
                    <th>Work Time</th>
                    <th>ST</th>
                    <th>ID</th>
                    <th>Comment</th>
                    <th>Machine</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows}
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
