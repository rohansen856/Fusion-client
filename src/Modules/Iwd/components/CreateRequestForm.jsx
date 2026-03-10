import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Paperclip } from "@phosphor-icons/react";
import {
  Button,
  Flex,
  Grid,
  Loader,
  Paper,
  Title,
  Textarea,
  Center,
  CheckIcon,
  TextInput,
  FileInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import PropTypes from "prop-types";
// import { DesignationsContext } from "../helper/designationContext";
import ConfirmationModal from "../helper/ConfirmationModal";
import { HandleRequest } from "../handlers/handlers";

function CreateRequest({ setActiveTab }) {
  const role = useSelector((state) => state.user.role);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmationModalOpen, setConfirmationModal] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: null,
      description: null,
      area: null,
      designation: "Admin IWD|kunal",
      file: null,
    },
    validate: {
      name: (value) => (value ? null : "Field is required"),
      description: (value) => (value ? null : "Field is required"),
      area: (value) => (value ? null : "Field is required"),
      designation: (value) => (value ? null : "Field is required"),
    },
  });
  return (
    /* eslint-disable react/jsx-props-no-spreading */

    <Grid mt="md">
      <div
        style={{
          maxWidth: "100vw",
          width: "100vw",
          margin: "0 auto",
          padding: "1rem",
        }}
      >
        <form
          onSubmit={form.onSubmit((values) => {
            if (form.validate(values)) setConfirmationModal(true);
          })}
        >
          <Paper
            radius="md"
            px="lg"
            py="xl"
            style={{
              maxHeight: "70vh",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.15)",
            }}
            withBorder
            backgroundColor="white"
          >
            <Flex
              direction="column"
              gap="lg"
              style={{ textAlign: "left", width: "100%", fontFamily: "Arial" }}
            >
              <Flex direction="column" align="center" mt="lg">
                <Title>New Request</Title>
              </Flex>

              <Flex direction="column" gap="xs" justify="flex-start">
                <TextInput
                  label="Title"
                  required
                  placeholder="Title"
                  key={form.key("name")}
                  {...form.getInputProps("name")}
                  styles={{
                    label: {
                      color: "#1a1a1a",
                      fontWeight: 600,
                      marginBottom: "8px",
                    },
                  }}
                />
              </Flex>

              <Flex direction="column" gap="xs">
                <Textarea
                  placeholder="Description"
                  required
                  variant="filled"
                  style={{ width: "100%" }}
                  key={form.key("description")}
                  {...form.getInputProps("description")}
                  backgroundColor="#efefef"
                  cols={50}
                  rows={3}
                  label="Description"
                  styles={{
                    label: {
                      color: "#1a1a1a",
                      fontWeight: 600,
                      marginBottom: "8px",
                    },
                  }}
                />
              </Flex>

              <Flex direction="column" gap="xs" justify="flex-start">
                <TextInput
                  label="Area"
                  required
                  placeholder="Area"
                  key={form.key("area")}
                  {...form.getInputProps("area")}
                  styles={{
                    label: {
                      color: "#1a1a1a",
                      fontWeight: 600,
                      marginBottom: "8px",
                    },
                  }}
                />
              </Flex>
              <Flex gap="xs">
                <FileInput
                  label="Upload any additional documents"
                  placeholder="Choose a file"
                  key={form.key("file")}
                  my="sm"
                  radius="md"
                  size="md"
                  icon={<Paperclip size={18} />}
                  styles={{
                    input: {
                      backgroundColor: "#f8f9fa",
                      borderColor: "silver",
                      fontWeight: 500,
                    },
                    label: {
                      color: "#1a1a1a",
                      fontWeight: 600,
                      marginBottom: "8px",
                    },
                  }}
                  {...form.getInputProps("file")}
                />
              </Flex>
              <Button
                size="sm"
                variant="filled"
                type="submit"
                radius="sm"
                color="green"
                disabled={isLoading || isSuccess}
                style={{ maxWidth: "100px" }}
              >
                {isLoading ? (
                  <Center>
                    <Loader color="black" size="xs" />
                  </Center>
                ) : isSuccess ? (
                  <Center>
                    <CheckIcon size="16px" color="black" />
                  </Center>
                ) : (
                  "Submit"
                )}
              </Button>
            </Flex>
          </Paper>
          <ConfirmationModal
            opened={confirmationModalOpen}
            onClose={() => setConfirmationModal(false)}
            onConfirm={() => {
              setConfirmationModal(false);

              form.onSubmit(
                HandleRequest({
                  setIsLoading,
                  setIsSuccess,
                  setActiveTab,
                  role,
                  form,
                }),
              )();
            }}
          />
        </form>
      </div>
    </Grid>
    /* eslint-enable react/jsx-props-no-spreading */
  );
}
CreateRequest.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};
export default CreateRequest;
