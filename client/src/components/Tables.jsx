import Table from 'react-bootstrap/Table';
import React from 'react';

export default function Tables({ dataForms }) {


  const tableRows = dataForms.map((items) => {
    return (
      <tr key={items.id}>
        <td>{items.date}</td>
        <td>{items.time}</td>
        <td>{items.workOrder}</td>
        <td>{items.program}</td>
        <td>{items.radios}</td>
        <td>Worktime</td>
        <td>{items.solderTest}</td>
        <td>{items.name}</td>
        <td>{items.comment}</td>
        <td>Change</td>
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