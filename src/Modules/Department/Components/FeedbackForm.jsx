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

export default function Feedbackform() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("Good");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFeedbackChange = (e) => setFeedback(e.target.value);
  const handleRatingChange = (value) => setRating(value);
  const handleDepartmentChange = (value) => setSelectedDepartment(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const token = localStorage.getItem("authToken");
    const url = `${host}/dep/api/feedback/create/`;

    const feedbackData = {
      department: selectedDepartment,
      rating,
      remark: feedback,
    };

    try {
      const response = await axios.post(url, feedbackData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Feedback submitted:", response.data);
      setFeedback("");
      setRating("Poor");
      setSelectedDepartment("");
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setErrorMessage(
        errorResponse.detail || "Error submitting feedback. Please try again.",
      );
      console.error("Error submitting feedback:", errorResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Title order={2} mb="md">
          Department Feedback
        </Title>

        {errorMessage && (
          <Notification color="red" title="Error" mb="md">
            {errorMessage}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Textarea
              value={feedback}
              onChange={handleFeedbackChange}
              placeholder="Enter your feedback here..."
              label="Remark"
              required
              autosize
              minRows={3}
            />

            <Select
              label="Rating"
              value={rating}
              onChange={handleRatingChange}
              data={["Poor", "Good", "Excellent"]}
              required
            />

            <Select
              label="Select Department"
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              data={[
                { value: "CSE", label: "CSE" },
                { value: "ECE", label: "ECE" },
                { value: "ME", label: "ME" },
                { value: "SM", label: "SM" },
                { value: "BDES", label: "BDES" },
                { value: "LA", label: "Liberal Arts" },
                { value: "Natural Science", label: "Natural Science" },
              ]}
              required
            />

            <Button type="submit" fullWidth loading={loading} size="md">
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
