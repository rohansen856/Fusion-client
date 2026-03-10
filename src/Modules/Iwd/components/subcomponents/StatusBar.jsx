import PropTypes from "prop-types";
import {
  IconFileDescription,
  IconPrinter,
  IconX,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import {
  Paper,
  Group,
  Title,
  Text,
  Badge,
  Tooltip,
  ActionIcon,
  Timeline,
} from "@mantine/core";
import dayjs from "dayjs";

export default function StatusBar({ request }) {
  let TimelineItems = 0;
  if (request.work_completed === 1) {
    TimelineItems = 6;
  } else if (request.work_order === 1) {
    TimelineItems = 5;
  } else if (request.processed_by_director) {
    TimelineItems = 4;
  } else if (request.processed_by_admin && request.active_proposal) {
    TimelineItems = 3;
  } else if (request.active_proposal) {
    TimelineItems = 2;
  } else if (request.processed_by_admin) {
    TimelineItems = 1;
  }

  const statusBadge = () => {
    if (request.processed_by_admin === -1)
      return <Badge color="red">REJECTED</Badge>;
    if (request.processed_by_director === -1)
      return (
        <Badge size="xl" color="red">
          REJECTED BY DIRECTOR
        </Badge>
      );
    if (request.work_order === 1)
      return (
        <Badge size="xl" color="#1e90ff">
          WORK ORDER ISSUED
        </Badge>
      );
    if (request.processed_by_director === 1)
      return (
        <Badge size="xl" color="green">
          APPROVED
        </Badge>
      );
    if (request.active_proposal !== null)
      return (
        <Badge size="xl" color="#1e90ff">
          PROPOSAL CREATED
        </Badge>
      );
    if (request.processed_by_admin === 1)
      return (
        <Badge size="xl" color="#1e90ff">
          RECOMMENDED
        </Badge>
      );
    return (
      <Badge size="xl" color="yellow">
        PENDING
      </Badge>
    );
  };
  return (
    <Paper shadow="sm" p="md" mb="xl" radius="sm">
      <Group position="apart" mb="md" py="lg">
        <Group px="md">
          <IconFileDescription size={45} />
          <div>
            <Title>
              Request #{request.request_id} - {request.name}
            </Title>
            <Text color="dimmed">
              <span style={{ marginRight: "1rem" }}>
                Filed on {dayjs(request.creation_time).format("MMMM D, YYYY")}
              </span>
              —
              <span style={{ marginLeft: "1rem" }}>
                Created By {request.requestCreatedBy}
              </span>
            </Text>
          </div>
        </Group>
        <Group px="md">
          {statusBadge()}
          <Tooltip label="Print Request">
            <ActionIcon variant="light" size="lg" onClick={() => {}}>
              <IconPrinter size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Timeline */}
      <Timeline active={TimelineItems} bulletSize={40} lineWidth={2}>
        <Timeline.Item bullet={<IconCheck size={20} />} title="Request Created">
          <Text color="dimmed" size="sm">
            Request created by {request.requestCreatedBy}
          </Text>
        </Timeline.Item>
        <Timeline.Item
          bullet={
            request.processed_by_admin === 1 ? (
              <IconCheck size={20} />
            ) : request.processed_by_admin === 0 ? (
              <IconClock size={20} />
            ) : (
              <IconX size={20} />
            )
          }
          title="Recommended By IWD Admin"
        >
          <Text color="dimmed" size="sm">
            IWD Admin Recommendation
          </Text>
        </Timeline.Item>
        <Timeline.Item
          bullet={
            request.active_proposal === null ? (
              <IconClock size={20} />
            ) : request.active_proposal >= 0 ? (
              <IconCheck size={20} />
            ) : (
              <IconX size={20} />
            )
          }
          title="Proposal Created"
        >
          <Text color="dimmed" size="sm">
            Proposal is Active
          </Text>
        </Timeline.Item>
        <Timeline.Item
          bullet={
            request.active_proposal >= 0 && request.processed_by_admin === 1 ? (
              <IconCheck size={20} />
            ) : (
              <IconClock size={20} />
            )
          }
          title="Proposal Recommended"
        >
          <Text color="dimmed" size="sm">
            Proposal Recommended
          </Text>
        </Timeline.Item>
        <Timeline.Item
          bullet={
            request.processed_by_director === 1 ? (
              <IconCheck size={20} />
            ) : request.processed_by_director === 0 ? (
              <IconClock size={20} />
            ) : (
              <IconX size={20} />
            )
          }
          title="Director Approval"
        >
          <Text color="dimmed" size="sm">
            Request approved by director
          </Text>
        </Timeline.Item>
        <Timeline.Item
          bullet={
            request.work_order === 1 ? (
              <IconCheck size={20} />
            ) : (
              <IconClock size={20} />
            )
          }
          title="Work Order Issued"
        >
          <Text color="dimmed" size="sm">
            Work Order Issued
          </Text>
        </Timeline.Item>
        <Timeline.Item
          bullet={
            request.work_completed === 1 ? (
              <IconCheck size={20} />
            ) : (
              <IconClock size={20} />
            )
          }
          title="Work Status"
        >
          <Text color="dimmed" size="sm">
            Work completion status
          </Text>
        </Timeline.Item>
      </Timeline>
    </Paper>
  );
}
StatusBar.propTypes = {
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
    updated: PropTypes.number,
    creation_time: PropTypes.string,
  }),
};
