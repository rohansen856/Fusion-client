import React, { useState } from "react";
import axios from "axios";
import {
  Textarea,
  Select,
  Button,
  Notification,
  Title,
  Paper,
  Stack,
  Container,
} from "@mantine/core";
import { host } from "../../../routes/globalRoutes";

export default function MakeAnnouncement() {
  const [programme, setProgramme] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setIsSuccess(false);

    // Validate fields
    if (!programme || !batch || !department || !announcement) {
      setErrorMessage("All fields are required.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("Authentication token is missing.");
      setLoading(false);
      return;
    }

    const url = `${host}/dep/api/announcements/`;

    const formData = new FormData();
    formData.append("programme", programme);
    formData.append("batch", batch);
    formData.append("department", department);
    formData.append("message", announcement);

    try {
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 201) {
        setIsSuccess(true);
        setTimeout(() => {
          setProgramme("");
          setBatch("");
          setDepartment("");
          setAnnouncement("");
        }, 2000);
      }
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setErrorMessage(
        errorResponse.detail ||
          "Error creating Announcement. Please try again.",
      );
      console.error("Error creating Announcement:", errorResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} mb="md">
          Make an Announcement
        </Title>

        {errorMessage && (
          <Notification color="red" title="Error" mb="md">
            {errorMessage}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            {/* Programme Select */}
            <Select
              label="Programme"
              placeholder="Select Programme Type"
              value={programme}
              onChange={setProgramme}
              data={["M.Tech", "B.Tech", "PhD", "Other"]}
              required
            />

            {/* Batch Select */}
            <Select
              label="Batch"
              placeholder="Select Batch"
              value={batch}
              onChange={setBatch}
              data={["All", "Year-1", "Year-2", "Year-3", "Year-4"]}
              required
            />

            {/* Department Select */}
            <Select
              label="Department"
              placeholder="Select Department"
              value={department}
              onChange={setDepartment}
              data={[
                "ALL",
                "CSE",
                "ECE",
                "ME",
                "SM",
                "Natural Science",
                "Design",
              ]}
              required
            />

            {/* Announcement Textarea */}
            <Textarea
              label="Announcement Details"
              placeholder="What is the Announcement?"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              required
              autosize
              minRows={3}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="md"
              style={{
                backgroundColor: isSuccess ? "#2BB673" : undefined,
                color: isSuccess ? "black" : "white",
              }}
            >
              {loading ? "Submitting..." : isSuccess ? "Submitted" : "Submit"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
