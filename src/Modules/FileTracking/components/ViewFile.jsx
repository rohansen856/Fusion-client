import { useState, useEffect } from "react";
import {
  Card,
  Textarea,
  Button,
  Title,
  Group,
  FileInput,
  Select,
  Box,
  Divider,
  Grid,
  Autocomplete,
  Modal,
  Text,
  Flex,
  Paper,
  Timeline,
  Badge,
  ScrollArea,
  ActionIcon,
  Collapse,
  Avatar,
  Tooltip,
  Skeleton,
  useMantineTheme,
  SegmentedControl,
  Table,
  Center,
} from "@mantine/core";
import PropTypes from "prop-types";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import {
  ArrowLeft,
  DownloadSimple,
  PaperPlaneTilt,
  Trash,
  Upload,
  CalendarBlank,
  User,
  UserCircle,
  CaretDown,
  CaretUp,
  File as FileIcon,
  Info,
  ArrowsClockwise,
  ChatCircleText,
  ChatCenteredText,
  ClockCounterClockwise,
  Table as TableIcon,
  ListBullets,
} from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { useMediaQuery } from "@mantine/hooks";
import { InfoCircle } from "tabler-icons-react";
import {
  createFileRoute,
  designationsRoute,
  forwardFileRoute,
  getUsernameRoute,
  historyRoute,
} from "../../../routes/filetrackingRoutes";
import { host } from "../../../routes/globalRoutes";

