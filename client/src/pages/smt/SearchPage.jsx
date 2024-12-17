import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../../components/Header';

export default function SearchPage() {
  const today = new Date();
  const [query, setQuery] = useState('');
  const [parent, setParent] = useState('');
  const [solderTest, setSolderTest] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [results, setResults] = useState([]);

  const handleSearch = useCallback(async () => {
    try {
      const response = await axios.get('/api/search', {
        params: {
          dbType: 'smt',
          query, 
          parent, 
          startDate, 
          endDate, 
          solderTest }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching data:', error);
    }
  }, [query, parent, startDate, endDate, solderTest]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const sortedDataForms = [...results].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA;
  });

  const formatTime = (time) => {
    return time ? time.slice(0, 5) : '';
  };

  const calculateAverageChangeOver = () => {
    // Filter out rows where ChangeOver is "DOWNTIME"
    const filteredData = sortedDataForms.filter(item => item.radios && item.radios !== 'DOWNTIME' && item.radios !== 'DownTime');
    if (filteredData.length === 0) return "00:00"; // Return "00:00" instead of "00:00:00"
    const totalChangeOverMinutes = filteredData.reduce((acc, item) => {
      const timeParts = item.changeOver?.split(':');
      if (timeParts && timeParts.length === 3) {
        const [hours, minutes, seconds] = timeParts.map(part => parseInt(part, 10));
        const totalMinutes = hours * 60 + minutes + seconds / 60;
        return acc + totalMinutes;
      }
      return acc;
    }, 0);
    // Calculate the average in minutes
    const averageMinutes = totalChangeOverMinutes / filteredData.length;
    // Convert average minutes to hours and minutes
    const hours = Math.floor(averageMinutes / 60);
    const minutes = Math.round(averageMinutes % 60); // Round minutes to avoid fractions
    // Format as HH:MM
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };
  

  const tableRows = sortedDataForms.map((items) => (
    <tr key={items.id}>
      <td>{items.date}</td>
      <td>{formatTime(items.time)}</td>
      <td>{formatTime(items.stopTime)}</td>
      <td>{items.workOrder}</td>
      <td className='table-program'>{items.program}</td>
      <td>{items.workTime}</td>
      <td>{items.radios}</td>
      <td>{items.changeOver}</td>
      <td>{items.solderTest ? 'Y' : 'N'}</td>
      <td>{items.solderResult}</td>
      <td>{items.name}</td>
      <td className='table-comment'>{items.comment}</td>
      <td>{items.parent}</td>
    </tr>
  ));

  return (
    <div>
      <Header />
      <Container fluid className="mt-4">
        <Row className="d-flex justify-content-center">
          <Col md={8}>
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
                  <Col>
                    <Form.Label>Solder Test</Form.Label>
                    <Form.Select as="select" value={solderTest} onChange={(e) => setSolderTest(e.target.value)}>
                      <option value="">All</option>
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
              
            </Form>
          </Col>
        </Row>


        <Container>
          <Row className='mt-5'>
            <Col  xs={4}>
              <h3>
                Results <span>: {sortedDataForms.length} {sortedDataForms.length > 1 ? 'Changeovers' : 'Changeover'}</span>
              </h3>
            </Col>
            <Col>
              <h3>
                Average Changeover (hh:mm) : {calculateAverageChangeOver()} min
              </h3>
            </Col>
          </Row>
        </Container>

        <Row className="mt-2 d-flex justify-content-center">
          <Col md={11}>
            {results.length > 0 ? (
              <div className='table-responsive'>
                <Table striped bordered hover className='custom-table'>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>Stop Time</th>
                      <th>Order</th>
                      <th>Program</th>
                      <th>Work Time</th>
                      <th>Site</th>
                      <th>Changeover</th>
                      <th>Solder Test</th>
                      <th>Solder Result</th>
                      <th>ID</th>
                      <th>Comment</th>
                      <th>Machine</th>
                    </tr>
                  </thead>
                  <tbody>{tableRows}</tbody>
                </Table>
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
