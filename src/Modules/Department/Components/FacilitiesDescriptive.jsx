import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FaPhoneAlt, FaEnvelope, FaEye } from "react-icons/fa"; // Import the eye icon
import { host } from "../../../routes/globalRoutes";

export default function FacilitiesDescriptive({ branch }) {
  const [data, setData] = useState({
    phone_number: "",
    email: "",
  });

  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${host}/dep/api/information/`);
        const result = await response.json();

        const branchData = result.find((item) => {
          switch (branch) {
            case "CSE":
              return item.department === 51;
            case "ECE":
              return item.department === 30;
            case "ME":
              return item.department === 37;
            case "SM":
              return item.department === 53;
            case "DS":
              return item.department === 44;
            case "Natural Science":
              return item.department === 31;
            default:
              return null;
          }
        });

        setData({
          phone_number: branchData?.phone_number || "NA",
          email: branchData?.email || "NA",
        });
      } catch (error) {
        console.error("Error fetching information data:", error);
      }
    };

    const fetchFacilities = async () => {
      const token = localStorage.getItem("authToken");

      try {
        const res = await fetch(`${host}/dep/api/facilities/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(
            "Failed to fetch facilities. Unauthorized or server error.",
          );
        }

        const facilitiesData = await res.json();
        const filtered = facilitiesData.filter((f) => f.branch === branch);
        setFacilities(filtered);
      } catch (error) {
        console.error("Error fetching facilities:", error);
      }
    };

    fetchData();
    fetchFacilities();
  }, [branch]);

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, "_blank"); // Opens the image in a new tab
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "20px",
      }}
    >
      {/* Contact Info Section */}
      <div
        style={{
          width: "80%",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 6px 30px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaPhoneAlt
            style={{
              fontSize: "24px",
              color: "#28a745",
              marginRight: "10px",
            }}
          />
          <p style={{ fontSize: "18px", color: "#333", fontWeight: "600" }}>
            {data.phone_number}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaEnvelope
            style={{
              fontSize: "24px",
              color: "#007bff",
              marginRight: "10px",
            }}
          />
          <p style={{ fontSize: "18px", color: "#333", fontWeight: "600" }}>
            {data.email}
          </p>
        </div>
      </div>

      {/* Facilities Scrollable Section */}
      <div style={{ width: "100%", maxWidth: "1200px" }}>
        <h3
          style={{
            marginBottom: "24px",
            fontSize: "24px",
            color: "#333",
            fontWeight: "700",
          }}
        >
          Department Facilities
        </h3>
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "24px",
            paddingBottom: "1rem",
            paddingTop: "1rem",
          }}
        >
          {facilities.map((facility) => (
            <div
              key={facility.id}
              style={{
                minWidth: "300px",
                flexShrink: 0,
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "12px",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
              }}
              // eslint-disable-next-line no-return-assign
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              // eslint-disable-next-line no-return-assign
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <img
                src={`${host}${facility.picture}`}
                alt={facility.name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              />
              {/* Eye icon button */}
              <button
                onClick={() => openImageInNewTab(`${host}${facility.picture}`)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  border: "none",
                  borderRadius: "50%",
                  padding: "8px",
                  fontSize: "18px",
                  color: "#007bff",
                  cursor: "pointer",
                }}
                title="View Image"
              >
                <FaEye />
              </button>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "18px",
                  color: "#222",
                  fontWeight: "600",
                  lineHeight: "1.4",
                }}
              >
                {facility.name}
              </h4>
              <p style={{ margin: "0", fontSize: "14px", color: "#777" }}>
                Location: {facility.location}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#777" }}>
                Quantity: {facility.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

FacilitiesDescriptive.propTypes = {
  branch: PropTypes.string.isRequired,
};
