import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table, Paper, Loader } from "@mantine/core";
import axios from "axios";
import { Get_Assistantship_Status } from "../../../../routes/otheracademicRoutes/index";

function AssistantshipStatus() {
  const roll = useSelector((state) => state.user.roll_no);
  const name = useSelector((state) => state.user.username);
  const authToken = localStorage.getItem("authToken");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roll || !name || !authToken) return;

    const fetchAssistantshipStatus = async () => {
      try {
        const response = await axios.post(
          Get_Assistantship_Status,
          { roll_no: roll, username: name },
          { headers: { Authorization: `Token ${authToken}` } },
        );
        console.log("API Response:", response.data);
        setData(response.data.reverse());
      } catch (err) {
        setError("Failed to fetch Assistantship requests. Please try again.");
        console.error("Error fetching assistantship status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssistantshipStatus();
  }, [roll, name, authToken]);

  if (loading)
    return (
      <div className="loader-container">
        <Loader color="blue" size="lg" />
      </div>
    );

  if (error) return <div className="error-message">{error}</div>;

  return (
    <Paper className="status-paper">
      <div className="table-wrapper">
        <Table striped highlightOnHover className="status-table">
          <thead>
            <tr>
              <th>Date Applied</th>
              <th>TA Supervisor</th>
              <th>Thesis Supervisor</th>
              <th>HOD</th>
              <th>Academic Admin</th>
              <th>Dean</th>
              <th>Director</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.dateApplied || "N/A"}</td>
                <td>{item.approvalStages.TA_Supervisor}</td>
                <td>{item.approvalStages.Thesis_Supervisor}</td>
                <td>{item.approvalStages.HOD}</td>
                <td>{item.approvalStages.Academic_Admin}</td>
                <td>{item.approvalStages.Dean_Academic}</td>
                <td>{item.approvalStages.Director}</td>
                <td className={`status-${item.status.toLowerCase()}`}>
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Paper>
  );
}

export default AssistantshipStatus;
