import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Table } from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';

export default function SearchPage() {
  const today = new Date();
  const [query, setQuery] = useState('');
  const [parent, setParent] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);

  const handleSearch = useCallback(async () => {
    try {
      const response = await axios.get('/api/search', {
        params: { query, parent, startDate, endDate }
      });
      setResults(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching data:', error);
    }
  }, [query, parent, startDate, endDate]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const sortedDataForms = [...results].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA;
  });

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
      <td className='table-comment'>{items.comment}</td>
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
                <Form.Control
                  type="text"
                  placeholder="Enter keyword"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Form.Group>
              
              <Form.Group controlId="searchParent">
                <Row md={5}>
                  <Col>
                    <Form.Label>Machine Line</Form.Label>
                    <Form.Select as="select" value={parent} onChange={(e) => setParent(e.target.value)}>
                      <option value="">All</option>
                      <option value="Augustiner">Augustiner</option>
                      <option value="Franziskaner">Franziskaner</option>
                      <option value="Mackmyra">Mackmyra</option>
                    </Form.Select>
                  </Col>
                  <Col>
                    <Form.Label className='d-flex'>Start Date</Form.Label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                    />
                  </Col>
                  <Col className='date-col'>
                    <Form.Label className='d-flex'>End Date</Form.Label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                    />
                  </Col>
                </Row>
              </Form.Group>
              
            </Form>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <h3>
              Results <span>: {sortedDataForms.length} {sortedDataForms.length > 1 ? 'Changeovers' : 'Changeover'}</span>

            </h3>
            {results.length > 0 ? (
              <div className='table-responsive'>
                <Table striped bordered hover className='custom-table'>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>Order</th>
                      <th>Program</th>
                      <th>Site</th>
                      <th>Work Time</th>
                      <th>Solder Test</th>
                      <th>ID</th>
                      <th>Comment</th>
                      <th>Machine</th>
                    </tr>
                  </thead>
                  <tbody>{tableRows}</tbody>
                </Table>
                <Pagination className="justify-content-center custom-pagination">
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
              </div>
            ) : (
              <p>No results found</p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
