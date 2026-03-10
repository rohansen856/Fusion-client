import React, { useEffect, useState } from "react";
import { Title, Select, TextInput } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Eye } from "@phosphor-icons/react";
import LoadingComponent from "../../components/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import { get_leave_requests } from "../../../../routes/hr/index";
import "./LeaveRequests.css";

function LeaveRequests() {
  const [requestData, setRequestData] = useState([]); // State for leave requests
  const [filteredData, setFilteredData] = useState([]); // State for filtered leave requests
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedStatus, setSelectedStatus] = useState("All"); // State for status filter
  const [selectedDate, setSelectedDate] = useState(""); // State for date filter (as string)
  const navigate = useNavigate();

  // Fetch leave requests from the backend
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      console.log("Fetching leave requests...");
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        return;
      }
      try {
        const queryParams = new URLSearchParams();
        if (selectedDate) {
          queryParams.append("date", selectedDate);
        }
        const response = await fetch(
          `${get_leave_requests}?${queryParams.toString()}`,
          {
            headers: { Authorization: `Token ${token}` },
          },
        );
        const data = await response.json();

        // Sort the data by submissionDate in descending order (latest first)
        const sortedData = data.leave_requests.sort((a, b) => {
          return new Date(b.submissionDate) - new Date(a.submissionDate);
        });

        setRequestData(sortedData); // Set fetched and sorted data
        setFilteredData(sortedData); // Initialize filtered data
        setLoading(false); // Set loading to false once data is fetched
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch leave requests:", error);
        setLoading(false); // Set loading to false if there’s an error
      }
    };
    fetchLeaveRequests(); // Call the function to fetch data
  }, [selectedDate]); // Re-fetch data when selectedDate changes

  // Handle "View" button click
  const handleViewClick = (view) => {
    navigate(`./view/${view}`);
  };

  // Function to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFD700"; // Yellow
      case "Accepted":
        return "#32CD32"; // Green
      case "Rejected":
        return "#FF0000"; // Red
      default:
        return "#333"; // Default color
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setSelectedStatus(value);
    if (value === "All") {
      setFilteredData(requestData); // Show all data
    } else {
      const filtered = requestData.filter((item) => item.status === value);
      setFilteredData(filtered); // Filter by status
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value); // Update selectedDate state
  };

  // Table headers
  const headers = [
    "ID",
    "Submission Date",
    "Status",
    "Leave Start Date",
    "Leave End Date",
    "View",
  ];

  // Render loading component if data is still being fetched
  if (loading) {
    return <LoadingComponent loadingMsg="Fetching Leave Requests..." />;
  }

  return (
    <div className="app-container">
      <Title
        order={2}
        style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
      >
        Leave Requests
      </Title>

      {/* Filter Section */}
      <div
        style={{
          margin: "20px 15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center", // Align items vertically in the center
        }}
      >
        {/* Left Side: Filters */}
        <div style={{ display: "flex", gap: "20px" }}>
          <TextInput
            label="Filter by Date"
            placeholder="Select or enter a date"
            type="date"
            value={selectedDate}
            onChange={handleDateFilterChange}
            style={{ maxWidth: "300px" }}
          />
          <Select
            label="Filter by Status"
            placeholder="Select a status"
            value={selectedStatus}
            onChange={handleStatusFilterChange}
            data={[
              { value: "All", label: "All" },
              { value: "Pending", label: "Pending" },
              { value: "Accepted", label: "Accepted" },
              { value: "Rejected", label: "Rejected" },
            ]}
          />
        </div>

        {/* Right Side: Showing Results */}
        <Title order={4} style={{ fontWeight: "400" }}>
          {selectedDate
            ? `Filtered results as of ${new Date(
                selectedDate,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`
            : `Filtered results as of ${new Date(
                Date.now() - 365 * 24 * 60 * 60 * 1000, // One year in milliseconds
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`}
        </Title>
      </div>

      {/* Display EmptyTable if no data is found */}
      {filteredData.length === 0 ? (
        <EmptyTable
          title="No Leave Requests Found"
          message="There are no leave requests available. Please check back later."
        />
      ) : (
        <div className="form-table-container">
          <table className="form-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  className="table-row"
                  key={index}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleViewClick(item.id)}
                >
                  <td>{item.id}</td>
                  <td>{item.submissionDate}</td>
                  <td>
                    <span
                      style={{
                        color: getStatusColor(item.status),
                        fontWeight: "bold",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{item.leaveStartDate}</td>
                  <td>{item.leaveEndDate}</td>
                  <td>
                    <span className="text-link">
                      <Eye size={20} />
                      View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LeaveRequests;
