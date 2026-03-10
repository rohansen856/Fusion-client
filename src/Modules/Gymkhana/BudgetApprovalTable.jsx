import React, { useMemo, useState } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import {
  ActionIcon,
  Flex,
  Stack,
  Text,
  Input,
  Tooltip,
  Modal,
  Box,
  Button,
  CloseButton,
  Group,
  Divider,
  ScrollArea,
  Pill,
} from "@mantine/core";
import { IconEye, IconEdit, IconSend } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { notifications } from "@mantine/notifications";
import { host } from "../../routes/globalRoutes/index.jsx";
import {
  useGetUpcomingBudgets,
  useGetCommentsBudgetInfo,
  approveFICBudgetButton,
  approveCounsellorBudgetButton,
  approveDeanBudgetButton,
  rejectBudgetButton,
  modifyBudgetButton,
  reviewDeanBudgetButton,
  useGetClubPositionData,
  useGetCurrentLoginnedRoleRelatedClub,
} from "./BackendLogic/ApiRoutes";

import { BudgetApprovalForm } from "./BudgetForm";
import CounsellorReview from "./CounsellorReview";

function BudgetApprovals({ clubName }) {
  const user = useSelector((state) => state.user);
  const userRole = user.role;
  const token = localStorage.getItem("authToken");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [validationErrors] = useState({});
  const [commentValue, setCommentValue] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: commentsData, refetch: refetchComments } =
    useGetCommentsBudgetInfo(selectedBudget?.id, token);

  const columns = useMemo(
    () => [
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "budget_for",
        header: "Budget Title",
      },
      {
        accessorKey: "budget_requested",
        header: "Budget Requested",
      },
      {
        accessorKey: "budget_allocated",
        header: "Budget Allocated",
      },
      {
        accessorKey: "budget_comment",
        header: "Budget Comment",
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
      },
    ],
    [validationErrors],
  );

  const {
    data: fetchedBudgets = [],
    isError: isLoadingBudgetsError,
    isFetching: isFetchingBudgets,
    isLoading: isLoadingBudgets,
    refetch: refetchBudget,
  } = useGetUpcomingBudgets(token); // Fetch budgets for the club (implement the API call)

  const { data: CurrentLoginRoleData = [] } =
    useGetCurrentLoginnedRoleRelatedClub(user.roll_no, token);

  const VisibeClubArray = [];
  CurrentLoginRoleData.forEach((c) => {
    VisibeClubArray.push(c.club);
  });

  const ClubMap = {
    Tech_Counsellor: ["BitByte", "AFC"],
    Cultural_Counsellor: ["Jazbaat", "Aavartan"],
    Sports_Counsellor: ["Badminton Club", "Volleyball Club"],
  };

  const filteredBudgets = useMemo(() => {
    return fetchedBudgets.filter((budget) => {
      if (
        budget.status.toLowerCase() === "coordinator" ||
        budget.status.toLowerCase() === "reject" ||
        budget.status.toLowerCase() === "accept" ||
        budget.status.toLowerCase() === "accepted"
      ) {
        if (
          userRole.toLowerCase() === "co-ordinator" &&
          VisibeClubArray.includes(budget.club)
        )
          return true;
      }
      if (budget.status.toLowerCase() === "fic") {
        if (
          userRole.toLowerCase() === "fic" &&
          VisibeClubArray.includes(budget.club)
        ) {
          return true;
        }
      }
      if (
        userRole.toLowerCase() === "tech_counsellor" &&
        (budget.status.toLowerCase() === "counsellor" ||
          budget.status.toLowerCase() === "rereview")
      ) {
        const allowedClubs = ClubMap.Tech_Counsellor;
        return allowedClubs.includes(budget.club);
      }
      if (
        userRole.toLowerCase() === "sports_counsellor" &&
        (budget.status.toLowerCase() === "counsellor" ||
          budget.status.toLowerCase() === "rereview")
      ) {
        const allowedClubs = ClubMap.Sports_Counsellor;
        return allowedClubs.includes(budget.club);
      }
      if (
        userRole.toLowerCase() === "cultural_counsellor" &&
        (budget.status.toLowerCase() === "counsellor" ||
          budget.status.toLowerCase() === "rereview")
      ) {
        const allowedClubs = ClubMap.Cultural_Counsellor;
        return allowedClubs.includes(budget.club);
      }
      if (budget.status.toLowerCase() === "dean") {
        if (userRole.toLowerCase() === "dean_s") {
          return true;
        }
      }
      return false;
    });
  }, [fetchedBudgets, userRole]);

  const openViewModal = (budget) => {
    setSelectedBudget(budget);
  };

  const closeViewModal = () => {
    setSelectedBudget(null);
  };

  const openEditModal = (budget) => {
    setSelectedBudget(budget);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBudget(null);
  };

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

  const updateBudgetMutation = useMutation({
    mutationFn: ({ formData }) => {
      return axios.put(`${host}/gymkhana/api/update_budget/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
    },
    onSuccess: async (_, variables) => {
      const { SelectedBudgetFileId: fileId } = variables;
      console.log(fileId);
      try {
        const FICName =
          CurrentLogginedRelatedClub.find(
            (c) => c.club === clubName && c.position === "FIC",
          )?.name || null;

        await forwardFile({
          fileId,
          receiver: FICName, // based on clubname & under which fraternity we have filter from relatedClubData
          receiverDesignation: "Professor",
          remarks: "Approved by Co-ordinator",
          fileExtraJSON: {
            approved_by: "Co-ordinator",
            approved_on: new Date().toISOString(),
          },
          files: [],
        });

        notifications.show({
          title: "Co-ordinator Modification",
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
      closeEditModal();
      refetchBudget();
      // You might want to refresh your events data here
    },
  });

  const mutation = useMutation({
    mutationFn: (commentData) => {
      return axios.post(
        `${host}/gymkhana/api/create_budget_comment/`,
        {
          budget_id: commentData.selectedBudget.id,
          commentator_designation: commentData.userRole,
          comment: commentData.commentValue,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
    },
  });

  const handleCommentSubmit = (values) => {
    mutation.mutate(values, {
      onSuccess: (response) => {
        console.log("Successfully comment posted!!!", response.data);
        setCommentValue(""); // Clear the comment input field
        refetchComments(); // Refresh the comments list
      },
      onError: (error) => {
        console.error("Error during posting comment", error);
        notifications.show({
          title: "Error",
          message: (
            <Flex gap="4px">
              <Text fz="sm">Error during posting comment</Text>
            </Flex>
          ),
          color: "green",
        });
      },
    });
  };

  const approveFICMutation = useMutation({
    mutationFn: (eventId) => {
      approveFICBudgetButton(eventId, token);
    },
    onSuccess: async (_, variables) => {
      const { fileId } = variables;

      // const fraternity = Object.keys(ClubMap).find((fra) =>
      //   ClubMap[fra].includes(clubName),
      // );

      const fraternity = "Counsellor";

      const CounsellorName =
        CurrentLogginedRelatedClub.find(
          (c) => c.club === clubName && c.position === fraternity,
        )?.name || "simanta";

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
      refetchBudget();
    },
  });

  const updateAllocatedBudgetMutation = useMutation({
    mutationFn: (updatedBudgetData) => {
      return axios.put(
        `${host}/gymkhana/api/counsellor_approve_budget/`,
        updatedBudgetData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
    },
    onSuccess: () => {
      closeEditModal();
      refetchBudget();
    },
  });

  const approveCounsellorMutation = useMutation({
    mutationFn: ({ budgetId }) =>
      approveCounsellorBudgetButton(budgetId, token),
    // mutationFn: ({ budgetId }) => console.log('here'),
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
      refetchBudget();
    },
  });

  const approveDeanMutation = useMutation({
    mutationFn: (budgetId) => approveDeanBudgetButton(budgetId, token),
    onSuccess: () => {
      notifications.show({
        title: "Approved by Dean",
        message: (
          <Flex gap="4px">
            <Text fz="sm">Approved by Dean</Text>
          </Flex>
        ),
        color: "green",
      });
      closeViewModal();
      refetchBudget();
    },
  });

  const reviewDeanMutation = useMutation({
    mutationFn: ({ budgetId }) => reviewDeanBudgetButton(budgetId, token),
    // mutationFn: ({ budgetId }) => console.log('here'),
    onSuccess: async (_, variables) => {
      const { fileId } = variables;
      // const fraternity = Object.keys(ClubMap).find((fra) =>
      //   ClubMap[fra].includes(clubName),
      // );
      console.log(fileId);
      const fraternity = "Counsellor";

      const counsellorName =
        CurrentLogginedRelatedClub.find(
          (c) => c.club === clubName && c.position === fraternity,
        )?.name || "simanta";

      try {
        await forwardFile({
          fileId,
          receiver: counsellorName,
          receiverDesignation: fraternity,
          remarks: "Reviewed by Dean",
          fileExtraJSON: {
            approved_by: "Dean",
            approved_on: new Date().toISOString(),
          },
          files: [],
        });

        notifications.show({
          title: "Dean Review",
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
      refetchBudget();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (budgetId) => rejectBudgetButton(budgetId, token),
    onSuccess: () => {
      notifications.show({
        title: "Rejected",
        message: (
          <Flex gap="4px">
            <Text fz="sm">Rejected</Text>
          </Flex>
        ),
        color: "green",
      });
      closeViewModal();
      refetchBudget();
    },
  });

  const modifyMutation = useMutation({
    mutationFn: (budgetId) => modifyBudgetButton(budgetId, token),
    onSuccess: async (_, variables) => {
      const { fileId } = variables;
      try {
        const CoordinatorName =
          CurrentLogginedRelatedClub.find(
            (c) =>
              c.club === clubName &&
              c.position.toLowerCase() === "co-ordinator",
          )?.name || null;

        await forwardFile({
          fileId,
          receiver: CoordinatorName, // based on clubname & under which fraternity we have filter from relatedClubData
          receiverDesignation: "co-ordinator",
          remarks: "Modification request to co-ordinator",
          fileExtraJSON: {
            approved_by: "Authority",
            approved_on: new Date().toISOString(),
          },
          files: [],
        });

        notifications.show({
          title: "Modify",
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
      refetchBudget();
    },
  });

  const handleFICApproveButton = (budgetId, fileId) => {
    approveFICMutation.mutate({ budgetId, fileId });
  };
  const handleCounsellorApproveButton = (budgetId, fileId) => {
    approveCounsellorMutation.mutate({ budgetId, fileId });
  };
  const handleDeanApproveButton = (budgetId) => {
    approveDeanMutation.mutate(budgetId);
  };

  const handleDeanReviewButton = (budgetId, fileId) => {
    reviewDeanMutation.mutate({ budgetId, fileId });
  };

  const handleRejectButton = (budgetId) => {
    rejectMutation.mutate(budgetId);
  };
  const handleModifyButton = (budgetId, fileId) => {
    modifyMutation.mutate({ budgetId, fileId });
  };
  const renderRoleBasedActions = useMemo(() => {
    if (!selectedBudget) return null;

    if (selectedBudget.status === "FIC" && userRole === "FIC") {
      return (
        <>
          <Button
            color="blue"
            onClick={() =>
              handleFICApproveButton(selectedBudget.id, selectedBudget.file_id)
            }
          >
            FIC Approve
          </Button>
          <Button
            color="red"
            onClick={() =>
              handleRejectButton(selectedBudget.id, selectedBudget.file_id)
            }
          >
            Reject
          </Button>
          <Button
            color="yellow"
            onClick={() =>
              handleModifyButton(selectedBudget.id, selectedBudget.file_id)
            }
          >
            Modify
          </Button>
        </>
      );
    }
    if (
      (selectedBudget.status === "COUNSELLOR" ||
        selectedBudget.status.toLowerCase() === "rereview") &&
      (userRole === "Tech_Counsellor" ||
        userRole === "Sports_Counsellor" ||
        userRole === "Cultural_Counsellor")
    ) {
      return (
        <>
          <Button
            color="blue"
            onClick={() =>
              handleCounsellorApproveButton(
                selectedBudget.id,
                selectedBudget.file_id,
              )
            }
          >
            Counsellor Approve
          </Button>
          <Button
            color="red"
            onClick={() => handleRejectButton(selectedBudget.id)}
          >
            Reject
          </Button>
          <Button
            color="yellow"
            onClick={() =>
              handleModifyButton(selectedBudget.id, selectedBudget.file_id)
            }
          >
            Modify
          </Button>
        </>
      );
    }
    if (selectedBudget.status === "DEAN" && userRole === "Dean_s") {
      return (
        <>
          <Button
            color="blue"
            onClick={() => handleDeanApproveButton(selectedBudget.id)}
          >
            Final Approve
          </Button>
          <Button
            color="red"
            onClick={() => handleRejectButton(selectedBudget.id)}
          >
            Reject
          </Button>
          <Button
            color="yellow"
            onClick={() =>
              handleDeanReviewButton(selectedBudget.id, selectedBudget.file_id)
            }
          >
            ReReview
          </Button>
        </>
      );
    }

    return null;
  }, [selectedBudget, userRole]);
  const table = useMantineReactTable({
    columns,
    data: filteredBudgets,
    enableEditing: true,
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingBudgetsError
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
        {row.original.status === "REREVIEW" && userRole === "Counsellor" && (
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
      isLoading: isLoadingBudgets,
      showAlertBanner: isLoadingBudgetsError,
      showProgressBars: isFetchingBudgets,
    },
  });

  return (
    <>
      <MantineReactTable table={table} />
      {/* View Modal */}
      <Modal
        opened={!!selectedBudget && !isEditModalOpen}
        onClose={closeViewModal}
        w="40%"
      >
        {selectedBudget && (
          <Stack
            spacing="md"
            sx={{
              width: "40%",
              padding: "20px",
              border: "1px solid #dfe1e5",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              backgroundColor: "white",
            }}
          >
            <Box>
              <Stack>
                <Text
                  size="25px"
                  style={{ fontWeight: 900 }}
                  align="center"
                  mb="10px"
                >
                  {selectedBudget.budget_for}
                </Text>
                <Text size="15px" weight={700}>
                  <b>Amount Requested: </b> {selectedBudget.budget_requested}
                </Text>
                <Text size="15px" weight={700}>
                  <b>Description: </b>
                  {selectedBudget.description}
                </Text>
              </Stack>

              <Divider my="sm" />

              <Box>
                <Stack>
                  <Text size="md" weight={500}>
                    Comments:
                  </Text>
                  <ScrollArea
                    h={300}
                    styles={{
                      viewport: {
                        paddingRight: "10px", // Add padding to avoid overlap
                      },
                      scrollbar: {
                        position: "absolute",
                        right: 0,
                        width: "8px",
                      },
                    }}
                  >
                    {commentsData?.map((comment) => (
                      <Box
                        key={comment.event_index}
                        my="sm"
                        style={{
                          border: " solid 1px lightgray",
                          borderRadius: "5px",
                        }}
                      >
                        <Pill weight={900} size="xs" c="blue" mb="5px">
                          {comment.commentator_designation}
                        </Pill>
                        <Text size="sm" p="10px" radius="lg">
                          {comment.comment}{" "}
                        </Text>
                        <Group justify="end">
                          <Pill size="xs" mr="2px" mb="1px">
                            {comment.comment_date}, {comment.comment_time}
                          </Pill>
                        </Group>
                      </Box>
                    ))}
                  </ScrollArea>

                  <Group position="apart" align="center">
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Input
                        placeholder="Add a comment"
                        value={commentValue}
                        onChange={(budget) =>
                          setCommentValue(budget.currentTarget.value)
                        }
                        style={{ paddingRight: "30px", width: "290px" }} // Add padding to make space for the CloseButton
                      />
                      {commentValue && (
                        <CloseButton
                          aria-label="Clear input"
                          onClick={() => setCommentValue("")}
                          style={{
                            position: "absolute",
                            right: "5px",
                            cursor: "pointer",
                          }}
                        />
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        const objectComment = {
                          userRole,
                          commentValue,
                          selectedBudget,
                        };
                        handleCommentSubmit(objectComment);
                      }}
                      color="blue"
                    >
                      <IconSend />
                    </Button>
                    {/* </Flex> */}
                    {renderRoleBasedActions}
                  </Group>
                </Stack>
              </Box>
            </Box>
          </Stack>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Budget"
        size="lg"
      >
        {selectedBudget && selectedBudget.status !== "REREVIEW" && (
          <BudgetApprovalForm
            clubName={clubName}
            initialValues={{
              ...selectedBudget,
            }}
            onSubmit={(values) => {
              const formData = new FormData();

              // Add the text data (details)
              formData.append("budget_requested", values.budget_requested);

              // Add the ID of the event
              formData.append("id", selectedBudget.id);
              const SelectedBudgetFileId = selectedBudget.file_id;
              // Now, submit the formData to the backend using the mutation
              updateBudgetMutation.mutate({ formData, SelectedBudgetFileId });
            }}
            editMode
            disabledFields={[
              "busget_allocated",
              "budget_comment",
              "budget_for",
              // "budget_file",
              "description",
              "status",
              // "remarks",
            ]}
          />
        )}
        {selectedBudget &&
          userRole === "Counsellor" &&
          selectedBudget?.status === "REREVIEW" && (
            <CounsellorReview
              clubName={clubName}
              initialValues={{
                ...selectedBudget,
              }}
              onSubmit={(values) => {
                const formData = new FormData();
                formData.append("budget_allocated", values.budget_allocated);
                formData.append("budget_comment", values.budget_comment);
                formData.append("id", selectedBudget.id);

                updateAllocatedBudgetMutation.mutate(formData);
              }}
              editMode
              disabledFields={[
                "budget_requested",
                "budget_for",
                "budget_file",
                "description",
                "status",
                "remarks",
              ]}
            />
          )}
      </Modal>
    </>
  );
}

BudgetApprovals.propTypes = {
  clubName: PropTypes.string,
};
function BudgetApprovalsWithProviders({ clubName }) {
  return <BudgetApprovals clubName={clubName} />;
}
BudgetApprovalsWithProviders.propTypes = {
  clubName: PropTypes.string,
};

export default BudgetApprovalsWithProviders;
