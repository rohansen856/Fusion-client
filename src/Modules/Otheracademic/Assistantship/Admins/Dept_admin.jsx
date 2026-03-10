import "../../Bonafide/AdminBonafideRequests.css"; // Import the CSS file
import React, { useState } from "react";
import {
  Table,
  Paper,
  Switch,
  Button,
  Modal,
  Text,
  Select,
} from "@mantine/core";

function DeptAdminPage() {
  const data = [
    {
      rollNo: "22bcsxxx",
      name: "Sample 1",
      form: "22bcsxxx.pdf",
      details: {
        dateFrom: "2024-10-10",
        dateTo: "2024-10-12",
        leaveType: "Casual",
        address: "123 Street, City",
        purpose: "Personal Work",
        hodCredential: "HOD123",
        mobileNumber: "1234567890",
        parentsMobile: "0987654321",
        mobileDuringLeave: "1234567890",
        semester: "5",
        academicYear: "2024-2025",
        dateOfApplication: "2024-10-01",
      },
    },
    {
      rollNo: "22bcsxxx",
      name: "Sample 2",
      form: "22bcsxxx.pdf",
      details: {
        dateFrom: "2024-10-15",
        dateTo: "2024-10-20",
        leaveType: "Medical",
        address: "456 Avenue, City",
        purpose: "Medical treatment",
        hodCredential: "HOD456",
        mobileNumber: "2234567890",
        parentsMobile: "2987654321",
        mobileDuringLeave: "2234567890",
        semester: "5",
        academicYear: "2024-2025",
        dateOfApplication: "2024-10-05",
      },
    },
    {
      rollNo: "22bcsxxx",
      name: "Sample 3",
      form: "22bcsxxx.pdf",
      details: {
        dateFrom: "2024-10-25",
        dateTo: "2024-10-30",
        leaveType: "Medical",
        address: "46 Dmart, City",
        purpose: "Medical treatment",
        hodCredential: "HOD456",
        mobileNumber: "2233457890",
        parentsMobile: "2987698721",
        mobileDuringLeave: "2234097890",
        semester: "3",
        academicYear: "2024-2025",
        dateOfApplication: "2024-10-15",
      },
    },
  ];

  const [status, setStatus] = useState(
    data.map(() => ({
      approveCheck: false,
      rejectCheck: false,
      submitted: false, // Track if the form has been submitted for this entry
      authorityTransfer: "", // Track the selected authority
    })),
  );

  const [opened, setOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleToggle = (index, stat) => {
    setStatus((prevStatus) =>
      prevStatus.map((item, i) => {
        if (i === index) {
          if (stat.type === "approve") {
            if (stat.value === true && item.rejectCheck === true) {
              return { ...item, approveCheck: true, rejectCheck: false };
            }
            return { ...item, approveCheck: stat.value };
          }
          if (stat.value === true && item.approveCheck === true) {
            return { ...item, approveCheck: false, rejectCheck: true };
          }
          return { ...item, rejectCheck: stat.value };
        }
        return item;
      }),
    );
  };

  const handleAuthorityChange = (index, value) => {
    setStatus((prevStatus) =>
      prevStatus.map((item, i) =>
        i === index ? { ...item, authorityTransfer: value } : item,
      ),
    );
  };

  const handleViewForm = (index) => {
    setSelectedStudent(data[index]);
    setOpened(true);
  };

  const handleSubmit = () => {
    const updatedStatus = status.map((entry) => {
      if (entry.approveCheck || entry.rejectCheck) {
        // Mark as submitted if approved or rejected
        return { ...entry, submitted: true };
      }
      return entry;
    });

    setStatus(updatedStatus);

    const approvedLeaves = data.filter(
      (_, index) => status[index].approveCheck,
    );
    const rejectedLeaves = data.filter((_, index) => status[index].rejectCheck);
    console.log("Approved Leaves:", approvedLeaves);
    console.log("Rejected Leaves:", rejectedLeaves);

    // Here we can handle the form submission (e.g., send data to the server)
  };

  return (
    <>
      <Paper className="responsive-table-container">
        <div className="table-wrapper" style={{ marginTop: "50px" }}>
          <Table striped highlightOnHover className="status-table">
            <thead>
              <tr>
                <th
                  style={{
                    borderRight: "1px solid white",
                    borderLeft: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Roll No
                </th>
                <th
                  style={{
                    borderRight: "1px solid white",
                    textAlign: "center",
                  }}
                >
                  Student Name
                </th>
                <th
                  style={{
                    borderRight: "1px solid white",
                    textAlign: "center",
                  }}
                >
                  Approve/Reject
                </th>
                <th
                  style={{
                    borderRight: "1px solid white",
                    textAlign: "center",
                  }}
                >
                  View Form
                </th>
                <th
                  style={{
                    borderRight: "1px solid white",
                    textAlign: "center",
                  }}
                >
                  Authority Transfer
                </th>
                <th
                  style={{
                    borderRight: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Current Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {item.rollNo}
                  </td>
                  <td
                    style={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      maxWidth: "130px",
                    }}
                  >
                    {!status[index].submitted ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-evenly",
                        }}
                      >
                        <Switch
                          label="Approve"
                          checked={status[index].approveCheck}
                          onChange={(event) =>
                            handleToggle(index, {
                              type: "approve",
                              value: event.currentTarget.checked,
                            })
                          }
                        />
                        <Switch
                          label="Reject"
                          checked={status[index].rejectCheck}
                          onChange={(event) =>
                            handleToggle(index, {
                              type: "reject",
                              value: event.currentTarget.checked,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <Text>
                        {status[index].approveCheck
                          ? "Approved"
                          : status[index].rejectCheck
                            ? "Rejected"
                            : ""}
                      </Text>
                    )}
                  </td>
                  <td
                    style={{ border: "1px solid black", textAlign: "center" }}
                  >
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "blue",
                        padding: 0,
                      }}
                      onClick={() => handleViewForm(index)}
                    >
                      {item.form}
                    </button>
                  </td>
                  <td
                    style={{ border: "1px solid black", textAlign: "center" }}
                  >
                    <Select
                      placeholder="Select Authority"
                      data={[
                        { value: "Acad Admin", label: "Acad Admin" },
                        { value: "Dean Acad", label: "Dean Acad" },
                        { value: "Director", label: "Director" },
                        { value: "Account Section", label: "Account Section" },
                      ]}
                      value={status[index].authorityTransfer}
                      onChange={(value) => handleAuthorityChange(index, value)}
                    />
                  </td>
                  <td
                    style={{
                      color: `${
                        status[index].approveCheck
                          ? "green"
                          : status[index].rejectCheck
                            ? "red"
                            : "orange"
                      }`,
                      border: "1px solid black",
                      textAlign: "center",
                    }}
                  >
                    {status[index].approveCheck
                      ? "Approved"
                      : status[index].rejectCheck
                        ? "Rejected"
                        : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <center>
          <Button onClick={handleSubmit} mt="md">
            Submit
          </Button>
        </center>
      </Paper>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text style={{ fontSize: "25px" }}>Student Form Details</Text>
          </div>
        }
        centered
        overlaycolor="rgba(0, 0, 0, 0.6)"
        overlayblur={3}
        size="lg"
      >
        {selectedStudent && (
          <div>
            <Text>
              <strong>Date From:</strong> {selectedStudent.details.dateFrom}
            </Text>
            {/* Add more details as needed */}
          </div>
        )}
      </Modal>
    </>
  );
}

export default DeptAdminPage;
