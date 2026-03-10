import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Box, Button, Select, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import {
  getDirectorGoldApplicationsRoute,
  getDirectorSilverApplicationsRoute,
  getProficiencyDMApplicationsRoute,
  updateDirectorGoldStatusRoute,
  updateDirectorSilverStatusRoute,
  updateProficiencyDMStatusRoute,
  scholarshipNotification,
} from "../../../../routes/SPACSRoutes";
import { host } from "../../../../routes/globalRoutes";
import styles from "./medal_applications.module.css";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

function MedalApplications() {
  const [selectedAward, setSelectedAward] = useState("Director's Silver Medal");
  const [medals, setMedals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMedalsData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      let apiUrl = getDirectorSilverApplicationsRoute;
      if (selectedAward === "Director's Gold Medal")
        apiUrl = getDirectorGoldApplicationsRoute;
      if (selectedAward === "D&M Proficiency Gold Medal")
        apiUrl = getProficiencyDMApplicationsRoute;

      const { data } = await axios.get(apiUrl, {
        headers: { Authorization: `Token ${token}` },
      });
      const incomplete = data.filter((m) => m.status === "INCOMPLETE");
      setMedals(incomplete);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error loading medals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedalsData();
  }, [selectedAward]);

  // Notification & approval
  const handleNotification = async (recipient, type) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      await axios.post(
        scholarshipNotification,
        { recipient, type },
        { headers: { Authorization: `Token ${token}` } },
      );
    } catch (err) {
      console.error("Notification error", err);
    }
  };

  const handleApproval = async (id, action) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");
      let apiUrl = updateDirectorSilverStatusRoute;
      let payload = {
        id,
        status: action === "approved" ? "ACCEPTED" : "REJECTED",
      };
      if (selectedAward === "Director's Gold Medal") {
        apiUrl = updateDirectorGoldStatusRoute;
        payload = { id, action: action === "approved" ? "accept" : "reject" };
      }
      if (selectedAward === "D&M Proficiency Gold Medal") {
        apiUrl = updateProficiencyDMStatusRoute;
        payload = {
          id,
          status: action === "approved" ? "ACCEPTED" : "REJECTED",
        };
      }
      await axios.post(apiUrl, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchMedalsData();
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error updating status");
    }
  };

  const handleAction = async (id, action, student) => {
    const confirmed = window.confirm("Are you sure you want to proceed?");
    if (!confirmed) {
      return; // User cancelled
    }
    await handleApproval(id, action);
    let notifType = "";
    if (action === "approved" && selectedAward.includes("Silver"))
      notifType = "Accept_Silver";
    if (action === "rejected" && selectedAward.includes("Silver"))
      notifType = "Reject_Silver";
    if (action === "approved" && selectedAward.includes("Gold"))
      notifType = "Accept_Gold";
    if (action === "rejected" && selectedAward.includes("Gold"))
      notifType = "Reject_Gold";
    if (selectedAward === "D&M Proficiency Gold Medal")
      notifType = action === "approved" ? "Accept_DM" : "Reject_DM";
    await handleNotification(student, notifType);
  };

  // CSV Exports
  const handleExportRows = (rows) => {
    const csv = generateCsv(csvConfig)(rows.map((r) => r.original));
    download(csvConfig)(csv);
  };
  const handleExportAll = () =>
    handleExportRows(medals.map((m) => ({ original: m })));

  // Marksheets ZIP
  const handleDownloadAllMarksheets = async () => {
    if (!medals.length) return alert("No medals to download");

    const zip = new JSZip();

    const token = localStorage.getItem("authToken");

    // Loop through each medal and fetch the marksheet file
    await Promise.all(
      medals.map(async (medal, index) => {
        try {
          const url = `${host}${medal.Marksheet}`;
          const response = await fetch(url, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });

          if (!response.ok)
            throw new Error(`Failed to fetch file for ${medal.student}`);

          const blob = await response.blob();
          const fileName = `${medal.student}${index}_marksheet.${blob.type.split("/")[1] || "pdf"}`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error(
            `Error downloading marksheet for ${medal.student}:`,
            error,
          );
        }
      }),
    );

    // Generate zip and trigger download
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "All_Marksheets.zip");
    });
  };

  // Table columns
  const columns = useMemo(
    () => [
      { accessorKey: "student", header: "Roll No" },
      { id: "award", header: "Award", accessorFn: () => selectedAward },
      {
        accessorKey: "Marksheet",
        header: "File",
        Cell: ({ cell }) => (
          <a
            href={`${host}${cell.getValue()}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button} ${styles.fileButton}`}
          >
            View Marksheet
          </a>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        Cell: ({ row }) => (
          <Box className={styles.statusButtons}>
            <Button
              size="xs"
              color="green"
              onClick={() =>
                handleAction(row.original.id, "approved", row.original.student)
              }
            >
              Approve
            </Button>
            <Button
              size="xs"
              color="red"
              onClick={() =>
                handleAction(row.original.id, "rejected", row.original.student)
              }
            >
              Reject
            </Button>
          </Box>
        ),
      },
    ],
    [selectedAward],
  );

  // Table instance
  const table = useMantineReactTable({
    columns,
    data: medals,
    enableSorting: true,
    enableRowSelection: true,
    positionToolbarAlertBanner: "bottom",
    renderTopToolbarCustomActions: ({ table }) => (
      <Box className={styles.exportButtons}>
        <div className={styles.export}>
          <Button leftIcon={<IconDownload />} onClick={handleExportAll}>
          Export CSV (All)
        </Button>
        <Button
          leftIcon={<IconDownload />} 
          disabled={ 
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
        >
          Export CSV (Selected)
        </Button>
        <Button
          color="gray"
          leftIcon={<IconDownload />}
          onClick={handleDownloadAllMarksheets}
        >
          Download Marksheets ZIP
        </Button>
        </div>
      </Box>
    ),
    getRowProps: ({ row }) => ({
      className: styles.stripedRow,
    }),
  });

  return (
    <div className={styles.container}>
      <Text size="xl" weight={500} mb="sm">
        Medal Applications
      </Text>
      <Select
        value={selectedAward}
        onChange={setSelectedAward}
        data={[
          {
            value: "Director's Silver Medal",
            label: "Director's Silver Medal",
          },
          { value: "Director's Gold Medal", label: "Director's Gold Medal" },
          {
            value: "D&M Proficiency Gold Medal",
            label: "D&M Proficiency Gold Medal",
          },
        ]}
      />
      {isLoading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : (
        <MantineReactTable table={table} />
      )}
    </div>
  );
}

export default MedalApplications;
