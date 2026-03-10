import React, { useState } from "react";
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
import ConfirmationModal from "../../../helper/ConfirmationModal";
import { HandleAddVendor } from "../../../handlers/handlers";

export default function AddVendor({ onBack, work_id }) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationModalOpen, setConfirmationModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: null,
      contact_number: null,
      email_address: null,
      country_code: "+91",
      work: work_id,
    },
    validate: {
      contact_number: (value) =>
        value && /^[0-9]{10}$/.test(value)
          ? null
          : "Invalid phone number. Must be 10 digits.",
      email_address: (value) =>
        value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : "Invalid email address",
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
            if (form.validate(data)) setConfirmationModal(true);
          })}
        >
          <Flex
            direction="column"
            gap="lg"
            style={{ textAlign: "left", fontFamily: "Arial" }}
          >
            <Title align="center" py="lg">
              Add Vendor
            </Title>

            {/* Request ID & Title */}
            <Grid columns={12} gutter="md" mb="md">
              <Grid.Col span={6} pr="md">
                <TextInput
                  label="Work ID"
                  disabled
                  key={form.key("work")}
                  {...form.getInputProps("work")}
                  styles={labelStyles}
                />
              </Grid.Col>
              <Grid.Col span={6} pr="md">
                <TextInput
                  label="Vendor Name"
                  required
                  key={form.key("name")}
                  {...form.getInputProps("name")}
                  styles={labelStyles}
                />
              </Grid.Col>
            </Grid>

            <Grid columns={12} gutter="md" mb="md">
              <Grid.Col span={2} pr="md">
                <TextInput
                  label="Country Code"
                  placeholder="+91"
                  required
                  key={form.key("country_code")}
                  {...form.getInputProps("country_code")}
                  styles={labelStyles}
                />
              </Grid.Col>
              <Grid.Col span={4} pr="md">
                <TextInput
                  label="Contact Number"
                  placeholder="XXXXXXXXXX"
                  required
                  key={form.key("contact_number")}
                  {...form.getInputProps("contact_number")}
                  styles={labelStyles}
                />
              </Grid.Col>
              <Grid.Col span={6} pr="md">
                <TextInput
                  label="Email Address"
                  required
                  placeholder="example@domain.com"
                  key={form.key("email_addres")}
                  {...form.getInputProps("email_address")}
                  styles={labelStyles}
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
          <ConfirmationModal
            opened={confirmationModalOpen}
            onClose={() => setConfirmationModal(false)}
            onConfirm={() => {
              setConfirmationModal(false);

              form.onSubmit(
                HandleAddVendor({ form, setIsLoading, setIsSuccess, onBack }),
              )();
            }}
          />
        </form>
      </div>
    </Grid>
  );
}

AddVendor.propTypes = {
  work_id: PropTypes.number,
  onBack: PropTypes.func.isRequired,
};
