import { useState } from "react";
import { Select, Button, Flex, Table } from "@mantine/core";
import styles from "./LabInchargeNoDuesStatus.module.css"; // Import the CSS module

function LabInchargeNoDuesStatus() {
  const [batch, setBatch] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [studentsCleared, setStudentsCleared] = useState([]);
  const [studentsNotCleared, setStudentsNotCleared] = useState([]);
  const [selectedCleared, setSelectedCleared] = useState([]);
  const [selectedNotCleared, setSelectedNotCleared] = useState([]);

  // Dummy data for demonstration (replace with your fetching logic)
  const studentsData = [
    { name: "Alice", rollNo: "202201", duesCleared: true },
    { name: "Bob", rollNo: "202202", duesCleared: false },
    { name: "Charlie", rollNo: "202203", duesCleared: true },
    { name: "David", rollNo: "202204", duesCleared: false },
  ];

  const handleFetchStudents = () => {
    // Logic to fetch students based on selected batch and discipline
    const cleared = studentsData.filter((student) => student.duesCleared);
    const notCleared = studentsData.filter((student) => !student.duesCleared);
    setStudentsCleared(cleared);
    setStudentsNotCleared(notCleared);
  };

  // Select All functionality for cleared students
  const handleSelectAllCleared = (e) => {
    const isChecked = e.target.checked;
    setSelectedCleared(
      isChecked ? studentsCleared.map((student) => student.rollNo) : [],
    );
  };

  // Select All functionality for not cleared students
  const handleSelectAllNotCleared = (e) => {
    const isChecked = e.target.checked;
    setSelectedNotCleared(
      isChecked ? studentsNotCleared.map((student) => student.rollNo) : [],
    );
  };

  // Function to clear dues for selected students
  const handleClearDues = () => {
    const clearedStudents = studentsNotCleared.filter((student) =>
      selectedNotCleared.includes(student.rollNo),
    );
    const remainingStudents = studentsNotCleared.filter(
      (student) => !selectedNotCleared.includes(student.rollNo),
    );
    setStudentsCleared((prev) => [...prev, ...clearedStudents]);
    setStudentsNotCleared(remainingStudents);
    setSelectedNotCleared([]);
  };

  // Function to revert dues for selected cleared students
  const handleRevertDues = () => {
    const revertedStudents = studentsCleared.filter((student) =>
      selectedCleared.includes(student.rollNo),
    );
    const remainingClearedStudents = studentsCleared.filter(
      (student) => !selectedCleared.includes(student.rollNo),
    );
    setStudentsNotCleared((prev) => [...prev, ...revertedStudents]);
    setStudentsCleared(remainingClearedStudents);
    setSelectedCleared([]);
  };

  // Function to handle checkbox changes in the "Check" column
  const handleCheckboxChange = (studentRollNo, isCleared) => {
    if (isCleared) {
      // Move student from cleared to not cleared
      const updatedCleared = studentsCleared.filter(
        (student) => student.rollNo !== studentRollNo,
      );
      const revertedStudent = studentsCleared.find(
        (student) => student.rollNo === studentRollNo,
      );
      setStudentsCleared(updatedCleared);
      setStudentsNotCleared([...studentsNotCleared, revertedStudent]);
    } else {
      // Move student from not cleared to cleared
      const updatedNotCleared = studentsNotCleared.filter(
        (student) => student.rollNo !== studentRollNo,
      );
      const clearedStudent = studentsNotCleared.find(
        (student) => student.rollNo === studentRollNo,
      );
      setStudentsNotCleared(updatedNotCleared);
      setStudentsCleared([...studentsCleared, clearedStudent]);
    }
  };

  return (
    <div>
      <Flex justify="space-between" align="center" mt="lg">
        <Select
          data={["2021", "2022", "2023", "2024"]}
          label="Select Batch"
          value={batch}
          onChange={setBatch}
          placeholder="Choose a batch"
        />
        <Select
          data={["CSE", "ECE", "SM", "ME", "Design"]}
          label="Select Discipline"
          value={discipline}
          onChange={setDiscipline}
          placeholder="Choose a discipline"
        />
        <Button onClick={handleFetchStudents}>Fetch Students</Button>
      </Flex>

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
                <input
                  type="checkbox"
                  onChange={handleSelectAllCleared}
                  checked={
                    selectedCleared.length === studentsCleared.length &&
                    studentsCleared.length > 0
                  }
                  aria-label="Select all cleared"
                />
              </th>
              <th>Name</th>
              <th>Roll No</th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody>
            {studentsCleared.map((student, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCleared.includes(student.rollNo)}
                    onChange={() => {
                      const newSelection = selectedCleared.includes(
                        student.rollNo,
                      )
                        ? selectedCleared.filter(
                            (rollNo) => rollNo !== student.rollNo,
                          )
                        : [...selectedCleared, student.rollNo];
                      setSelectedCleared(newSelection);
                    }}
                    aria-label={`Select ${student.name}`}
                  />
                </td>
                <td>{student.name}</td>
                <td>{student.rollNo}</td>
                <td>
                  <input
                    type="checkbox"
                    checked // Since this student is in cleared, we mark it as checked
                    onChange={() => handleCheckboxChange(student.rollNo, true)}
                    aria-label={`Revert ${student.name}`}
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
                <input
                  type="checkbox"
                  onChange={handleSelectAllNotCleared}
                  checked={
                    selectedNotCleared.length === studentsNotCleared.length &&
                    studentsNotCleared.length > 0
                  }
                  aria-label="Select all not cleared"
                />
              </th>
              <th>Name</th>
              <th>Roll No</th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody>
            {studentsNotCleared.map((student, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedNotCleared.includes(student.rollNo)}
                    onChange={() => {
                      const newSelection = selectedNotCleared.includes(
                        student.rollNo,
                      )
                        ? selectedNotCleared.filter(
                            (rollNo) => rollNo !== student.rollNo,
                          )
                        : [...selectedNotCleared, student.rollNo];
                      setSelectedNotCleared(newSelection);
                    }}
                    aria-label={`Select ${student.name}`}
                  />
                </td>
                <td>{student.name}</td>
                <td>{student.rollNo}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={false} // Since this student is not cleared, we mark it as unchecked
                    onChange={() => handleCheckboxChange(student.rollNo, false)}
                    aria-label={`Clear ${student.name}`}
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

export default LabInchargeNoDuesStatus;
