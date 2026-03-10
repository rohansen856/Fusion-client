import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Card,
  Container,
  Title,
  Checkbox,
  Badge,
  Button,
  Notification,
  LoadingOverlay,
  Stack,
  Image,
  Center,
  Space,
  Group,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { host } from "../../../routes/globalRoutes";

function FacilityGallery({ branch }) {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(`${host}/dep/api/facilities/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setFacilities(
          response.data.filter((facility) => facility.branch === branch),
        );
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setErrorMessage("Error fetching facilities. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, [branch]);

  const handleFacilitySelection = (facilityId) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId],
    );
  };

  const handleDeleteFacilities = async () => {
    if (selectedFacilities.length === 0) {
      alert("No facilities selected for deletion.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`${host}/dep/api/facilities/delete/`, {
        headers: { Authorization: `Token ${token}` },
        data: { facility_ids: selectedFacilities },
      });
      const responseFacilities = await axios.get(
        `${host}/dep/api/facilities/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      setFacilities(
        responseFacilities.data.filter(
          (facility) => facility.branch === branch,
        ),
      );
      setSelectedFacilities([]);
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setErrorMessage(
        errorResponse.detail || "Error deleting facilities. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" py="md" pos="relative">
      {errorMessage && (
        <Notification color="red" mb="sm">
          {errorMessage}
        </Notification>
      )}

      <LoadingOverlay visible={loading} overlayBlur={2} />

      <div
        style={{ overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 8 }}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          {facilities.map((facility) => {
            const isSelected = selectedFacilities.includes(facility.id);
            return (
              <Card
                key={facility.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  minWidth: 280,
                  border: isSelected ? "2px solid #4c6ef5" : undefined,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onClick={() => handleFacilitySelection(facility.id)}
              >
                <Stack spacing="xs">
                  <Group position="apart">
                    <Title order={6}>{facility.name}</Title>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleFacilitySelection(facility.id)}
                      color="indigo"
                    />
                  </Group>

                  {facility.location && (
                    <Badge color="gray">Location: {facility.location}</Badge>
                  )}
                  {facility.amount && (
                    <Badge color="blue">Amount: {facility.amount}</Badge>
                  )}

                  {facility.picture && (
                    <Image
                      src={`http://127.0.0.1:8000${facility.picture}`}
                      alt={facility.name}
                      fit="contain"
                      style={{
                        maxHeight: 200,
                        objectFit: "contain",
                        backgroundColor: "#f1f3f5",
                        borderRadius: 4,
                      }}
                      withPlaceholder
                    />
                  )}
                </Stack>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedFacilities.length > 0 && (
        <>
          <Space h="xl" />
          <Center>
            <Button
              variant="filled"
              color="red"
              leftIcon={<IconTrash size={18} />}
              onClick={handleDeleteFacilities}
              loading={loading}
              size="md"
              radius="md"
            >
              Delete Selected Facilities
            </Button>
          </Center>
        </>
      )}
    </Container>
  );
}

FacilityGallery.propTypes = {
  branch: PropTypes.string.isRequired,
};

export default FacilityGallery;
