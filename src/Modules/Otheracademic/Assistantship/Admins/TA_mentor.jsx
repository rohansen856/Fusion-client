import React, { useState } from "react";
import { Table } from "@mantine/core";

function TA_mentor() {
  const [requests] = useState([
    {
      id: 1,
      studentName: "Alice",
      rollNumber: "2021005",
      status: "Approved by HoD",
    },
    {
      id: 2,
      studentName: "Bob",
      rollNumber: "2021006",
      status: "Pending with Academic Admin",
    },
  ]);

  return (
    <div>
      <h2>Dean - Assistantship Requests</h2>
      <Table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.studentName}</td>
              <td>{request.rollNumber}</td>
              <td>{request.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default TA_mentor;
