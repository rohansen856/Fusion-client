import { useState, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  Loader,
  Button,
  Flex,
  Center,
  FileInput,
  Textarea,
  Select,
  CheckIcon,
} from "@mantine/core";
import ConfirmationModal from "../../helper/ConfirmationModal";
import { DesignationsContext } from "../../helper/designationContext";
import classes from "../../iwd.module.css";
import { HandleAdminApproval } from "../../handlers/handlers";

function AdminApproval({ form, request, handleBackToList }) {
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const [isSuccessApprove, setIsSuccessApprove] = useState(false);
  const [isSuccessReject, setIsSuccessReject] = useState(false);
  const role = useSelector((state) => state.user.role);
  const designations = useContext(DesignationsContext);
  const [fileAction, setFileAction] = useState("approve");
  const [confirmationModalOpen, setConfirmationModal] = useState(false);
  const designationsList = useMemo(
    () =>
      designations.map(
        (designation) =>
          `${designation.designation.name}|${designation.username}`,
      ),
    [designations],
  );
  return (
    /* eslint-disable react/jsx-props-no-spreading */

    <form
      onSubmit={form.onSubmit((values) => {
        if (form.validate(values)) setConfirmationModal(true);
      })}
    >
      <Flex gap="xs">
        <FileInput
          label="Upload your file"
          placeholder="Choose a file"
          key={form.key("file")}
          my="sm"
          {...form.getInputProps("file")}
        />
      </Flex>
      <Flex direction="column" gap="xl">
        <Textarea
          placeholder="Remarks"
          variant="filled"
          mt="sm"
          style={{ width: "100%" }}
          key={form.key("remarks")}
          {...form.getInputProps("remarks")}
          backgroundColor="#efefef"
          cols={50}
          rows={3}
        />
        <Flex direction="column" gap="xs" justify="flex-start">
          <Select
            mb="sm"
            comboboxProps={{ withinPortal: true }}
            data={designationsList}
            placeholder="IWD Admin"
            label="designation"
            classNames={classes}
            key={form.key("designation")}
            {...form.getInputProps("designation")}
            required
            searchable
            clearable
          />
        </Flex>
      </Flex>
      <Flex gap="xs" my="10px">
        <Button
          size="sm"
          variant="filled"
          color="black"
          type="submit"
          style={{
            width: "auto",
            backgroundColor: "#1E90FF",
            color: isSuccessApprove ? "black" : "white",
            border: "none",
            borderRadius: "20px",
          }}
          disabled={
            isLoadingReject ||
            isSuccessReject ||
            isLoadingApprove ||
            isSuccessApprove
          }
          onClick={() => {
            // e.preventDefault();
            setFileAction("approve");
          }}
        >
          {isLoadingApprove ? (
            <Center>
              <Loader color="black" size="xs" />
            </Center>
          ) : isSuccessApprove ? (
            <Center>
              <CheckIcon size="16px" color="black" />
            </Center>
          ) : (
            "Approve File"
          )}
        </Button>
        <Button
          size="sm"
          variant="filled"
          color="black"
          type="submit"
          style={{
            width: "auto",
            backgroundColor: "#1E90FF",
            color: isSuccessReject ? "black" : "white",
            border: "none",
            borderRadius: "20px",
          }}
          disabled={
            isLoadingReject ||
            isSuccessReject ||
            isLoadingApprove ||
            isSuccessApprove
          }
          onClick={() => {
            // e.preventDefault();
            setFileAction("reject");
          }}
        >
          {isLoadingReject ? (
            <Center>
              <Loader color="black" size="xs" />
            </Center>
          ) : isSuccessReject ? (
            <Center>
              <CheckIcon size="16px" color="black" />
            </Center>
          ) : (
            "Reject File"
          )}
        </Button>
        <ConfirmationModal
          opened={confirmationModalOpen}
          onClose={() => setConfirmationModal(false)}
          onConfirm={() => {
            setConfirmationModal(false);

            form.onSubmit(
              HandleAdminApproval({
                form,
                request,
                setIsLoading:
                  fileAction === "approve"
                    ? setIsLoadingApprove
                    : setIsLoadingReject,
                setIsSuccess:
                  fileAction === "approve"
                    ? setIsSuccessApprove
                    : setIsSuccessReject,
                handleBackToList,
                action: fileAction,
                role,
              }),
            )();
          }}
        />
      </Flex>
    </form>
    /* eslint-enable react/jsx-props-no-spreading */
  );
}
AdminApproval.propTypes = {
  form: PropTypes.isRequired,
  handleBackToList: PropTypes.func.isRequired,
  request: PropTypes.isRequired,
};

export default AdminApproval;
