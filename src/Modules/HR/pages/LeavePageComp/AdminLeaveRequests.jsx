import React, { useState, useEffect } from "react";
import { Title, Select, TextInput, Alert, Divider } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { Eye } from "@phosphor-icons/react";
import LoadingComponent from "../../components/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import SearchEmployee from "../../components/SearchEmployee";
import HrBreadcrumbs from "../../components/HrBreadcrumbs";
import "./LeaveRequests.css";
import { admin_get_leave_requests } from "../../../../routes/hr";

function AdminLeaveRequests() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestData, setRequestData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchParams] = useSearchParams();
  const [accessError, setAccessError] = useState(null);
  const [autoSearchCompleted, setAutoSearchCompleted] = useState(false);

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Admin Leave Management", path: "/hr/admin_leave" },
    { title: "Leave Requests", path: "/hr/admin_leave/review_leave_requests" },
  ];

  // Check for emp query parameter on initial load
  useEffect(() => {
    const empUsername = searchParams.get("emp");
    if (empUsername && !autoSearchCompleted) {
      setAccessError(null); // Reset any previous errors
    }
  }, [searchParams, autoSearchCompleted]);

  // Fetch leave requests for the selected user
  useEffect(() => {
    if (!selectedUser) return;

    const fetchLeaveRequests = async () => {
      setLoading(true);
      setAccessError(null);
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
          `${admin_get_leave_requests}/${selectedUser.id}?${queryParams.toString()}`,
          {
            headers: { Authorization: `Token ${token}` },
          },
        );

        if (response.status === 403) {
          setAccessError(
            "You do not have access to this employee's leave requests",
          );
          setLoading(false);
          return;
        }

        const data = await response.json();

        const sortedData =
          data.leave_requests?.sort((a, b) => {
            return new Date(b.submissionDate) - new Date(a.submissionDate);
          }) || [];

        setRequestData(sortedData);
        setFilteredData(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch leave requests:", error);
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, [selectedUser, selectedDate]);

  const handleViewClick = (view) => {
    window.open(`../leave/view/${view}?admin=true`, "_blank");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFD700";
      case "Accepted":
        return "#32CD32";
      case "Rejected":
        return "#FF0000";
      default:
        return "#333";
    }
  };

  const handleStatusFilterChange = (value) => {
    setSelectedStatus(value);
    if (value === "All") {
      setFilteredData(requestData);
    } else {
      const filtered = requestData.filter((item) => item.status === value);
      setFilteredData(filtered);
    }
  };

  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSearchError = (error) => {
    if (error.includes("403") || error.includes("access")) {
      setAccessError("You do not have access to this page");
    } else {
      setAccessError(error);
    }
    setAutoSearchCompleted(true);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedUser(employee);
    setAccessError(null);
    setAutoSearchCompleted(true);
  };

  const headers = [
    "ID",
    "Submission Date",
    "Status",
    "Leave Start Date",
    "Leave End Date",
    "View",
  ];

  return (
    <div className="app-container">
      <HrBreadcrumbs items={exampleItems} />
      <Title
        order={2}
        style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
      >
        Admin Leave Requests
      </Title>

      {accessError && (
        <Alert title="Access Error" color="red" style={{ margin: "20px 15px" }}>
          {accessError}
        </Alert>
      )}

      <div
        style={{
          margin: "20px 15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center", // Align items vertically in the center
        }}
      >
        {/* Left Side: Search Component */}
        <SearchEmployee
          onEmployeeSelect={handleEmployeeSelect}
          initialSearch={searchParams.get("emp") || ""}
          onSearchError={handleSearchError}
          disabled={loading}
        />

        {/* Right Side: Selected Employee */}
        {selectedUser && !accessError && (
          <Title order={4} style={{ fontWeight: 400 }}>
            Selected Employee:{" "}
            <span style={{ fontWeight: 500, color: "#15a9fff1" }}>
              {selectedUser.username}
            </span>
          </Title>
        )}
      </div>
      <Divider my="sm" />

      {selectedUser && !accessError && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "20px 15px",
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
              style={{ maxWidth: "350px" }}
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
      )}

      {selectedUser &&
        !accessError &&
        (loading ? (
          <LoadingComponent loadingMsg="Fetching Leave Requests..." />
        ) : filteredData.length === 0 ? (
          <EmptyTable
            title="No Leave Requests Found"
            message="There are no leave requests available for the selected user."
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
        ))}
    </div>
  );
}

export default AdminLeaveRequests;
