import { useState } from "react";
import PropTypes from "prop-types";
import {
  Text,
  Button,
  Input,
  Flex,
  Divider,
  NumberInput,
  Table,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import {
  updateProfileDataRoute,
  deleteProfileDataRoute,
} from "../../../routes/dashboardRoutes";

function normalizeSkills(list) {
  return (list || []).map((item) => ({
    id: item.id,
    skill_name: item.skill_id?.skill ?? item.skill_name ?? "",
    skill_rating: item.skill_rating ?? 0,
  }));
}

function extractErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.skill) return Array.isArray(data.skill) ? data.skill[0] : data.skill;
  if (data.detail) return data.detail;
  if (data.skill_id?.skill) {
    const s = data.skill_id.skill;
    return Array.isArray(s) ? s[0] : s;
  }
  if (data.skill_rating) {
    return Array.isArray(data.skill_rating)
      ? data.skill_rating[0]
      : data.skill_rating;
  }
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    if (Array.isArray(val)) return `${firstKey}: ${val[0]}`;
    if (typeof val === "string") return `${firstKey}: ${val}`;
  }
  return fallback;
}

function SkillsTechComponent({ data }) {
  const [skills, setSkills] = useState(normalizeSkills(data));
  const [newSkill, setNewSkill] = useState("");
  const [rating, setRating] = useState(80);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getToken = () => localStorage.getItem("authToken");

  const addSkill = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed) {
      notifications.show({
        title: "Error",
        message: "Skill name cannot be empty!",
        color: "red",
      });
      return;
    }
    if (trimmed.length > 30) {
      notifications.show({
        title: "Error",
        message: "Skill name must be at most 30 characters.",
        color: "red",
      });
      return;
    }
    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 0 || numericRating > 100) {
      notifications.show({
        title: "Error",
        message: "Rating must be between 0 and 100.",
        color: "red",
      });
      return;
    }

    setAdding(true);
    try {
      const payload = {
        skillsubmit: {
          skill_id: { skill: trimmed },
          skill_rating: numericRating,
        },
      };
      const response = await axios.put(updateProfileDataRoute, payload, {
        headers: { Authorization: `Token ${getToken()}` },
      });
      const created = response.data || {};
      const newEntry = {
        id: created.id,
        skill_name: created.skill_id?.skill ?? trimmed,
        skill_rating: created.skill_rating ?? numericRating,
      };
      setSkills((prev) => [...prev, newEntry]);
      setNewSkill("");
      setRating(80);
      notifications.show({
        title: "Success",
        message: "Skill added successfully!",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: extractErrorMessage(
          error,
          "Failed to update skills. Please try again.",
        ),
        color: "red",
      });
    } finally {
      setAdding(false);
    }
  };

  const removeSkill = async (skill) => {
    if (!skill?.id) {
      notifications.show({
        title: "Error",
        message:
          "This skill cannot be removed automatically. Please refresh the page and try again.",
        color: "red",
      });
      return;
    }
    setDeletingId(skill.id);
    try {
      await axios.delete(deleteProfileDataRoute(skill.id), {
        headers: { Authorization: `Token ${getToken()}` },
        data: { deleteskill: true },
      });
      setSkills((prev) => prev.filter((s) => s.id !== skill.id));
      notifications.show({
        title: "Removed",
        message: `Skill "${skill.skill_name}" has been removed.`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: extractErrorMessage(error, "Failed to remove skill."),
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
      {/* Add Skill Section */}
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Skills & Technologies
        </Text>
        <Divider my="md" />
        <Flex w="100%" direction="column">
          <Text fw={500} mb="lg">
            Add New Skill/Technology
          </Text>
          <Flex
            align="flex-end"
            justify="space-between"
            direction={{ base: "column", sm: "row" }}
            gap="sm"
          >
            <Input.Wrapper
              label="Skill/Technology"
              w={{ base: "100%", sm: "50%" }}
            >
              <Input
                size="md"
                mt="xs"
                maxLength={30}
                value={newSkill}
                placeholder="e.g. React, Python"
                onChange={(e) => setNewSkill(e.target.value)}
              />
            </Input.Wrapper>
            <Input.Wrapper
              label="Rating (0-100)"
              w={{ base: "100%", sm: "30%" }}
            >
              <NumberInput
                mt="xs"
                min={0}
                max={100}
                clampBehavior="strict"
                value={rating}
                onChange={setRating}
              />
            </Input.Wrapper>
            <Button onClick={addSkill} loading={adding}>
              Add
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Display Skills Section */}
      <Flex
        w="100%"
        p="md"
        mt="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Your Skills
        </Text>
        <Divider my="md" />
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Skill</Table.Th>
              <Table.Th style={{ width: 120 }}>Rating</Table.Th>
              <Table.Th style={{ width: 80 }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <Table.Tr key={skill.id ?? `${skill.skill_name}-${index}`}>
                  <Table.Td>{skill.skill_name || "—"}</Table.Td>
                  <Table.Td>{skill.skill_rating}</Table.Td>
                  <Table.Td>
                    <Tooltip label="Remove skill" withArrow>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        loading={deletingId === skill.id}
                        disabled={!skill.id}
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill.skill_name}`}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={3} align="center">
                  No skills added yet
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Flex>
    </Flex>
  );
}

SkillsTechComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      skill_rating: PropTypes.number,
      skill_id: PropTypes.shape({
        id: PropTypes.number,
        skill: PropTypes.string,
      }),
      skill_name: PropTypes.string,
    }),
  ),
};

export default SkillsTechComponent;
