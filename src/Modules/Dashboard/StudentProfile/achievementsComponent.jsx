import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Flex,
  Input,
  Divider,
  Text,
  Button,
  Select,
  Textarea,
  Table,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import {
  updateProfileDataRoute,
  deleteProfileDataRoute,
} from "../../../routes/dashboardRoutes";

function authHeaders() {
  return { Authorization: `Token ${localStorage.getItem("authToken")}` };
}

function extractError(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    if (Array.isArray(val)) return `${firstKey}: ${val[0]}`;
    if (typeof val === "string") return `${firstKey}: ${val}`;
  }
  return fallback;
}

function AchievementsComponent({ achievements }) {
  const [rows, setRows] = useState(achievements || []);
  const [deletingId, setDeletingId] = useState(null);
  const [achievement, setAchievement] = useState({
    achievement: "",
    achievement_type: "EDUCATIONAL",
    date_earned: "",
    issuer: "",
    description: "",
  });

  useEffect(() => {
    setRows(achievements || []);
  }, [achievements]);

  const handleChange = (field, value) => {
    setAchievement((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(
        updateProfileDataRoute,
        { achievementsubmit: achievement },
        { headers: authHeaders() },
      );
      if (res.data && res.data.id) {
        setRows((prev) => [...prev, res.data]);
      }
      notifications.show({
        message: "Achievement added successfully!",
        color: "green",
      });
      setAchievement({
        achievement: "",
        achievement_type: "EDUCATIONAL",
        date_earned: "",
        issuer: "",
        description: "",
      });
    } catch (error) {
      notifications.show({
        message: extractError(error, "Failed to add achievement."),
        color: "red",
      });
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    setDeletingId(row.id);
    try {
      await axios.delete(deleteProfileDataRoute(row.id), {
        headers: authHeaders(),
        data: { deleteach: true },
      });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notifications.show({
        message: "Achievement removed.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: extractError(error, "Failed to remove achievement."),
        color: "red",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Flex
      w={{ base: "100%", sm: "60%" }}
      p="md"
      h="auto"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      direction="column"
      justify="space-evenly"
    >
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Achievements
        </Text>
        <Divider my="md" />
        <Flex w="100%" direction="column">
          <Text fw={500} mb="md">
            Add a new achievement
          </Text>
          <Flex align="center" justify="space-between" mb="md">
            <Input.Wrapper label="Achievement name" w="65%">
              <Input
                size="md"
                mt="xs"
                value={achievement.achievement}
                onChange={(e) => handleChange("achievement", e.target.value)}
              />
            </Input.Wrapper>
            <Input.Wrapper label="Type" w="30%">
              <Select
                size="md"
                mt="xs"
                data={[
                  { value: "EDUCATIONAL", label: "Educational" },
                  { value: "OTHER", label: "Other" },
                ]}
                value={achievement.achievement_type}
                onChange={(value) => handleChange("achievement_type", value)}
              />
            </Input.Wrapper>
          </Flex>
          <Flex align="center" justify="space-between" mb="md">
            <Input.Wrapper label="Date" w={{ base: "45%", sm: "30%" }}>
              <Input
                type="date"
                size="md"
                mt="xs"
                value={achievement.date_earned}
                onChange={(e) => handleChange("date_earned", e.target.value)}
              />
            </Input.Wrapper>
            <Input.Wrapper label="Issuer" w={{ base: "50%", sm: "65%" }}>
              <Input
                size="md"
                mt="xs"
                value={achievement.issuer}
                onChange={(e) => handleChange("issuer", e.target.value)}
              />
            </Input.Wrapper>
          </Flex>
          <Flex
            align="center"
            gap={{ base: "md", sm: "lg" }}
            justify="space-between"
            direction={{ base: "column" }}
          >
            <Input.Wrapper label="Description" w={{ base: "100%" }}>
              <Textarea
                autosize
                minRows={5}
                resize="vertical"
                mt="xs"
                value={achievement.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Input.Wrapper>
            <Button
              size="md"
              style={{
                base: { alignSelf: "flex-center" },
                sm: { alignSelf: "flex-end" },
              }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Flex>
        </Flex>
        <Divider my="md" />
        <Text fw={500} mb="md">
          Your Achievements
        </Text>
        <Divider my="md" />
        {rows.length > 0 ? (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ textAlign: "center" }}>Name</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Type</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Date</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Issuer</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Description</Table.Th>
                <Table.Th style={{ textAlign: "center", width: 70 }}>
                  Action
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((ach, index) => (
                <Table.Tr key={ach.id ?? index}>
                  <Table.Td style={{ textAlign: "center" }}>
                    {ach.achievement}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {ach.achievement_type}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {ach.date_earned}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {ach.issuer}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {ach.description}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    <Tooltip label="Remove" withArrow>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        disabled={!ach.id}
                        loading={deletingId === ach.id}
                        onClick={() => handleDelete(ach)}
                        aria-label="Remove achievement"
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text>No achievements added yet.</Text>
        )}
      </Flex>
    </Flex>
  );
}

AchievementsComponent.propTypes = {
  achievements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      achievement: PropTypes.string,
      achievement_type: PropTypes.string,
      date_earned: PropTypes.string,
      issuer: PropTypes.string,
      description: PropTypes.string,
    }),
  ),
};

export default AchievementsComponent;
