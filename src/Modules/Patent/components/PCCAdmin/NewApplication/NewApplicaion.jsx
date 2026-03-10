import React, { useState, useEffect } from "react";
import { Box, Button, Table, Text, Loader, Alert, Group } from "@mantine/core";
import { Eye, ArrowsClockwise } from "@phosphor-icons/react";
import axios from "axios";
import ViewNewApplication from "./ViewNewApplication";
import { host } from "../../../../../routes/globalRoutes/index.jsx";

function NewApplication() {
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const columnNames = [
    "S.No.",
    "Application Number",
    "Token Number",
    "Patent Title",
    "Inventor 1",
    "Designation",
    "Department",
    "Date",
    "Actions",
  ];

  // Assign percent widths to each column (total 100%)
  const columnPercents = [
    "5%", // S.No.
    "12%", // Application Number
    "10%", // Token Number
    "22%", // Patent Title
    "11%", // Inventor 1
    "10%", // Designation
    "10%", // Department
    "10%", // Date
    "10%", // Actions
  ];

  const fetchApplications = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await axios.get(
        `${host}/patentsystem/pccAdmin/applications/new/`,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        },
      );
      const applicationsArray = Object.entries(response.data.applications).map(
        ([appId, appData]) => ({
          id: appId,
          token_no: appData.token_no || "Not Assigned",
          ...appData,
        }),
      );
      setApplications(applicationsArray);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to fetch applications. Please try again later.",
      );
    } finally {
      setLoading(false);
      if (showRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleViewClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
  };

  const handleBackClick = () => {
    setSelectedApplicationId(null);
  };

  const handleRefresh = () => {
    fetchApplications(true);
  };

  const renderApplicationsTable = () => {
    if (loading) {
      return (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <Loader size="lg" color="blue" />
          <Text mt={10}>Loading applications...</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert color="red" title="Error loading applications">
          {error}
        </Alert>
      );
    }

    if (applications.length === 0) {
      return (
        <Alert color="blue" title="No applications">
          There are no new applications to review at this time.
        </Alert>
      );
    }

    return (
      <Table
        striped
        highlightOnHover
        withBorder
        style={{
          width: "100%",
          tableLayout: "fixed", // force columns to squeeze
          fontSize: "14px",
        }}
      >
        <thead>
          <tr>
            {columnNames.map((col, idx) => (
              <th
                key={col}
                style={{
                  width: columnPercents[idx],
                  padding: "8px 6px",
                  fontWeight: 600,
                  color: "#333",
                  textAlign: "left",
                  background: "#f8f9fa",
                  borderBottom: "2px solid #dee2e6",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map((application, index) => (
            <tr
              key={application.id}
              style={{
                backgroundColor: index % 2 === 0 ? "#fff" : "#f6f6fb",
              }}
            >
              <td
                style={{
                  width: columnPercents[0],
                  padding: "8px 6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {index + 1}
              </td>
              <td
                style={{
                  width: columnPercents[1],
                  padding: "8px 6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {application.id}
              </td>
              <td
                style={{
                  width: columnPercents[2],
                  padding: "8px 6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {application.token_no || "Not Assigned"}
              </td>
              <td
                style={{
                  width: columnPercents[3],
                  padding: "8px 6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={application.title}
              >
                {application.title}
              </td>
              <td
                style={{
                  width: columnPercents[4],
                  padding: "8px 6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {application.submitted_by}
              </td>
              <td
                style={{
                  width: columnPercents[5],
                  padding: "8px 6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {application.designation}
              </td>
              <td
                style={{
                  width: columnPercents[6],
                  padding: "8px 6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {application.department}
              </td>
              <td
                style={{
                  width: columnPercents[7],
                  padding: "8px 6px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {application.submitted_on}
              </td>
              <td style={{ width: columnPercents[8], padding: "8px 6px" }}>
                <Group position="left" spacing="xs">
                  <Button
                    variant="outline"
                    color="blue"
                    size="sm"
                    onClick={() => handleViewClick(application.id)}
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Box
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {!selectedApplicationId ? (
        <>
          <Text
            style={{
              textAlign: "left",
              fontSize: "24px",
              fontWeight: 600,
              marginLeft: "50px",
            }}
          >
            New Applications
          </Text>
          <Text size="md" color="dimmed" style={{ textAlign: "left" }} />

          <Group position="left" mb="sm">
            <Button
              variant="subtle"
              color="blue"
              size="sm"
              onClick={handleRefresh}
              loading={isRefreshing}
              style={{ marginLeft: "50px" }}
              leftIcon={<ArrowsClockwise size={16} />}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </Group>

          <Box
            style={{
              maxWidth: "100%",
              padding: "12px 50px",
              backgroundColor: "transparent",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0px 5px 15px rgba(0, 0, 0, 0)",
            }}
          >
            {renderApplicationsTable()}
          </Box>
        </>
      ) : (
        <ViewNewApplication
          applicationId={selectedApplicationId}
          handleBackToList={handleBackClick}
        />
      )}
    </Box>
  );
}

export default NewApplication;
