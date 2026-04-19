import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Card,
  Text,
  Group,
  Button,
  Badge,
  Loader,
  Stack,
  Anchor,
  Modal,
  Textarea,
  SimpleGrid,
  Alert,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  Buildings,
  CheckCircle,
  XCircle,
  Envelope,
  Globe,
  User,
  Warning,
} from "@phosphor-icons/react";
import api from "../api";
import {
  companiesRoute,
  companyReviewRoute,
} from "../../../routes/placementCellRoutes";

export default function CompanyRegistrationForm() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await api.get(companiesRoute, {
        params: { status: "PENDING" },
      });
      setRegistrations(response.data?.results ?? response.data ?? []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to fetch pending registrations.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.post(companyReviewRoute(id), {
        action: "approve",
      });
      showNotification({
        title: "Approved",
        message: "Company registration approved successfully.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to approve registration.",
        color: "red",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (id, name) => {
    setRejectModal({ open: true, id, name });
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Please provide a reason for rejection.",
        color: "red",
      });
      return;
    }

    setActionLoading(rejectModal.id);
    try {
      await api.post(companyReviewRoute(rejectModal.id), {
        action: "reject",
        reason: rejectReason.trim(),
      });
      showNotification({
        title: "Rejected",
        message: "Company registration rejected.",
        color: "orange",
        icon: <XCircle size={18} />,
      });
      setRegistrations((prev) =>
        prev.filter((r) => r.id !== rejectModal.id),
      );
      setRejectModal({ open: false, id: null, name: "" });
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to reject registration.",
        color: "red",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Group justify="center" mt="xl">
        <Loader />
      </Group>
    );
  }

  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={3} mb="lg">
        <Group gap="xs">
          <Buildings size={24} />
          Pending Company Registrations
        </Group>
      </Title>

      {registrations.length === 0 ? (
        <Alert color="blue" title="No Pending Registrations">
          All company registrations have been reviewed.
        </Alert>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {registrations.map((reg) => (
            <Card key={reg.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Title order={5}>{reg.company_name || reg.name}</Title>
                  <Badge color="yellow" variant="light">
                    Pending
                  </Badge>
                </Group>

                {(reg.website || reg.company_website) && (
                  <Group gap="xs">
                    <Globe size={16} />
                    <Anchor
                      href={reg.website || reg.company_website}
                      target="_blank"
                      size="sm"
                    >
                      {reg.website || reg.company_website}
                    </Anchor>
                  </Group>
                )}

                {(reg.email || reg.contact_email) && (
                  <Group gap="xs">
                    <Envelope size={16} />
                    <Text size="sm">{reg.email || reg.contact_email}</Text>
                  </Group>
                )}

                {(reg.hr_name || reg.contact_person) && (
                  <Group gap="xs">
                    <User size={16} />
                    <Text size="sm">
                      HR: {reg.hr_name || reg.contact_person}
                    </Text>
                  </Group>
                )}

                {(reg.documents_url || reg.documents) && (
                  <Anchor
                    component="button"
                    size="sm"
                    onClick={async () => {
                      try {
                        const resp = await api.get(
                          `/placement/api/companies/${reg.id}/document/`,
                          { responseType: "blob" },
                        );
                        const url = URL.createObjectURL(resp.data);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `company_${reg.id}_document`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (e) {
                        showNotification({
                          title: "Download failed",
                          message:
                            e.response?.data?.detail ||
                            "Unable to download document.",
                          color: "red",
                        });
                      }
                    }}
                  >
                    Download Company Document
                  </Anchor>
                )}

                {(reg.contact_phone || reg.phone) && (
                  <Text size="sm">
                    📞 {reg.contact_phone || reg.phone}
                  </Text>
                )}

                <Group mt="sm">
                  <Button
                    color="green"
                    size="xs"
                    onClick={() => handleApprove(reg.id)}
                    loading={actionLoading === reg.id}
                    leftSection={<CheckCircle size={16} />}
                  >
                    Approve
                  </Button>
                  <Button
                    color="red"
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      openRejectModal(
                        reg.id,
                        reg.company_name || reg.name,
                      )
                    }
                    disabled={actionLoading === reg.id}
                    leftSection={<XCircle size={16} />}
                  >
                    Reject
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: null, name: "" })}
        title={`Reject ${rejectModal.name}`}
        centered
      >
        <Stack gap="md">
          <Textarea
            label="Reason for Rejection"
            placeholder="Provide a reason for rejecting this registration..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() =>
                setRejectModal({ open: false, id: null, name: "" })
              }
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleReject}
              loading={actionLoading === rejectModal.id}
            >
              Confirm Reject
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
