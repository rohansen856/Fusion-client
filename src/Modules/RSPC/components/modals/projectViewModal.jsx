import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Text,
  Badge,
  Group,
  Table,
  Loader,
  Container,
  Divider,
  Grid,
  GridCol,
  Title,
} from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";
import axios from "axios";
import { ProjectPDF } from "../../helpers/projectPDF";
import classes from "../../styles/formStyle.module.css";
import {
  fetchStaffPositionsRoute,
  fetchBudgetRoute,
} from "../../../../routes/RSPCRoutes";
import { badgeColor } from "../../helpers/badgeColours";
import { host } from "../../../../routes/globalRoutes";

function ProjectViewModal({ opened, onClose, projectData }) {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(true);

  const [staffPositions, setStaffPositions] = useState(null);
  useEffect(() => {
    if (opened && projectData) {
      setLoading(true);
      const fetchStaffPositions = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return console.error("No authentication token found!");
        try {
          const response = await axios.get(
            fetchStaffPositionsRoute(projectData.pid),
            {
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            },
          );
          console.log("Fetched Staff Positions:", response.data);
          setStaffPositions(response.data);
          setLoading(false);
        } catch (error) {
          console.error("Error during Axios GET:", error);
          setLoading(false);
          setFetched(false);
        }
      };
      fetchStaffPositions();
    }
  }, [projectData]);

  const [budget, setBudget] = useState(null);
  useEffect(() => {
    if (opened && projectData) {
      setLoading(true);
      const fetchBudget = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return console.error("No authentication token found!");
        try {
          const response = await axios.get(fetchBudgetRoute(projectData.pid), {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          console.log("Fetched Budget:", response.data);
          setBudget(response.data);
          setLoading(false);
        } catch (error) {
          console.error("Error during Axios GET:", error);
          setLoading(false);
          setFetched(false);
        }
      };
      fetchBudget();
    }
  }, [projectData]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      styles={{
        content: {
          borderLeft: "0.7rem solid #15ABFF",
        },
      }}
    >
      {loading ? (
        <Container py="xl">
          {" "}
          <Loader size="lg" />
        </Container>
      ) : projectData && Object.keys(projectData).length > 0 && fetched ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginBottom: 20,
            }}
          >
            <Group position="apart">
              <Title order={2}>{projectData.name}</Title>
              <Badge
                color={badgeColor[projectData.status]}
                size="lg"
                style={{ color: "#3f3f3f" }}
              >
                {projectData.status}
              </Badge>
            </Group>
            <Button
              color="#15abff"
              style={{ borderRadius: "8px" }}
              size="xs"
              onClick={() => ProjectPDF(projectData, staffPositions, budget)}
            >
              <DownloadSimple size={26} style={{ marginRight: "3px" }} />
              Report
            </Button>
          </div>

          <Grid gutter="xs" style={{ marginBottom: 20 }}>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  Principal Investigator:
                </span>{" "}
                {projectData.pi_name} ({projectData.pi_id})
              </Text>
            </GridCol>
            <Grid.Col span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  Co-Principal Investigators:{" "}
                </span>
                {projectData.copis.length > 0 ? (
                  <ul style={{ paddingLeft: "20px", margin: "0 0" }}>
                    {projectData.copis.map((copi, index) => (
                      <li key={index}>
                        <span>{copi}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>No Co-PIs</span>
                )}
              </Text>
            </Grid.Col>

            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  Project To Be Operated By:
                </span>{" "}
                {projectData.access === "Co"
                  ? "Only PI"
                  : "Either PI or Co-PI(s)"}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Project Type:</span>{" "}
                {projectData.type}
              </Text>
            </GridCol>

            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Department:</span>{" "}
                {projectData.dept}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Sponsoring Agency:</span>{" "}
                {projectData.sponsored_agency}
              </Text>
            </GridCol>

            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Category:</span>{" "}
                {projectData.category}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Scheme:</span>{" "}
                {projectData.scheme}
              </Text>
            </GridCol>
            <Grid.Col span={12}>
              <Group position="apart" align="center">
                <Text style={{ color: "#A0A0A0" }}>
                  Project Agreement (Sanction Letter, MoU, etc.):
                </Text>
                {projectData.file ? (
                  <Button
                    variant="outline"
                    color="#15ABFF"
                    size="xs"
                    className={classes.fileInputButton}
                    style={{ borderRadius: "8px" }}
                    component="a"
                    href={`${host}/${projectData.file}`} // Directly access the file URL
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadSimple size={26} style={{ marginRight: "3px" }} />
                    Open File
                  </Button>
                ) : (
                  <span>No file uploaded</span>
                )}
              </Group>
            </Grid.Col>
            <GridCol span={12}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Project Abstract:</span>{" "}
                {projectData.description}
              </Text>
            </GridCol>

            <Grid.Col span={12}>
              <Divider my="sm" label="" labelPosition="center" size="sm" />
            </Grid.Col>

            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  Proposal Submission Date:
                </span>{" "}
                {new Date(projectData.submission_date).toLocaleDateString()}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Project Sanction Date:</span>{" "}
                {new Date(projectData.sanction_date).toLocaleDateString()}
              </Text>
            </GridCol>

            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Project Duration:</span>{" "}
                {projectData.duration} months
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  Project Commencement Date:
                </span>{" "}
                {new Date(projectData.start_date).toLocaleDateString()}
              </Text>
            </GridCol>

            <Grid.Col span={12}>
              <Divider my="sm" label="" labelPosition="center" size="sm" />
            </Grid.Col>

            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Total Proposed Budget:</span>{" "}
                ₹{projectData.total_budget}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  Total Sanctioned Amount:
                </span>{" "}
                ₹{projectData.sanctioned_amount}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Current Funds:</span>
                {budget ? (
                  <span>₹{budget.current_funds}</span>
                ) : (
                  <span>NIL</span>
                )}
              </Text>
            </GridCol>
            <Grid.Col span={6}>
              <Group position="apart" align="center">
                <Text style={{ color: "#A0A0A0" }}>Project Registration:</Text>
                {projectData.registration_form ? (
                  <Button
                    variant="outline"
                    color="#15ABFF"
                    size="xs"
                    className={classes.fileInputButton}
                    style={{ borderRadius: "8px" }}
                    component="a"
                    href={`${host}/${projectData.registration_form}`} // Directly access the file URL
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadSimple size={26} style={{ marginRight: "3px" }} />
                    Open Registration
                  </Button>
                ) : (
                  <span>No file uploaded</span>
                )}
              </Group>
            </Grid.Col>
          </Grid>

          {budget && Object.keys(budget).length > 0 && (
            <>
              <Title
                order={4}
                style={{ textAlign: "center", color: "#A0A0A0" }}
              >
                Budget Heads
              </Title>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Category</Table.Th>
                    {budget.manpower.map((_, index) => (
                      <Table.Th key={index}>Year {index + 1}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {[
                    "manpower",
                    "travel",
                    "contingency",
                    "consumables",
                    "equipments",
                  ].map((category) => (
                    <Table.Tr key={category}>
                      <Table.Td>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Table.Td>
                      {budget[category].map((value, index) => (
                        <Table.Td key={index}>₹{value}</Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Overhead Expenses:</span> ₹
                {budget.overhead}
              </Text>
            </>
          )}

          {staffPositions && Object.keys(staffPositions).length > 0 && (
            <>
              <Divider my="sm" label="" labelPosition="center" size="sm" />
              <Title
                order={4}
                style={{ textAlign: "center", color: "#A0A0A0" }}
              >
                Project Personnel
              </Title>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Designation</Table.Th>
                    <Table.Th>Available Spots</Table.Th>
                    <Table.Th>Occupied Spots</Table.Th>
                    <Table.Th>Current Staff</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.keys(staffPositions.positions).map((position) => (
                    <Table.Tr key={position}>
                      <Table.Td>{position}</Table.Td>
                      <Table.Td>
                        {staffPositions.positions[position][0]}
                      </Table.Td>
                      <Table.Td>
                        {staffPositions.positions[position][1]}
                      </Table.Td>
                      <Table.Td>
                        {staffPositions.incumbents[position]?.length > 0
                          ? staffPositions.incumbents[position].map(
                              (incumbent, index) => (
                                <div key={index}>{incumbent.name}</div>
                              ),
                            )
                          : "None"}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </>
          )}
        </>
      ) : (
        <Text color="red" align="center">
          Failed to load project details
        </Text>
      )}
    </Modal>
  );
}

ProjectViewModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectData: PropTypes.shape({
    pid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    pi_name: PropTypes.string,
    pi_id: PropTypes.string.isRequired,
    access: PropTypes.string,
    sponsored_agency: PropTypes.string.isRequired,
    dept: PropTypes.string,
    scheme: PropTypes.string,
    type: PropTypes.string,
    start_date: PropTypes.string,
    submission_date: PropTypes.string,
    sanction_date: PropTypes.string,
    total_budget: PropTypes.number,
    sanctioned_amount: PropTypes.number,
    duration: PropTypes.number,
    copis: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.string,
    description: PropTypes.string,
    file: PropTypes.string,
    registration_form: PropTypes.string,
  }).isRequired,
};

export default ProjectViewModal;
