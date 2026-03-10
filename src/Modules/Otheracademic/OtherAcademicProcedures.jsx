import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { Tabs, Button, Flex, Text } from "@mantine/core";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useMediaQuery } from "@mantine/hooks";
import classes from "../Dashboard/Dashboard.module.css";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import LeaveCombined from "./Leave/LeaveCombined";
import GraduateStatus from "./Graduate_Seminar/graduate_status"; // Adjusted to PascalCase
import TAform from "./Assistantship/Supervisors/TA_supervisorCombined"; // Adjusted name to PascalCase
import BonafideCombined from "./Bonafide/BonafideCombined";
import NoDuesCombined from "./NoDues/NoDuesCombined";
import ApproveLeave from "./Leave/ApproveLeave";
import AdminBonafideRequests from "./Bonafide/AdminBonafideRequests";
import ApproveLeaveTA from "./Leave/ApproveLeaveTA";
import ApproveLeaveThesis from "./Leave/ApproveLeaveThesis";
import DeanPage from "./Assistantship/Admins/dean";
import Director from "./Assistantship/Admins/director";
import AcadAdminPage from "./Assistantship/Admins/Acad_admin";
import HoDPage from "./Assistantship/Admins/Hod";
import LeavePGCombined from "./Leave/LeavePGcombined";
import ThesisSupervisor from "./Assistantship/Admins/ThesisSupervisor";
import TAsupervisor from "./Assistantship/Admins/TAsupervisor";

function OtherAcadProcedures() {
  const tabsListRef = useRef(null);
  const [activeTab, setActiveTab] = useState("0");
  const role = useSelector((state) => state.user.role);
  const roll_no = useSelector((state) => state.user.roll_no);
  const username = useSelector((state) => state.user.username);
  console.log(username, role, roll_no);

  const allTabItems = [
    { title: "Bonafide", component: <BonafideCombined /> }, // 0
    { title: "Leave", component: <LeaveCombined /> }, // 1
    { title: "No dues", component: <NoDuesCombined /> }, // 2
    { title: "Graduate Status", component: <GraduateStatus /> }, // 3
    { title: "TA Supervisor", component: <TAform /> }, // 4
    { title: "Leave Requests HOD", component: <ApproveLeave /> }, // 5
    { title: "Bonafide Request", component: <AdminBonafideRequests /> }, // 6
    { title: "Leave TA", component: <ApproveLeaveTA /> }, // 7
    { title: "Leave Thesis", component: <ApproveLeaveThesis /> }, // 8

    { title: "Assistant Request Director", component: <Director /> }, // 9
    { title: "Assistant Request Dean ", component: <DeanPage /> }, // 10
    { title: "Assistant Request HOD ", component: <HoDPage /> }, // 11
    { title: "Assistant Request Acadadmin ", component: <AcadAdminPage /> }, // 12
    { title: "Leave PG", component: <LeavePGCombined /> }, // 13
    {
      title: "Assistant Request ThesisSupervisor",
      component: <ThesisSupervisor />,
    },
    { title: "Assistant Request TASupervisor", component: <TAsupervisor /> },
  ];
  let filteredTabItems = [];
  if (role === "student") {
    if (
      roll_no[2] === "m" ||
      roll_no[2] === "p" ||
      roll_no[2] === "M" ||
      roll_no[2] === "P"
    ) {
      filteredTabItems = allTabItems.filter((_, index) =>
        [0, 2, 4, 13].includes(index),
      );
    } else {
      filteredTabItems = allTabItems.filter((_, index) =>
        [0, 1, 2].includes(index),
      );
    }
  } else if (role === "acadadmin") {
    filteredTabItems = allTabItems.filter((_, index) =>
      [3, 6, 12].includes(index),
    );
  } else if (role.startsWith("HOD")) {
    filteredTabItems = allTabItems.filter((_, index) =>
      [5, 11].includes(index),
    );
  } else filteredTabItems = allTabItems;

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, filteredTabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
    tabsListRef.current.scrollBy({
      left: direction === "next" ? 50 : -50,
      behavior: "smooth",
    });
  };

  const isAboveXs = useMediaQuery("(min-width: 530px)");

  return (
    <>
      <CustomBreadcrumbs />
      <Flex justify="space-between" align="center" mt="lg">
        <Flex
          style={{ width: isAboveXs ? "" : "330px" }}
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
                {filteredTabItems.map((item, index) => (
                  <Tabs.Tab
                    value={`${index}`}
                    key={index}
                    className={
                      activeTab === `${index}`
                        ? classes.fusionActiveRecentTab
                        : ""
                    }
                  >
                    <Flex gap="4px">
                      <Text>{item.title}</Text>
                    </Flex>
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
      </Flex>

      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          marginTop: isAboveXs ? "20px" : "0px",
          marginLeft: isAboveXs ? "25px" : "0px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {filteredTabItems[+activeTab]?.component}
      </div>
    </>
  );
}

export default OtherAcadProcedures;
