import Table from 'react-bootstrap/Table';
import { useState } from 'react';

export default function Tables() {

  const Forms = useState();

  const tableRows = Forms.map((info) => {
    return (
      <tr>
        <td>info.name</td>
        <td>info.workOrder</td>
      </tr>
    );
  });

  return (
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
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
          {tableRows}
      </tbody>
    </Table>
  );
}