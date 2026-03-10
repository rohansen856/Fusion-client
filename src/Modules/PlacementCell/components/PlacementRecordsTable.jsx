import React, { useEffect, useState, useMemo } from "react";
import { Title, Container, Button, Loader, Alert } from "@mantine/core";
import axios from "axios";
import { MantineReactTable } from "mantine-react-table";
import { useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import AddPlacementRecordForm from "./AddPlacementRecordForm";
import {
  deletePlacementStatsRoute,
  fetchPlacementStatsRoute,
} from "../../../routes/placementCellRoutes";

function PlacementRecordsTable() {
  const role = useSelector((state) => state.user.role);

  const [placementStats, setPlacementStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchPlacementStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(fetchPlacementStatsRoute, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (response.status === 200) {
          setPlacementStats(response.data);
        } else {
          setPlacementStats(response.data);
          notifications.show({
            title: "No data available",
            message: `No data available: ${response.status}`,
            color: "red",
          });
        }
      } catch (err) {
        setError("Failed to fetch placement statistics");
        notifications.show({
          title: "Failed to fetch data",
          message: "Failed to fetch placement statistics",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementStats();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this record id:${id}?`,
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `${deletePlacementStatsRoute}${id}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200) {
        notifications.show({
          title: "Record deleted",
          message: "Record successfully deleted!",
          color: "green",
        });
        setPlacementStats((prevStats) =>
          prevStats.filter((record) => record.id !== id),
        );
      } else {
        notifications.show({
          title: "Failed to delete record",
          message: "Unable to delete the record.",
          color: "red",
        });
      }
    } catch (err) {
      console.error("Error deleting record:", err);
      notifications.show({
        title: "Failed to delete record",
        message: "An error occured while deleting the record.",
        color: "red",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "first_name",
        header: "Student Name",
        size: 200,
      },
      {
        accessorKey: "placement_name",
        header: "Company",
        size: 200,
      },
      {
        accessorKey: "batch",
        header: "Batch",
        size: 150,
      },
      {
        accessorKey: "branch",
        header: "Branch",
        size: 150,
      },
      {
        accessorKey: "ctc",
        header: "CTC",
        size: 120,
      },
      ...(role === "placement officer"
        ? [
            {
              accessorKey: "actions",
              header: "Actions",
              // eslint-disable-next-line react/no-unstable-nested-components, react/prop-types
              Cell: ({ row }) => (
                <Button
                  color="red"
                  size="xs"
                  // eslint-disable-next-line react/prop-types
                  onClick={() => handleDelete(row.original.id)}
                >
                  Delete
                </Button>
              ),
              size: 100,
            },
          ]
        : []),
    ],
    [role],
  );

  const paginatedRecords = placementStats.slice(
    (1 - 1) * recordsPerPage, // removed activePage var as it was always set to 1, Module team need to fix if not working as expected
    1 * recordsPerPage,
  );

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Container fluid>
      <Container
        fluid
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        my={16}
      >
        <Title order={2}>Placement Statistics</Title>
        {role === "placement officer" && (
          <Button
            onClick={() => setModalOpened(true)}
            variant="outline"
            style={{ marginLeft: "auto", marginRight: 0 }}
          >
            Add Placement Record
          </Button>
        )}
      </Container>

      <AddPlacementRecordForm
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />

      <Container fluid>
        <Title order={3} style={{ marginBottom: "12px" }}>
          All Students
        </Title>

        {placementStats.length > 0 ? (
          <MantineReactTable
            columns={columns}
            data={paginatedRecords}
            // enableColumnOrdering
            // enableGlobalFilter
            // enableRowOrdering
            // mantineColumnActionsButtonProps={{
            //   variant: "light",
            // }}
            // positionActionsColumn="last"
          />
        ) : (
          <Alert color="yellow">No records available</Alert>
        )}
      </Container>
    </Container>
  );
}

export default PlacementRecordsTable;
