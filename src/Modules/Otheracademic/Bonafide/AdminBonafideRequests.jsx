import React, { useState, useEffect } from "react";
import { Table, Paper, Switch, Button, Modal, Text } from "@mantine/core";
import axios from "axios";
import {
  Fetch_Pending_Bonafide_Request,
  Update_Bonafide_Status,
} from "../../../routes/otheracademicRoutes/index"; // Adjust API paths if needed

function ApproveBonafide() {
  const [bonafideRequests, setBonafideRequests] = useState([]);
  const [status, setStatus] = useState([]);
  const [opened, setOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const authToken = localStorage.getItem("authToken");

  const fetchPendingBonafides = async () => {
    try {
      const response = await axios.get(Fetch_Pending_Bonafide_Request, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      setBonafideRequests(response.data);

      // Initialize status for each Bonafide request
      const initialStatus = response.data.map(() => ({
        approveCheck: false,
        rejectCheck: false,
        submitted: false,
      }));
      setStatus(initialStatus);
    } catch (err) {
      console.error("Error fetching Bonafide requests", err);
    }
  };

  useEffect(() => {
    fetchPendingBonafides();
  }, []);

  const handleToggle = (index, stat) => {
    setStatus((prevStatus) =>
      prevStatus.map((item, i) => {
        if (i === index) {
          if (stat.type === "approve") {
            if (stat.value && item.rejectCheck) {
              return { ...item, approveCheck: true, rejectCheck: false };
            }
            return { ...item, approveCheck: stat.value };
          }
          if (stat.value && item.approveCheck) {
            return { ...item, approveCheck: false, rejectCheck: true };
          }
          return { ...item, rejectCheck: stat.value };
        }
        return item;
      }),
    );
  };

  const handleViewForm = (index) => {
    setSelectedStudent(bonafideRequests[index]);
    setOpened(true);
  };

  const handleSubmit = async () => {
    const updatedStatus = status.map((entry) => {
      if (entry.approveCheck || entry.rejectCheck) {
        return { ...entry, submitted: true };
      }
      return entry;
    });

    setStatus(updatedStatus);

    const approvedBonafides = bonafideRequests.filter(
      (_, index) => status[index]?.approveCheck,
    );
    const rejectedBonafides = bonafideRequests.filter(
      (_, index) => status[index]?.rejectCheck,
    );

    // Submit data to the server if required
    try {
      const response = await axios.post(
        Update_Bonafide_Status,
        {
          approvedBonafides: approvedBonafides.map((bonafide) => bonafide.id), // Sending only the ids
          rejectedBonafides: rejectedBonafides.map((bonafide) => bonafide.id), // Sending only the ids
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );
      console.log("Status updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating Bonafide status:", error);
    }

    fetchPendingBonafides();
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
                <th style={{ textAlign: "center" }}>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {bonafideRequests.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      minWidth: "100px",
                    }}
                  >
                    {item.rollNo}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      minWidth: "140px",
                    }}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      minWidth: "245px",
                    }}
                  >
                    {!status[index]?.submitted ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-evenly",
                        }}
                      >
                        <Switch
                          label="Approve"
                          checked={status[index]?.approveCheck}
                          onChange={(event) =>
                            handleToggle(index, {
                              type: "approve",
                              value: event.currentTarget.checked,
                            })
                          }
                        />
                        <Switch
                          label="Reject"
                          checked={status[index]?.rejectCheck}
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
                        {status[index]?.approveCheck
                          ? "Approved"
                          : status[index]?.rejectCheck
                            ? "Rejected"
                            : ""}
                      </Text>
                    )}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      minWidth: "100px",
                    }}
                  >
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "blue",
                      }}
                      onClick={() => handleViewForm(index)}
                    >
                      View Form
                    </button>
                  </td>
                  <td
                    style={{
                      color: `${
                        status[index]?.approveCheck
                          ? "green"
                          : status[index]?.rejectCheck
                            ? "red"
                            : "orange"
                      }`,
                      border: "1px solid black",
                      textAlign: "center",
                      minWidth: "100px",
                    }}
                  >
                    {status[index]?.approveCheck
                      ? "Approved"
                      : status[index]?.rejectCheck
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
        title={<Text style={{ fontSize: "25px" }}>Student Form Details</Text>}
        centered
        overlaycolor="rgba(0, 0, 0, 0.6)"
        overlayblur={3}
        size="lg"
      >
        {selectedStudent && (
          <div>
            <Text>
              <strong>Purpose:</strong> {selectedStudent.details.purpose}
            </Text>
            <Text>
              <strong>Academic Year:</strong> {new Date().getFullYear()}
            </Text>
            <Text>
              <strong>Date of Application:</strong>{" "}
              {selectedStudent.details.dateOfApplication}
            </Text>
            {/* Add other details as necessary */}
          </div>
        )}
      </Modal>
    </>
  );
}

export default ApproveBonafide;
