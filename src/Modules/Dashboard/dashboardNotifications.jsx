import axios from "axios";
import PropTypes from "prop-types";
import {
  SortAscending,
  Trash,
  Star,
  FunnelSimple,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Loader,
  Badge,
  Button,
  Flex,
  Grid,
  Paper,
  Select,
  Text,
  ActionIcon,
  Group,
  Box,
  Tooltip,
  SegmentedControl,
} from "@mantine/core";
import { useDispatch } from "react-redux";
import { setTotalNotifications } from "../../redux/userslice.jsx";
import classes from "./Dashboard.module.css";
import { Empty } from "../../components/empty";
import CustomBreadcrumbs from "../../components/Breadcrumbs.jsx";
import {
  notificationReadRoute,
  notificationDeleteRoute,
  notificationUnreadRoute,
  getNotificationsRoute,
} from "../../routes/dashboardRoutes";
import ModuleTabs from "../../components/moduleTabs.jsx";

const sortCategories = ["Most Recent", "Tags", "Title"];
const filterCategories = ["All", "Starred"];

function NotificationItem({
  notification,
  markAsRead,
  deleteNotification,
  markAsUnread,
  toggleStar,
  loading,
  starLoading,
}) {
  const { module } = notification.data;
  const isUnread = notification.unread;
  const isStarred = notification.starred;
  const formattedDate = new Date(notification.timestamp).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <Grid.Col span={12} key={notification.id}>
      <Paper
        radius="md"
        px={{ base: "sm", sm: "lg" }}
        py="md"
        style={{
          borderLeft: `0.6rem solid ${isUnread ? "#15ABFF" : "#ADB5BD"}`,
          minHeight: "105px",
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
        withBorder
        className={`${classes.notificationItem} ${isStarred ? classes.starredNotification : ""}`}
      >
        <Flex
          justify="space-between"
          align="flex-start"
          style={{ width: "100%" }}
          direction={{ base: "column", sm: "row" }}
          gap={{ base: "md", sm: 0 }}
        >
          <Flex
            align="center"
            gap="xs"
            style={{
              position: "absolute",
              top: "12px",
              left: "10px",
              zIndex: 2,
            }}
          >
            <Tooltip
              label={isStarred ? "Unstar notification" : "Star notification"}
              withinPortal
              position="right"
            >
              <ActionIcon
                variant="subtle"
                color={isStarred ? "yellow" : "gray"}
                onClick={() => toggleStar(notification.id)}
                loading={starLoading === notification.id}
                title={isStarred ? "Unstar notification" : "Star notification"}
                radius="xl"
                size="md"
                className={classes.starButton}
                style={{
                  transition: "all 0.2s ease",
                }}
              >
                <Star size={20} weight={isStarred ? "fill" : "regular"} />
              </ActionIcon>
            </Tooltip>
          </Flex>

          <Box ml={40} style={{ flex: 1, paddingRight: "16px" }}>
            <Flex
              justify="space-between"
              direction={{ base: "column", xs: "row" }}
              align={{ base: "flex-start", xs: "center" }}
              gap={{ base: "xs", xs: 0 }}
            >
              <Group spacing="sm">
                <Text
                  fw={isUnread ? 700 : 400}
                  size="1rem"
                  c={isUnread ? "#2c2e33" : "#777"}
                >
                  {notification.verb}
                </Text>
                <Badge color={isUnread ? "#15ABFF" : "#ADB5BD"} size="sm">
                  {module || "N/A"}
                </Badge>
              </Group>
              <Text c="#6B6B6B" size="0.8rem" style={{ whiteSpace: "nowrap" }}>
                {formattedDate}
              </Text>
            </Flex>

            <Text
              c={isUnread ? "#2c2e33" : "#9AA1A9"}
              size="0.9rem"
              mt="xs"
              lineClamp={2}
              fw={isUnread ? 500 : 400}
              style={{ marginBottom: "8px" }}
            >
              {notification.description || "No description available."}
            </Text>
          </Box>

          <Group
            spacing="md"
            style={{ flexShrink: 0 }}
            mt={{ base: "5px", sm: 0 }}
            ml={{ base: 40, sm: 0 }}
            className={classes.notificationActions}
          >
            <Button
              variant="light"
              color={isUnread ? "blue" : "gray"}
              onClick={() =>
                isUnread
                  ? markAsRead(notification.id)
                  : markAsUnread(notification.id)
              }
              loading={loading === notification.id}
              size="xs"
              radius="md"
            >
              {isUnread ? "Mark as read" : "Mark as unread"}
            </Button>

            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => deleteNotification(notification.id)}
              title="Delete notification"
              radius="xl"
            >
              <Trash size={18} />
            </ActionIcon>
          </Group>
        </Flex>
      </Paper>
    </Grid.Col>
  );
}

