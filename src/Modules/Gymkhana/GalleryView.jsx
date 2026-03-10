import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Card,
  Image,
  Text,
  SimpleGrid,
  Container,
  Loader,
  Center,
} from "@mantine/core";
import { host } from "../../routes/globalRoutes/index.jsx";

function GalleryView({ clubName }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async (authToken) => {
    try {
      const response = await axios.get(
        `${host}/gymkhana/api/list-gallery-images/?club_name=${clubName}`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );
      setImages(response.data.images);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      fetchImages(storedToken);
    } else {
      setLoading(false);
      console.warn("No auth token found. Skipping image fetch.");
    }
  }, [clubName]);

  return (
    <Container className="club-form">
      <h2 className="club-header">Gallery</h2>

      {loading ? (
        <Center>
          <Loader />
        </Center>
      ) : images.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="lg">
          {images.map((imgPath, idx) => (
            <Card key={idx} shadow="sm" padding="md" radius="md" withBorder>
              <Card.Section style={{ overflow: "hidden", height: 200 }}>
                <Image
                  src={`${host}/media/${imgPath}`}
                  alt={`gallery-${idx}`}
                  height={200}
                  fit="cover"
                  style={{ objectPosition: "center" }}
                />
              </Card.Section>
              <Text align="center" size="sm" mt="sm">
                {imgPath.split("/").pop()}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Center>No images found.</Center>
      )}
    </Container>
  );
}

GalleryView.propTypes = {
  clubName: PropTypes.string.isRequired,
};

export default GalleryView;
