import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  TextInput,
  Button,
  Container,
  Title,
  Divider,
  Paper,
  Notification,
  Group,
  Center,
  Grid,
  Badge,
  Checkbox,
  FileInput,
} from "@mantine/core";
import { IconCheck, IconX, IconPhoto, IconTrash } from "@tabler/icons-react";
import { host } from "../../../routes/globalRoutes";
import FacilityGallery from "./FacilityGallery"; // Import FacilityGallery

function GoBackButton({ setIsEditing }) {
  return (
    <Group position="left" mb="md">
      <Button
        variant="filled"
        color="indigo"
        onClick={() => setIsEditing(false)}
      >
        Go Back
      </Button>
    </Group>
  );
}

GoBackButton.propTypes = {
  setIsEditing: PropTypes.func.isRequired,
};

// eslint-disable-next-line react/prop-types
export default function EditFacilities({ setIsEditing, branch }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [labName, setLabName] = useState("");
  const [labCapacity, setLabCapacity] = useState("");
  const [labLocation, setLabLocation] = useState("");
  const [labLoading, setLabLoading] = useState(false);
  const [setLabErrorMessage] = useState("");
  const [labIsSuccess, setLabIsSuccess] = useState(false);

  const [labs, setLabs] = useState([]);
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [facilityName, setFacilityName] = useState("");
  const [facilityLocation, setFacilityLocation] = useState("");
  const [facilityPictureFile, setFacilityPictureFile] = useState(null);
  const [facilityLoading, setFacilityLoading] = useState(false);
  const scrollContainerRef = useRef(null); // Ref for scroll container

  useEffect(() => {
    const fetchLabs = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(`${host}/dep/api/labs/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setLabs(response.data.filter((lab) => lab.department === branch));
      } catch (error) {
        console.error("Error fetching labs:", error);
      }
    };
    fetchLabs();
  }, [branch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("authToken");

    const data = {
      phone_number: phoneNumber,
      email,
      department: branch === "DS" ? "Design" : branch,
    };

    try {
      const response = await axios.put(
        `${host}/dep/api/information/update-create/`,
        data,
        { headers: { Authorization: `Token ${token}` } },
      );
      console.log("Form Data Updated:", response.data);
      setIsSuccess(true);
      setPhoneNumber("");
      setEmail("");
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setErrorMessage(
        errorResponse.detail || "Error updating data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    setLabLoading(true);
    const token = localStorage.getItem("authToken");

    const labData = {
      name: labName,
      capacity: labCapacity,
      location: labLocation,
      department: branch,
    };

    try {
      const response = await axios.post(`${host}/dep/api/labsadd/`, labData, {
        headers: { Authorization: `Token ${token}` },
      });
      console.log("Lab Data Submitted:", response.data);
      setLabIsSuccess(true);
      setLabName("");
      setLabCapacity("");
      setLabLocation("");

      const responseLabs = await axios.get(`${host}/dep/api/labs/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setLabs(responseLabs.data.filter((lab) => lab.department === branch));
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setLabErrorMessage(
        errorResponse.detail || "Error adding lab. Please try again.",
      );
    } finally {
      setLabLoading(false);
    }
  };

  const handleLabSelection = (labId) => {
    setSelectedLabs((prev) =>
      prev.includes(labId)
        ? prev.filter((id) => id !== labId)
        : [...prev, labId],
    );
  };

  const handleDeleteLabs = async () => {
    if (selectedLabs.length === 0) {
      alert("No labs selected for deletion.");
      return;
    }

    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`${host}/dep/api/labs/delete/`, {
        headers: { Authorization: `Token ${token}` },
        data: { lab_ids: selectedLabs },
      });
      const responseLabs = await axios.get(`${host}/dep/api/labs/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setLabs(responseLabs.data.filter((lab) => lab.department === branch));
      setSelectedLabs([]);
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setErrorMessage(
        errorResponse.detail || "Error deleting labs. Please try again.",
      );
    }
  };

  const [facilityAmount, setFacilityAmount] = useState("");

  const handleFacilitySubmit = async (e) => {
    e.preventDefault();
    setFacilityLoading(true);
    const token = localStorage.getItem("authToken");

    const facilityData = new FormData();
    facilityData.append("name", facilityName);
    facilityData.append("branch", branch);
    facilityData.append("location", facilityLocation);
    facilityData.append("amount", facilityAmount);

    if (facilityPictureFile) {
      facilityData.append("picture", facilityPictureFile);
    }

    try {
      const response = await axios.post(
        `${host}/dep/api/facilities/`,
        facilityData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("Facility Data Submitted:", response.data);
      setFacilityName("");
      setFacilityLocation("");
      setFacilityPictureFile(null);
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setErrorMessage(
        errorResponse.detail || "Error adding facility. Please try again.",
      );
    } finally {
      setFacilityLoading(false);
    }
  };

  const handleFileChange = (file) => {
    setFacilityPictureFile(file);
  };

  return (
    <div>
      <GoBackButton setIsEditing={setIsEditing} />
      <Container size="xl">
        {errorMessage && (
          <Notification icon={<IconX size={18} />} color="red" mb="sm">
            {errorMessage}
          </Notification>
        )}
        <Divider my="xl" />
        <Grid gutter="md" mt="xl">
          <Grid.Col xs={12} md={5}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Title order={5} mb="sm">
                Update Department Contact
              </Title>
              <form onSubmit={handleSubmit}>
                <TextInput
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  mb="xs"
                />
                <TextInput
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  mb="xs"
                />
                <Button
                  type="submit"
                  loading={loading}
                  color="indigo"
                  mt="sm"
                  fullWidth
                >
                  Update
                </Button>
                {isSuccess && (
                  <Notification
                    icon={<IconCheck size={18} />}
                    color="green"
                    mt="sm"
                  >
                    Information updated successfully!
                  </Notification>
                )}
              </form>
            </Paper>
          </Grid.Col>

          <Grid.Col xs={12} md={5}>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Title order={5} mb="sm">
                Add Lab
              </Title>
              <form onSubmit={handleLabSubmit}>
                <TextInput
                  label="Lab Name"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  mb="xs"
                />
                <TextInput
                  label="Lab Capacity"
                  value={labCapacity}
                  onChange={(e) => setLabCapacity(e.target.value)}
                  mb="xs"
                />
                <TextInput
                  label="Lab Location"
                  value={labLocation}
                  onChange={(e) => setLabLocation(e.target.value)}
                  mb="xs"
                />
                <Button
                  type="submit"
                  loading={labLoading}
                  color="indigo"
                  fullWidth
                >
                  Add Lab
                </Button>
                {labIsSuccess && (
                  <Notification
                    icon={<IconCheck size={18} />}
                    color="green"
                    mt="sm"
                  >
                    Lab added successfully!
                  </Notification>
                )}
              </form>
            </Paper>
            <Paper withBorder shadow="sm" p="lg" radius="md">
              <Title order={4} mb="md">
                Add Facility
              </Title>
              <form onSubmit={handleFacilitySubmit}>
                <TextInput
                  label="Facility Name"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  mb="xs"
                />
                <TextInput
                  label="Facility Location"
                  value={facilityLocation}
                  onChange={(e) => setFacilityLocation(e.target.value)}
                  mb="xs"
                />
                <TextInput
                  label="amount"
                  value={facilityAmount}
                  onChange={(e) => setFacilityAmount(e.target.value)}
                  type="number"
                  min={0}
                  mb="xs"
                />
                <FileInput
                  label="Facility Picture"
                  placeholder="Choose a file"
                  value={facilityPictureFile}
                  onChange={handleFileChange}
                  accept="image/*"
                  mb="xs"
                  icon={<IconPhoto size={14} />}
                  withPreview
                  clearable
                />
                <Button
                  type="submit"
                  loading={facilityLoading}
                  color="indigo"
                  fullWidth
                >
                  Add Facility
                </Button>
              </form>
            </Paper>
          </Grid.Col>
        </Grid>
        <Divider my="xl" />
        <Title order={4} mb="md">
          Manage Labs
        </Title>
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            paddingBottom: "1rem",
            gap: "16px",
          }}
          ref={scrollContainerRef}
        >
          {labs.map((lab) => {
            const isSelected = selectedLabs.includes(lab.id);
            return (
              <Paper
                key={lab.id}
                withBorder
                shadow="xs"
                p="md"
                radius="md"
                style={{
                  width: "250px",
                  flexShrink: 0,
                  border: isSelected
                    ? "2px solid #4c6ef5"
                    : "1px solid #ced4da",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onClick={() => handleLabSelection(lab.id)}
              >
                <Group position="apart" mb="xs">
                  <Title order={6}>{lab.name}</Title>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleLabSelection(lab.id)}
                    color="indigo"
                  />
                </Group>
                <Badge color="gray" mb="xs">
                  Capacity: {lab.capacity}
                </Badge>
                <Badge color="gray">{lab.location}</Badge>
              </Paper>
            );
          })}
        </div>
        {selectedLabs.length > 0 && (
          <Center>
            <Button
              variant="filled"
              color="red"
              leftIcon={<IconTrash size={18} />}
              onClick={handleDeleteLabs}
              loading={loading}
              size="md"
              radius="md"
            >
              Delete Selected Labs
            </Button>
          </Center>
        )}
        {/* Add FacilityGallery below the labs section */}
        <Divider my="xl" />
        <Title order={4} mb="md">
          Manage Facilities
        </Title>
        <FacilityGallery branch={branch} /> {/* Pass branch prop here */}
      </Container>
    </div>
  );
}