function Dashboard() {
  const [notificationsList, setNotificationsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [activeTab, setActiveTab] = useState("0");
  const [sortedBy, setSortedBy] = useState("Most Recent");
  const [filterBy, setFilterBy] = useState("All");
  const [loading, setLoading] = useState(false);
  const [read_Loading, setRead_Loading] = useState(-1);
  const [star_Loading, setStar_Loading] = useState(-1);
  const dispatch = useDispatch();
  const tabItems = [{ title: "Notifications" }, { title: "Announcements" }];

  const notificationBadgeCount = notificationsList.filter(
    (n) => !n.deleted && n.unread,
  ).length;
  const announcementBadgeCount = announcementsList.filter(
    (n) => !n.deleted && n.unread,
  ).length;
  const badges = [notificationBadgeCount, announcementBadgeCount];
  dispatch(
    setTotalNotifications(notificationBadgeCount + announcementBadgeCount),
  );

  useEffect(() => {
    try {
      const starredNotifications = JSON.parse(
        localStorage.getItem("starredNotifications") || "{}",
      );

      setNotificationsList((prev) =>
        prev.map((notification) => ({
          ...notification,
          starred: !!starredNotifications[notification.id],
        })),
      );

      setAnnouncementsList((prev) =>
        prev.map((notification) => ({
          ...notification,
          starred: !!starredNotifications[notification.id],
        })),
      );
    } catch (err) {
      console.error(
        "Error loading starred notifications from localStorage:",
        err,
      );
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return console.error("No authentication token found!");

      try {
        setLoading(true);
        const { data } = await axios.get(getNotificationsRoute, {
          headers: { Authorization: `Token ${token}` },
        });
        const { notifications } = data;
        const notificationsData = notifications.map((item) => {
          let parsedData;
          try {
            parsedData = JSON.parse(item.data.replace(/'/g, '"'));
          } catch (err) {
            console.error("Error parsing notification data:", err);
            parsedData = {};
          }

          return {
            ...item,
            data: parsedData,
            starred: false,
          };
        });

        const starredNotifications = JSON.parse(
          localStorage.getItem("starredNotifications") || "{}",
        );

        setNotificationsList(
          notificationsData
            .filter((item) => item.data?.flag !== "announcement")
            .map((notification) => ({
              ...notification,
              starred: !!starredNotifications[notification.id],
            })),
        );

        setAnnouncementsList(
          notificationsData
            .filter((item) => item.data?.flag === "announcement")
            .map((notification) => ({
              ...notification,
              starred: !!starredNotifications[notification.id],
            })),
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  const notificationsToDisplay =
    activeTab === "1" ? announcementsList : notificationsList;

  const filteredAndSortedNotifications = useMemo(() => {
    let filteredNotifications = notificationsToDisplay;

    if (filterBy === "Starred") {
      filteredNotifications = notificationsToDisplay.filter(
        (notification) => notification.starred,
      );
    }

    const sortMap = {
      "Most Recent": (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      Tags: (a, b) => a.data.module.localeCompare(b.data.module),
      Title: (a, b) => a.verb.localeCompare(b.verb),
    };

    return [...filteredNotifications]
      .filter((notification) => !notification.deleted)
      .sort(sortMap[sortedBy]);
  }, [sortedBy, filterBy, notificationsToDisplay]);

  const markAsRead = async (notifId) => {
    const token = localStorage.getItem("authToken");
    try {
      setRead_Loading(notifId);
      const response = await axios.post(
        notificationReadRoute,
        { id: notifId },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (response.status === 200) {
        setNotificationsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: false } : notif,
          ),
        );
        setAnnouncementsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: false } : notif,
          ),
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    } finally {
      setRead_Loading(-1);
    }
  };

  const markAsUnread = async (notifId) => {
    const token = localStorage.getItem("authToken");
    try {
      setRead_Loading(notifId);
      const response = await axios.post(
        notificationUnreadRoute,
        { id: notifId },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (response.status === 200) {
        setNotificationsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: true } : notif,
          ),
        );
        setAnnouncementsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: true } : notif,
          ),
        );
      }
    } catch (err) {
      console.error("Error marking notification as unread:", err);
    } finally {
      setRead_Loading(-1);
    }
  };

  const toggleStar = (notifId) => {
    try {
      setStar_Loading(notifId);

      const notification = [...notificationsList, ...announcementsList].find(
        (notif) => notif.id === notifId,
      );

      if (!notification) return;

      const isCurrentlyStarred = notification.starred;

      const starredNotifications = JSON.parse(
        localStorage.getItem("starredNotifications") || "{}",
      );

      if (isCurrentlyStarred) {
        delete starredNotifications[notifId];
      } else {
        starredNotifications[notifId] = true;
      }

      localStorage.setItem(
        "starredNotifications",
        JSON.stringify(starredNotifications),
      );

      const updateStarStatus = (items) =>
        items.map((notif) =>
          notif.id === notifId
            ? { ...notif, starred: !isCurrentlyStarred }
            : notif,
        );

      setNotificationsList((prev) => updateStarStatus(prev));
      setAnnouncementsList((prev) => updateStarStatus(prev));

      console.log(
        `Notification ${notifId} ${isCurrentlyStarred ? "unstarred" : "starred"} successfully`,
      );
    } catch (err) {
      console.error("Error toggling star:", err);
    } finally {
      setStar_Loading(-1);
    }
  };

  const deleteNotification = async (notifId) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        notificationDeleteRoute,
        { id: notifId },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setNotificationsList((prev) =>
          prev.filter((notif) => notif.id !== notifId),
        );
        setAnnouncementsList((prev) =>
          prev.filter((notif) => notif.id !== notifId),
        );

        const starredNotifications = JSON.parse(
          localStorage.getItem("starredNotifications") || "{}",
        );
        if (starredNotifications[notifId]) {
          delete starredNotifications[notifId];
          localStorage.setItem(
            "starredNotifications",
            JSON.stringify(starredNotifications),
          );
        }

        console.log("Notification deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  return (
    <>
      <CustomBreadcrumbs />
      <Flex
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        mt="lg"
        direction={{ base: "column", sm: "row" }}
      >
        <ModuleTabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          badges={badges}
        />

        <Flex align="center" mt="md" rowGap="1rem" columnGap="md" wrap="wrap">
          <Group spacing="md">
            <Flex align="center" gap="xs">
              <FunnelSimple size={20} />
              <SegmentedControl
                value={filterBy}
                onChange={setFilterBy}
                data={filterCategories}
                size="xs"
              />
            </Flex>

            <Select
              classNames={{
                option: classes.selectoptions,
                input: classes.selectinputs,
              }}
              variant="filled"
              leftSection={<SortAscending />}
              data={sortCategories}
              value={sortedBy}
              onChange={setSortedBy}
              placeholder="Sort By"
              size="sm"
            />
          </Group>
        </Flex>
      </Flex>
      <Grid mt="xl">
        {loading ? (
          <Container py="xl">
            <Loader size="lg" />
          </Container>
        ) : filteredAndSortedNotifications.length === 0 ? (
          <Container py="xl" style={{ textAlign: "center" }}>
            {filterBy === "Starred" ? (
              <Box>
                <Text fw={500} fz="lg" mb="sm">
                  No starred notifications
                </Text>
                <Text c="dimmed">
                  Star important notifications to see them here
                </Text>
              </Box>
            ) : (
              <Empty />
            )}
          </Container>
        ) : (
          filteredAndSortedNotifications.map((notification) => (
            <NotificationItem
              notification={notification}
              key={notification.id}
              markAsRead={markAsRead}
              markAsUnread={markAsUnread}
              deleteNotification={deleteNotification}
              toggleStar={toggleStar}
              loading={read_Loading}
              starLoading={star_Loading}
            />
          ))
        )}
      </Grid>
    </>
  );
}

export default Dashboard;

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.number.isRequired,
    verb: PropTypes.string.isRequired,
    description: PropTypes.string,
    timestamp: PropTypes.string.isRequired,
    data: PropTypes.shape({
      module: PropTypes.string,
      flag: PropTypes.string,
    }),
    unread: PropTypes.bool.isRequired,
    starred: PropTypes.bool,
  }).isRequired,
  markAsRead: PropTypes.func.isRequired,
  markAsUnread: PropTypes.func.isRequired,
  deleteNotification: PropTypes.func.isRequired,
  toggleStar: PropTypes.func.isRequired,
  loading: PropTypes.number.isRequired,
  starLoading: PropTypes.number.isRequired,
};
