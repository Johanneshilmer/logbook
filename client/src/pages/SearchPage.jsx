import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Table } from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';
import Header from '../components/Header';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [parent, setParent] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50); // Max 50 rows per page

  // handle query
  const handleSearch = useCallback(async () => {
    try {
      const response = await axios.get('/api/search', { params: { query, parent } });
      setResults(response.data);
      setCurrentPage(1); // Reset to the first page whenever a new search is performed
    } catch (error) {
      console.error('Error searching data:', error);
    }
  }, [query, parent]);

  // load data
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // Sorting data
  const sortedDataForms = [...results].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA;
  });

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedDataForms.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedDataForms.length / rowsPerPage);

  const tableRows = currentRows.map((items) => (
    <tr key={items.id}>
      <td>{items.date}</td>
      <td>{items.time}</td>
      <td>{items.workOrder}</td>
      <td>{items.program}</td>
      <td>{items.radios}</td>
      <td>{items.workTime}</td>
      <td>{items.solderTest ? 'Y' : 'N'}</td>
      <td>{items.name}</td>
      <td>{items.comment}</td>
      <td>{items.parent}</td>
    </tr>
  ));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div>
      <Header />
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
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="searchParent">
                <Form.Label>Machine Line</Form.Label>
                <Form.Control as="select" value={parent} onChange={(e) => setParent(e.target.value)}>
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
              <>
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
                  <tbody>{tableRows}</tbody>
                </Table>
                <Pagination className="justify-content-center">
                  <Pagination.First onClick={() => handlePageChange(1)} />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                  />
                  {paginationItems}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  />
                  <Pagination.Last onClick={() => handlePageChange(totalPages)} />
                </Pagination>
              </>
            ) : (
              <p>No results found</p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
