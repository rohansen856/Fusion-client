import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Anchor,
  Text,
  Button,
  Tabs,
  Flex,
  Grid,
  Container,
  Loader,
} from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import Bills from "./Bills";
import Vendors from "./Vendors";
import classes from "../../../Dashboard/Dashboard.module.css";
import { WorkContext } from "../../helper/WorkContext";
import Report from "./Report";
import CustomBread from "../BreadCrumbs";
import "../GlobTable.css";
import { GetWorkData } from "../../handlers/handlers";

function IwdPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("0");
  const role = useSelector((state) => state.user.role);
  const accessible = useSelector(
    (state) => state.user.accessibleModules[role].iwd,
  );
  const { workDetails, setWorkDetails } = useContext(WorkContext);
  const [isLoading, setLoading] = useState(true);
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const tabsListRef = useRef(null);
  const tabItems = [
    { title: "Vendors", component: <Vendors workDetails={workDetails} /> },
    { title: "Bills", component: <Bills setActiveTab={setActiveTab} /> },
    {
      title: "Report",
      component: <Report />,
    },
  ];
  useEffect(() => {
    GetWorkData({ setWorkDetails, id, setLoading });
    console.log(workDetails);
  }, [role]);
  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
    tabsListRef.current.scrollBy({
      left: direction === "next" ? 50 : -50,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const currentTab = tabItems[parseInt(activeTab, 10)];
    const breadcrumbs = [
      { title: "Home", href: "/dashboard" },
      { title: "IWD", href: "/iwd" },
      { title: "work", href: "#" },
      { title: currentTab.title, href: "#" },
    ].map((item, index) => (
      <Anchor
        key={index}
        onClick={() => {
          if (item.href !== "#") {
            navigate(item.href);
          }
        }}
        c="dark"
      >
        <Text style={{ fontWeight: "600" }}>{item.title}</Text>
      </Anchor>
    ));

    setBreadcrumbItems(breadcrumbs);
  }, [activeTab]);

  if (!accessible) {
    return (
      <Flex justify="center" align="center" style={{ height: "100vh" }}>
        <Text color="red" size="lg">
          Unauthorized Access
        </Text>
      </Flex>
    );
  }

  return (
    <div style={{ maxHeight: "100vh" }}>
      <CustomBread breadCrumbs={breadcrumbItems} />
      <Flex
        justify="flex-start"
        align="center"
        gap={{ base: "0.5rem", md: "1rem" }}
        mt={{ base: "1rem", md: "1.5rem" }}
        ml={{ md: "lg" }}
      >
        <Button
          onClick={() => handleTabChange("prev")}
          variant="default"
          p={0}
          style={{ border: "none" }}
        >
          <CaretCircleLeft
            className={classes.fusionCaretCircleIcon}
            weight="light"
          />
        </Button>

        <div className={classes.fusionTabsContainer} ref={tabsListRef}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
              {tabItems.map((item, index) => (
                <Tabs.Tab
                  value={`${index}`}
                  key={index}
                  onClick={() => setActiveTab(String(index))}
                  className={
                    activeTab === `${index}`
                      ? // activeTab === String(index)
                        classes.fusionActiveRecentTab
                      : ""
                  }
                >
                  <Text>{item.title}</Text>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </div>
        <Button
          onClick={() => handleTabChange("next")}
          variant="default"
          p={0}
          style={{ border: "none" }}
        >
          <CaretCircleRight
            className={classes.fusionCaretCircleIcon}
            weight="light"
          />
        </Button>
      </Flex>
      {isLoading ? (
        <Grid mt="xl">
          <Container py="xl">
            <Loader size="lg" />
          </Container>
        </Grid>
      ) : (
        tabItems[parseInt(activeTab, 10)].component
      )}
    </div>
  );
}

export default IwdPage;
