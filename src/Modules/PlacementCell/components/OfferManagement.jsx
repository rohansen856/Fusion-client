import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Title,
  Paper,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Loader,
  Center,
  Modal,
  ThemeIcon,
  Alert,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  Handshake,
  CheckCircle,
  XCircle,
  HourglassMedium,
  WarningCircle,
  Sparkle,
  Info,
} from "@phosphor-icons/react";
import api from "../api";
import {
  offersRoute,
  respondOfferRoute,
  seedDemoOffersRoute,
} from "../../../routes/placementCellRoutes";

function extractErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.non_field_errors?.length) return data.non_field_errors.join(" ");
  if (typeof data === "object") {
    const first = Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
      .join(" | ");
    if (first) return first;
  }
  return fallback;
}

function useCountdown(deadline) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!deadline) return undefined;
    const target = new Date(deadline).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setRemaining("Expired");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      parts.push(`${h}h`);
      parts.push(`${m}m`);
      setRemaining(parts.join(" "));
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [deadline]);

  return remaining;
}

const STATUS_COLOR = {
  PENDING: "yellow",
  ACCEPTED: "green",
  DECLINED: "red",
  EXPIRED: "gray",
};

function OfferCard({ offer, onRespond, lockReason }) {
  const countdown = useCountdown(offer.offer_deadline);
  const status = (offer.status || "PENDING").toUpperCase();
  const isPending = status === "PENDING";
  const expired =
    !!offer.is_expired ||
    status === "EXPIRED" ||
    (isPending && countdown === "Expired");

  const title =
    offer.role_offered || offer.job_title || offer.title || "Offer";
  const company = offer.company_name || offer.company || "—";
  const pkg = offer.package_ctc ?? offer.package;

  const accepted = status === "ACCEPTED";
  const acceptDisabled = isPending && !expired && !!lockReason;

  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
      style={{
        opacity: expired && isPending ? 0.6 : 1,
        borderColor: accepted ? "var(--mantine-color-green-5)" : undefined,
        borderWidth: accepted ? 2 : 1,
      }}
    >
      <Group justify="space-between" wrap="wrap" mb="xs">
        <div>
          <Text fw={600} size="md">
            {title}
          </Text>
          <Text size="sm" c="dimmed">
            {company}
          </Text>
        </div>
        <Badge
          color={STATUS_COLOR[status] ?? "gray"}
          variant={accepted ? "filled" : "light"}
          size="lg"
        >
          {expired && isPending ? "EXPIRED" : status}
        </Badge>
      </Group>

      <Group gap="lg" mb="sm" wrap="wrap">
        {pkg != null && pkg !== "" && (
          <Text size="sm" fw={500}>
            CTC: ₹ {Number(pkg).toFixed(2)} LPA
          </Text>
        )}
        {offer.offer_deadline && (
          <Group gap={4}>
            <HourglassMedium size={14} />
            <Text
              size="sm"
              c={expired ? "red" : "orange"}
              fw={500}
            >
              {expired ? "Deadline passed" : `Deadline in ${countdown}`}
            </Text>
          </Group>
        )}
        {offer.responded_at && !isPending && (
          <Text size="xs" c="dimmed">
            Responded on{" "}
            {new Date(offer.responded_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        )}
      </Group>

      {isPending && !expired && (
        <Group justify="flex-end" gap="sm">
          <Button
            size="sm"
            variant="light"
            color="red"
            leftSection={<XCircle size={16} />}
            onClick={() => onRespond(offer.id, "decline")}
          >
            Decline
          </Button>
          <Tooltip
            label={lockReason || ""}
            disabled={!acceptDisabled}
            withinPortal
            multiline
            w={260}
          >
            <Button
              size="sm"
              color="green"
              leftSection={<CheckCircle size={16} />}
              onClick={() => onRespond(offer.id, "accept")}
              disabled={acceptDisabled}
            >
              Accept
            </Button>
          </Tooltip>
        </Group>
      )}
    </Card>
  );
}

OfferCard.propTypes = {
  offer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    role_offered: PropTypes.string,
    job_title: PropTypes.string,
    title: PropTypes.string,
    company_name: PropTypes.string,
    company: PropTypes.string,
    package_ctc: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    package: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    offer_deadline: PropTypes.string,
    responded_at: PropTypes.string,
    status: PropTypes.string,
    is_expired: PropTypes.bool,
  }).isRequired,
  onRespond: PropTypes.func.isRequired,
  lockReason: PropTypes.string,
};

OfferCard.defaultProps = {
  lockReason: "",
};

