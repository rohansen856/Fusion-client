import React, { useState, useEffect } from "react";
import { Table, Paper, Switch, Button, Modal, Text } from "@mantine/core";
import axios from "axios";
import {
  Fetch_Pending_Request_TA,
  Update_Leave_Status_TA,
} from "../../../routes/otheracademicRoutes/index";

function ApproveLeaveTA() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [status, setStatus] = useState([]);
  const [opened, setOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // const [loading,setLoading]=useState()
  // const [error,setError]=useState()

  const authToken = localStorage.getItem("authToken");

  const fetchPendingLeaves = async () => {
    try {
      const response = await axios.get(Fetch_Pending_Request_TA, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      // console.log(response);

      setLeaveRequests(response.data);
      // Initialize status for each leave request
      const initialStatus = response.data.map(() => ({
        approveCheck: false,
        rejectCheck: false,
        submitted: false,
      }));
      setStatus(initialStatus);

      // setLoading(false);
    } catch (err) {
      // setError("Error fetching leave requests");
      // setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
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
    setSelectedStudent(leaveRequests[index]);
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

    const approvedLeaves = leaveRequests.filter(
      (_, index) => status[index]?.approveCheck,
    );
    const rejectedLeaves = leaveRequests.filter(
      (_, index) => status[index]?.rejectCheck,
    );

    console.log("Approved Leaves:", approvedLeaves);
    console.log("Rejected Leaves:", rejectedLeaves);

    // Submit data to the server if required
    try {
      const response = await axios.post(
        Update_Leave_Status_TA,
        {
          approvedLeaves: approvedLeaves.map((leave) => leave.id), // Sending only the ids
          rejectedLeaves: rejectedLeaves.map((leave) => leave.id), // Sending only the ids
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );
      console.log("Status updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating leave status:", error);
    }

    fetchPendingLeaves();
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
              {leaveRequests.map((item, index) => (
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
                    style={{ border: "1px solid black", textAlign: "center" }}
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
              <strong>Date From:</strong> {selectedStudent.details.dateFrom}
            </Text>
            <Text>
              <strong>Date To:</strong> {selectedStudent.details.dateTo}
            </Text>
            <Text>
              <strong>Leave Type:</strong> {selectedStudent.details.leaveType}
            </Text>
            <Text>
              <strong>Address:</strong> {selectedStudent.details.address}
            </Text>
            <Text>
              <strong>Purpose:</strong> {selectedStudent.details.purpose}
            </Text>
            <Text>
              <strong>HOD Credential:</strong>{" "}
              {selectedStudent.details.hodCredential}
            </Text>
            <Text>
              <strong>Mobile Number:</strong>{" "}
              {selectedStudent.details.mobileNumber}
            </Text>
            <Text>
              <strong>Parents' Mobile Number:</strong>{" "}
              {selectedStudent.details.parentsMobile}
            </Text>
            <Text>
              <strong>Mobile During Leave:</strong>{" "}
              {selectedStudent.details.mobileDuringLeave}
            </Text>
            <Text>
              <strong>Semester:</strong> {selectedStudent.details.semester}
            </Text>
            <Text>
              <strong>Academic Year:</strong>{" "}
              {selectedStudent.details.academicYear}
            </Text>
            <Text>
              <strong>Date of Application:</strong>{" "}
              {selectedStudent.details.dateOfApplication}
            </Text>
          </div>
        )}
      </Modal>
    </>
  );
}

export default ApproveLeaveTA;
