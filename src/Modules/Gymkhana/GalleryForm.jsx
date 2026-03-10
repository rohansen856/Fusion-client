import React, { useState } from "react";
import PropTypes from "prop-types";
import { FileInput, Button, Group, Container, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { host } from "../../routes/globalRoutes/index.jsx";
import "./GymkhanaForms.css";

function GalleryForm({ clubName }) {
  const token = localStorage.getItem("authToken");
  const [file, setFile] = useState(null);

  const mutation = useMutation({
    mutationFn: async (fileToUpload) => {
      const formData = new FormData();
      formData.append("image", fileToUpload);
      formData.append("club_name", clubName);

      const response = await axios.post(
        `${host}/gymkhana/api/upload-gallery-image/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select an image.");
      return;
    }

    mutation.mutate(file, {
      onSuccess: (response) => {
        console.log("Upload successful:", response);
        notifications.show({
          title: "Image uploaded successfully",
          message: <Text fz="sm">Image uploaded</Text>,
          color: "green",
        });
        setFile(null);
      },
      onError: (error) => {
        console.error("Upload failed:", error);
        notifications.show({
          title: "Image upload failed",
          message: <Text fz="sm">Could not forward file</Text>,
          color: "red",
        });
      },
    });
  };

  return (
    <Container>
      <form onSubmit={handleSubmit} className="club-form">
        <h2 className="club-header">Upload an image to the gallery</h2>

        <FileInput
          label="Select Image"
          placeholder="Choose an image"
          accept="image/*"
          value={file}
          onChange={setFile}
          clearable
          required
          disabled={mutation.isLoading}
        />

        <Group position="center" mt="md" className="submit-container">
          {token && (
            <Button
              type="submit"
              className="submit-btn"
              loading={mutation.isLoading}
            >
              Upload
            </Button>
          )}
        </Group>
      </form>
    </Container>
  );
}

GalleryForm.propTypes = {
  clubName: PropTypes.string.isRequired,
};

export default GalleryForm;
