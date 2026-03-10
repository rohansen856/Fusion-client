import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Button,
  Paper,
  Text,
  Container,
  Loader,
  Box,
  Grid,
  Card,
  Title,
  Group,
  Badge,
  Divider,
  Center,
} from "@mantine/core";
import { IconMapPin, IconUsers, IconBuilding } from "@tabler/icons-react";

import FacilitiesDescriptive from "./FacilitiesDescriptive.jsx";
import EditFacilities from "./EditFacilities.jsx";
import { host } from "../../../routes/globalRoutes/index.jsx";

function Facilities({ branch }) {
  const [isEditing, setIsEditing] = useState(false);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = useSelector((state) => state.user.role);

  useEffect(() => {
    const fetchLabs = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(`${host}/dep/api/labs/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setLabs(response.data);
      } catch (error) {
        console.error("Error fetching labs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  const filteredLabs = labs.filter((lab) => lab.department === branch);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const isEditButtonVisible = () => {
    const allowedRoles = ["HOD", "admin"];
    const rolePrefix = role.split(" ")[0];

    switch (branch) {
      case "CSE":
        return allowedRoles.includes(rolePrefix) && role.includes("(CSE)");
      case "ECE":
        return allowedRoles.includes(rolePrefix) && role.includes("(ECE)");
      case "SM":
        return allowedRoles.includes(rolePrefix) && role.includes("(SM)");
      case "ME":
        return allowedRoles.includes(rolePrefix) && role.includes("(ME)");
      case "DS":
        return allowedRoles.includes(rolePrefix) && role.includes("(Design)");
      case "Natural Science":
        return allowedRoles.includes(rolePrefix) && role.includes("(NS)");
      default:
        return false;
    }
  };

  return (
    <Container size="lg" p="md">
      {isEditing ? (
        <EditFacilities branch={branch} setIsEditing={setIsEditing} />
      ) : (
        <Box>
          <FacilitiesDescriptive branch={branch} />
          <Title order={3} mt="md" mb="md" color="blue.7">
            Department Labs
          </Title>

          <Paper shadow="sm" p="xl" radius="lg" withBorder>
            {loading ? (
              <Center>
                <Loader size="lg" />
              </Center>
            ) : filteredLabs.length === 0 ? (
              <Text align="center" color="dimmed" size="lg">
                No labs available for this department.
              </Text>
            ) : (
              <Grid gutter="xl">
                {filteredLabs.map((lab) => (
                  <Grid.Col key={lab.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card shadow="md" padding="xl" radius="md" withBorder>
                      <Group mb="md" align="center" spacing="sm">
                        <IconBuilding size={28} />
                        <Text size="lg" weight={600}>
                          {lab.name}
                        </Text>
                      </Group>

                      <Divider my="md" />

                      <Group position="apart" mb="sm">
                        <Group spacing="xs">
                          <IconUsers size={20} />
                          <Text size="md" weight={500}>
                            Capacity:
                          </Text>
                        </Group>
                        <Badge color="blue" variant="light" size="lg">
                          {lab.capacity}
                        </Badge>
                      </Group>

                      <Group position="apart">
                        <Group spacing="xs">
                          <IconMapPin size={20} />
                          <Text size="md" weight={500}>
                            Location:
                          </Text>
                        </Group>
                        <Badge color="teal" variant="light" size="lg">
                          {lab.location}
                        </Badge>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Paper>

          {isEditButtonVisible() && (
            <Box
              mt="xl"
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                onClick={handleEditClick}
                variant="filled"
                color="blue"
                radius="md"
                size="md"
              >
                Edit
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}

Facilities.propTypes = {
  branch: PropTypes.string.isRequired,
};

export default Facilities;
