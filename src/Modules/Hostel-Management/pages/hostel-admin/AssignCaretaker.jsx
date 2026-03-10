import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Select,
  Text,
  Button,
  Stack,
  Notification,
  Tabs,
  Card,
  Divider,
  Group,
} from "@mantine/core";

import {
  getCaretakers,
  assignCaretakers,
  getWardens,
  assignWarden,
} from "../../../../routes/hostelManagementRoutes";

import AddHostel from "./AddHostel";

axios.defaults.withXSRFToken = true;

export default function AssignPersonnel() {
  const [activeTab, setActiveTab] = useState("caretaker");

  // Caretaker states
  const [hallsForCaretaker, setHallsForCaretaker] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [selectedHallForCaretaker, setSelectedHallForCaretaker] =
    useState(null);
  const [selectedCaretaker, setSelectedCaretaker] = useState(null);

  // Warden states
  const [hallsForWarden, setHallsForWarden] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [selectedHallForWarden, setSelectedHallForWarden] = useState(null);
  const [selectedWarden, setSelectedWarden] = useState(null);

  // Shared states
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    opened: false,
    message: "",
    color: "",
  });

  const showNotification = (message, color) => {
    setNotification({
      opened: true,
      message,
      color,
    });
  };

  const fetchCaretakerData = () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      showNotification(
        "Authentication token not found. Please login again.",
        "red",
      );
      return;
    }

    axios
      .get(getCaretakers, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((response) => {
        const { halls, caretaker_usernames } = response.data;
        setHallsForCaretaker(
          halls.map((hallData) => ({
            value: hallData.hall_id,
            label: hallData.hall_name,
          })),
        );
        setCaretakers(
          caretaker_usernames.map((user) => ({
            value: user.id_id,
            label: user.id_id,
          })),
        );
      })
      .catch((error) => {
        console.error("Error fetching caretaker data", error);
        showNotification(
          "Failed to fetch caretaker data. Please try again.",
          "red",
        );
      });
  };

  // Load caretaker data
  useEffect(() => {
    if (activeTab === "caretaker") {
      fetchCaretakerData();
    }
  }, [activeTab]);

  const fetchWardenData = () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      showNotification(
        "Authentication token not found. Please login again.",
        "red",
      );
      return;
    }

    axios
      .get(getWardens, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((response) => {
        const { halls, warden_usernames } = response.data;
        setHallsForWarden(
          halls.map((hallData) => ({
            value: hallData.hall_id,
            label: hallData.hall_name,
          })),
        );
        setWardens(
          warden_usernames.map((user) => ({
            value: user.id_id,
            label: user.id_id,
          })),
        );
      })
      .catch((error) => {
        console.error("Error fetching warden data", error);
        showNotification(
          "Failed to fetch warden data. Please try again.",
          "red",
        );
      });
  };

  // Load warden data
  useEffect(() => {
    if (activeTab === "warden") {
      fetchWardenData();
    }
  }, [activeTab]);

  const handleAssignCaretaker = () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      showNotification(
        "Authentication token not found. Please login again.",
        "red",
      );
      return;
    }

    if (!selectedHallForCaretaker || !selectedCaretaker) {
      showNotification("Please select both a hall and a caretaker.", "red");
      return;
    }

    setLoading(true);

    axios
      .post(
        assignCaretakers,
        {
          hall_id: selectedHallForCaretaker,
          caretaker_username: selectedCaretaker,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      )
      .then(() => {
        showNotification("Caretaker assigned successfully!", "green");
        setSelectedHallForCaretaker(null);
        setSelectedCaretaker(null);
      })
      .catch((error) => {
        console.error("Error assigning caretaker", error);
        showNotification(
          "Failed to assign caretaker. Please try again.",
          "red",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAssignWarden = () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      showNotification(
        "Authentication token not found. Please login again.",
        "red",
      );
      return;
    }

    if (!selectedHallForWarden || !selectedWarden) {
      showNotification("Please select both a hall and a warden.", "red");
      return;
    }

    setLoading(true);

    axios
      .post(
        assignWarden,
        {
          hall_id: selectedHallForWarden,
          warden_username: selectedWarden,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      )
      .then(() => {
        showNotification("Warden assigned successfully!", "green");
        setSelectedHallForWarden(null);
        setSelectedWarden(null);
      })
      .catch((error) => {
        console.error("Error assigning warden", error);
        showNotification("Failed to assign warden. Please try again.", "red");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box p="md" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Card shadow="xs" radius="md" p="md" withBorder>
        <Tabs value={activeTab} onChange={setActiveTab} mb="md">
          <Tabs.List>
            <Tabs.Tab value="caretaker" style={{ fontSize: "0.95rem" }}>
              Assign Caretaker
            </Tabs.Tab>
            <Tabs.Tab value="warden" style={{ fontSize: "0.95rem" }}>
              Assign Warden
            </Tabs.Tab>
            <Tabs.Tab value="addHostel" style={{ fontSize: "0.95rem" }}>
              Add Hostel
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Divider mb="md" />

        {activeTab === "caretaker" && (
          <Stack spacing="sm">
            <Box mb="xs">
              <Text component="label" size="sm" fw={500}>
                Select Hall:
              </Text>
              <Select
                placeholder="Choose a hall"
                data={hallsForCaretaker}
                value={selectedHallForCaretaker}
                onChange={setSelectedHallForCaretaker}
                w="100%"
                size="sm"
                styles={{ root: { marginTop: 4 } }}
              />
            </Box>

            <Box mb="md">
              <Text component="label" size="sm" fw={500}>
                Select Caretaker:
              </Text>
              <Select
                placeholder="Choose a caretaker"
                data={caretakers}
                value={selectedCaretaker}
                onChange={setSelectedCaretaker}
                w="100%"
                size="sm"
                styles={{ root: { marginTop: 4 } }}
              />
            </Box>

            <Group position="right">
              <Button
                variant="filled"
                onClick={handleAssignCaretaker}
                loading={loading}
                size="sm"
              >
                Assign Caretaker
              </Button>
            </Group>
          </Stack>
        )}

        {activeTab === "warden" && (
          <Stack spacing="sm">
            <Box mb="xs">
              <Text component="label" size="sm" fw={500}>
                Select Hall:
              </Text>
              <Select
                placeholder="Choose a hall"
                data={hallsForWarden}
                value={selectedHallForWarden}
                onChange={setSelectedHallForWarden}
                w="100%"
                size="sm"
                styles={{ root: { marginTop: 4 } }}
              />
            </Box>

            <Box mb="md">
              <Text component="label" size="sm" fw={500}>
                Select Warden:
              </Text>
              <Select
                placeholder="Choose a warden"
                data={wardens}
                value={selectedWarden}
                onChange={setSelectedWarden}
                w="100%"
                size="sm"
                styles={{ root: { marginTop: 4 } }}
              />
            </Box>

            <Group position="right">
              <Button
                variant="filled"
                onClick={handleAssignWarden}
                loading={loading}
                size="sm"
              >
                Assign Warden
              </Button>
            </Group>
          </Stack>
        )}

        {activeTab === "addHostel" && <AddHostel />}
      </Card>

      {notification.opened && (
        <Notification
          color={notification.color}
          onClose={() => setNotification({ ...notification, opened: false })}
          mt="md"
          withCloseButton
        >
          {notification.message}
        </Notification>
      )}
    </Box>
  );
}
