import React from "react";
import { Box, Text, Group, Badge, Flex, Stack } from "@mantine/core";
import { CalendarBlank, Phone, Notepad } from "@phosphor-icons/react";

const defaultProps = {
  student_name: "",
  roll_num: "",
  reason: "",
  phone_number: "",
  start_date: "",
  end_date: "",
  status: "pending",
  remark: "",
};

export default function LeaveApplicationCard(props = defaultProps) {
  const {
    student_name,
    roll_num,
    reason,
    phone_number,
    start_date,
    end_date,
    status,
    remark,
  } = {
    ...defaultProps,
    ...props,
  };

  const getStatusColor = (currStatus) => {
    switch (currStatus.toLowerCase()) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "yellow";
    }
  };

  const getDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        backgroundColor: theme.white,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      })}
    >
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        gap="md"
      >
        {/* Left Info Section */}
        <Stack spacing="xs" style={{ flex: 1 }}>
          <Group spacing="xs">
            <Text weight={600} size="sm">
              {student_name}
            </Text>
            <Badge size="xs" variant="outline" color="blue">
              {roll_num}
            </Badge>
          </Group>

          <Text size="sm" color="dimmed" style={{ maxWidth: 600 }}>
            {reason}
          </Text>

          <Group spacing="xl" align="center" wrap="wrap">
            <Group spacing={6}>
              <CalendarBlank size={14} color="#5C7CFA" />
              <Text size="xs">
                {start_date} - {end_date}
              </Text>
            </Group>
            <Group spacing={6}>
              <CalendarBlank size={14} color="#5C7CFA" />
              <Text size="xs">{getDuration(start_date, end_date)}</Text>
            </Group>
            <Group spacing={6}>
              <Phone size={14} color="#5C7CFA" />
              <Text size="xs">{phone_number}</Text>
            </Group>
          </Group>

          {remark && (
            <Group spacing={6}>
              <Notepad size={14} color="#5C7CFA" />
              <Text size="xs" color="dimmed">
                Remark:{" "}
                <Text component="span" weight={500}>
                  {remark}
                </Text>
              </Text>
            </Group>
          )}
        </Stack>

        {/* Right Status Badge */}
        <Flex
          direction="column"
          align="flex-end"
          justify="space-between"
          style={{ minWidth: "100px" }}
        >
          <Badge
            color={getStatusColor(status)}
            variant="filled"
            size="sm"
            radius="sm"
            sx={{ textAlign: "center", alignSelf: "flex-end" }}
          >
            {status.toUpperCase()}
          </Badge>
        </Flex>
      </Flex>
    </Box>
  );
}

LeaveApplicationCard.defaultProps = defaultProps;
