import React, { useState, useMemo } from "react";
import { Button, Box, Text, Loader, Container, Title } from "@mantine/core";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconDownload } from "@tabler/icons-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import styles from "./ScholarshipStatus.module.css";
import {
  showMcmStatusRoute,
  showGoldStatusRoute,
  showSilverStatusRoute,
  showPdmStatusRoute,
} from "../../../../routes/SPACSRoutes";

export default function ScholarshipStatus() {
  const [page, setPage] = useState(1);
  const [showStatus, setShowStatus] = useState(false);
  const [applications, setApplications] = useState([]);

  // CSV config
  const csvConfig = useMemo(
    () =>
      mkConfig({
        fieldSeparator: ",",
        decimalSeparator: ".",
        useKeysAsHeaders: true,
        filename: "scholarship_status",
      }),
    [],
  );

  // Fetch handler
  const fetchStatus = async (route) => {
    setShowStatus(true);
    setApplications([]);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(route, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Columns definition
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Application ID", enableSorting: true },
      { accessorKey: "status", header: "Status", enableSorting: true },
    ],
    [],
  );

  // Export helpers
  const handleExportAll = () => {
    const csv = generateCsv(csvConfig)(applications);
    download(csvConfig)(csv);
  };
  const handleExportRows = (rows) => {
    const data = rows.map((r) => r.original);
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  // Table instance
  const table = useMantineReactTable({
    columns,
    data: applications,
    enableSorting: true,
    enableRowSelection: true,
    paginationDisplayMode: "pages",
    renderTopToolbarCustomActions: ({ table }) => (
      <Box className={styles.exportButtons}>
        <div className={styles.export}>
          <Button
            leftIcon={<IconDownload />}
            onClick={handleExportAll}
            disabled={applications.length === 0}
          >
            Export All Data
          </Button>
          <Button
            leftIcon={<IconDownload />}
            onClick={() => handleExportRows(table.getRowModel().rows)}
            disabled={table.getRowModel().rows.length === 0}
          >
            Export Page Rows
          </Button>
          <Button
            leftIcon={<IconDownload />}
            onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
          >
            Export Selected
          </Button>
        </div>
      </Box>
    ),
  });

  // Render a scholarship block
  const renderBlock = (title, route) => (
    <div className={styles.formContainer}>
      <Title order={3} className={styles.scholarshipName}>
        {title}
      </Title>
      {!showStatus ? (
        <Button
          className={styles.checkStatusButton}
          onClick={() => fetchStatus(route)}
        >
          Check Status
        </Button>
      ) : applications.length === 0 ? (
        <Loader size="lg" />
      ) : (
        <MantineReactTable table={table} />
      )}
    </div>
  );

  return (
    <Container className={styles.wrapper}>
      {page === 1 && (
        <div className={styles.scholarshipContainer}>
          <div className={styles.sch}>
            <Text className={styles.scholarshipName}>
              Merit-Cum-Means Scholarship
            </Text>
            <Button
              className={styles.checkStatusButton}
              onClick={() => {
                setPage(2);
                setShowStatus(false);
              }}
            >
              Check Status
            </Button>
          </div>
          <div className={styles.sch}>
            <Text className={styles.scholarshipName}>
              Director's Gold Medal
            </Text>
            <Button
              className={styles.checkStatusButton}
              onClick={() => {
                setPage(3);
                setShowStatus(false);
              }}
            >
              Check Status
            </Button>
          </div>
          <div className={styles.sch}>
            <Text className={styles.scholarshipName}>
              Director's Silver Medal
            </Text>
            <Button
              className={styles.checkStatusButton}
              onClick={() => {
                setPage(4);
                setShowStatus(false);
              }}
            >
              Check Status
            </Button>
          </div>
          <div className={styles.sch}>
            <Text className={styles.scholarshipName}>
              D&M Proficiency Gold Medal
            </Text>
            <Button
              className={styles.checkStatusButton}
              onClick={() => {
                setPage(5);
                setShowStatus(false);
              }}
            >
              Check Status
            </Button>
          </div>
        </div>
      )}

      {page === 2 &&
        renderBlock("Merit-Cum-Means Scholarship", showMcmStatusRoute)}
      {page === 3 && renderBlock("Director's Gold Medal", showGoldStatusRoute)}
      {page === 4 &&
        renderBlock("Director's Silver Medal", showSilverStatusRoute)}
      {page === 5 &&
        renderBlock("D&M Proficiency Gold Medal", showPdmStatusRoute)}
    </Container>
  );
}
