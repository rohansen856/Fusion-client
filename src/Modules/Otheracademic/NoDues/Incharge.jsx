import { useState } from "react";
import { Select, Button, Table } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import styles from "./Incharge.module.css";

function Incharge() {
  const [batch, setBatch] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [studentsCleared, setStudentsCleared] = useState([]);
  const [studentsNotCleared, setStudentsNotCleared] = useState([]);
  const [selectedCleared, setSelectedCleared] = useState([]);
  const [selectedNotCleared, setSelectedNotCleared] = useState([]);

  const studentsData = [
    { name: "Alice", rollNo: "202201", duesCleared: true },
    { name: "Bob", rollNo: "202202", duesCleared: false },
    { name: "Charlie", rollNo: "202203", duesCleared: true },
    { name: "David", rollNo: "202204", duesCleared: false },
  ];

  const handleFetchStudents = () => {
    const cleared = studentsData.filter((student) => student.duesCleared);
    const notCleared = studentsData.filter((student) => !student.duesCleared);
    setStudentsCleared(cleared);
    setStudentsNotCleared(notCleared);
  };

  const handleSelectAll = (isCleared, e) => {
    const isChecked = e.target.checked;
    if (isCleared) {
      setSelectedCleared(
        isChecked ? studentsCleared.map((student) => student.rollNo) : [],
      );
    } else {
      setSelectedNotCleared(
        isChecked ? studentsNotCleared.map((student) => student.rollNo) : [],
      );
    }
  };

  const handleClearDues = () => {
    const clearedStudents = studentsNotCleared.filter((student) =>
      selectedNotCleared.includes(student.rollNo),
    );
    const remainingNotCleared = studentsNotCleared.filter(
      (student) => !selectedNotCleared.includes(student.rollNo),
    );
    setStudentsCleared((prev) => [...prev, ...clearedStudents]);
    setStudentsNotCleared(remainingNotCleared);
    setSelectedNotCleared([]);
  };

  const handleRevertDues = () => {
    const revertedStudents = studentsCleared.filter((student) =>
      selectedCleared.includes(student.rollNo),
    );
    const remainingCleared = studentsCleared.filter(
      (student) => !selectedCleared.includes(student.rollNo),
    );
    setStudentsNotCleared((prev) => [...prev, ...revertedStudents]);
    setStudentsCleared(remainingCleared);
    setSelectedCleared([]);
  };

  const handleCheckboxChange = (rollNo, isCleared) => {
    if (isCleared) {
      setStudentsCleared((prev) =>
        prev.filter((student) => student.rollNo !== rollNo),
      );
      setStudentsNotCleared((prev) => [
        ...prev,
        studentsCleared.find((student) => student.rollNo === rollNo),
      ]);
    } else {
      setStudentsNotCleared((prev) =>
        prev.filter((student) => student.rollNo !== rollNo),
      );
      setStudentsCleared((prev) => [
        ...prev,
        studentsNotCleared.find((student) => student.rollNo === rollNo),
      ]);
    }
  };
  const isAboveXs = useMediaQuery("(min-width: 640px)");

  return (
    <div>
      <div
        style={{
          display: isAboveXs ? "flex" : "block",
          alignItems: isAboveXs ? "flex-end" : "",
        }}
      >
        <Select
          data={["2021", "2022", "2023", "2024"]}
          label="Select Batch"
          value={batch}
          onChange={setBatch}
          placeholder="Choose a batch"
          mr={10}
          mb={10}
        />
        <Select
          data={["CSE", "ECE", "SM", "ME", "Design"]}
          label="Select Discipline"
          value={discipline}
          onChange={setDiscipline}
          placeholder="Choose a discipline"
          mr={10}
          mb={10}
        />
        <Button mb={10} onClick={handleFetchStudents}>
          Fetch <br />
          Students
        </Button>
      </div>

      <div className={styles["table-box"]}>
        <h3>Cleared No Dues</h3>
        <Button
          onClick={handleRevertDues}
          disabled={selectedCleared.length === 0}
        >
          Revert Selected to Not Cleared
        </Button>
        <Table className={styles["table-container"]} striped highlightOnHover>
          <thead>
            <tr>
              <th>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(true, e)}
                    checked={
                      selectedCleared.length === studentsCleared.length &&
                      studentsCleared.length > 0
                    }
                  />
                  Select All Cleared
                </label>
              </th>

              <th>Name</th>
              <th>Roll No</th>
              <th>Clear/Unclear</th>
            </tr>
          </thead>
          <tbody>
            {studentsCleared.map((student, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCleared.includes(student.rollNo)}
                    onChange={() =>
                      setSelectedCleared((prev) =>
                        prev.includes(student.rollNo)
                          ? prev.filter((rollNo) => rollNo !== student.rollNo)
                          : [...prev, student.rollNo],
                      )
                    }
                    aria-label={`Select ${student.name}`}
                  />
                </td>
                <td>{student.name}</td>
                <td>{student.rollNo}</td>
                <td>
                  <input
                    type="checkbox"
                    checked
                    onChange={() => handleCheckboxChange(student.rollNo, true)}
                    aria-label={`Mark ${student.name} as not cleared`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className={styles["table-box"]}>
        <h3>Not Cleared No Dues</h3>
        <Button
          onClick={handleClearDues}
          disabled={selectedNotCleared.length === 0}
        >
          Clear Selected
        </Button>
        <Table className={styles["table-container"]} striped highlightOnHover>
          <thead>
            <tr>
              <th>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(false, e)}
                    checked={
                      selectedNotCleared.length === studentsNotCleared.length &&
                      studentsNotCleared.length > 0
                    }
                  />
                  Select All Not Cleared
                </label>
              </th>

              <th>Name</th>
              <th>Roll No</th>
              <th>Clear/Unclear</th>
            </tr>
          </thead>
          <tbody>
            {studentsNotCleared.map((student, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedNotCleared.includes(student.rollNo)}
                    onChange={() =>
                      setSelectedNotCleared((prev) =>
                        prev.includes(student.rollNo)
                          ? prev.filter((rollNo) => rollNo !== student.rollNo)
                          : [...prev, student.rollNo],
                      )
                    }
                    aria-label={`Select ${student.name}`}
                  />
                </td>
                <td>{student.name}</td>
                <td>{student.rollNo}</td>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(student.rollNo, false)}
                    aria-label={`Mark ${student.name} as cleared`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default Incharge;
