import { useState } from "react";
import PropTypes from "prop-types";
import { Table, Text, Button, Flex, Divider, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { updateProfileDataRoute } from "../../../routes/dashboardRoutes";

// Keep in sync with backend `applications.placement_cell.validators`.
const PHONE_REGEX = /^[6-9]\d{9}$/;
const normalizePhone = (raw) => {
  if (!raw) return "";
  let cleaned = String(raw).replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+91")) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith("0") && cleaned.length === 11) cleaned = cleaned.slice(1);
  return cleaned;
};
const validatePhone = (raw) => {
  const cleaned = normalizePhone(raw);
  if (!cleaned) return "Phone number is required.";
  if (!/^\d+$/.test(cleaned)) return "Only digits (optional +91) are allowed.";
  if (cleaned.length !== 10)
    return `Phone number must be exactly 10 digits (got ${cleaned.length}).`;
  if (!PHONE_REGEX.test(cleaned))
    return "Phone number must start with 6, 7, 8 or 9.";
  return null;
};
const validateDob = (value) => {
  if (!value) return null;
  const m = String(value).match(/^\d{4}-\d{2}-\d{2}$/);
  if (!m) return "Date of birth must be in YYYY-MM-DD format.";
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return "Invalid date.";
  const today = new Date();
  if (dob > today) return "Date of birth cannot be in the future.";
  const age = (today - dob) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 10) return "User must be at least 10 years old.";
  if (age > 100) return "Age cannot exceed 100 years.";
  return null;
};
const validateAbout = (v) =>
  v && v.length > 1000 ? "About me must be 1000 characters or fewer." : null;
const validateAddress = (v) =>
  v && v.length > 500 ? "Address must be 500 characters or fewer." : null;

function ProfileComponent({ data, isEditable }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    about: data.profile?.about_me || "N/A",
    dob: data.profile?.date_of_birth || "Jan 01, 2004",
    address: data.profile?.address || "XYZ",
    contactNumber: data.profile?.phone_no || "+91 99999 99999",
    mailId: data.current[0]?.user.email || "abc@gmail.com",
  });
  const [errors, setErrors] = useState({});

  const runAllValidations = (d) => ({
    contactNumber: validatePhone(d.contactNumber),
    dob: validateDob(d.dob),
    about: validateAbout(d.about),
    address: validateAddress(d.address),
  });

  const handleEditClick = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return console.error("No authentication token found!");
    if (isEditing) {
      const errs = runAllValidations(profileData);
      const hasError = Object.values(errs).some(Boolean);
      setErrors(errs);
      if (hasError) {
        notifications.show({
          title: "Validation error",
          message:
            Object.values(errs).find(Boolean) || "Please fix the highlighted fields.",
          color: "red",
        });
        return;
      }

      try {
        const payload = {
          profilesubmit: {
            about_me: profileData.about,
            date_of_birth: profileData.dob,
            address: profileData.address,
            phone_no: normalizePhone(profileData.contactNumber),
          },
        };

        const response = await axios.put(updateProfileDataRoute, payload, {
          headers: { Authorization: `Token ${token}` },
        });

        if (response.status === 200) {
          notifications.show({
            message: "Profile updated successfully!",
            color: "green",
          });
          setErrors({});
        } else {
          notifications.show({
            message: "Failed to update profile",
            color: "red",
          });
          return;
        }
      } catch (error) {
        const backendErrs = error?.response?.data || {};
        const firstMsg =
          (Array.isArray(backendErrs.phone_no) && backendErrs.phone_no[0]) ||
          (Array.isArray(backendErrs.date_of_birth) && backendErrs.date_of_birth[0]) ||
          backendErrs.detail ||
          "Error updating profile";
        notifications.show({ message: firstMsg, color: "red" });
        if (backendErrs.phone_no)
          setErrors((e) => ({ ...e, contactNumber: backendErrs.phone_no[0] }));
        if (backendErrs.date_of_birth)
          setErrors((e) => ({ ...e, dob: backendErrs.date_of_birth[0] }));
        return;
      }
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field, value) => {
    setProfileData((prev) => {
      const next = { ...prev, [field]: value };
      let fieldError = null;
      if (field === "contactNumber") fieldError = validatePhone(value);
      else if (field === "dob") fieldError = validateDob(value);
      else if (field === "about") fieldError = validateAbout(value);
      else if (field === "address") fieldError = validateAddress(value);
      setErrors((e) => ({ ...e, [field]: fieldError }));
      return next;
    });
  };

  return (
    <Flex
      w={{ base: "100%", sm: "60%" }}
      p="md"
      gap="md"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      direction="column"
      justify="space-evenly"
    >
      {/* About Me Section */}
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          About Me
        </Text>
        <Divider my="sm" />
        <Flex w="100%" justify="space-between" align="center">
          {isEditing ? (
            <TextInput
              value={profileData.about}
              onChange={(e) => handleChange("about", e.target.value)}
              error={errors.about}
              w="80%"
              maxLength={1000}
            />
          ) : (
            <Text>{profileData.about}</Text>
          )}
          {isEditable && (
            <Button
              onClick={handleEditClick}
              color={isEditing ? "green" : "red"}
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Details Section */}
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Details
        </Text>
        <Divider my="sm" />
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td fw={500}>Date of Birth</Table.Td>
              <Table.Td>
                {isEditing ? (
                  <TextInput
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    error={errors.dob}
                    placeholder="YYYY-MM-DD"
                  />
                ) : (
                  profileData.dob
                )}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>Address</Table.Td>
              <Table.Td>
                {isEditing ? (
                  <TextInput
                    value={profileData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    error={errors.address}
                    maxLength={500}
                  />
                ) : (
                  profileData.address
                )}
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Flex>

      {/* Contact Details Section */}
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Contact Details
        </Text>
        <Divider my="sm" />
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td fw={500}>Contact Number</Table.Td>
              <Table.Td>
                {isEditing ? (
                  <TextInput
                    value={profileData.contactNumber}
                    onChange={(e) =>
                      handleChange("contactNumber", e.target.value)
                    }
                    error={errors.contactNumber}
                    placeholder="10-digit mobile (starting 6-9, optional +91)"
                    maxLength={16}
                    inputMode="tel"
                  />
                ) : (
                  profileData.contactNumber
                )}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>Mail ID</Table.Td>
              <Table.Td>{profileData.mailId}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Flex>
    </Flex>
  );
}

ProfileComponent.propTypes = {
  data: PropTypes.shape({
    profile: PropTypes.shape({
      about_me: PropTypes.string,
      date_of_birth: PropTypes.string,
      address: PropTypes.string,
      phone_no: PropTypes.number,
    }),
    current: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.shape({
          email: PropTypes.string,
        }),
      }),
    ),
  }),
  isEditable: PropTypes.bool.isRequired, // Added this line
};
export default ProfileComponent;
