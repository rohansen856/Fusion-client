import React from "react";
import {
  Card,
  Text,
  Stack,
  Paper,
  Group,
  SimpleGrid,
  Container,
} from "@mantine/core";
import PropTypes from "prop-types";

function StudentInfoCard({
  name,
  programme,
  batch,
  cpi,
  category,
  hall_id,
  room_no,
}) {
  return (
    <Container size="xs" px="xs">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          maxWidth: "400px",
          margin: "auto",
        }}
        styles={(theme) => ({
          root: {
            backgroundColor: theme.colors.gray[0],
          },
        })}
      >
        <Stack spacing="md">
          <Paper p="md" radius="md" withBorder>
            <Group position="apart">
              <Text size="lg" weight={500} color="blue">
                Room & Information
              </Text>
            </Group>
          </Paper>
          <SimpleGrid cols={2} spacing="md">
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">
                Name:
              </Text>
              <Text size="lg" italic>
                {name}
              </Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">
                Room No:
              </Text>
              <Text size="lg">{room_no}</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">
                Hall ID:
              </Text>
              <Text size="lg">{hall_id}</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">
                Programme:
              </Text>
              <Text size="lg">{programme}</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">
                Batch:
              </Text>
              <Text size="lg">{batch}</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">
                CPI:
              </Text>
              <Text size="lg">{cpi}</Text>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Text weight={500} color="dimmed">
                Category:
              </Text>
              <Text size="lg">{category}</Text>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Card>
    </Container>
  );
}

StudentInfoCard.propTypes = {
  name: PropTypes.string.isRequired,
  programme: PropTypes.string.isRequired,
  batch: PropTypes.string.isRequired,
  cpi: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
  hall_id: PropTypes.string.isRequired,
  room_no: PropTypes.string.isRequired,
};

export default StudentInfoCard;
