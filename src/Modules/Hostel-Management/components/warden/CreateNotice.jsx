import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Add this import for prop validation
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Paper,
  Notification,
  Select,
} from "@mantine/core";
import axios from "axios";
import { createNotice } from "../../../../routes/hostelManagementRoutes";

axios.defaults.withXSRFToken = true;

function CreateNotice({ existingAnnouncement }) {
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    opened: false,
    message: "",
    color: "",
  });

  const resetForm = () => {
    // Move resetForm above its first usage
    setHeadline("");
    setContent("");
    setDescription("");
    setScope("");
  };

  useEffect(() => {
    if (existingAnnouncement) {
      setHeadline(existingAnnouncement.headline);
      setContent(existingAnnouncement.content);
      setDescription(existingAnnouncement.description);
      setScope(existingAnnouncement.scope);
    } else {
      resetForm();
    }
  }, [existingAnnouncement]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!token) {
      setNotification({
        opened: true,
        message: "Authentication token not found. Please login again.",
        color: "red",
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const announcement = { headline, content, description, scope };
      const response = await axios.post(createNotice, announcement, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 201) {
        setNotification({
          opened: true,
          message: "Announcement submitted successfully!",
          color: "green",
        });
        resetForm();
        window.location.reload();
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
          "Submission failed. Please try again.",
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
      <Stack spacing="lg">
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label={
                <Text component="label" size="lg" fw={500}>
                  Headline:
                </Text>
              }
              value={headline}
              onChange={(e) => setHeadline(e.currentTarget.value)}
              required
              styles={{ root: { marginTop: 5 } }}
            />

            <Textarea
              label={
                <Text component="label" size="lg" fw={500}>
                  Content:
                </Text>
              }
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              required
              styles={{ root: { marginTop: 5 } }}
            />

            <Textarea
              label={
                <Text component="label" size="lg" fw={500}>
                  Description:
                </Text>
              }
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              required
              styles={{ root: { marginTop: 5 } }}
            />

            <Select
              label={
                <Text component="label" size="lg" fw={500}>
                  Announcement Scope:
                </Text>
              }
              placeholder="Select scope"
              value={scope}
              onChange={setScope}
              data={[
                { value: "global", label: "Global" },
                { value: "local", label: "Local" },
              ]}
              required
              styles={{ root: { marginTop: 5 } }}
            />

            <Group position="right" spacing="sm" mt="xl">
              <Button type="button" variant="outline" onClick={resetForm}>
                Clear
              </Button>
              <Button type="submit" variant="filled" loading={loading}>
                {existingAnnouncement ? "Update" : "Submit"}
              </Button>
            </Group>
          </Stack>
        </form>

        {notification.opened && (
          <Notification
            title="Notification"
            color={notification.color}
            onClose={() => setNotification({ ...notification, opened: false })}
            style={{ marginTop: "10px" }}
          >
            {notification.message}
          </Notification>
        )}
      </Stack>
    </Paper>
  );
}

CreateNotice.propTypes = {
  existingAnnouncement: PropTypes.shape({
    hall: PropTypes.string,
    headline: PropTypes.string,
    content: PropTypes.string,
    description: PropTypes.string,
    scope: PropTypes.string,
  }), // Define prop types for existingAnnouncement
};

export default CreateNotice;
