import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
import {
  Paper,
  Button,
  Group,
  Text,
  Stack,
  ScrollArea,
  Loader,
} from "@mantine/core";
import axios from "axios";
import ComplaintCard from "../../components/students/ComplaintCard"; // Adjust import path if necessary
import { fetch_complaint } from "../../../../routes/hostelManagementRoutes"; // Adjust this import path as needed

export default function Complaints() {
  const [activeComplaints, setActiveComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken"); // Get the auth token from local storage

  // Fetch complaints for the logged-in user
  const fetchActiveComplaints = async () => {
    console.log("Starting to fetch complaints...");

    if (!token) {
      console.error("Authentication token not found.");
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Making API request to:", fetch_complaint);

      // Make the GET request to the backend, where the backend automatically filters by roll_number
      const response = await axios.get(fetch_complaint, {
        headers: { Authorization: `Token ${token}` }, // Send token in the request header
      });

      console.log("API response received:", response);

      if (response.data && response.data.complaints) {
        console.log("Complaints found:", response.data.complaints);
        setActiveComplaints(response.data.complaints);
      } else {
        console.warn("No complaints found in the response.");
        setError("No complaints found for this user.");
      }
    } catch (err) {
      console.error("Error fetching active complaints:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch complaints. Please try again later.",
      );
    } finally {
      console.log("Finished fetching complaints.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveComplaints(); // Fetch complaints on component mount
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <Paper
      shadow="md"
      p="md"
      withBorder
      sx={(theme) => ({
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      <Group position="apart" style={{ width: "100%" }} mb="xl">
        <Text
          align="left"
          size="24px"
          style={{ color: "#757575", fontWeight: "bold" }}
        >
          Register Complaints
        </Text>
        <Button
          size="xl"
          onClick={() => console.log("Redirect to complaint form")}
        >
          Make Complaint
        </Button>
      </Group>

      <ScrollArea style={{ flex: 1 }}>
        {loading ? (
          <>
            <Loader size="md" />
            {console.log("Loading complaints...")}
          </>
        ) : error ? (
          <>
            <Text color="red" align="center">
              {error}
            </Text>
            {console.log("Error occurred:", error)}
          </>
        ) : (
          <Stack spacing="md">
            <Text weight={500} size="xl" color="dimmed">
              Active Complaints
            </Text>
            {console.log("Rendering complaints:", activeComplaints)}
            {activeComplaints.length > 0 ? (
              activeComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  hall_name={complaint.hall_name}
                  roll_number={complaint.roll_number}
                  student_name={complaint.student_name}
                  description={complaint.description}
                  contact_number={complaint.contact_number}
                />
              ))
            ) : (
              <>
                <Text color="dimmed" align="center">
                  No active complaints found.
                </Text>
                {console.log("No complaints to render.")}
              </>
            )}
          </Stack>
        )}
      </ScrollArea>
    </Paper>
  );
}
