import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Group,
  Text,
  Box,
  Container,
  ScrollArea,
  Paper,
  Divider,
} from "@mantine/core";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { setActiveTab_, setCurrentModule } from "../../../redux/moduleslice";
/**
 * Enhanced SectionNavigation component that can be used across different user roles
 *
 * @param {Object} props
 * @param {string[]} props.sections - Main navigation sections
 * @param {Object} props.subSections - Object mapping sections to their subsections
 * @param {Object} props.components - Object mapping section/subsection keys to components
 * @param {string} props.defaultSection - Default section to show on load
 * @param {string} props.userrole - User userrole (admin, warden, caretaker, student)
 */
export default function EnhancedSectionNavigation({
  sections,
  subSections = {},
  components,
  defaultSection = "Notice Board",
  userrole = "student",
}) {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.module.active_tab);
  const [activeSubSection, setActiveSubSection] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(setCurrentModule("Hostel"));
    dispatch(setActiveTab_(defaultSection));
  }, [dispatch, defaultSection]);

  useEffect(() => {
    if (subSections[activeTab]) {
      setActiveSubSection(subSections[activeTab][0]);
    } else {
      setActiveSubSection(null);
    }
  }, [activeTab, subSections]);

  const getComponentKey = () => {
    if (activeSubSection) {
      return `${activeTab}_${activeSubSection}`;
    }
    return activeTab;
  };

  const DefaultComponent = components[defaultSection];
  const ActiveComponent = components[getComponentKey()] || DefaultComponent;

  const handleSectionClick = (section) => {
    dispatch(setActiveTab_(section));
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollTo({
        left:
          scrollRef.current.scrollLeft +
          (direction === "left" ? -scrollAmount : scrollAmount),
        behavior: "smooth",
      });
    }
  };

  const roleColors = {
    admin: "#4299E1", // Blue
    warden: "#4299E1", // Green
    caretaker: "#4299E1", // Orange
    student: "#4299E1", // Blue (default)
  };

  const activeColor = roleColors[userrole] || "#4299E1";

  return (
    <Container
      size="xl"
      p="md"
      className="mx-auto"
      style={{ maxWidth: "1200px" }}
    >
      <Paper shadow="xs" p="md" radius="md" mb="md">
        <Divider mb="md" />

        <ScrollArea viewportRef={scrollRef} style={{ width: "100%" }}>
          <Group spacing="md" position="apart">
            <Group>
              <CaretLeft
                size={20}
                weight="bold"
                color="#718096"
                style={{ cursor: "pointer", flexShrink: 0 }}
                onClick={() => handleScroll("left")}
              />

              <Group spacing="xs">
                {sections.map((section, index) => (
                  <React.Fragment key={section}>
                    <Text
                      size="md"
                      weight={activeTab === section ? 600 : 400}
                      color={activeTab === section ? activeColor : "#718096"}
                      style={{
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        backgroundColor:
                          activeTab === section
                            ? `${activeColor}10`
                            : "transparent",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => handleSectionClick(section)}
                    >
                      {section}
                    </Text>
                    {index < sections.length - 1 && (
                      <Text color="#CBD5E0" size="sm">
                        |
                      </Text>
                    )}
                  </React.Fragment>
                ))}
              </Group>

              <CaretRight
                size={20}
                weight="bold"
                color="#718096"
                style={{ cursor: "pointer", flexShrink: 0 }}
                onClick={() => handleScroll("right")}
              />
            </Group>
          </Group>
        </ScrollArea>

        {subSections[activeTab] && (
          <Box mt="md">
            <ScrollArea>
              <Group spacing="xs" mt="xs" ml="md">
                {subSections[activeTab].map((subSection, index) => (
                  <React.Fragment key={subSection}>
                    <Text
                      size="sm"
                      weight={activeSubSection === subSection ? 600 : 400}
                      color={
                        activeSubSection === subSection
                          ? activeColor
                          : "#718096"
                      }
                      style={{
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          activeSubSection === subSection
                            ? `${activeColor}10`
                            : "transparent",
                      }}
                      onClick={() => setActiveSubSection(subSection)}
                    >
                      {subSection}
                    </Text>
                    {index < subSections[activeTab].length - 1 && (
                      <Text color="#CBD5E0" size="sm">
                        •
                      </Text>
                    )}
                  </React.Fragment>
                ))}
              </Group>
            </ScrollArea>
            <Divider mt="sm" color="#EDF2F7" />
          </Box>
        )}
      </Paper>

      <Paper
        shadow="sm"
        p="md"
        radius="md"
        style={{
          width: "100%",
          minHeight: "70vh",
          maxHeight: "75vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px",
          }}
        >
          <ActiveComponent />
        </Box>
      </Paper>
    </Container>
  );
}

EnhancedSectionNavigation.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.string).isRequired,
  subSections: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  components: PropTypes.objectOf(PropTypes.elementType).isRequired,
  defaultSection: PropTypes.string,
  userrole: PropTypes.string,
};
