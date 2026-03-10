import React, { useEffect, useState } from "react";
import { Button, Text, Table, LoadingOverlay } from "@mantine/core";
import { ArrowCircleDown } from "@phosphor-icons/react";
import { fetchDocuments } from "../../../services/documentService.jsx";

function DownloadsSection() {
  const [downloadsData, setDownloadsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments();
      setDownloadsData(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      alert("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "20px auto 40px auto",
        padding: "0 20px",
        position: "relative",
      }}
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />

      <Text
        style={{
          fontSize: "24px",
          fontWeight: 600,
          color: "#1976d2",
          margin: "20px 0",
          width: "100%",
          textAlign: "left",
        }}
      >
        Documents & Downloads
      </Text>

      <div style={{ overflowX: "auto", width: "100%" }}>
        <Table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #e5edf1",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: "5%",
                  background: "rgb(244, 246, 246)",
                  fontWeight: 600,
                  padding: "16px 20px",
                  borderBottom: "2px solid #e5edf1",
                  borderRight: "1px solid #e5edf1",
                }}
              >
                S.No.
              </th>
              <th
                style={{
                  width: "75%",
                  background: "rgb(244, 246, 246)",
                  fontWeight: 600,
                  padding: "16px 20px",
                  borderBottom: "2px solid #e5edf1",
                  borderRight: "1px solid #e5edf1",
                }}
              >
                Document Title
              </th>
              <th
                style={{
                  width: "20%",
                  background: "rgb(244, 246, 246)",
                  fontWeight: 600,
                  padding: "16px 20px",
                  textAlign: "center",
                }}
              >
                Download
              </th>
            </tr>
          </thead>
          <tbody>
            {downloadsData.map((download, index) => {
              const isHovered = hoveredRow === index;
              return (
                <tr
                  key={download.id}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    backgroundColor: isHovered
                      ? "#f0f4fa"
                      : index % 2 === 0
                        ? "#f8fbff"
                        : "#ffffff",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid #e5edf1",
                      borderRight: "1px solid #e5edf1",
                      color: "#000",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid #e5edf1",
                      borderRight: "1px solid #e5edf1",
                      color: "#000",
                    }}
                  >
                    {download.title}
                  </td>
                  <td
                    style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid #e5edf1",
                      textAlign: "center",
                    }}
                  >
                    <Button
                      component="a"
                      href={download.link}
                      target="_blank"
                      variant="outline"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: isHovered ? "#1976d2" : "#fff",
                        color: isHovered ? "#fff" : "#1976d2",
                        border: "1.5px solid #1976d2",
                        borderRadius: "6px",
                        padding: "6px 14px",
                        fontWeight: 500,
                        transition: "all 0.18s",
                      }}
                    >
                      <ArrowCircleDown size={16} />
                      Download
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default DownloadsSection;
