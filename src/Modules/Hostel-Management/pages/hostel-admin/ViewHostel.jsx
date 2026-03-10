import { useState, useEffect } from "react";
import { Card, Select, Grid, Text, Box } from "@mantine/core";
import { viewHostel } from "../../../../routes/hostelManagementRoutes"; // Import your endpoint

export default function ViewHostel() {
  const [selectedHall, setSelectedHall] = useState("");
  const [hostelsData, setHostelsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await fetch(viewHostel, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setHostelsData(data.hostel_details);
        if (data.hostel_details.length > 0) {
          setSelectedHall(data.hostel_details[0].hall_id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hostel data:", error);
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  // Get data of the selected hall
  const hostel = hostelsData.find((h) => h.hall_id === selectedHall);

  if (loading) {
    return (
      <Text align="center" mt="xl">
        Loading...
      </Text>
    );
  }

  return (
    <>
      <Text
        align="center"
        mb="xl"
        size="24px"
        style={{ color: "#4299E1", fontWeight: "bold" }}
      >
        Select Hostel
      </Text>

      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          height: "100%",
          width: "100%",
          margin: "auto",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Select
          data={hostelsData.map((hostelData) => ({
            value: hostelData.hall_id,
            label: hostelData.hall_name,
          }))}
          placeholder="Select Hall"
          value={selectedHall}
          onChange={setSelectedHall}
          mb="lg"
          mt="lg"
          styles={{
            input: {
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              fontSize: "1rem",
            },
          }}
        />

        {hostel && (
          <Box
            style={{
              height: "250px",
              overflowY: "auto",
              paddingRight: "12px",
            }}
          >
            <Grid>
              {[
                { label: "Name:", value: hostel.hall_name },
                { label: "Code:", value: hostel.hall_id },
                {
                  label: "Maximum Accommodation:",
                  value: hostel.max_accomodation,
                },
                { label: "Current Students:", value: hostel.number_students },
                {
                  label: "Batch Assigned:",
                  value: hostel.assigned_batch.join() || "Not Assigned",
                },
                { label: "Caretaker Name:", value: hostel.assigned_caretaker },
                { label: "Warden Name:", value: hostel.assigned_warden },
              ].map((item, index) => (
                <Grid.Col span={12} key={index}>
                  <Grid
                    style={{
                      backgroundColor: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
                      padding: "12px 20px",
                      borderRadius: "4px",
                    }}
                  >
                    <Grid.Col span={6}>
                      <Text
                        weight={500}
                        style={{
                          fontFamily: "'Segoe UI', system-ui, sans-serif",
                          color: "#334155",
                        }}
                      >
                        {item.label}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text
                        align="right"
                        style={{
                          fontFamily: "'Segoe UI', system-ui, sans-serif",
                          color: "#475569",
                        }}
                      >
                        {item.value}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Grid.Col>
              ))}
            </Grid>
          </Box>
        )}
      </Card>
    </>
  );
}
