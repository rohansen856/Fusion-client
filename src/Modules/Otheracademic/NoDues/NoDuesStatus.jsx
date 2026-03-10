import React from "react";
import { Table, Text, Paper, ScrollArea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

function NoDuesStatus() {
  // Dummy status data for each department
  const noDuesStatus = [
    { department: "Hostel", status: "Clear" },
    { department: "Mess", status: "Not Clear" },
    { department: "Library", status: "Clear" },
    { department: "Computer Lab", status: "Clear" },
    { department: "Design Studio", status: "Not Clear" },
    { department: "Placement Cell", status: "Clear" },
    { department: "Discipline Office", status: "Clear" },
    { department: "I-Card DSA", status: "Not Clear" },
  ];
  const isAboveMd = useMediaQuery("(min-width: 992px)");

  // Render the no-dues status table
  const rows = noDuesStatus.map((item) => (
    <tr key={item.department}>
      {/* Department column inside shadowed boxes */}
      <td
        style={{
          padding: "10px 10px",
          textAlign: "center",
          // paddingLeft: isAboveSm?"200px":"0px",
        }}
      >
        <Paper
          shadow="sm"
          radius="md"
          p="sm"
          style={{
            // boxShadow: "0px 0px 5px 0px",
            // width: isAboveSm?"300px":"",
            height: "35px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "8px",
          }}
        >
          <Text>{item.department}</Text>
        </Paper>
      </td>

      <td
        style={{
          padding: "10px 10px",
          textAlign: "center",
          // paddingRight: isAboveSm?"30px":"0px",
        }}
      >
        <Paper
          shadow="sm"
          radius="md"
          p="sm"
          style={{
            // width: isAboveSm?"250px":"",
            height: "35px",
            backgroundColor: item.status === "Clear" ? "#d4edda" : "#f8d7da",
            color: item.status === "Clear" ? "#155724" : "#721c24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "8px",
          }}
        >
          <Text>{item.status}</Text>
        </Paper>
      </td>
    </tr>
  ));

  return (
    <center>
      <ScrollArea style={{ width: isAboveMd ? "800px" : "" }}>
        <Table
          style={{ width: isAboveMd ? "800px" : "" }}
          highlightOnHover
          withBorder
          withColumnBorders
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: "10px 10px",
                  textAlign: "center",
                  borderTopLeftRadius: "5px",
                }}
              >
                <div>Department</div>
              </th>
              <th
                style={{
                  padding: "10px 10px",
                  textAlign: "center",
                  borderTopRightRadius: "5px",
                }}
              >
                <div>Status</div>
              </th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
    </center>
    //   {/* </Grid.Col>
    // </Grid> */}
    //  </Paper>
  );
}

export default NoDuesStatus;
