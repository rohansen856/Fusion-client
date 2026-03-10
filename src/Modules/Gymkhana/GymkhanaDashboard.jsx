import { useState, Suspense, lazy, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Select,
  Group,
  Text,
  Badge,
  SimpleGrid,
  Card,
  Modal,
  Button,
} from "@mantine/core";
import dayjs from "dayjs";
import { useMediaQuery } from "@mantine/hooks";
import ModuleTabs from "../../components/moduleTabs";
import { setActiveTab_ } from "../../redux/moduleslice";

import ClubFilter from "./calender/ClubFilter";
import DateSelector from "./calender/DateSelector";
import EventCalendar from "./calender/EventCalender";
import EventCard from "./calender/EventCard";

import {
  useGetClubMembers,
  useGetData,
  useGetPastEvents,
  useGetUpcomingEvents,
  useGetClubAcheivement,
  useGetFests,
} from "./BackendLogic/ApiRoutes";

const CustomTable = lazy(() => import("./CustomTable"));
const ClubViewComponent = lazy(() => import("./ClubViewComponent"));

function GymkhanaDashboard() {
  const isMobile = useMediaQuery(`(max-width: 750px)`);
  const token = localStorage.getItem("authToken");
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("0");
  const [value, setValue] = useState("Select a Club");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClub, setSelectedClub] = useState("All Clubs");
  const tabs = [
    { title: "Clubs" },
    { title: "Calendar" },
    { title: "Fests" },
    { title: "Events" },
  ];
  const badges = []; // Add badge data if needed
  const [opened, setOpened] = useState(false);
  const [selectedFest, setSelectedFest] = useState(null);

  const openModal = (fest) => {
    setSelectedFest(fest);
    setOpened(true);
  };

  const { data: upcomingEvents } = useGetUpcomingEvents(token);
  const { data: pastEvents } = useGetPastEvents(token);
  console.log(pastEvents);
  const { data: fests } = useGetFests(token);
  const { data: clubMembers, refetch: refetchClubMembers } = useGetClubMembers(
    value,
    token,
  );
  // eslint-disable-next-line no-unused-vars
  const { data: clubDetails, refetch: refetchClubDetail } = useGetData(
    value,
    token,
  );
  const { data: Acheivements, refetch: refetchAcheivements } =
    useGetClubAcheivement(value, token);
  // Use useEffect to refetch data when `value` (selected club) changes
  useEffect(() => {
    if (value && value !== "Select a Club") {
      refetchClubMembers(); // Trigger refetch of club members
      refetchClubDetail();
      refetchAcheivements(); // Trigger refetch of club details
    }
  }, [value, refetchClubMembers, refetchClubDetail]);
  console.log(JSON.stringify(clubDetails, null, 2));
  return (
    <>
      <ModuleTabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(String(tab));
          dispatch(setActiveTab_(tabs[tab].title)); // Dispatch the Redux action if necessary
        }}
        badges={badges}
      />
      {activeTab === "0" && (
        <Box
          mt={{ base: "5px", sm: "30px" }}
          mx={{ base: "5px", sm: "30px" }}
          px={{ base: "5px", sm: "30px" }}
          mb={{ base: "xs", sm: "30px" }}
          w="90vw"
        >
          <Group justify="end" mb="5px" mr="110px">
            <Select
              data={[
                "BitByte",
                "AFC",
                "Jazbaat",
                "Aavartan",
                "Badminton Club",
                "Volleyball Club",
              ]}
              value={value}
              placeholder="Select a Club"
              onChange={setValue}
              w="220px"
            />
          </Group>
          {value === "Select a Club" ? (
            <Paper
              shadow="md"
              p="xl"
              style={{
                height: "80vh",
                overflow: "auto",
                width: "100%", // Changed from 80vw
                maxWidth: "1200px", // Optional max-width for larger screens
                margin: "10px auto", // Centered with small margin
              }}
            >
              {/* Science & Tech Clubs Content */}
              <Box mb="xl" px="sm">
                <h2
                  style={{
                    borderBottom: "2px solid #e67700",
                    paddingBottom: "8px",
                  }}
                >
                  Science & Technology Clubs
                </h2>
              </Box>
              {/* Card Grid - 3 columns */}
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {/* 1. Programming Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200, // Increased height for better content visibility
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/programming.png"
                        alt="Programming Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        The Programming Club
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      The byte-sized problem solvers! We host weekly coding
                      contests, hackathons, and open-source contribution drives.
                      Our teams have won ACM-ICPC regionals and developed apps
                      used by 10,000+ students.
                    </Text>
                    <Text size="sm" mt="md">
                      <b>Facilities:</b> 24/7 coding lab with high-performance
                      machines
                    </Text>
                  </Box>
                </Paper>

                {/* 2. Business & Management Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/business.png"
                        alt="Business Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Business & Management Club
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Future CEOs in the making! We organize case study
                      competitions, startup mentorship programs, and investor
                      pitch simulations. Our annual "BizTech Summit" attracts
                      industry leaders.
                    </Text>
                  </Box>
                </Paper>

                {/* 3. Astronomy & Physics Society */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/telescope.png"
                        alt="Astronomy Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Astronomy & Physics Society
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Exploring the universe one star at a time. We host
                      telescope nights, astrophysics lectures, and participate
                      in international astronomy olympiads. Our radio telescope
                      project won NASA's Space Apps Challenge.
                    </Text>
                  </Box>
                </Paper>

                {/* 4. Aero Fabrication Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/airplane.png"
                        alt="Aero Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Aero Fabrication Club
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Building the future of flight. Members design drones, RC
                      planes, and compete in international competitions like SAE
                      Aero Design. Our solar-powered UAV achieved 8 hours
                      continuous flight.
                    </Text>
                  </Box>
                </Paper>

                {/* 5. Robotics Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/robot-2.png"
                        alt="Robotics Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Robotics Club
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Where machines come to life! We build combat robots,
                      autonomous rovers, and compete in ABU Robocon. Our
                      humanoid robot "Jarvis" won 2nd place in the National
                      Robotics Championship.
                    </Text>
                  </Box>
                </Paper>

                {/* 6. Racing Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/2583/2583344.png"
                        alt="Racing Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Racing Club
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Engineering speed demons! We design formula-style race
                      cars for Formula Student. Our EV "VoltX" achieves 0-100
                      kmph in 3.2 seconds.
                    </Text>
                  </Box>
                </Paper>
              </SimpleGrid>

              <Box mb="xl">
                <h2
                  style={{
                    borderBottom: "2px solid #228be6",
                    paddingBottom: "8px",
                  }}
                >
                  Cultural Clubs
                </h2>
              </Box>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {/* 1. Saaz - Music Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" noWrap>
                    <Group spacing="xs" align="center">
                      <Text size="xl" fw={700}>
                        Saaz
                      </Text>
                      <Badge color="blue" variant="light">
                        Music
                      </Badge>
                    </Group>
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/music.png"
                        alt="Music Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      The melody makers of campus! From classical to rock, our
                      bands perform at college events and compete nationally.
                      Hosts annual 'Swarangan' festival.
                    </Text>
                  </Box>
                </Paper>

                {/* 2. Jazbaat - Dramatics */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" noWrap>
                    <Group spacing="xs" align="center">
                      <Text size="xl" fw={700}>
                        Jazbaat
                      </Text>
                      <Badge color="red" variant="light">
                        Dramatics
                      </Badge>
                    </Group>
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/drama.png"
                        alt="Drama Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Where stories come alive! Specializes in street plays and
                      annual productions. Won 5 inter-college competitions last
                      year.
                    </Text>
                  </Box>
                </Paper>

                {/* 3. Aavartan - Dance */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" noWrap>
                    <Group spacing="xs" align="center">
                      <Text size="xl" fw={700}>
                        Aavartan
                      </Text>
                      <Badge color="violet" variant="light">
                        Dance
                      </Badge>
                    </Group>
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/dancing-party.png"
                        alt="Dance Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      From Kathak to hip-hop, our award-winning troupe performs
                      at major events. National champions in contemporary dance
                      (2023).
                    </Text>
                  </Box>
                </Paper>

                {/* 4. Samvaad - Literary */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" noWrap>
                    <Group spacing="xs" align="center">
                      <Text size="xl" fw={700}>
                        Samvaad
                      </Text>
                      <Badge color="orange" variant="light">
                        Literary
                      </Badge>
                    </Group>
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/literature.png"
                        alt="Literary Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Hosts poetry slams and debate competitions. Publishes
                      annual magazine "Vachan". Debate team reached national
                      finals 3 years running.
                    </Text>
                  </Box>
                </Paper>

                {/* 5. ShutterBox - Photography */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" noWrap>
                    <Group spacing="xs" align="center">
                      <Text size="xl" fw={700}>
                        ShutterBox
                      </Text>
                      <Badge color="grape" variant="light">
                        Photography
                      </Badge>
                    </Group>
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/compact-camera.png"
                        alt="Photography Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      From DSLR workshops to short film competitions. Annual
                      "Frame Fest" showcases student work. Alumni at National
                      Geographic.
                    </Text>
                  </Box>
                </Paper>

                {/* 6. Abhivyakti - Arts */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" noWrap>
                    <Group spacing="xs" align="center">
                      <Text size="xl" fw={700}>
                        Abhivyakti
                      </Text>
                      <Badge color="green" variant="light">
                        Art & Craft
                      </Badge>
                    </Group>
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/paint-palette.png"
                        alt="Art Club Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Weekly pottery and sketching sessions. Annual art auction
                      funds scholarships. Mural paintings across campus.
                    </Text>
                  </Box>
                </Paper>
              </SimpleGrid>
              <Box mb="xl">
                <h2
                  style={{
                    borderBottom: "2px solid #40c057",
                    paddingBottom: "8px",
                  }}
                >
                  Sports Clubs
                </h2>
              </Box>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {/* 1. Cricket Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/cricket.png"
                        alt="Cricket Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Cricket
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      The willow warriors! 3-time inter-university champions
                      with professional coaching and annual "Boundary Kings"
                      tournament.
                    </Text>
                  </Box>
                </Paper>

                {/* 2. Athletics Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/sprint.png"
                        alt="Athletics Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Athletics
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Speed, strength and stamina! Our athletes hold 15 college
                      records. Hosts the annual "Thunder Run" marathon.
                    </Text>
                  </Box>
                </Paper>

                {/* 3. Badminton Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/badminton.png"
                        alt="Badminton Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Badminton
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      6 wood-floor courts with professional lighting. Weekly
                      doubles tournaments and "Shuttle Premier League".
                    </Text>
                  </Box>
                </Paper>

                {/* 4. Basketball Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/basketball.png"
                        alt="Basketball Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Basketball
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Floodlit courts with NBA-standard flooring. Compete in our
                      3x3 streetball tournament and inter-college league.
                    </Text>
                  </Box>
                </Paper>

                {/* 5. Lawn Tennis Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/tennis.png"
                        alt="Tennis Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Lawn Tennis
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      Clay and grass courts available. Annual "Racket Royale"
                      tournament with players from 20+ colleges.
                    </Text>
                  </Box>
                </Paper>

                {/* 6. Table Tennis Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/ping-pong.png"
                        alt="Table Tennis Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Table Tennis
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      8 professional tables with tournament-grade flooring.
                      Weekly round-robin matches and championships.
                    </Text>
                  </Box>
                </Paper>

                {/* 7. Football Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/soccer.png"
                        alt="Football Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Football
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      FIFA-standard turf with floodlights. 7-a-side league and
                      annual "Golden Boot" tournament. Women's team available.
                    </Text>
                  </Box>
                </Paper>

                {/* 8. Volleyball Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/volleyball.png"
                        alt="Volleyball Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Volleyball
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      4 professional courts (2 indoor). Beach volleyball
                      training. Reigning state university champions.
                    </Text>
                  </Box>
                </Paper>

                {/* 9. Kabaddi Club */}
                <Paper
                  withBorder
                  p="lg"
                  shadow="sm"
                  style={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ width: 30, height: 30 }}>
                      <img
                        src="https://img.icons8.com/color/96/kabaddi.png"
                        alt="Kabaddi Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box>
                      <Text size="xl" fw={700}>
                        Kabaddi
                      </Text>
                    </Box>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginTop: 16,
                      paddingRight: 8,
                    }}
                  >
                    <Text size="sm">
                      National-level players. Professional mat arena. Compete in
                      Pro Kabaddi League scouting tournaments.
                    </Text>
                  </Box>
                </Paper>
              </SimpleGrid>
            </Paper>
          ) : (
            <Suspense fallback={<div>Loading .......</div>}>
              {upcomingEvents && Acheivements && clubMembers && (
                <ClubViewComponent
                  AboutClub={clubDetails?.description}
                  clubName={value}
                  membersData={clubMembers}
                  achievementsData={Acheivements}
                  eventsData={[...upcomingEvents, ...pastEvents]
                    .filter((item) => {
                      if (item.club === value && item.status === "ACCEPT")
                        return true;
                      return false;
                    })
                    .sort((a, b) => a.end_date < b.end_date)}
                  membersColumns={[
                    {
                      accessorKey: "club", // Key in your data object
                      header: "Club", // Column header name
                    },
                    { accessorKey: "description", header: "Description" },

                    { accessorKey: "member", header: "Member" },
                    { accessorKey: "remarks", header: "Remarks" },
                    { accessorKey: "status", header: "Status" },
                  ]}
                  achievementsColumns={[
                    { accessorKey: "title", header: "Title" },
                    { accessorKey: "achievement", header: "Acheivement" },
                  ]}
                  eventsColumns={[
                    { accessorKey: "club", header: "Club" },
                    { accessorKey: "event_name", header: "Event Name" },
                    { accessorKey: "incharge", header: "Incharge" },
                    { accessorKey: "venue", header: "Venue" },
                    {
                      accessorKey: "start_date",
                      header: "Start Date",
                      render: (data) =>
                        new Date(data.start_date).toLocaleDateString(), // optional formatting
                    },
                    {
                      accessorKey: "end_date",
                      header: "End Date",
                      render: (data) =>
                        new Date(data.end_date).toLocaleDateString(), // optional formatting
                    },
                    {
                      accessorKey: "start_time",
                      header: "Start Time",
                      render: (data) => data.start_time.substring(0, 5), // optional formatting (HH:MM)
                    },

                    { accessorKey: "details", header: "Details" },
                  ]}
                />
              )}
            </Suspense>
          )}
        </Box>
      )}
      {activeTab === "1" && (
        <Box>
          {pastEvents && upcomingEvents && (
            <Box
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                height: "100%",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {/* Left Section */}
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "50px",
                  paddingTop: "35px",
                  boxSizing: "border-box",
                }}
              >
                <DateSelector
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
                <EventCard
                  events={[...pastEvents, ...upcomingEvents]
                    .filter((event) =>
                      dayjs(event.start_date).isSame(selectedDate, "day"),
                    )
                    .filter((event) => {
                      if (event.status === "ACCEPT") return true;
                      return false;
                    })}
                />
              </Box>

              {/* Right Section */}
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                    overflow: "auto",
                  }}
                >
                  <h2>{dayjs(selectedDate).format("MMMM YYYY")}</h2>
                  <ClubFilter
                    selectedClub={selectedClub}
                    setSelectedClub={setSelectedClub}
                  />
                </div>
                <EventCalendar
                  selectedDate={selectedDate}
                  selectedClub={selectedClub}
                  events={[...pastEvents, ...upcomingEvents].filter((event) => {
                    if (event.status === "ACCEPT") return true;
                    return false;
                  })}
                />
              </Box>
            </Box>
          )}
        </Box>
      )}
      {activeTab === "2" && (
        <Box mt="10px" mx="0" my="xs">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {fests.map((fest) => (
              <Card
                key={fest.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
              >
                <Text weight={700} size="lg">
                  {fest.name}
                </Text>
                <Badge color="blue" mt="sm" size="sm" variant="light">
                  {fest.category}
                </Badge>
                <Text size="sm" mt="sm">
                  Date: {fest.date}
                </Text>
                <Text size="sm" mt="sm" color="blue">
                  <a href={fest.link} target="_blank" rel="noopener noreferrer">
                    Visit Link
                  </a>
                </Text>
                <Button
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                  onClick={() => openModal(fest)}
                >
                  View Description
                </Button>
              </Card>
            ))}
          </SimpleGrid>

          <Modal
            opened={opened}
            onClose={() => setOpened(false)}
            title={selectedFest?.name}
            centered
            size="70%"
          >
            <Text align="justify" size="md" mt="md">
              {selectedFest?.description.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </Text>
          </Modal>
        </Box>
      )}
      {activeTab === "3" && (
        <Box mt="10px">
          <Box>
            <Suspense fallback={<div>Loading Events Table for you ...</div>}>
              {upcomingEvents && (
                <>
                  <Text size="xl" m="lg">
                    UpcomingEvents Table
                  </Text>
                  <CustomTable
                    data={upcomingEvents}
                    columns={[
                      { accessorKey: "club", header: "Club" },
                      { accessorKey: "event_name", header: "Event Name" },
                      { accessorKey: "incharge", header: "Incharge" },
                      { accessorKey: "venue", header: "Venue" },
                      {
                        accessorKey: "start_date",
                        header: "Start Date",
                        render: (data) =>
                          new Date(data.start_date).toLocaleDateString(),
                      },
                      {
                        accessorKey: "end_date",
                        header: "End Date",
                        render: (data) =>
                          new Date(data.end_date).toLocaleDateString(),
                      },
                      {
                        accessorKey: "start_time",
                        header: "Start Time",
                        render: (data) => data.start_time.substring(0, 5),
                      },
                      { accessorKey: "details", header: "Details" },
                    ]}
                    TableName="Upcoming Events"
                  />
                </>
              )}
            </Suspense>
          </Box>
          <Box>
            <Suspense fallback={<div>Loading Events Table for you ...</div>}>
              {pastEvents && (
                <>
                  <Text size="xl" m="lg">
                    PastEvents Table
                  </Text>
                  <CustomTable
                    data={pastEvents}
                    columns={[
                      { accessorKey: "club", header: "Club" },
                      { accessorKey: "event_name", header: "Event Name" },
                      { accessorKey: "incharge", header: "Incharge" },
                      { accessorKey: "venue", header: "Venue" },
                      {
                        accessorKey: "start_date",
                        header: "Start Date",
                        render: (data) =>
                          new Date(data.start_date).toLocaleDateString(),
                      },
                      {
                        accessorKey: "end_date",
                        header: "End Date",
                        render: (data) =>
                          new Date(data.end_date).toLocaleDateString(),
                      },
                      {
                        accessorKey: "start_time",
                        header: "Start Time",
                        render: (data) => data.start_time.substring(0, 5),
                      },
                      { accessorKey: "details", header: "Details" },
                    ]}
                    TableName="Past Events"
                  />
                </>
              )}
            </Suspense>
          </Box>
        </Box>
      )}
    </>
  );
}

export default GymkhanaDashboard;
