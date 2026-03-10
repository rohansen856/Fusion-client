/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import {
  Card,
  Title,
  TextInput,
  FileInput,
  Button,
  Textarea,
  Box,
  Select,
  Grid,
  Autocomplete,
  Group,
} from "@mantine/core";
import { ArrowLeft, Upload } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { useSelector } from "react-redux";
import { Trash } from "phosphor-react";
import {
  createFileRoute,
  designationsRoute,
  getUsernameRoute,
} from "../../../routes/filetrackingRoutes";
import { host } from "../../../routes/globalRoutes";

// eslint-disable-next-line react/prop-types
export default function EditDraft({ file, onBack, deleteDraft }) {
  // Initialize state with data from the draft (file prop)

  const [receiver_designations, setReceiverDesignations] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [title, setTitle] = useState(file.file_extra_JSON.subject || "");
  // eslint-disable-next-line no-unused-vars
  const [description, setDescription] = useState(
    file.file_extra_JSON.description || "",
  );
  const [remarks, setRemarks] = useState(file.file_extra_JSON.remarks);
  const [attachedFile, setAttachedFile] = useState([]);
  const token = localStorage.getItem("authToken");
  const [receiver_username, setReceiverUsername] = useState("");
  const [receiver_designation, setReceiverDesignation] = useState("");
  let module = useSelector((state) => state.module.current_module);
  module = module.split(" ").join("").toLowerCase();
  const uploaderRole = useSelector((state) => state.user.role);
  // eslint-disable-next-line no-unused-vars
  const [designation, setDesignation] = useState(uploaderRole);
  const receiverRoles = Array.isArray(receiver_designations)
    ? receiver_designations.map((role) => ({
        value: role,
        label: role,
      }))
    : [];
  useEffect(() => {
    setAttachedFile(file.upload_file);
  }, [file]);
  const removeFile = () => {
    setAttachedFile(null);
  };
  const handleFileChange = (uploadedFile) => {
    setAttachedFile(uploadedFile); // only one file allowed here as it is already associated with one fileID.
  };
  useEffect(() => {
    let isMounted = true;
    const getUsernameSuggestion = async () => {
      try {
        const response = await axios.post(
          `${getUsernameRoute}`,
          { value: receiver_username },
          {
            headers: { Authorization: `Token ${token}` },
          },
        );
        const users = JSON.parse(response.data.users);
        // Ensure response.data.users is an array before mapping
        if (response.data && Array.isArray(users)) {
          const suggestedUsernames = users.map((user) => user.fields.username);
          if (isMounted) {
            setUsernameSuggestions(suggestedUsernames);
          }
        }
      } catch (error) {
        console.error("Error fetching username suggestion:", error);
      }
    };

    if (receiver_username) {
      getUsernameSuggestion();
    }

    return () => {
      isMounted = false; // Cleanup to prevent memory leaks
    };
  }, [receiver_username, token]);
  const files = [attachedFile];
  const handleCreateFile = async () => {
    try {
      const formData = new FormData();
      files.forEach((fileItem, index) => {
        const fileAttachment =
          fileItem instanceof File
            ? fileItem
            : new File([fileItem], `uploaded_file_${index}`, {
                type: "application/octet-stream",
              });
        formData.append("files", fileAttachment); // Append each file
      });
      formData.append("subject", title);
      formData.append("description", description);
      formData.append("designation", designation);
      formData.append("receiver_username", receiver_username);
      formData.append("receiver_designation", receiver_designation);
      formData.append("src_module", module);
      const response = await axios.post(`${createFileRoute}`, formData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (response.status === 201) {
        notifications.show({
          title: "File sent successfully",
          message: "The file has been sent successfully.",
          color: "green",
          position: "top-center",
        });
        deleteDraft(file.id);
        onBack();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchRoles = async () => {
    const response = await axios.get(
      `${designationsRoute}${receiver_username}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    console.log(response);
    setReceiverDesignations(response.data.designations);
  };
  useEffect(() => {
    if (receiver_username) {
      fetchRoles();
    }
  }, [receiver_username]);
  return (
    <Card
      // shadow="sm" padding="lg" radius="md" withBorder
      shadow="sm"
      padding="lg"
      radius="m"
      withBorder
      style={{
        backgroundColor: "#F5F7F8",
        // position: "absolute",
        height: "70vh",
        width: "90vw",
        overflowY: "auto",
      }}
    >
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <Button
          variant="subtle"
          onClick={onBack}
          style={{ marginRight: "1rem" }}
        >
          <ArrowLeft size={24} />
        </Button>
        <Title order={3} style={{ flexGrow: 1, textAlign: "center" }}>
          Edit Draft: {title}
        </Title>
      </Box>

      <TextInput
        label="Title"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        mb="sm"
      />
      <Textarea
        label="Description"
        placeholder="Enter your description here"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        mb="sm"
      />
      <FileInput
        label="Attach file (PDF, JPG, PNG) (MAX: 10MB)"
        accept="application/pdf,image/jpeg,image/png"
        icon={<Upload size={16} />}
        placeholder={attachedFile}
        value={attachedFile}
        onChange={handleFileChange}
        mb="sm"
        withAsterisk
      />
      {attachedFile && (
        <Group position="apart" mt="sm">
          <Button
            leftIcon={<Trash size={16} />}
            color="green"
            onClick={() => window.open(`${host}${attachedFile}`, "_blank")}
            compact
          >
            Download File
          </Button>
          <Button
            leftIcon={<Trash size={16} />}
            color="red"
            onClick={removeFile}
            compact
          >
            Remove File
          </Button>
        </Group>
      )}
      <Textarea
        label="Remark"
        placeholder="Enter remark"
        mb="sm"
        value={remarks}
        onChange={(e) => setRemarks(e.currentTarget.value)}
      />
      <Grid mb="sm" gutter="sm">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Autocomplete
            label="Send To"
            placeholder="Enter recipient"
            value={receiver_username}
            data={usernameSuggestions} // Pass the array of suggestions
            onChange={(value) => {
              setReceiverDesignation("");
              setReceiverUsername(value);
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label="Receiver Designation"
            placeholder="Select designation"
            onClick={() => {
              if (receiverRoles.length === 0) {
                fetchRoles();
              }
            }}
            value={receiver_designation} // Use receiver_designation (string)
            data={receiverRoles} // Ensure this is populated correctly
            onChange={(value) => setReceiverDesignation(value)}
            searchable // Allows searching for designations
            nothingFound="No designations found"
          />
        </Grid.Col>
      </Grid>
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "auto", // Push button to the bottom
        }}
      >
        <Button
          style={{
            width: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={handleCreateFile}
        >
          Send
        </Button>
      </Box>
    </Card>
  );
}
