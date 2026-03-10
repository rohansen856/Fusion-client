/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import cx from "clsx";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Table, Button, Badge, ScrollArea, Text } from "@mantine/core";
import {
  Eye,
  FileText,
  PlusCircle,
  ArrowsDownUp,
  ArrowUp,
  ArrowDown,
} from "@phosphor-icons/react";
import classes from "../../styles/tableStyle.module.css";
import ProjectViewModal from "../modals/projectViewModal";
import { badgeColor } from "../../helpers/badgeColours";

function ProjectTable({ setActiveTab, projectsData }) {
  const [scrolled, setScrolled] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const role = useSelector((state) => state.user.role);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const sortData = (data, column) => {
    const sorted = [...data].sort((a, b) => {
      if (a[column] === null || a[column] === undefined) return 1;
      if (b[column] === null || b[column] === undefined) return -1;

      const aValue =
        typeof a[column] === "string" ? a[column].toLowerCase() : a[column];
      const bValue =
        typeof b[column] === "string" ? b[column].toLowerCase() : b[column];

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const navigate = useNavigate();
  const handleProjectActionClick = (row) => {
    let tabIndex = "1";
    if (role.includes("Professor") || role.includes("SectionHead_RSPC")) {
      tabIndex =
        row.status === "OnGoing" ? "1" : row.status === "Completed" ? "2" : "0";
    }
    navigate("/research/forms", {
      state: { data: row, initialTab: tabIndex },
    });
  };

  const handleProjectAddClick = () => {
    setActiveTab("1");
  };

  const handleViewClick = (row) => {
    setSelectedProject(row);
    setViewModalOpened(true);
  };

  const displayedProjects = sortColumn
    ? sortData(projectsData, sortColumn)
    : projectsData;
  const rows = displayedProjects.map((row, index) => (
    <Table.Tr key={index}>
      <Table.Td className={classes["row-content"]}>
        <Badge
          color={badgeColor[row.status]}
          size="lg"
          style={{ minWidth: "110px", color: "#3f3f3f" }}
        >
          {row.status}
        </Badge>
      </Table.Td>
      <Table.Td className={classes["row-content"]}>{row.name}</Table.Td>
      <Table.Td className={classes["row-content"]}>{row.pid}</Table.Td>
      <Table.Td className={classes["row-content"]}>
        {row.sponsored_agency}
      </Table.Td>
      <Table.Td className={classes["row-content"]}>
        {row.sanction_date
          ? new Date(row.sanction_date).toLocaleDateString()
          : "---"}
      </Table.Td>
      <Table.Td className={classes["row-content"]}>
        {role.includes("Professor") ? (
          <Button
            onClick={() => handleProjectActionClick(row)}
            variant="outline"
            color="#15ABFF"
            size="xs"
            style={{ borderRadius: "8px", minWidth: "105px" }}
            disabled={row.status === "Registered"}
          >
            <FileText size={26} style={{ marginRight: "3px" }} />
            {row.status === "Submitted"
              ? "Register"
              : row.status === "OnGoing"
                ? "Forms"
                : "Details"}
          </Button>
        ) : role.includes("SectionHead_RSPC") ? (
          <Button
            onClick={() => handleProjectActionClick(row)}
            variant="outline"
            color="#15ABFF"
            size="xs"
            style={{ borderRadius: "8px", minWidth: "120px" }}
            disabled={row.status === "Submitted"}
          >
            <FileText size={26} style={{ marginRight: "3px" }} />
            {row.status === "Registered"
              ? "Commence"
              : row.status === "OnGoing"
                ? "Forms"
                : "Details"}
          </Button>
        ) : (
          <Button
            onClick={() => handleProjectActionClick(row)}
            variant="outline"
            color="#15ABFF"
            size="xs"
            style={{ borderRadius: "8px" }}
            disabled={row.status !== "OnGoing" && row.status !== "Completed"}
          >
            <FileText size={26} style={{ marginRight: "3px" }} />
            Details
          </Button>
        )}
      </Table.Td>

      <Table.Td className={classes["row-content"]}>
        <Button
          onClick={() => handleViewClick(row)}
          variant="outline"
          color="#15ABFF"
          size="xs"
          style={{ borderRadius: "8px" }}
        >
          <Eye size={26} style={{ margin: "3px" }} />
          View
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div style={{ padding: "3% 5%" }}>
      <ScrollArea
        h={350}
        onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
      >
        <Table highlightOnHover>
          <Table.Thead
            className={cx(classes.header, { [classes.scrolled]: scrolled })}
          >
            <Table.Tr>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("status")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Status
                  {sortColumn === "status" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("name")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Project Name
                  {sortColumn === "name" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("pid")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Project ID
                  {sortColumn === "pid" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("sponsored_agency")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Sponsor Agency
                  {sortColumn === "sponsored_agency" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("sanction_date")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Sanction Date
                  {sortColumn === "sanction_date" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th className={classes["header-cell"]}>
                Action Centre
              </Table.Th>
              <Table.Th className={classes["header-cell"]}>
                Project Info
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          {projectsData ? (
            <Table.Tbody>{rows}</Table.Tbody>
          ) : (
            <Text color="red" align="center">
              Unable to load project details
            </Text>
          )}
        </Table>
      </ScrollArea>
      {role.includes("Professor") && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "3%",
            marginRight: "3%",
          }}
        >
          <Button
            onClick={handleProjectAddClick}
            color="green"
            size="s"
            style={{ borderRadius: "8px", padding: "7px 18px" }}
          >
            <PlusCircle size={26} style={{ marginRight: "3px" }} />
            New Project Proposal
          </Button>
        </div>
      )}
      <ProjectViewModal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        projectData={selectedProject}
      />
    </div>
  );
}

ProjectTable.propTypes = {
  projectsData: PropTypes.arrayOf(
    PropTypes.shape({
      pid: PropTypes.number,
    }),
  ),
  setActiveTab: PropTypes.func.isRequired,
};

export default ProjectTable;
