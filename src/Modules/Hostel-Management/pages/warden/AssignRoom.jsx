import {
  Button,
  Grid,
  Stack,
  Box,
  Text,
  Group,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Container,
  Card,
  Divider,
} from "@mantine/core";
import {
  IconUpload,
  IconDownload,
  IconPlus,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import { useState } from "react";
import axios from "axios";
import {
  download_hostel_allotment,
  assign_roomsbywarden,
  update_student_allotment,
} from "../../../../routes/hostelManagementRoutes";

export default function AssignRoomsComponent() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentBatch, setCurrentBatch] = useState("");
  const [batchError, setBatchError] = useState("");
  const [alloting, setAlloting] = useState(false);

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFile = event.target.files[0];
      setCurrentFile(newFile);
      setCurrentBatch("");
      setBatchError("");
      setModalOpen(true);
      event.target.value = null;
    }
  };

  const handleBatchConfirm = () => {
    if (!currentBatch) {
      setBatchError("Please enter a batch year");
      return;
    }

    setFiles((currentFiles) => [
      ...currentFiles,
      { file: currentFile, batch: currentBatch },
    ]);

    console.log("Added file:", currentFile, "for batch:", currentBatch);
    setModalOpen(false);
    setCurrentFile(null);
    setCurrentBatch("");
  };

  const removeFile = (indexToRemove) => {
    setFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(download_hostel_allotment, {
        headers: { Authorization: `Token ${token}` },
      });

      if (
        !response ||
        !response.data.files ||
        response.data.files.length === 0
      ) {
        alert("No files available for download.");
        return;
      }

      response.data.files.forEach(async (fileUrl, index) => {
        try {
          const fileResponse = await axios.get(fileUrl, {
            responseType: "blob",
          });

          const blob = new Blob([fileResponse.data], {
            type: fileResponse.headers["content-type"],
          });
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `Hostel_Allotment_${index + 1}`);
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error(`Failed to download file ${index + 1}:`, err);
        }
      });
    } catch (error) {
      console.error("Error fetching file list:", error);
      alert("Failed to fetch files. Please try again.");
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) {
      alert("Please select at least one file to upload");
      return;
    }

    setUploading(true);
    const token = localStorage.getItem("authToken");
    const successfulUploads = [];
    const failedUploads = [];

    try {
      const uploadPromises = files.map(async (fileObj) => {
        const formData = new FormData();
        formData.append("file", fileObj.file);
        formData.append("selectedBatch", fileObj.batch);

        try {
          const response = await axios.post(assign_roomsbywarden, formData, {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.status === 200) {
            successfulUploads.push({
              fileName: fileObj.file.name,
              batch: fileObj.batch,
              message: response.data.message,
            });
          }
        } catch (error) {
          console.error(`Error uploading ${fileObj.file.name}:`, error);
          failedUploads.push({
            fileName: fileObj.file.name,
            batch: fileObj.batch,
            error: error.response?.data?.error || "Unknown error occurred",
          });
        }
      });

      await Promise.all(uploadPromises);

      setUploading(false);
      setFiles([]);

      if (successfulUploads.length > 0 && failedUploads.length === 0) {
        alert(`All ${successfulUploads.length} files uploaded successfully!`);
      } else if (successfulUploads.length > 0 && failedUploads.length > 0) {
        alert(
          `${successfulUploads.length} files uploaded successfully. ${failedUploads.length} files failed to upload. Check console for details.`,
        );
      } else {
        alert("Failed to upload any files. Please check console for details.");
      }
    } catch (error) {
      console.error("Error in upload process:", error);
      setUploading(false);
      alert("An error occurred during the upload process. Please try again.");
    }

    try {
      setAlloting(true);
      await axios.get(update_student_allotment, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setAlloting(false);
    } catch (error) {
      console.error("Error in updating process:", error);
      setAlloting(false);
      alert("An error occurred during the updating process. Please try again.");
    }
  };

  const refreshAllotment = async () => {
    setAlloting(true);
    const token = localStorage.getItem("authToken");
    try {
      await axios.get(update_student_allotment, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
    } catch (error) {
      console.error("Error in updating process:", error);
      alert("An error occurred during the updating process. Please try again.");
    } finally {
      setAlloting(false);
    }
  };

  const getFileTypeInfo = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    if (["xls", "xlsx", "csv"].includes(extension)) {
      return { color: "teal", label: "Excel" };
    }
    if (["pdf"].includes(extension)) {
      return { color: "red", label: "PDF" };
    }
    if (["doc", "docx"].includes(extension)) {
      return { color: "blue", label: "Word" };
    }
    if (["ppt", "pptx"].includes(extension)) {
      return { color: "orange", label: "PowerPoint" };
    }
    if (["txt"].includes(extension)) {
      return { color: "gray", label: "Text" };
    }

    return { color: "dark", label: extension.toUpperCase() };
  };

  return (
    <Container size="xl" px="xs">
      <Group position="apart" mb="lg">
        <Button
          variant="light"
          size="sm"
          leftIcon={<IconRefresh size={16} />}
          onClick={refreshAllotment}
          loading={alloting}
          color="teal"
        >
          Refresh Allotment
        </Button>
      </Group>

      <Divider mb="lg" />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="apart">
                <Group>
                  <IconUpload size={20} stroke={1.5} color="#228be6" />
                  <Text weight={500}>Upload Allocation Data</Text>
                </Group>
                <input
                  type="file"
                  id="batchSheet"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                />
                <Button
                  component="label"
                  htmlFor="batchSheet"
                  variant="subtle"
                  size="xs"
                  leftIcon={<IconPlus size={14} />}
                  color="blue"
                >
                  Add File
                </Button>
              </Group>
            </Card.Section>

            {files.length > 0 ? (
              <Box py="md">
                <Text size="sm" color="dimmed" mb="sm">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </Text>
                <Box sx={{ height: "180px", overflowY: "auto" }}>
                  <Stack spacing="xs">
                    {files.map((fileObj, index) => {
                      const fileTypeInfo = getFileTypeInfo(fileObj.file.name);
                      return (
                        <Group
                          key={index}
                          position="apart"
                          p="xs"
                          sx={(theme) => ({
                            backgroundColor:
                              theme.colorScheme === "dark"
                                ? theme.colors.dark[8]
                                : theme.colors.gray[0],
                            borderRadius: theme.radius.sm,
                          })}
                        >
                          <Group spacing="xs">
                            <Badge
                              color={fileTypeInfo.color}
                              size="sm"
                              variant="outline"
                            >
                              {fileTypeInfo.label}
                            </Badge>
                            <Text
                              size="sm"
                              style={{
                                maxWidth: "120px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fileObj.file.name}
                            </Text>
                            <Badge color="blue" size="sm">
                              {fileObj.batch}
                            </Badge>
                          </Group>
                          <ActionIcon
                            color="red"
                            size="sm"
                            variant="subtle"
                            onClick={() => removeFile(index)}
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        </Group>
                      );
                    })}
                  </Stack>
                </Box>
                <Box mt="md">
                  <Button
                    fullWidth
                    variant="filled"
                    color="blue"
                    size="sm"
                    onClick={uploadAllFiles}
                    loading={uploading}
                  >
                    Upload Files
                  </Button>
                </Box>
              </Box>
            ) : (
              <Stack align="center" spacing="md" py={50}>
                <IconUpload size={40} stroke={1} color="#ADB5BD" />
                <Text color="dimmed" size="sm" align="center">
                  Drag files here or click the Add File button above
                </Text>
              </Stack>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group>
                <IconDownload size={20} stroke={1.5} color="#228be6" />
                <Text weight={500}>Download Templates</Text>
              </Group>
            </Card.Section>

            <Stack align="center" spacing="lg" py={50}>
              <IconDownload size={40} stroke={1} color="#ADB5BD" />
              <Text align="center" size="sm" color="dimmed" px="lg">
                Download the template files for batch allocation
              </Text>
              <Button
                variant="outline"
                color="blue"
                leftIcon={<IconDownload size={16} />}
                onClick={handleDownload}
              >
                Download Templates
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Select Batch Year"
        centered
        size="sm"
        styles={(theme) => ({
          title: {
            fontWeight: 600,
            color: theme.colors.blue[7],
          },
        })}
      >
        <Stack spacing="md">
          {currentFile && (
            <Group spacing="xs">
              <Text size="sm" weight={500}>
                Selected file:
              </Text>
              <Text size="sm" color="dimmed">
                {currentFile.name}
              </Text>
            </Group>
          )}

          <TextInput
            label="Batch Year"
            placeholder="e.g., 2023"
            value={currentBatch}
            onChange={(event) => {
              setCurrentBatch(event.currentTarget.value);
              setBatchError("");
            }}
            required
            error={batchError}
          />

          <Group position="right" mt="md" spacing="sm">
            <Button
              variant="subtle"
              onClick={() => setModalOpen(false)}
              color="gray"
            >
              Cancel
            </Button>
            <Button onClick={handleBatchConfirm} color="blue">
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
