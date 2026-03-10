import React from "react";
import { Paper, Text, Group, Badge, Divider } from "@mantine/core";

const defaultProps = {
  fine_id: "",
  student_name: "Unknown",
  hall: "Unknown Hall",
  amount: 0,
  status: "Pending",
  reason: "No reason provided",
};

export default function FineCard(props = defaultProps) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "green";
      case "pending":
        return "orange";
      default:
        return "gray";
    }
  };

  const { student_name, hall, amount, status, reason } = {
    ...defaultProps,
    ...props,
  };

  return (
    <Paper
      radius="sm"
      withBorder
      p="md"
      sx={(theme) => ({
        backgroundColor: theme.white,
        borderColor: theme.colors.gray[3],
      })}
    >
      <Group position="apart" mb="md">
        <Group spacing="xs">
          <Text
            weight={600}
            size="lg"
            color={status === "Pending" ? "red" : "dark"}
          >
            ₹{amount.toLocaleString()}
          </Text>
        </Group>
        <Badge color={getStatusColor(status)} size="md" variant="light">
          {status}
        </Badge>
      </Group>

      <Group grow mb="sm">
        <div>
          <Text size="xs" color="dimmed">
            Student
          </Text>
          <Text size="sm">{student_name}</Text>
        </div>
        <div>
          <Text size="xs" color="dimmed">
            Hall
          </Text>
          <Text size="sm">{hall}</Text>
        </div>
      </Group>

      <Divider my="xs" />

      <div>
        <Text size="xs" color="dimmed" mb="xs">
          Reason
        </Text>
        <Text size="sm">{reason}</Text>
      </div>
    </Paper>
  );
}

FineCard.defaultProps = defaultProps;
