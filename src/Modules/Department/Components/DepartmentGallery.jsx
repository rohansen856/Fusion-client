import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { host } from "../../../routes/globalRoutes"; // Ensure this host is correctly set

export default function DepartmentGallery({ branch }) {
  const [data, setData] = useState({
    gallery_images: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${host}/dep/api/facilities/`);
        const result = await response.json();

        // Filter facilities by branch and collect their pictures
        const branchFacilities = result.filter(
          (facility) => facility.branch === branch,
        );

        // Extract image paths from the filtered facilities data
        const galleryImages = branchFacilities.map(
          (facility) => facility.picture,
        );

        setData({
          gallery_images: galleryImages || [],
        });
      } catch (error) {
        console.error("Error fetching facility data:", error);
      }
    };

    fetchData();
  }, [branch]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "80%",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          transition: "box-shadow 0.3s ease-in-out",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            color: "#000",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Department Facility Gallery
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {data.gallery_images.length > 0 ? (
            data.gallery_images.map((image, index) => (
              <div
                key={index}
                style={{ borderRadius: "8px", overflow: "hidden" }}
              >
                <img
                  src={`${host}${image}`} // Concatenate host with image path
                  alt={`Facility ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
            ))
          ) : (
            <p>No gallery images available.</p>
          )}
        </div>

        <div
          style={{
            height: "1px",
            backgroundColor: "#000",
            width: "100%",
            marginBottom: "15px",
          }}
        />
      </div>
    </div>
  );
}

DepartmentGallery.propTypes = {
  branch: PropTypes.string.isRequired,
};