export default function ViewFile({
  onBack,
  fileID,
  updateFiles,
  isArchived = false,
}) {
  // State management
  const [activeSection, setActiveSection] = useState(null);
  const [file, setFile] = useState({});
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [receiver_username, setReceiverUsername] = useState("");
  const [receiver_designation, setReceiverDesignation] = useState("");
  const [receiver_designations, setReceiverDesignations] = useState("");
  const [current_receiver, setCurrentReceiver] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [files, setFiles] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState("");
  const token = localStorage.getItem("authToken");
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedForwardFile, setSelectedForwardFile] = useState(null);
  const [fileContent, setFileContent] = useState([]);
  const [remarksOpened, setRemarksOpened] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [descOpened, setDescOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  // New state for view type
  const [viewType, setViewType] = useState("table");

  // Theme and responsive design
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  // eslint-disable-next-line no-unused-vars
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const downloadAttachment = (url) => {
    window.open(`${host}${url}`, "_blank");
  };

  const previewRemarks = fileContent
    .slice(0, 3)
    .map((line) => `• ${line}`)
    .join("\n");
  const allRemarks = fileContent.map((line) => `• ${line}`).join("\n");

  // Generate file ID from file object
  const generateFileId = (fileObj) => {
    if (!fileObj || !fileObj.upload_date) return "Loading...";
    return `${fileObj.branch}-${new Date(fileObj.upload_date).getFullYear()}-${(
      new Date(fileObj.upload_date).getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-#${fileObj.id}`;
  };

  const openForwardModal = (x) => {
    setSelectedForwardFile(x);
    setShowForwardModal(true);
  };

  const receiverRoles = Array.isArray(receiver_designations)
    ? receiver_designations.map((role) => ({
        value: role,
        label: role,
      }))
    : [];

  useEffect(() => {
    setReceiverDesignation("");
    setReceiverDesignations("");
  }, [receiver_username]);

  const currentUser = useSelector((state) => state.user.roll_no);
  const userDesignation = useSelector((state) => state.user.role);

  // Helper function to format dates
  const convertDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const removeFile = () => {
    setFiles(null);
  };

  const handleOpenRemarksModal = (x) => {
    setSelectedRemarks(x);
    setOpened(true);
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch file first
        const fileResponse = await axios.get(`${createFileRoute}${fileID}`, {
          withCredentials: true,
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setFile(fileResponse.data);
        setSelectedForwardFile(fileResponse.data);

        // Fetch history after file is fetched
        const historyResponse = await axios.get(`${historyRoute}${fileID}`, {
          withCredentials: true,
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const trackingData = historyResponse.data;
        const contentArray = trackingData.map(
          (track) =>
            `On ${convertDate(track?.forward_date)}: ${track?.current_id}[${track?.sender_designation}] added remarks: ${track?.remarks}`,
        );

        trackingData[0].upload_file = fileResponse.data.upload_file;
        setTrackingHistory(trackingData);
        setCurrentReceiver(
          trackingData[trackingData.length - 1]?.receiver_id ?? null,
        );
        setFileContent(contentArray);
      } catch (err) {
        console.error("Error fetching data:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load file data. Please try again.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileID, token]);

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

  // Fetch designations when a user is selected
  const fetchRoles = async () => {
    if (!receiver_username || receiver_username === "") return "";
    try {
      const response = await axios.get(
        `${designationsRoute}${receiver_username}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      setReceiverDesignations(response.data.designations);
    } catch (err) {
      if (err.response && err.response.status === 500) {
        console.warn("Retrying fetchRoles in 2 seconds...");
      }
    }
  };

  // Toggle sections (forward/delete/etc)
  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleFileChange = (data) => {
    setFiles(data);
  };

  // Handle file forwarding
  const handleForward = async () => {
    if (!receiver_username || !receiver_designation) {
      notifications.show({
        title: "Missing information",
        message: "Please select both receiver and designation",
        color: "red",
        position: "top-center",
      });
      return;
    }

    setIsForwarding(true);
    try {
      const formData = new FormData();
      if (files && files.length > 0) {
        files.forEach((fileItem, index) => {
          const fileAttachment =
            fileItem instanceof File
              ? fileItem
              : new File([fileItem], `uploaded_file_${index}`, {
                  type: "application/octet-stream",
                });
          formData.append("files", fileAttachment); // Append each file
        });
      }
      formData.append("receiver", receiver_username);
      formData.append("receiver_designation", receiver_designation);
      formData.append("remarks", remarks);
      const response = await axios.post(
        `${forwardFileRoute}${fileID}/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      if (response.status === 201) {
        notifications.show({
          title: "File forwarded successfully",
          message: "The file has been forwarded successfully.",
          color: "green",
          position: "top-center",
        });
        setIsForwarding(false);
        setActiveSection(null);
        setReceiverDesignation("");
        setReceiverUsername("");
        setRemarks("");
        setFiles(null);
      }
    } catch (err) {
      console.error("Error forwarding file:", err);
      notifications.show({
        title: "Error",
        message: "Failed to forward file. Please try again.",
        color: "red",
        position: "top-center",
      });
      setIsForwarding(false);
    }
  };

  const confirmForward = () => {
    if (selectedForwardFile) {
      handleForward();
      setShowForwardModal(false);
      setSelectedForwardFile(null);
      toggleSection(null);
      updateFiles();
      onBack();
    }
  };

  // Render timeline view for all device sizes
  const renderTimelineView = () => {
    const bulletSize = isMobile ? 24 : 28;
    const lineWidth = isMobile ? 2 : 3;

    return (
      <ScrollArea
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          fontSize: "12px",
          minWidth: "700px",
        }}
      >
        <Timeline
          active={trackingHistory.length - 1}
          bulletSize={bulletSize}
          lineWidth={lineWidth}
          sx={{
            padding: isMobile ? "0.5rem" : "1rem",
            "& .mantine-Timeline-item": {
              marginBottom: isMobile ? "1rem" : "1.5rem",
            },
          }}
        >
          {trackingHistory.map((track, index) => (
            <Timeline.Item
              key={index}
              bullet={
                <Avatar
                  radius="xl"
                  size={bulletSize}
                  color={index === trackingHistory.length - 1 ? "blue" : "gray"}
                >
                  <ArrowsClockwise size={bulletSize / 2} />
                </Avatar>
              }
              title={
                <Group spacing="xs" noWrap align="center">
                  <Text weight={600} size={isMobile ? "sm" : "md"}>
                    {track.current_id}
                  </Text>
                  <Badge
                    size={isMobile ? "sm" : "md"}
                    color="blue"
                    variant="light"
                  >
                    {track.sender_designation}
                  </Badge>
                </Group>
              }
            >
              <Text
                color="dimmed"
                size={isMobile ? "xs" : "sm"}
                mb={isMobile ? 5 : 8}
              >
                {convertDate(track.forward_date)}
              </Text>

              <Paper
                p="xs"
                withBorder
                mb={10}
                style={{ background: "#f8f9fa" }}
              >
                <Group mb={5}>
                  <Text weight={500} size={isMobile ? "xs" : "sm"}>
                    To:
                  </Text>
                  <Text size={isMobile ? "xs" : "sm"}>
                    <Text span weight={500}>
                      {track.receiver_id}
                    </Text>{" "}
                    [{track.receive_design}]
                  </Text>
                </Group>

                {track.remarks && (
                  <Box mt={8}>
                    <Text weight={500} size={isMobile ? "xs" : "sm"} mb={5}>
                      Remarks:
                    </Text>
                    <Paper
                      p="xs"
                      withBorder
                      style={{
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        borderLeft: "3px solid #228be6",
                      }}
                      onClick={() => handleOpenRemarksModal(track.remarks)}
                    >
                      <Text size={isMobile ? "xs" : "sm"} lineClamp={2}>
                        {track.remarks}
                      </Text>
                      {track.remarks.length > 100 && (
                        <Text size="xs" color="blue" mt={3}>
                          Click to read more
                        </Text>
                      )}
                    </Paper>
                  </Box>
                )}
              </Paper>

              {track.upload_file && (
                <Button
                  variant="light"
                  size={isMobile ? "xs" : "sm"}
                  leftIcon={<DownloadSimple size={isMobile ? 14 : 16} />}
                  onClick={() => downloadAttachment(track.upload_file)}
                  fullWidth={isMobile}
                  style={{ maxWidth: isMobile ? "100%" : "200px" }}
                >
                  Download Attachment
                </Button>
              )}
            </Timeline.Item>
          ))}
        </Timeline>
      </ScrollArea>
    );
  };

  // Render tabular view (only for desktop)
  const renderTabularView = () => {
    return (
      <ScrollArea>
        <Table
          highlightOnHover
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "12px",
            minWidth: "700px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#0000" }}>
              <th
                style={{
                  padding: "8px",
                  width: "9%",
                  border: "1px solid #ddd",
                  textAlign: "center",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "8px",
                  width: "13%",
                  border: "1px solid #ddd",
                  textAlign: "center",
                }}
              >
                Sender
              </th>
              <th
                style={{
                  padding: "8px",
                  width: "13%",
                  border: "1px solid #ddd",
                  textAlign: "center",
                }}
              >
                Receiver
              </th>
              <th
                style={{
                  padding: "8px",
                  width: "20%",
                  border: "1px solid #ddd",
                  textAlign: "center",
                }}
              >
                Remarks
              </th>
              <th
                style={{
                  padding: "8px",
                  width: "10%",
                  border: "1px solid #ddd",
                  textAlign: "center",
                }}
              >
                Attachment
              </th>
            </tr>
          </thead>
          <tbody>
            {trackingHistory.map((track, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                    wordWrap: "break-word",
                  }}
                >
                  {convertDate(track.forward_date)}
                </td>
                <td
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                    wordWrap: "break-word",
                  }}
                >
                  {track.current_id}[{track.sender_designation}]
                </td>
                <td
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                    wordWrap: "break-word",
                  }}
                >
                  {track.receiver_id}[{track.receive_design}]
                </td>
                <td
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                    wordWrap: "break-word",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOpenRemarksModal(track.remarks || "-")}
                >
                  {track.remarks && track.remarks.length > 15
                    ? `${track.remarks.slice(0, 15)}...`
                    : track.remarks || "-"}
                </td>
                <td
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                  }}
                >
                  {track.upload_file ? (
                    <Button
                      variant="subtle"
                      size="xs"
                      leftIcon={<DownloadSimple size={16} />}
                      onClick={() => downloadAttachment(track.upload_file)}
                      style={{
                        display: "inline-block",
                        padding: "5px 10px",
                        fontSize: "10px",
                      }}
                    >
                      Download
                    </Button>
                  ) : (
                    "No file found"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    );
  };

  // Determine if forward button should be shown
  // Hide if file is archived OR current user is not the latest receiver
  const shouldShowForwardButton =
    !isArchived && current_receiver === currentUser;

  return (
    <Card
      shadow="sm"
      padding={isMobile ? "md" : "lg"}
      radius="md"
      withBorder
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "10vh",
        padding: isMobile ? "1rem" : "2rem",
      }}
    >
      {/* File Details: ViewFile */}
      <div>
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            backgroundColor: "#FFFFFF",
            padding: "10px 0",
            borderBottom: "1px solid #E0E6ED",
          }}
        >
          <Flex align="center" justify="center" mb="lg">
            <div style={{ position: "absolute", left: 0 }}>
              <Tooltip label="Go back" position="right">
                <Button variant="subtle" onClick={onBack} radius="xl">
                  <ArrowLeft size={20} />
                </Button>
              </Tooltip>
            </div>
            <Title
              order={3}
              style={{
                fontSize: isMobile ? "20px" : "26px",
                textAlign: "center",
              }}
            >
              {loading ? (
                <Skeleton height={30} width="80%" radius="xl" />
              ) : (
                generateFileId(file)
              )}
            </Title>
          </Flex>
        </div>

        <Divider mb="lg" />

        {/* File Summary Card */}
        <Paper
          p="md"
          shadow="xs"
          radius="md"
          withBorder
          style={{
            marginBottom: "1.5rem",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Flex justify="space-between" align="center" mb="xs" wrap="nowrap">
            {/* Left section: File icon + subject + ID */}
            <Group spacing="xs" noWrap>
              <Avatar color="blue" radius="xl">
                <FileIcon size={20} />
              </Avatar>
              <Box>
                <Text weight={700} size={isMobile ? "md" : "lg"}>
                  {loading ? (
                    <Skeleton height={20} width={150} />
                  ) : (
                    file.subject
                  )}
                </Text>
                <Text size="sm" color="dimmed">
                  {loading ? (
                    <Skeleton height={16} width={100} />
                  ) : (
                    generateFileId(file)
                  )}
                </Text>
              </Box>
            </Group>

            {/* Right section: Status badge */}
            {!loading && (
              <Badge
                color={
                  isArchived
                    ? "orange"
                    : current_receiver === currentUser
                      ? "green"
                      : "blue"
                }
                size="lg"
                variant="filled"
                radius="sm"
              >
                {isArchived
                  ? "Archived"
                  : current_receiver === currentUser
                    ? "Awaiting Your Action"
                    : "In Progress"}
              </Badge>
            )}
          </Flex>

          <Grid mt="md" gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Group spacing="xs" align="center" noWrap>
                <CalendarBlank size={18} />
                <Text weight={500}>Upload Date:</Text>
                {loading ? (
                  <Skeleton height={16} width={120} />
                ) : (
                  <Text>
                    {file?.upload_date
                      ? convertDate(file.upload_date)
                      : "Not available"}
                  </Text>
                )}
              </Group>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Group spacing="xs" align="center" noWrap>
                <UserCircle size={18} />
                <Text weight={500}>Created By:</Text>
                {loading ? (
                  <Skeleton height={16} width={120} />
                ) : (
                  <Text>
                    {`${file?.uploader || ""} [${file?.uploader_designation || ""}]` ||
                      "Not available"}
                  </Text>
                )}
              </Group>
            </Grid.Col>
          </Grid>

          <Divider my="md" />
          <Box>
            <Group position="apart" mb="xs">
              <Text weight={500} size="sm">
                <InfoCircle
                  size={16}
                  style={{ marginRight: "5px", verticalAlign: "text-bottom" }}
                />
                Description
              </Text>
              <Tooltip label="View full description">
                <ActionIcon
                  onClick={() => setDescOpened(true)}
                  size="sm"
                  radius="xl"
                  variant="light"
                  color="blue"
                >
                  <Info size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {loading ? (
              <>
                <Skeleton height={12} width="90%" radius="xl" mb={8} />
                <Skeleton height={12} width="85%" radius="xl" mb={8} />
                <Skeleton height={12} width="80%" radius="xl" />
              </>
            ) : (
              <Paper
                p="xs"
                withBorder
                style={{ backgroundColor: "#fff", cursor: "pointer" }}
                onClick={() => setDescOpened(true)}
              >
                <Text
                  size="sm"
                  style={{ whiteSpace: "pre-wrap" }}
                  lineClamp={3}
                >
                  {file.description}
                </Text>
                {file.description.length > 300 && (
                  <Text
                    size="xs"
                    c="blue"
                    mt={5}
                    onClick={() => setDescOpened(true)}
                  >
                    Click to view full description
                  </Text>
                )}
              </Paper>
            )}
          </Box>
          <Divider my="md" />
          <Box>
            <Group position="apart" mb="xs">
              <Text weight={500} size="sm">
                <ChatCircleText
                  size={16}
                  style={{ marginRight: "5px", verticalAlign: "text-bottom" }}
                />
                File Comments
              </Text>
              <Tooltip label="View all comments">
                <ActionIcon
                  onClick={() => setRemarksOpened(true)}
                  size="sm"
                  radius="xl"
                  variant="light"
                  color="blue"
                >
                  <Info size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {loading ? (
              <>
                <Skeleton height={12} width="90%" radius="xl" mb={8} />
                <Skeleton height={12} width="80%" radius="xl" mb={8} />
                <Skeleton height={12} width="85%" radius="xl" />
              </>
            ) : (
              <Paper
                p="xs"
                withBorder
                style={{ backgroundColor: "#fff", cursor: "pointer" }}
                onClick={() => setRemarksOpened(true)}
              >
                <Text
                  size="sm"
                  style={{ whiteSpace: "pre-wrap" }}
                  lineClamp={3}
                >
                  {previewRemarks}
                </Text>
                {fileContent.length > 3 && (
                  <Text size="xs" c="blue" mt={5}>
                    Click to view all {fileContent.length} comments
                  </Text>
                )}
              </Paper>
            )}
          </Box>
        </Paper>
      </div>

      {/* Tracking History of the File */}
      <Paper shadow="xs" radius="md" p={0} withBorder mb="lg">
        <Flex
          p="md"
          justify="space-between"
          align="center"
          style={{
            backgroundColor: "#f1f3f5",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            borderBottom: historyExpanded ? "1px solid #dee2e6" : "none",
          }}
          onClick={() => setHistoryExpanded(!historyExpanded)}
          sx={{ cursor: "pointer" }}
        >
          <Group>
            <ClockCounterClockwise size={20} />
            <Title
              order={4}
              style={{ margin: 0, fontSize: isMobile ? "16px" : "18px" }}
            >
              Tracking History of {generateFileId(file)}
            </Title>
          </Group>
          <Group>
            {/* View Type Selector - Only show on desktop */}
            {!isMobile && historyExpanded && (
              <SegmentedControl
                value={viewType}
                onChange={setViewType}
                data={[
                  {
                    value: "table",
                    label: (
                      <Center>
                        <TableIcon size={16} style={{ marginRight: 8 }} />
                        <Text size="sm">Table</Text>
                      </Center>
                    ),
                  },
                  {
                    value: "timeline",
                    label: (
                      <Center>
                        <ListBullets size={16} style={{ marginRight: 8 }} />
                        <Text size="sm">Timeline</Text>
                      </Center>
                    ),
                  },
                ]}
                size="xs"
                radius="md"
                onClick={(e) => e.stopPropagation()}
                style={{ marginRight: 10 }}
              />
            )}
            <ActionIcon variant="subtle">
              {historyExpanded ? (
                <CaretUp size={16} />
              ) : (
                <CaretDown size={16} />
              )}
            </ActionIcon>
          </Group>
        </Flex>

        <Collapse in={historyExpanded}>
          <Box p={isMobile ? "xs" : "md"}>
            {loading ? (
              <>
                <Skeleton height={50} radius="sm" mb={10} />
                <Skeleton height={50} radius="sm" mb={10} />
                <Skeleton height={50} radius="sm" />
              </>
            ) : isMobile ? (
              // Mobile always shows timeline view
              renderTimelineView()
            ) : // Desktop shows selected view type
            viewType === "timeline" ? (
              renderTimelineView()
            ) : (
              renderTabularView()
            )}
          </Box>
        </Collapse>
      </Paper>

      {/* Action Buttons */}
      <Group
        position="center"
        mt="lg"
        spacing={isMobile ? "md" : "xl"}
        style={{ flexWrap: "wrap" }}
      >
        {/* Only show forward button if not archived and current user is the latest receiver */}
        {shouldShowForwardButton && (
          <Button
            leftIcon={<PaperPlaneTilt size={20} />}
            onClick={() => toggleSection("forward")}
            disabled={loading}
            color="blue"
            radius="md"
            fullWidth={isMobile}
          >
            {activeSection === "forward" ? "Close" : "Forward"}
          </Button>
        )}

        {file?.upload_file && (
          <Button
            leftIcon={<DownloadSimple size={20} />}
            onClick={() => {
              trackingHistory.forEach((track) => {
                if (track.upload_file) {
                  downloadAttachment(track.upload_file);
                }
              });
            }}
            variant="outline"
            radius="md"
            fullWidth={isMobile}
          >
            Download All Attachments
          </Button>
        )}
      </Group>

      {/* Forward Form */}
      {activeSection === "forward" && (
        <Paper
          shadow="xs"
          p={isMobile ? "md" : "lg"}
          mt="xl"
          radius="md"
          withBorder
          style={{
            backgroundColor: "#F9FAFB",
          }}
        >
          <Title order={4} mb="md">
            Forward File
          </Title>

          <Grid gutter="md" mb="md" align="flex-end">
            <Grid.Col span={{ base: 11, sm: 6 }}>
              <Autocomplete
                label="Forward To"
                placeholder="Enter recipient username"
                value={receiver_username}
                data={usernameSuggestions}
                onChange={(value) => {
                  setReceiverDesignation("");
                  setReceiverUsername(value);
                }}
                icon={<User size={16} />}
                required
                size="sm" // Makes label/input padding consistent
              />
            </Grid.Col>
            <Grid.Col span={{ base: 11, sm: 6 }}>
              <Select
                key={receiver_username}
                label="Receiver Designation"
                placeholder="Select designation"
                onClick={() => fetchRoles()}
                value={receiver_designation}
                data={receiverRoles}
                onChange={(value) => setReceiverDesignation(value)}
                searchable
                nothingFound="No designations found"
                icon={<UserCircle size={16} />}
                required
                size="sm" // Match size with Autocomplete
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Remarks"
            placeholder="Enter remarks (500 letters maximum)"
            value={remarks}
            onChange={(e) => {
              if (remarks.length < 500) {
                setRemarks(e.currentTarget.value);
              }
            }}
            mb="xs"
            minRows={3}
            required
            icon={<ChatCenteredText size={16} />}
          />

          <Text
            align="right"
            size="sm"
            c={remarks.split(/\s+/).length >= 45 ? "red" : "dimmed"}
          >
            {remarks.split(/\s+/).length} / 50 words
          </Text>

          <FileInput
            label="Attach file (PDF, JPG, PNG) (MAX: 10MB)"
            placeholder="Upload file"
            accept="application/pdf,image/jpeg,image/png"
            icon={<Upload size={16} />}
            value={files}
            onChange={handleFileChange}
            mb="md"
            multiple
          />

          {files && files.length > 0 && (
            <Group position="left" mb="md">
              <Button
                leftIcon={<Trash size={16} />}
                color="red"
                onClick={removeFile}
                size="sm"
                variant="light"
              >
                Remove File
              </Button>
            </Group>
          )}

          <Divider my="md" />

          <Group position="right" style={{ flexWrap: "wrap" }}>
            <Button
              variant="outline"
              onClick={() => {
                setActiveSection(null);
                setIsForwarding(false);
              }}
              radius="md"
            >
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={() => openForwardModal(file)}
              loading={isForwarding}
              disabled={!receiver_designation || !receiver_username || !remarks}
              radius="md"
            >
              Forward File
            </Button>
          </Group>
        </Paper>
      )}

      {/* Modals */}

      {/* Description Modal */}
      <Modal
        opened={descOpened}
        onClose={() => setDescOpened(false)}
        title={
          <Text weight={600}>File Description - {generateFileId(file)}</Text>
        }
        size="lg"
      >
        <ScrollArea style={{ height: "60vh" }}>
          <Textarea
            value={file.description}
            readOnly
            autosize
            style={{
              backgroundColor: "#f8f9fa",
              padding: "10px",
              borderRadius: "8px",
            }}
          />
        </ScrollArea>
      </Modal>
      {/* Remarks Modal */}
      <Modal
        opened={remarksOpened}
        onClose={() => setRemarksOpened(false)}
        title={
          <Text weight={600}>Comments History - {generateFileId(file)}</Text>
        }
        size="lg"
      >
        <ScrollArea style={{ height: "60vh" }}>
          <Textarea
            value={allRemarks}
            readOnly
            autosize
            minRows={Math.max(fileContent.length, 3)}
            style={{
              backgroundColor: "#f8f9fa",
              padding: "10px",
              borderRadius: "8px",
            }}
          />
        </ScrollArea>
      </Modal>

      {/* Individual Remark Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Text weight={600}>Full Remarks</Text>}
        size="lg"
      >
        <Paper p="md" withBorder>
          <Text style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {selectedRemarks}
          </Text>
        </Paper>
      </Modal>

      {/* Forward Confirmation Modal */}
      <Modal
        opened={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        title={
          <Text align="center" weight={600} size="lg">
            Confirm Forward
          </Text>
        }
        centered
        size={isMobile ? "sm" : "md"}
      >
        <Paper p="md" withBorder mb="md">
          <Text weight={600} mb="md" size="md">
            Are you sure you want to forward this file?
          </Text>

          <Grid>
            <Grid.Col span={5}>
              <Text weight={500}>File ID:</Text>
            </Grid.Col>
            <Grid.Col span={7}>
              <Text>
                {selectedForwardFile && generateFileId(selectedForwardFile)}
              </Text>
            </Grid.Col>

            <Grid.Col span={5}>
              <Text weight={500}>Subject:</Text>
            </Grid.Col>
            <Grid.Col span={7}>
              <Text>{selectedForwardFile?.subject}</Text>
            </Grid.Col>

            <Grid.Col span={5}>
              <Text weight={500}>Created By:</Text>
            </Grid.Col>
            <Grid.Col span={7}>
              <Text>
                {file.uploader}[{file.uploader_designation}]
              </Text>
            </Grid.Col>

            <Grid.Col span={5}>
              <Text weight={500}>From:</Text>
            </Grid.Col>
            <Grid.Col span={7}>
              <Text>
                {currentUser} [{userDesignation}]
              </Text>
            </Grid.Col>

            <Grid.Col span={5}>
              <Text weight={500}>To:</Text>
            </Grid.Col>
            <Grid.Col span={7}>
              <Text>
                {receiver_username}[{receiver_designation}]
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>

        <Group justify="center" gap="xl" style={{ width: "100%" }}>
          <Button
            onClick={confirmForward}
            color="blue"
            style={{ width: isMobile ? "100px" : "120px" }}
            radius="md"
          >
            Confirm
          </Button>
          <Button
            onClick={() => setShowForwardModal(false)}
            variant="outline"
            style={{ width: isMobile ? "100px" : "120px" }}
            radius="md"
          >
            Cancel
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}

ViewFile.propTypes = {
  onBack: PropTypes.func.isRequired,
  fileID: PropTypes.number.isRequired,
  updateFiles: PropTypes.func.isRequired,
  isArchived: PropTypes.bool,
};
