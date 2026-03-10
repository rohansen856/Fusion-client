import { useState } from "react";
import { Button, FileInput, Flex, Group, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";
import {
  uploadYearlyPlanExcel,
  useGetClubPositionData,
} from "./BackendLogic/ApiRoutes";
import { host } from "../../routes/globalRoutes";

export default function UploadForm({ clubName }) {
  const [file, setFile] = useState(null);
  const token = localStorage.getItem("authToken");

  const { data: CurrentLogginedRelatedClub = [] } =
    useGetClubPositionData(token);
  const FICName =
    CurrentLogginedRelatedClub.find(
      (c) => c.club === clubName && c.position === "FIC",
    )?.name || null;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("File is required");

      // First, create the file by hitting the filetracking API:
      const fileFormData = new FormData();
      fileFormData.append("designation", "co-ordinator");
      fileFormData.append("receiver_username", FICName);
      fileFormData.append("receiver_designation", "FIC");
      fileFormData.append("subject", "Yearly_planner");
      fileFormData.append("description", `${clubName} Yearly Plan details`);
      fileFormData.append("src_module", "Gymkhana");
      // fileFormData.append("remarks", "Created file by Coordinator"); // Optional

      if (file) {
        fileFormData.append("files", file);
      }

      const fileRes = await axios.post(
        `${host}/filetracking/api/file/`,
        fileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
        },
      );

      // Get the file_id from the file creation response
      const { file_id } = fileRes.data;

      const formData = new FormData();
      formData.append("club", clubName);
      formData.append("file", file);
      formData.append("file_id", file_id); // Append the file_id to the form data

      const response = await uploadYearlyPlanExcel(formData, token);

      console.log("File uploaded successfully:", response.data);
      // Prepare FormData for file forwarding
      const forwardFormData = new FormData();
      forwardFormData.append("receiver", FICName);
      forwardFormData.append("receiver_designation", "FIC");
      forwardFormData.append("remarks", "Approved by Co-ordinator");
      forwardFormData.append(
        "file_extra_JSON",
        JSON.stringify({
          approved_by: "FIC",
          approved_on: new Date().toISOString(),
        }),
      );

      await axios.post(
        `${host}/filetracking/api/forwardfile/${file_id}/`,
        forwardFormData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: "File uploaded successfully",
        message: (
          <Flex gap="4px">
            <Text fz="sm">File uploaded successfully</Text>
          </Flex>
        ),
        color: "green",
      });

      console.log("Server response:", data);
    },
    onError: (error) => {
      console.error("Error during posting comment", error);
    },
  });

  const handleUpload = () => {
    mutation.mutate();
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <FileInput
        label="Upload File"
        placeholder="Pick file"
        value={file}
        onChange={setFile}
        required
        mt="md"
      />
      <Group position="right" mt="md">
        <Button onClick={handleUpload} loading={mutation.isPending}>
          Upload
        </Button>
      </Group>
      {mutation.error && (
        <Text c="red" mt="sm">
          {mutation.error.message}
        </Text>
      )}
    </div>
  );
}
UploadForm.propTypes = {
  clubName: PropTypes.string.isRequired,
};
