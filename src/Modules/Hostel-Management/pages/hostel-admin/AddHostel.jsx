import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Notification,
  Paper,
} from "@mantine/core";
import axios from "axios";
import { addHostelRoute } from "../../../../routes/hostelManagementRoutes"; // Adjust the import path as per your file structure

function AddHostel() {
  const [hallId, setHallId] = useState("");
  const [hallName, setHallName] = useState("");
  const [maxAccommodation, setMaxAccommodation] = useState("");
  const [assignedBatch, setAssignedBatch] = useState("");
  const [typeOfSeater, setTypeOfSeater] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    opened: false,
    message: "",
    color: "",
  });

  const resetForm = () => {
    setHallId("");
    setHallName("");
    setMaxAccommodation("");
    setAssignedBatch("");
    setTypeOfSeater("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!token) {
      setNotification({
        opened: true,
        message: "Authentication token not found. Please login again.",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        hall_id: hallId,
        hall_name: hallName,
        max_accomodation: maxAccommodation,
        assigned_batch: assignedBatch,
        type_of_seater: typeOfSeater,
      };

      const response = await axios.post(addHostelRoute, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 201) {
        setNotification({
          opened: true,
          message: "Hostel added successfully!",
          color: "green",
        });
        resetForm();
      } else {
        setNotification({
          opened: true,
          message: "Submission failed. Please try again.",
          color: "red",
        });
      }
    } catch (error) {
      setNotification({
        opened: true,
        message:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      shadow="md"
      p="md"
      withBorder
      sx={(theme) => ({
        width: "100%",
        maxWidth: 500,
        margin: "auto",
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          <TextInput
            label="Hall ID"
            value={hallId}
            onChange={(e) => setHallId(e.target.value)}
            required
            placeholder="Enter Hall ID"
          />

          <TextInput
            label="Hall Name"
            value={hallName}
            onChange={(e) => setHallName(e.target.value)}
            required
            placeholder="Enter Hall Name"
          />

          <NumberInput
            label="Max Accommodation"
            value={maxAccommodation}
            onChange={(value) => setMaxAccommodation(value)}
            required
            placeholder="Enter Max Accommodation"
          />

          <TextInput
            label="Assigned Batch"
            value={assignedBatch}
            onChange={(e) => setAssignedBatch(e.target.value)}
            required
            placeholder="Enter Assigned Batch"
          />

          <Select
            label="Type of Seater"
            placeholder="Select type"
            value={typeOfSeater}
            onChange={setTypeOfSeater}
            data={[
              { value: "single", label: "Single Seater" },
              { value: "double", label: "Double Seater" },
              { value: "triple", label: "Triple Seater" },
            ]}
            required
          />

          <Group position="right" spacing="sm" mt="md">
            <Button variant="outline" onClick={resetForm}>
              Clear
            </Button>
            <Button type="submit" loading={loading}>
              Submit
            </Button>
          </Group>

          {notification.opened && (
            <Notification
              color={notification.color}
              onClose={() =>
                setNotification({ ...notification, opened: false })
              }
            >
              {notification.message}
            </Notification>
          )}
        </Stack>
      </form>
    </Paper>
  );
}

export default AddHostel;
