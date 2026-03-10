import React from "react";
import { Table, Title, Container, Paper } from "@mantine/core";

function GraduateStatus() {
  // Define the rows data
  const rows = [
    {
      rollNo: "20MCS010",
      semester: "3rd",
      seminarDate: "2024-10-14",
      mentor: "Dr. Shivdayal Patel",
      venue: "Room L101",
      title: "Blockchain and Security",
    },
    {
      rollNo: "22MCS020",
      semester: "4th",
      seminarDate: "2024-12-20",
      mentor: "Dr. Durgesh Singh",
      venue: "Room L202",
      title: "AI in Healthcare",
    },
  ];

  return (
    <Container size="lg" style={{ marginTop: "50px" }}>
      <Paper padding="md" shadow="xs">
        <Title order={2} align="center">
          Graduate Status
        </Title>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "15%" }}>Roll No.</Table.Th>
              <Table.Th style={{ width: "10%" }}>Semester</Table.Th>
              <Table.Th style={{ width: "15%" }}>Seminar Date</Table.Th>
              <Table.Th style={{ width: "20%" }}>Mentor</Table.Th>
              <Table.Th style={{ width: "10%" }}>Venue</Table.Th>
              <Table.Th style={{ width: "20%" }}>Title</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, index) => (
              <Table.Tr key={index}>
                <Table.Td>{row.rollNo}</Table.Td>
                <Table.Td>{row.semester}</Table.Td>
                <Table.Td>{row.seminarDate}</Table.Td>
                <Table.Td>{row.mentor}</Table.Td>
                <Table.Td>{row.venue}</Table.Td>
                <Table.Td>{row.title}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default GraduateStatus;