export default function OfferManagement() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(offersRoute);
      setOffers(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(err, "Failed to load offers"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const acceptedOffer = useMemo(
    () => offers.find((o) => (o.status || "").toUpperCase() === "ACCEPTED"),
    [offers],
  );
  const pendingCount = useMemo(
    () =>
      offers.filter((o) => (o.status || "").toUpperCase() === "PENDING").length,
    [offers],
  );

  const openConfirm = (id, action) => setConfirm({ id, action });

  const handleRespond = async () => {
    if (!confirm) return;
    setSubmitting(true);
    try {
      await api.post(respondOfferRoute(confirm.id), { action: confirm.action });
      const isAccept = confirm.action === "accept";
      showNotification({
        title: isAccept ? "Offer accepted" : "Offer declined",
        message: isAccept
          ? "Offer accepted. Any other pending offers have been auto-declined and all affected parties notified."
          : "Offer declined. The recruiter and placement cell have been notified.",
        color: isAccept ? "green" : "red",
      });
      setConfirm(null);
      fetchOffers();
    } catch (err) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(err, "Failed to respond to offer"),
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const { data } = await api.post(seedDemoOffersRoute);
      showNotification({
        title: "Demo offers ready",
        message:
          data?.detail ||
          "Demo offers have been created. Try accepting one to see the others auto-decline.",
        color: "blue",
      });
      fetchOffers();
    } catch (err) {
      showNotification({
        title: "Could not create demo offers",
        message: extractErrorMessage(err, "Failed to create demo offers"),
        color: "red",
      });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  const lockReason = acceptedOffer
    ? `You have already accepted the offer for ${
        acceptedOffer.role_offered ||
        acceptedOffer.job_title ||
        "another role"
      }${
        acceptedOffer.company_name ? ` at ${acceptedOffer.company_name}` : ""
      }. A student may accept only one offer.`
    : "";

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" align="center" mb="md" wrap="wrap">
        <Title order={3}>Offers</Title>
        <Button
          variant="light"
          color="blue"
          size="sm"
          leftSection={<Sparkle size={16} />}
          onClick={handleSeedDemo}
          loading={seeding}
          disabled={!!acceptedOffer}
        >
          Seed demo offers
        </Button>
      </Group>

      {acceptedOffer && (
        <Alert
          icon={<CheckCircle size={18} />}
          color="green"
          variant="light"
          mb="md"
          title="Offer accepted"
        >
          You accepted{" "}
          <Text span fw={600}>
            {acceptedOffer.role_offered ||
              acceptedOffer.job_title ||
              "this offer"}
          </Text>
          {acceptedOffer.company_name ? ` at ${acceptedOffer.company_name}` : ""}.
          Any other pending offers were auto-declined. If you need to switch,
          contact the placement cell.
        </Alert>
      )}

      {!acceptedOffer && pendingCount > 1 && (
        <Alert
          icon={<Info size={18} />}
          color="blue"
          variant="light"
          mb="md"
        >
          You have {pendingCount} pending offers. You can accept only one —
          the others will be auto-declined automatically and all affected
          recruiters / placement staff will be notified.
        </Alert>
      )}

      {offers.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="xs">
              <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                <Handshake size={28} />
              </ThemeIcon>
              <Text c="dimmed" size="lg">
                No offers at the moment.
              </Text>
              <Text c="dimmed" size="sm">
                Click &ldquo;Seed demo offers&rdquo; above to try the
                accept-one/auto-decline flow.
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Stack gap="md">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onRespond={openConfirm}
              lockReason={lockReason}
            />
          ))}
        </Stack>
      )}

      <Modal
        opened={confirm !== null}
        onClose={() => setConfirm(null)}
        title={`Confirm ${confirm?.action === "accept" ? "Acceptance" : "Decline"}`}
        centered
      >
        <Stack gap="md">
          <Group gap="sm" align="flex-start">
            <WarningCircle size={24} color="orange" />
            <Text size="sm">
              Are you sure you want to{" "}
              <Text span fw={600}>
                {confirm?.action}
              </Text>{" "}
              this offer? This action cannot be undone.
              {confirm?.action === "accept" && pendingCount > 1 && (
                <>
                  {" "}
                  <Text span c="red" fw={600}>
                    Any other pending offers will be auto-declined
                  </Text>{" "}
                  and all affected recruiters / TPOs will be notified.
                </>
              )}
            </Text>
          </Group>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => setConfirm(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              color={confirm?.action === "accept" ? "green" : "red"}
              onClick={handleRespond}
              loading={submitting}
            >
              {confirm?.action === "accept" ? "Accept" : "Decline"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
