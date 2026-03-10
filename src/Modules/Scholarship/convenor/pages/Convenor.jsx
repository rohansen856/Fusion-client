import React, { useState } from "react";
import { Tabs, Text } from "@mantine/core";
import AwardsAndScholarshipCatalog from "../components/AwardsAndScholarshipCatalogC";
import SpacsMembers from "../components/spacsMembersC";
import PreviousWinners from "../components/previousWinnerC";
import styles from "./Convenor.module.css";

function ConvenorPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabItems = [
    {
      label: "Awards and Scholarship Catalogue",
      component: <AwardsAndScholarshipCatalog />,
    },
    { label: "SPACS Members and Details", component: <SpacsMembers /> },
    { label: "Previous Winners", component: <PreviousWinners /> },
  ];

  return (
    <div className={styles.pageBackground}>
      <div className={styles.wrapper}>
        {/* Navigation Tabs */}
        <div className={styles.tabsContainer}>
          <Tabs value={activeTab.toString()}>
            <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
              {tabItems.map((tab, index) => (
                <Tabs.Tab
                  key={index}
                  value={index.toString()}
                  onClick={() => setActiveTab(index)}
                  className={
                    activeTab === index ? styles.activeTab : styles.inactiveTab
                  }
                >
                  <Text size="lg">{tab.label}</Text>
                  {/* Underline Progress Bar */}
                  {activeTab === index && <div className={styles.underline} />}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </div>

        {/* Content */}
        <div>{tabItems[activeTab].component}</div>
      </div>
    </div>
  );
}

export default ConvenorPage;
