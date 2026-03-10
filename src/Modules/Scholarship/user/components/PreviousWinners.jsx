import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import axios from "axios";
import {
  Select,
  Button,
  Text,
  Box,
  Loader,
} from "@mantine/core";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import {
  mkConfig,
  generateCsv,
  download,
} from "export-to-csv";
import { IconDownload } from "@tabler/icons-react";
import styles from "./PreviousWinners.module.css";
import { getPreviousWinnersRoute } from "../../../../routes/SPACSRoutes";

function PreviousWinners() {
  const [programme, setProgramme] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [award, setAward] = useState("");
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const awardMapping = {
    "Director's Gold": 2,
    "Director's Silver": 3,
    "Merit-cum-means Scholarship": 1,
    "Notional Prizes": 4,
    "D&M Proficiency Gold Medal": 5,
  };

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename: "previous-winners",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const awardId = awardMapping[award];
    setIsLoading(true);
    setShowTable(true);

    const formData = {
      programme,
      batch: parseInt(academicYear, 10),
      award_id: awardId,
    };

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(getPreviousWinnersRoute, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.result === "Success") {
        const { student_name, student_program, roll } = response.data;
        const winnersArray = student_name.map((name, index) => ({
          name,
          roll: roll[index],
          program: student_program[index],
        }));
        setWinners(winnersArray);
      } else {
        setWinners([]);
        console.error("No winners found:", response.data.error);
      }
    } catch (error) {
      setWinners([]);
      console.error("Error fetching winners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { accessorKey: "name", header: "Name", size: 200 },
    { accessorKey: "roll", header: "Roll No", size: 120 },
    { accessorKey: "program", header: "Program", size: 180 },
  ];

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportAllData = () => {
    const csv = generateCsv(csvConfig)(winners);
    download(csvConfig)(csv);
  };

  const table = useMantineReactTable({
    columns,
    data: winners,
    enableRowSelection: true,
    enableSorting: true,
    columnFilterDisplayMode: "popover",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    renderTopToolbarCustomActions: ({ table }) => (
      <Box className={styles.exportButtons}>
        <div className={styles.export}>
          <Button
            color="blue"
            onClick={handleExportAllData}
            leftIcon={<IconDownload />}
            className="expbtn"
          >
            Export All Data
          </Button>
          <Button
            disabled={table.getPrePaginationRowModel().rows.length === 0}
            onClick={() =>
              handleExportRows(table.getPrePaginationRowModel().rows)
            }
            leftIcon={<IconDownload />}
            className="expbtn"
          >
            Export All Rows
          </Button>
          <Button
            disabled={table.getRowModel().rows.length === 0}
            onClick={() => handleExportRows(table.getRowModel().rows)}
            leftIcon={<IconDownload />}
            className="expbtn"
          >
            Export Page Rows
          </Button>
          <Button
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
            onClick={() =>
              handleExportRows(table.getSelectedRowModel().rows)
            }
            leftIcon={<IconDownload />}
            className="expbtn"
          >
            Export Selected Rows
          </Button>
        </div>
      </Box>
    ),
  });

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <Select
            label="Programme"
            placeholder="Select Programme"
            value={programme}
            onChange={setProgramme}
            data={[
              { value: "B.Tech", label: "B.Tech" },
              { value: "M.Tech", label: "M.Tech" },
              { value: "B.Des", label: "B.Des" },
              { value: "M.Des", label: "M.Des" },
              { value: "PhD", label: "PhD" },
            ]}
            rightSection={<CaretDown />}
            className={styles.formItem}
          />

          <Select
            label="Academic Year"
            placeholder="Select Year"
            value={academicYear}
            onChange={setAcademicYear}
            data={[...Array(11).keys()].map((i) => ({
              value: `${2014 + i}`,
              label: `${2014 + i}`,
            }))}
            rightSection={<CaretDown />}
            className={styles.formItem}
          />

          <Select
            label="Scholarship/Awards"
            placeholder="Select Award"
            value={award}
            onChange={setAward}
            data={Object.keys(awardMapping).map((awardName) => ({
              value: awardName,
              label: awardName,
            }))}
            rightSection={<CaretDown />}
            className={styles.formItem}
          />
        </div>

        <div className={styles.buttonContainer}>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>

      {showTable && (
        <div className={styles.winnersList}>
          {isLoading ? (
            <Loader size="lg" />
          ) : winners.length > 0 ? (
            <MantineReactTable table={table} />
          ) : (
            <Text>No winners found</Text>
          )}
        </div>
      )}
    </div>
  );
}

export default PreviousWinners;
