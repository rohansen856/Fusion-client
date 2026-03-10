import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Button,
  Paper,
  Title,
  Collapse,
  Divider,
  Tooltip,
  Box,
} from "@mantine/core";
import { Paperclip, CaretLeft, CaretDown } from "@phosphor-icons/react";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import { CaretRight } from "phosphor-react";
import { host } from "../../../routes/globalRoutes/index";
import { GetFileData, GetItems } from "../handlers/handlers";
import CreateProposalForm from "./ProposalForm";
import ProposalTable from "./viewproposals";
import IssueWorkOrderForm from "./IssueWorkOrderForm";
import ItemsTable from "./ItemsTable";
import StatusBar from "./subcomponents/StatusBar";

export default function ViewWorkFile({ request, handleBackToList }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState({});
  const [view, setView] = useState("main");
  const role = useSelector((state) => state.user.role);
  const [proposaldata, setProposalData] = useState({});
  const [proposalType, setProposalType] = useState("");
  const [opened, setOpened] = useState(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      remarks: "",
      file: null,
      designation: null,
    },
    validate: {
      designation: (value) => (value ? null : "Field is required"),
    },
  });
  const allowedFormList = [
    "admin iwd",
    "ee",
    "executive engineer(civil)",
    "electrical_ae",
    "civil_ae",
    "civil_je",
    "electrical_je",
    "electrical_ae",
    "junior engineer",
    "sectionhead_iwd",
  ];
  useEffect(() => {
    GetFileData({ setLoading, form, request, setMessages });
    GetItems(setLoading, request.active_proposal).then((data) => {
      setProposalData(data);
    });
  }, []);
  console.log("this is message data\n\n : ", messages);
  return (
    <Paper
      style={{
        padding: "20px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.15)",
        borderLeft: view === "main" ? "0.6rem solid #15ABFF" : "none",
        overflow: "auto",
        margin: "0 auto",
        maxHeight: "100vh",
      }}
    >
      <Button
        variant="light"
        leftIcon={<CaretLeft size={12} />}
        onClick={handleBackToList}
        style={{
          marginBottom: "20px",
          marginLeft: "20px",
          borderRadius: "5px",
        }}
        color="black"
      >
        <CaretLeft size={20} />
        back to list
      </Button>
      <Card radius="md" style={{ overflowY: "auto", maxHeight: "65vh" }}>
        {loading ? (
          <Loader size="lg" />
        ) : view === "proposalForm" ? (
          <CreateProposalForm
            onBack={() => setView("main")}
            request_id={request.request_id}
            submitter={() => {
              handleBackToList();
            }}
            proposalType={proposalType}
          />
        ) : view === "proposalTable" ? (
          <ProposalTable
            requestId={request.request_id}
            onBack={() => setView("main")}
          />
        ) : view === "IssueWorkOrderForm" ? (
          <IssueWorkOrderForm
            workOrder={request}
            onBack={() => setView("main")}
            submitter={() => {
              handleBackToList();
            }}
          />
        ) : (
          <>
            <StatusBar request={request} />
            <Box my="lg">
              <Group position="apart" mb="sm">
                <Title order={4}>File Tracking Information</Title>

                <Tooltip label={opened ? "Collapse section" : "Expand section"}>
                  <Button
                    onClick={() => setOpened((o) => !o)}
                    size="xs"
                    variant="light"
                    radius="md"
                    leftIcon={
                      <CaretDown
                        size={16}
                        style={{
                          transition: "transform 300ms ease",
                          transform: opened ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    }
                  >
                    {opened ? "Collapse" : "Expand"}
                  </Button>
                </Tooltip>
              </Group>

              <Divider mb="md" />

              <Collapse
                in={opened}
                transitionDuration={300}
                transitionTimingFunction="ease"
              >
                <Stack spacing="md">
                  {messages.tracks?.map((message, index) => (
                    <Card
                      key={index}
                      shadow="md"
                      padding="lg"
                      radius="lg"
                      withBorder
                      sx={(theme) => ({
                        transition:
                          "box-shadow 150ms ease, transform 150ms ease",
                        "&:hover": {
                          boxShadow: theme.shadows.md,
                          transform: "translateY(-2px)",
                        },
                      })}
                    >
                      <Stack spacing="sm">
                        <Group position="apart">
                          <Text size="sm" color="dimmed" weight={600}>
                            Sent by:
                          </Text>
                          <Text size="sm" weight={500}>
                            {message.current_id}
                          </Text>
                        </Group>

                        <Group position="apart">
                          <Text size="sm" color="dimmed" weight={600}>
                            Sent Date & Time:
                          </Text>
                          <Text size="sm" weight={500}>
                            {dayjs(message.forward_date).format(
                              "MMMM D, YYYY [at] h:mm A",
                            )}
                          </Text>
                        </Group>

                        <Group position="apart">
                          <Text size="sm" color="dimmed" weight={600}>
                            Received by:
                          </Text>
                          <Text size="sm" weight={500}>
                            {message.receiver_id || "N/A"}
                          </Text>
                        </Group>

                        <Group position="apart" align="flex-start">
                          <Text size="sm" color="dimmed" weight={600}>
                            Remarks:
                          </Text>
                          <Text size="sm" weight={500}>
                            {message.remarks}
                          </Text>
                        </Group>
                        {index === 1
                          ? message.upload_file && (
                              <Group spacing="xs" mt="sm" noWrap>
                                <Paperclip size="1rem" />
                                <Button
                                  variant="light"
                                  component="a"
                                  href={`${host}/${message.upload_file}`}
                                  target="_blank"
                                  radius="md"
                                  size="xs"
                                  sx={{
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    maxWidth: 220,
                                  }}
                                >
                                  {message.upload_file.split("/").slice(-1)[0]}
                                </Button>
                              </Group>
                            )
                          : messages.file.upload_file && (
                              <Group spacing="xs" mt="sm" noWrap>
                                <Paperclip size="1rem" />
                                <Button
                                  variant="light"
                                  component="a"
                                  href={`${host}/${messages.file.upload_file}`}
                                  target="_blank"
                                  radius="md"
                                  size="xs"
                                  sx={{
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    maxWidth: 220,
                                  }}
                                >
                                  {
                                    messages.file.upload_file
                                      .split("/")
                                      .slice(-1)[0]
                                  }
                                </Button>
                              </Group>
                            )}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Collapse>
            </Box>
            <Group spacing="md" mt="sm" mb="md">
              {request.active_proposal != null ||
              !allowedFormList.includes(role.toLowerCase()) ||
              request.processed_by_admin === null ||
              request.processed_by_admin === -1 ? null : (
                <Button
                  variant="light"
                  radius="sm"
                  onClick={() => {
                    setView("proposalForm");
                    setProposalType("create");
                  }}
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  Proposal Form
                </Button>
              )}
              <Button
                variant="light"
                radius="sm"
                onClick={() => setView("proposalTable")}
                sx={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                View Proposals
              </Button>
              {request.work_order === 0 &&
              request.processed_by_director === 1 &&
              request.processed_by_admin >= 0 ? (
                <Button
                  variant="light"
                  radius="sm"
                  onClick={() => setView("IssueWorkOrderForm")}
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  Issue Work Order
                </Button>
              ) : null}
            </Group>
            {request.active_proposal ? (
              Object.keys(proposaldata).length > 0 ? (
                <div
                  style={{
                    marginTop: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <ItemsTable proposaldata={proposaldata} />
                </div>
              ) : (
                <Loader size="lg" />
              )
            ) : null}
          </>
        )}
        <div>
          <Button
            variant="filled"
            radius="sm"
            onClick={() => {
              navigate(`/iwd/work/${request.request_id}`);
            }}
          >
            <Text size="18">Manage Bills</Text>
            <CaretRight size={20} />
          </Button>
        </div>
      </Card>
    </Paper>
  );
}

ViewWorkFile.propTypes = {
  request: PropTypes.shape({
    request_id: PropTypes.number.isRequired,
    name: PropTypes.string,
    area: PropTypes.string,
    description: PropTypes.string,
    requestCreatedBy: PropTypes.string,
    status: PropTypes.string.isRequired,
    file_id: PropTypes.number.isRequired,
    processed_by_admin: PropTypes.number,
    processed_by_director: PropTypes.number,
    processed_by_dean: PropTypes.number,
    work_order: PropTypes.number,
    work_completed: PropTypes.number,
    active_proposal: PropTypes.number,
  }).isRequired,
  handleBackToList: PropTypes.func.isRequired,
};
