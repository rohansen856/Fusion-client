import React, { useState, useEffect, useMemo } from "react";
import {
  Loader,
  Text,
  Button,
  Button as MantineButton,
  Modal,
} from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";
import { IconDownload } from "@tabler/icons-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import axios from "axios";
import {
  getMCMApplicationsRoute,
  updateMCMStatusRoute,
  scholarshipNotification,
} from "../../../../routes/SPACSRoutes";
import styles from "./MCM_applications.module.css";
import MedalApplications from "./medal_applications";
import { host } from "../../../../routes/globalRoutes";

function MCMApplications() {
  const [activeTab, setActiveTab] = useState("MCM");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileModalOpened, setFileModalOpened] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await fetch(getMCMApplicationsRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const incomplete = data.filter((app) => app.status === "INCOMPLETE");
      console.log(incomplete);
      setApplications(incomplete);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Notification handler
  const handleNotification = async (recipient, type) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await axios.post(
        scholarshipNotification,
        { recipient, type },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (res.status !== 201) console.error("Notification error:", res);
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  // Approval handler
  const handleApproval = async (id, action) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("⛔️ No auth token—cannot approve/reject");
      return;
    }

    const payload = {
      id,
      status:
        action === "approved"
          ? "ACCEPTED"
          : action === "rejected"
            ? "REJECTED"
            : "UNDER_REVIEW",
    };

    console.log("🔼 Sending payload:", payload);

    try {
      const res = await axios.post(updateMCMStatusRoute, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      console.log("✅ Response from server:", res.status, res.data);

      if (res.status === 200) {
        fetchApplications(); // this should refetch data
      } else {
        console.error("⚠️ Unexpected response:", res);
      }
    } catch (err) {
      console.error("❌ Error during approval POST:", err);
      if (err.response) {
        console.error(
          "Response details:",
          err.response.status,
          err.response.data,
        );
      }
    }
  };

  // Combined action
  const handleAction = async (id, action, student) => {
    const confirmed = window.confirm("Are you sure you want to proceed?");
    if (!confirmed) {
      return; // User cancelled
    }
    await handleApproval(id, action);
    let notifType;
    if (action === "approved") notifType = "Accept_MCM";
    else if (action === "rejected") notifType = "Reject_MCM";
    else notifType = "MCM_UNDER_REVIEW";
    await handleNotification(student, notifType);
  };

  // CSV export
  const handleExportAll = () => {
    if (applications.length === 0) {
      alert("No applications to export.");
      return;
    }
    const config = mkConfig({
      fieldSeparator: ",",
      decimalSeparator: ".",
      useKeysAsHeaders: true,
      showLabels: true,
      showTitle: true,
      title: "MCM Applications",
      useBom: true,
    });
    const csv = generateCsv(config)(applications);
    download(config)(csv);
  };

  // Table columns
  const columns = useMemo(
    () => [
      { accessorKey: "student", header: "Roll No" },
      { accessorKey: "annual_income", header: "Income" },
      {
        accessorKey: "files",
        header: "Files",
        Cell: ({ row }) => (
          <Button
            size="xs"
            onClick={() => {
              setSelectedFiles(row.original);
              setFileModalOpened(true);
            }}
          >
            View Files
          </Button>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              color="green"
              size="xs"
              onClick={() =>
                handleAction(row.original.id, "approved", row.original.student)
              }
            >
              Accept
            </Button>
            <Button
              color="red"
              size="xs"
              onClick={() =>
                handleAction(row.original.id, "rejected", row.original.student)
              }
            >
              Reject
            </Button>
            <Button
              color="gray"
              size="xs"
              onClick={() =>
                handleAction(
                  row.original.id,
                  "under_review",
                  row.original.student,
                )
              }
            >
              Under Review
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <div
          role="button"
          tabIndex={0}
          className={activeTab === "MCM" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("MCM")}
        >
          Merit-cum-Means Scholarship
        </div>
        <div
          role="button"
          tabIndex={0}
          className={activeTab === "Medals" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("Medals")}
        >
          Convocation Medals
        </div>
      </div>

      {activeTab === "MCM" && (
        <>
          <Text weight={500} size="lg" mb="md">
            Merit-cum-Means Scholarship
          </Text>
          {loading ? (
            <Loader />
          ) : error ? (
            <Text color="red">{error}</Text>
          ) : (
            <MantineReactTable
              columns={columns}
              data={applications}
              enableRowSelection
              enableSorting
              muiTableBodyCellProps={{
                onClick: (e) => e.stopPropagation(),
              }}
              renderTopToolbarCustomActions={() => (
                <div className={styles.exportButtonWrapper}>
                  <MantineButton
                    leftSection={<IconDownload />}
                    onClick={handleExportAll}
                  >
                    Export All CSV
                  </MantineButton>
                </div>
              )}
              mantineTableBodyRowProps={() => ({
                className: styles.stripedRow,
              })}
            />

          )}
          <Modal
            opened={fileModalOpened}
            onClose={() => setFileModalOpened(false)}
            title="Uploaded Files"
            size="lg"
          >
            {selectedFiles ? (
              <div className={styles.fileModalContainer}>
                {[
                  ["Aadhar Card", selectedFiles.Aadhar_card],
                  ["Affidavit", selectedFiles.Affidavit],
                  ["Bank Details", selectedFiles.Bank_details],
                  ["Fee Receipt", selectedFiles.Fee_Receipt],
                  ["Marksheet", selectedFiles.Marksheet],
                  ["Income Certificate", selectedFiles.income_certificate],
                ].map(([label, path]) =>
                  path ? (
                    <a
                      className={styles.fileLink}
                      key={label}
                      href={`${host}${path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  ) : null,
                )}
              </div>
            ) : (
              <Text>No files found.</Text>
            )}
          </Modal>
        </>
      )}

      {activeTab === "Medals" && <MedalApplications />}
    </div>
  );
}

export default MCMApplications;
