import React, { useEffect, useState } from "react";
import { Button, Text, Table, LoadingOverlay } from "@mantine/core";
import { ArrowCircleDown } from "@phosphor-icons/react";
import { fetchDocuments } from "../../../services/documentService.jsx";

function DownloadsSection() {
  const [downloadsData, setDownloadsData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Track which button is hovered (by id)
  const [hoveredBtn, setHoveredBtn] = useState(null);

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

  // Inline styles for button, including hover effect
  const getButtonStyle = (isHovered) => ({
    fontSize: "0.85rem",
    backgroundColor: isHovered ? "#0073e6" : "#fff",
    color: isHovered ? "#fff" : "#0073e6",
    border: "1px solid #0073e6",
    fontWeight: 500,
    transition: "all 0.18s",
    boxShadow: isHovered ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
  });

  return (
    <div
      id="pms-director-downloads-container"
      style={{
        position: "relative",
        margin: "10px",
        width: "100%",
        marginRight: "20px",
      }}
    >
      <style>
        {`
          #pms-director-downloads-table {
            align: center;
            justify-content: space-between;
            width: 98%;
            border-collapse: collapse;
          }

          #pms-director-downloads-table th,
          #pms-director-downloads-table td {
            padding: 12px;
            border: 1px solid #ddd;
          }

          #pms-director-downloads-table-thead{
            background-color:rgb(236, 237, 237);
          }

          #pms-director-downloads-table tbody tr:nth-child(odd) {
            background-color: #f9f9f9;
          }

          #pms-director-downloads-table tbody tr:nth-child(even) {
            background-color: #ffffff;
          }

          #pms-director-downloads-table tbody tr:hover {
            background-color: #f5f7f8;
          }

          #pms-director-section-title {
            font-size: 24px;
            font-weight: 600;
            margin-top: 20px
          }
        `}
      </style>

      <LoadingOverlay visible={loading} overlayBlur={2} />

      <Text align="left" id="pms-director-section-title" mb={10}>
        Documents & Downloads
      </Text>

      <div style={{ overflowX: "auto", width: "100%" }}>
        <Table id="pms-director-downloads-table">
          <Table.Thead>
            <Table.Tr>
              <Table.Th id="pms-director-downloads-table-thead">S.No.</Table.Th>
              <Table.Th id="pms-director-downloads-table-thead">
                Document Title
              </Table.Th>
              <Table.Th id="pms-director-downloads-table-thead">
                Download
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <tbody>
            {downloadsData.map((download, index) => (
              <tr key={download.id}>
                <td>{index + 1}</td>
                <td>{download.title}</td>
                <td style={{ textAlign: "center" }}>
                  <Button
                    component="a"
                    href={download.link}
                    target="_blank"
                    color="blue"
                    variant="outline"
                    id="pms-director-download-button"
                    style={getButtonStyle(hoveredBtn === download.id)}
                    onMouseEnter={() => setHoveredBtn(download.id)}
                    onMouseLeave={() => setHoveredBtn(null)}
                  >
                    <ArrowCircleDown size={16} style={{ marginRight: "8px" }} />
                    Download
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default DownloadsSection;
