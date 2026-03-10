import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Flex,
  Grid,
  Loader,
  Title,
  Center,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import PropTypes from "prop-types";
import { DateInput } from "@mantine/dates";
import { HandleIssueWorkOrder } from "../handlers/handlers";

function IssueWorkOrderForm({ workOrder, onBack, submitter }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const username = useSelector((state) => state.user.username);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      request_id: workOrder.request_id,
      name: workOrder.name,
      start_date: null,
      alloted_time: null,
      work_issuer: username,
    },
    validate: {
      start_date: (value) => (value ? null : "Field is required"),
      alloted_time: (value) => (value ? null : "Field is required"),
    },
  });
  console.log(form);
  const labelStyles = {
    label: {
      color: "#1a1a1a",
      fontWeight: 600,
      marginBottom: "8px",
    },
  };

  return (
    /* eslint-disable react/jsx-props-no-spreading */
    <Grid>
      <div
        style={{
          maxWidth: "100%",
          width: "100%",
          margin: "0 auto",
          padding: "1rem",
        }}
      >
        <form
          onSubmit={form.onSubmit((data) => {
            console.log(data);
            HandleIssueWorkOrder({
              data,
              setIsLoading,
              setIsSuccess,
              submitter,
            });
          })}
        >
          <Flex
            direction="column"
            gap="lg"
            style={{ textAlign: "left", fontFamily: "Arial" }}
          >
            <Title align="center" pb="lg">
              Issue Work Order
            </Title>

            {/* Request ID & Title */}
            <Grid columns={12} gutter="md" mb="md">
              <Grid.Col span={4} pr="md">
                <TextInput
                  label="Request ID"
                  disabled
                  key={form.key("request_id")}
                  {...form.getInputProps("request_id")}
                  styles={labelStyles}
                />
              </Grid.Col>
              <Grid.Col span={4} pr="md">
                <TextInput
                  label="Request Title"
                  disabled
                  key={form.key("name")}
                  {...form.getInputProps("name")}
                  styles={labelStyles}
                />
              </Grid.Col>
              <Grid.Col span={4} pr="md">
                <TextInput
                  label="Work Issued By"
                  placeholder="Work Issued By"
                  disabled
                  key={form.key("work_issuer")}
                  {...form.getInputProps("work_issuer")}
                  styles={labelStyles}
                />
              </Grid.Col>
            </Grid>

            <Grid columns={12} gutter="md" mb="md">
              <Grid.Col span={6} pr="md">
                <TextInput
                  label="Allotted Time"
                  placeholder="Enter allotted time"
                  key={form.key("alloted_time")}
                  {...form.getInputProps("alloted_time")}
                  styles={labelStyles}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <DateInput
                  label="Start Date"
                  placeholder="yyyy/mm/dd"
                  key={form.key("start_date")}
                  {...form.getInputProps("start_date")}
                  valueFormat="YYYY-MM-DD"
                  minDate={new Date()}
                  styles={{
                    ...labelStyles,
                    calendarHeader: {
                      color: "#1E90FF",
                      fontSize: "200px",
                      fontWeight: "bold",
                    },
                    calendarHeaderIcon: {
                      color: "#00796b",
                      fontSize: "20px",
                      fontWeight: "bold",
                    },
                    dropdown: { maxHeight: "350px", overflow: "auto" },
                    calendar: { fontSize: "14px" },
                  }}
                  required
                />
              </Grid.Col>
            </Grid>

            {/* Buttons */}
            <Flex direction="row" gap="md" mb="md">
              <Button
                size="sm"
                variant="filled"
                type="submit"
                radius="sm"
                disabled={isLoading || isSuccess}
              >
                {isLoading ? (
                  <Center>
                    <Loader color="black" size="xs" />
                  </Center>
                ) : isSuccess ? (
                  <Center>
                    <span>✓</span>
                  </Center>
                ) : (
                  "Submit"
                )}
              </Button>
              <Button size="sm" variant="light" color="gray" onClick={onBack}>
                Back
              </Button>
            </Flex>
          </Flex>
        </form>
      </div>
    </Grid>
  );
}

IssueWorkOrderForm.propTypes = {
  workOrder: PropTypes.shape({
    request_id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    area: PropTypes.string,
    "created-by": PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  submitter: PropTypes.func.isRequired,
};

export default IssueWorkOrderForm;
