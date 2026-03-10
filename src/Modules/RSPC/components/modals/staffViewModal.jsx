import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Text,
  Badge,
  Group,
  Divider,
  Grid,
  GridCol,
  Title,
} from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";
import classes from "../../styles/formStyle.module.css";
import { badgeColor } from "../../helpers/badgeColours";
import { host } from "../../../../routes/globalRoutes";

function StaffViewModal({ opened, onClose, staffData }) {
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
      {staffData && Object.keys(staffData).length > 0 ? (
        <>
          <Group position="apart">
            <Title order={2}>
              {staffData.person && staffData.person.trim() !== ""
                ? staffData.person
                : "TBD"}
            </Title>
            <Badge
              color={badgeColor[staffData.approval]}
              size="lg"
              style={{ color: "#3f3f3f" }}
            >
              {staffData.approval}
            </Badge>
          </Group>
          <Title order={4} style={{ color: "#A0A0A0", marginBottom: 20 }}>
            {staffData.type}
          </Title>
          <Grid gutter="xs" style={{ marginBottom: 20 }}>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Project Title:</span>{" "}
                {staffData.project_title}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Staff ID:</span>{" "}
                {staffData.sid}
              </Text>
            </GridCol>

            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Joining Date:</span>{" "}
                {new Date(staffData.start_date).toLocaleDateString()}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Appointment Duration:</span>{" "}
                {staffData.duration} months
              </Text>
            </GridCol>

            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Consolidated Salary:</span> ₹
                {staffData.salary}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Salary Per Month:</span> ₹
                {staffData.salary_per_month}
              </Text>
            </GridCol>

            <Grid.Col span={6}>
              <Group position="apart" align="center">
                <Text style={{ color: "#A0A0A0" }}>Resume:</Text>
                {staffData.biodata_final[staffData.biodata_number] ? (
                  <Button
                    variant="outline"
                    color="#15ABFF"
                    size="xs"
                    className={classes.fileInputButton}
                    style={{ borderRadius: "8px" }}
                    component="a"
                    href={`${host}/${staffData.biodata_final[staffData.biodata_number]}`} // Directly access the file URL
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadSimple size={26} style={{ marginRight: "3px" }} />
                    Open Resume
                  </Button>
                ) : (
                  <span>No resume uploaded</span>
                )}
              </Group>
            </Grid.Col>
            <GridCol span={6}>
              <Group position="apart" align="center">
                <Text style={{ color: "#A0A0A0" }}>Joining Report:</Text>
                {staffData.joining_report ? (
                  <Button
                    variant="outline"
                    color="#15ABFF"
                    size="xs"
                    className={classes.fileInputButton}
                    style={{ borderRadius: "8px" }}
                    component="a"
                    href={`${host}/${staffData.joining_report}`} // Directly access the file URL
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadSimple size={26} style={{ marginRight: "3px" }} />
                    Open Report
                  </Button>
                ) : (
                  <span>No report uploaded</span>
                )}
              </Group>
            </GridCol>
            <GridCol span={12}>
              <Group position="apart" align="center">
                <Text style={{ color: "#A0A0A0" }}>ID Card:</Text>
                {staffData.id_card ? (
                  <Button
                    variant="outline"
                    color="#15ABFF"
                    size="xs"
                    className={classes.fileInputButton}
                    style={{ borderRadius: "8px" }}
                    component="a"
                    href={`${host}/${staffData.id_card}`} // Directly access the file URL
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadSimple size={26} style={{ marginRight: "3px" }} />
                    Open ID
                  </Button>
                ) : (
                  <span>No ID uploaded</span>
                )}
              </Group>
            </GridCol>

            <Grid.Col span={12}>
              <Divider my="sm" label="" labelPosition="center" size="sm" />
            </Grid.Col>

            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Test Date:</span>{" "}
                {new Date(staffData.test_date).toLocaleDateString()}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Mode Of Test:</span>{" "}
                {staffData.test_mode}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Interview Date:</span>{" "}
                {new Date(staffData.interview_date).toLocaleDateString()}
              </Text>
            </GridCol>
            <GridCol span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Interview Venue:</span>{" "}
                {staffData.interview_place}
              </Text>
            </GridCol>

            <GridCol span={12}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>Eligibility Criteria:</span>{" "}
                {staffData.eligibility}
              </Text>
            </GridCol>
            <Grid.Col span={12}>
              <Group position="apart" align="center">
                <Text style={{ color: "#A0A0A0" }}>
                  Copy Of Advertisement Uploaded On Institute Website:
                </Text>
                {staffData.ad_file ? (
                  <Button
                    variant="outline"
                    color="#15ABFF"
                    size="xs"
                    className={classes.fileInputButton}
                    style={{ borderRadius: "8px" }}
                    component="a"
                    href={`${host}/${staffData.ad_file}`} // Directly access the file URL
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadSimple size={26} style={{ marginRight: "3px" }} />
                    Open Copy
                  </Button>
                ) : (
                  <span>No file uploaded</span>
                )}
              </Group>
            </Grid.Col>

            <Grid.Col span={12}>
              <Divider my="sm" label="" labelPosition="center" size="sm" />
            </Grid.Col>

            <Grid.Col span={12}>
              <Title
                order={4}
                style={{ textAlign: "center", color: "#A0A0A0" }}
              >
                Selection Committee
              </Title>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  PI (Convener of the Committee):
                </span>{" "}
                {staffData.pi_name}
              </Text>
              {Object.entries(staffData.selection_committee).map(
                ([role, name], index) => (
                  <Text key={index}>
                    <span style={{ color: "#A0A0A0" }}>{role}:</span>{" "}
                    {Array.isArray(name) ? name.join(", ") : name}
                  </Text>
                ),
              )}
            </Grid.Col>

            <Grid.Col span={12}>
              <Divider my="sm" label="" labelPosition="center" size="sm" />
            </Grid.Col>

            <Grid.Col span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  Number Of Candidates Applied:
                </span>{" "}
                {staffData.candidates_applied}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  Number Of Candidates Called For Test:
                </span>{" "}
                {staffData.candidates_called}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>
                <span style={{ color: "#A0A0A0" }}>
                  Number Of Candidates Interviewed:
                </span>{" "}
                {staffData.candidates_interviewed}
              </Text>
            </Grid.Col>

            <Grid.Col span={12}>
              <Title
                order={4}
                style={{ textAlign: "center", color: "#A0A0A0" }}
              >
                Final Selections
              </Title>
              {staffData.final_selection.length > 0 ? (
                <ul style={{ paddingLeft: "20px", margin: "0 0" }}>
                  {staffData.final_selection.map((candidate, index) => (
                    <li key={index}>
                      <span>{candidate.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text style={{ textAlign: "center" }} color="dimmed">
                  None
                </Text>
              )}
            </Grid.Col>
            {staffData.waiting_list.length > 0 && (
              <Grid.Col span={12}>
                <Title
                  order={4}
                  style={{ textAlign: "center", color: "#A0A0A0" }}
                >
                  Waiting List
                </Title>
                <ul style={{ paddingLeft: "20px", margin: "0 0" }}>
                  {staffData.waiting_list.map((candidate, index) => (
                    <li key={index}>{candidate.name}</li>
                  ))}
                </ul>
              </Grid.Col>
            )}
            <Grid.Col span={12}>
              <Group position="apart" align="center">
                <Text style={{ color: "#A0A0A0" }}>
                  Comparative Statements Of Candidates:
                </Text>
                {staffData.comparative_file ? (
                  <Button
                    variant="outline"
                    color="#15ABFF"
                    size="xs"
                    className={classes.fileInputButton}
                    style={{ borderRadius: "8px" }}
                    component="a"
                    href={`${host}/${staffData.comparative_file}`} // Directly access the file URL
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadSimple size={26} style={{ marginRight: "3px" }} />
                    Open Statement
                  </Button>
                ) : (
                  <span>No file uploaded</span>
                )}
              </Group>
            </Grid.Col>
          </Grid>
        </>
      ) : (
        <Text color="red" align="center">
          Failed to load staff details
        </Text>
      )}
    </Modal>
  );
}

StaffViewModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  staffData: PropTypes.shape({
    sid: PropTypes.number,
    pid: PropTypes.number,
    project_title: PropTypes.string,
    pi_name: PropTypes.string,
    eligibility: PropTypes.string,
    ad_file: PropTypes.string,
    comparative_file: PropTypes.string,
    selection_committee: PropTypes.arrayOf(PropTypes.string),
    test_date: PropTypes.string,
    test_mode: PropTypes.string,
    submission_date: PropTypes.string,
    id_card: PropTypes.string,
    duration: PropTypes.number,
    candidates_applied: PropTypes.number,
    candidates_called: PropTypes.number,
    candidates_interviewed: PropTypes.number,
    approval: PropTypes.string,
    joining_report: PropTypes.string,
    type: PropTypes.string,
    sanction_date: PropTypes.string,
    start_date: PropTypes.string,
    interview_date: PropTypes.string,
    interview_place: PropTypes.string,
    salary: PropTypes.number,
    salary_per_month: PropTypes.number,
    person: PropTypes.string,
    biodata_final: PropTypes.arrayOf(PropTypes.string),
    biodata_number: PropTypes.number,
    final_selection: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
      }),
    ),
    waiting_list: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
};

export default StaffViewModal;
