import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";

import React, { useMemo, useState } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import {
  ActionIcon,
  Flex,
  Stack,
  Text,
  Tooltip,
  Modal,
  Box,
  Button,
  Divider,
  Pill,
} from "@mantine/core";
import { IconEye, IconEdit } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { host } from "../../routes/globalRoutes/index.jsx";
import {
  useGetClubPositionData,
  useGetCurrentLoginnedRoleRelatedClub,
  approveFICYearlyPlan,
  approveCounsellorYearlyPlan,
  approveDeanYearlyPlan,
  rejectYearlyPlan,
  ListYearlyPlans,
} from "./BackendLogic/ApiRoutes";

function YearlyApprovals({ clubName }) {
  const user = useSelector((state) => state.user);
  const userRole = user.role;
  const token = localStorage.getItem("authToken");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [validationErrors] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const columns = useMemo(
    () => [
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "club",
        header: "club",
      },
      {
        accessorKey: "file_link",
        header: "Link",
        mantineTableBodyCellProps: ({ cell }) => {
          return {
            onClick: () => {
              const url = cell.getValue();
              window.open(url, "_blank");
            },
            style: { cursor: "pointer", color: "#1c7ed6" },
          };
        },
      },
      {
        accessorKey: "year",
        header: "year",
      },
    ],
    [validationErrors],
  );
  const { data: CurrentLoginRoleData = [] } =
    useGetCurrentLoginnedRoleRelatedClub(user.roll_no, token);

  const VisibeClubArray = [];
  CurrentLoginRoleData.forEach((c) => {
    VisibeClubArray.push(c.club);
  });

  const {
    data: fetchedEvents = [],
    isError: isLoadingEventsError,
    isFetching: isFetchingEvents,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
  } = ListYearlyPlans(token);
  const ClubMap = {
    Tech_Counsellor: ["BitByte", "AFC"],
    Cultural_Counsellor: ["Jazbaat", "Aavartan"],
    Sports_Counsellor: ["Badminton Club", "Volleyball Club"],
  };
  // console.log(clubName, userRole, VisibeClubArray);

  const filteredEvents = useMemo(() => {
    return fetchedEvents.filter((event) => {
      if (
        event.status.toLowerCase() === "coordinator" ||
        event.status.toLowerCase() === "reject" ||
        event.status.toLowerCase() === "accept" ||
        event.status.toLowerCase() === "accepted"
      ) {
        if (
          userRole.toLowerCase() === "co-ordinator" &&
          VisibeClubArray.includes(event.club)
        )
          return true;
      }
      if (event.status.toLowerCase() === "fic") {
        if (
          userRole.toLowerCase() === "fic" &&
          VisibeClubArray.includes(event.club)
        ) {
          return true;
        }
      }
      if (
        userRole.toLowerCase() === "tech_counsellor" &&
        event.status.toLowerCase() === "counsellor"
      ) {
        const allowedClubs = ClubMap.Tech_Counsellor;
        return allowedClubs.includes(event.club);
      }
      if (
        userRole.toLowerCase() === "sports_counsellor" &&
        event.status.toLowerCase() === "counsellor"
      ) {
        const allowedClubs = ClubMap.Sports_Counsellor;
        return allowedClubs.includes(event.club);
      }
      if (
        userRole.toLowerCase() === "cultural_counsellor" &&
        event.status.toLowerCase() === "counsellor"
      ) {
        const allowedClubs = ClubMap.Cultural_Counsellor;
        return allowedClubs.includes(event.club);
      }
      if (event.status.toLowerCase() === "dean") {
        if (userRole.toLowerCase() === "dean_s") {
          return true;
        }
      }
      return false;
    });
  }, [fetchedEvents, userRole]);
  console.log(filteredEvents, fetchedEvents);

  const openViewModal = (event) => {
    setSelectedEvent(event);
  };

  const closeViewModal = () => {
    setSelectedEvent(null);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  // const closeEditModal = () => {
  //   setIsEditModalOpen(false);
  //   setSelectedEvent(null);
  // };

  const { data: CurrentLogginedRelatedClub = [] } =
    useGetClubPositionData(token);

  const forwardFile = async ({
    fileId,
    receiver,
    receiverDesignation,
    remarks,
    fileExtraJSON = {},
    files = [],
  }) => {
    const formData = new FormData();
    formData.append("receiver", receiver);
    formData.append("receiver_designation", receiverDesignation);
    formData.append("remarks", remarks);
    formData.append("file_extra_JSON", JSON.stringify(fileExtraJSON));

    files.forEach((file) => {
      formData.append("files", file); // multiple files support
    });

    return axios.post(
      `${host}/filetracking/api/forwardfile/${fileId}/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
  };

  const approveFICMutation = useMutation({
    mutationFn: ({ eventId }) => {
      approveFICYearlyPlan(eventId, token);
    },
    onSuccess: async (_, variables) => {
      const { fileId } = variables;
      const fraternity = Object.keys(ClubMap).find((fra) =>
        ClubMap[fra].includes(clubName),
      );

      // const fraternity = "Counsellor";

      const CounsellorName =
        CurrentLogginedRelatedClub.find(
          (c) => c.club === clubName && c.position === fraternity,
        )?.name || "simanta";

      console.log(CounsellorName, fraternity);
      try {
        await forwardFile({
          fileId,
          receiver: CounsellorName,
          receiverDesignation: fraternity,
          remarks: "Approved by FIC",
          fileExtraJSON: {
            approved_by: "FIC",
            approved_on: new Date().toISOString(),
          },
          files: [], // pass File objects if needed
        });

        notifications.show({
          title: "FIC Approval",
          message: <Text fz="sm">File forwarded successfully</Text>,
          color: "green",
        });
      } catch (err) {
        console.error("File forwarding failed", err);
        notifications.show({
          title: "Forwarding Failed",
          message: <Text fz="sm">Could not forward file</Text>,
          color: "red",
        });
      }

      closeViewModal();
      refetchEvents();
    },
  });

  const approveCounsellorMutation = useMutation({
    mutationFn: ({ eventId }) => approveCounsellorYearlyPlan(eventId, token),
    onSuccess: async (_, variables) => {
      const { fileId } = variables;

      const fraternity = "Dean_s";

      const deanName =
        CurrentLogginedRelatedClub.find(
          (c) => c.club === clubName && c.position === fraternity,
        )?.name || "mkroy";

      try {
        await forwardFile({
          fileId,
          receiver: deanName,
          receiverDesignation: fraternity,
          remarks: "Approved by Counsellor",
          fileExtraJSON: {
            approved_by: "Counsellor",
            approved_on: new Date().toISOString(),
          },
          files: [],
        });

        notifications.show({
          title: "Counsellor Approval",
          message: <Text fz="sm">File forwarded successfully</Text>,
          color: "green",
        });
      } catch (err) {
        console.error("File forwarding failed", err);
        notifications.show({
          title: "Forwarding Failed",
          message: <Text fz="sm">Could not forward file</Text>,
          color: "red",
        });
      }

      closeViewModal();
      refetchEvents();
    },
  });

  const approveDeanMutation = useMutation({
    mutationFn: (eventId) => approveDeanYearlyPlan(eventId, token),
    onSuccess: () => {
      notifications.show({
        title: "Approved by Dean Student",
        message: (
          <Flex gap="4px">
            <Text fz="sm">Approved by Dean Student</Text>
          </Flex>
        ),
        color: "green",
      });
      closeViewModal();
      refetchEvents();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (eventId) => rejectYearlyPlan(eventId, token),
    onSuccess: () => {
      notifications.show({
        title: "Rejected the Event",
        message: (
          <Flex gap="4px">
            <Text fz="sm">Rejected the Event</Text>
          </Flex>
        ),
        color: "green",
      });
      closeViewModal();
      refetchEvents();
    },
  });

  const handleFICApproveButton = (eventId, fileId) => {
    approveFICMutation.mutate({ eventId, fileId });
  };

  const handleCounsellorApproveButton = (eventId, fileId) => {
    approveCounsellorMutation.mutate({ eventId, fileId });
  };
  const handleDeanApproveButton = (eventId) => {
    approveDeanMutation.mutate(eventId);
  };

  const handleRejectButton = (eventId) => {
    rejectMutation.mutate(eventId);
  };

  const renderRoleBasedActions = useMemo(() => {
    if (!selectedEvent) return null;

    if (selectedEvent.status === "FIC" && userRole === "FIC") {
      return (
        <Flex justify="center" gap={5}>
          <Button
            color="blue"
            onClick={() =>
              handleFICApproveButton(selectedEvent.id, selectedEvent.file_id)
            }
          >
            FIC Approve
          </Button>
          <Button
            color="red"
            onClick={() => handleRejectButton(selectedEvent.id)}
          >
            Reject
          </Button>
        </Flex>
      );
    }
    if (
      (selectedEvent.status === "COUNSELLOR" &&
        userRole === "Tech_Counsellor") ||
      userRole === "Sports_Counsellor" ||
      userRole === "Cultural_Counsellor"
    ) {
      return (
        <>
          <Button
            color="blue"
            onClick={() =>
              handleCounsellorApproveButton(
                selectedEvent.id,
                selectedEvent.file_id,
              )
            }
          >
            Counsellor Approve
          </Button>
          <Button
            color="red"
            onClick={() => handleRejectButton(selectedEvent.id)}
          >
            Reject
          </Button>
        </>
      );
    }
    if (selectedEvent.status === "DEAN" && userRole === "Dean_s") {
      return (
        <>
          <Button
            color="blue"
            onClick={() => handleDeanApproveButton(selectedEvent.id)}
          >
            Final Approve
          </Button>
          <Button
            color="red"
            onClick={() => handleRejectButton(selectedEvent.id)}
          >
            Reject
          </Button>
        </>
      );
    }

    return null;
  }, [selectedEvent, userRole]);

  const table = useMantineReactTable({
    columns,
    data: filteredEvents,
    enableEditing: true,
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingEventsError
      ? {
          color: "red",
          children: "Error loading data",
        }
      : undefined,
    renderRowActions: ({ row }) => (
      <Flex gap="md">
        <Tooltip label="View">
          <ActionIcon onClick={() => openViewModal(row.original)}>
            <IconEye />
          </ActionIcon>
        </Tooltip>
        {row.original.status === "COORDINATOR" &&
          userRole === "co-ordinator" && (
            <Tooltip label="Edit">
              <ActionIcon
                color="blue"
                onClick={() => openEditModal(row.original)}
              >
                <IconEdit />
              </ActionIcon>
            </Tooltip>
          )}
        <Pill
          bg={
            row.original.status === "ACCEPT"
              ? "#B9FBC0"
              : row.original.status === "REJECT"
                ? "#FFA8A5"
                : "#FFDB58"
          }
        >
          {row.original.status}
        </Pill>
      </Flex>
    ),
    state: {
      isLoading: isLoadingEvents,
      showAlertBanner: isLoadingEventsError,
      showProgressBars: isFetchingEvents,
    },
  });
  return (
    <>
      <MantineReactTable table={table} />

      {/* View Modal */}
      <Modal
        opened={!!selectedEvent && !isEditModalOpen}
        onClose={closeViewModal}
        w="40%"
      >
        {selectedEvent && (
          <Stack
            spacing="md"
            sx={{
              width: "100%",
              padding: "20px",
              border: "1px solid #dfe1e5",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              backgroundColor: "white",
            }}
          >
            <Box>
              <Text size="lg">{selectedEvent.club} Yearly Plan</Text>
              <Divider my="md" />
              {selectedEvent.events.map((eve) => {
                // Add your logic to display the event details here
                return (
                  <Box key={`${eve.id}-${eve.event_name}`}>
                    <Text fw={700} size="sm">
                      Event Name:{eve.event_name}
                    </Text>
                    <Text fw={700} size="sm">
                      Tentative start date:{eve.tentative_start_date}
                    </Text>
                    <Text fw={700} size="sm">
                      Tentative end date:{eve.tentative_end_date}
                    </Text>
                    <Text fw={700} size="sm">
                      Description:{eve.description}
                    </Text>
                    <Text fw={700} size="sm">
                      Budget:{eve.budget}
                    </Text>
                    <Divider my="md" />
                  </Box>
                );
              })}
            </Box>
            <Box>{renderRoleBasedActions}</Box>
          </Stack>
        )}
      </Modal>
    </>
  );
}

YearlyApprovals.propTypes = {
  clubName: PropTypes.string,
};

function YearlyApprovalsWithProviders({ clubName }) {
  return <YearlyApprovals clubName={clubName} />;
}

YearlyApprovalsWithProviders.propTypes = {
  clubName: PropTypes.string,
};

export default YearlyApprovalsWithProviders;
