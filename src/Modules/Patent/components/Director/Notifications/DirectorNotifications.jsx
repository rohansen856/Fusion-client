import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Button, Text, Box, SimpleGrid } from "@mantine/core";
import notificationsData from "../../../data/director/notificationsData";

const styles = {
  notificationCard: {
    padding: "1.3rem 2rem",
    marginBottom: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.10)",
    borderRadius: "8px",
    backgroundColor: "#fff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderLeft: "8px solid #3182ce",
  },
  notificationTitle: {
    fontSize: "20px",
    fontWeight: 500,
    marginBottom: "2.2px",
    lineHeight: 1.2,
  },
  notificationStatus: {
    fontSize: "0.97rem",
    fontWeight: 500,
    marginBottom: "10px",
    lineHeight: 1.2,
  },
  notificationToken: {
    fontSize: "0.83rem",
    color: "#666",
    marginBottom: "5px",
    lineHeight: 1.2,
  },
  notificationDate: {
    fontSize: "0.83rem",
    color: "#666",
    marginBottom: "10px",
    lineHeight: 1.2,
  },
  notificationDescription: {
    fontSize: "0.83rem",
    color: "#444",
    padding: "0",
    flex: 1,
    marginBottom: "8px",
    lineHeight: 1.25,
  },
  notificationActions: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginTop: "0.3rem",
  },
  actionButton: {
    flex: "1",
    minWidth: "200px",
    fontWeight: "500",
    fontSize: "0.9rem",
    padding: "10px 0",
    height: "35px",
    backgroundColor: "#fff",
    color: "#0073e6",
    border: "1px solid #0073e6",
    transition: "background 0.18s, color 0.18s",
    cursor: "pointer",
  },
  actionButtonHover: {
    backgroundColor: "#0073e6",
    color: "#fff",
    border: "1px solid #0073e6",
  },
  pageTitle: {
    fontSize: "24px",
    marginTop: "-6px",
    fontWeight: 600,
    marginBottom: "8px",
    color: "#1a1b1e",
    lineHeight: 1.2,
  },
  container: {
    width: "100%",
    padding: "0",
    maxWidth: "1800px",
    margin: "0 50px",
  },
};

function NotificationCard({
  id,
  token,
  title,
  status,
  description,
  date,
  time,
  color,
  onMarkAsRead,
  isRead,
}) {
  const [hover, setHover] = useState(false);

  const getStatusColor = () => color || "#3182ce";
  const buttonStyle = {
    ...styles.actionButton,
    ...(hover ? styles.actionButtonHover : {}),
    ...(isRead && {
      backgroundColor: "#f3f3f3",
      color: "#888",
      border: "1px solid #ddd",
    }),
  };

  return (
    <Card style={styles.notificationCard}>
      <Text style={styles.notificationTitle}>{title}</Text>
      <Text style={{ ...styles.notificationStatus, color: getStatusColor() }}>
        {status}
      </Text>
      <Text style={styles.notificationToken}>{token}</Text>
      <Text style={styles.notificationDate}>{`${date} | ${time}`}</Text>
      <Text style={styles.notificationDescription}>{description}</Text>
      <div style={styles.notificationActions}>
        <Button
          variant={isRead ? "default" : "outline"}
          style={buttonStyle}
          onClick={() => onMarkAsRead(id)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {isRead ? "Remove Notification" : "Mark as Read"}
        </Button>
      </div>
    </Card>
  );
}

NotificationCard.propTypes = {
  id: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  color: PropTypes.string,
  onMarkAsRead: PropTypes.func.isRequired,
  isRead: PropTypes.bool.isRequired,
};

function DirectorNotifications() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [readNotifications, setReadNotifications] = useState([]);

  const handleMarkAsRead = (id) => {
    if (readNotifications.includes(id)) {
      setNotifications(notifications.filter((n) => n.id !== id));
      setReadNotifications(readNotifications.filter((readId) => readId !== id));
    } else {
      setReadNotifications([...readNotifications, id]);
    }
  };

  return (
    <Box style={styles.container}>
      <Text style={styles.pageTitle}>Notifications</Text>
      <Box style={{ width: "100%" }}>
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 2 }}
          spacing={{ base: "md", sm: "xl" }}
          verticalSpacing={{ base: "md", sm: "xl" }}
        >
          {notifications.map((notification) => (
            <NotificationCard
              token={notification.token}
              id={notification.id}
              title={notification.title}
              status={notification.status}
              description={notification.description}
              date={notification.date}
              time={notification.time}
              color={notification.color}
              onMarkAsRead={handleMarkAsRead}
              isRead={readNotifications.includes(notification.id)}
              key={notification.id}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}

export default DirectorNotifications;
