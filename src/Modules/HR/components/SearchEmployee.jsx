import React, { useState, useEffect, useRef } from "react";
import { Select } from "@mantine/core";
import PropTypes from "prop-types";
import { search_employees } from "../../../routes/hr/index";

function SearchEmployee({ onEmployeeSelect, initialSearch }) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState(initialSearch || "");

  const hasAutoSearched = useRef(false);
  const token = localStorage.getItem("authToken");

  const fetchEmployees = async (text) => {
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${search_employees}?search_text=${text}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`);
      }

      const data = await response.json();

      const uniqueEmployees = data.employees.reduce((acc, employee) => {
        if (!acc[employee.id]) {
          acc[employee.id] = {
            value: `${employee.id}-${employee.username}`,
            label: `${employee.username}`,
            details: employee,
          };
        }
        return acc;
      }, {});

      const formattedResults = Object.values(uniqueEmployees);
      setSearchResults(formattedResults);

      return formattedResults;
    } catch (err) {
      setError("Unable to fetch employees.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelection = (selectedValue) => {
    const employee = searchResults.find(
      (result) => result.value === selectedValue,
    );
    setSelectedEmployee(employee?.details || null);
    console.log(selectedEmployee);

    if (onEmployeeSelect && employee?.details) {
      onEmployeeSelect(employee.details);
    }
  };

  useEffect(() => {
    const autoSearch = async () => {
      if (initialSearch && !hasAutoSearched.current) {
        hasAutoSearched.current = true;
        setSearchText(initialSearch);
        console.log(searchText);
        const results = await fetchEmployees(initialSearch);
        if (results.length > 0) {
          const firstEmployee = results[0];
          setSelectedEmployee(firstEmployee.details);
          onEmployeeSelect?.(firstEmployee.details);
        }
      }
    };
    autoSearch();
  }, [initialSearch, onEmployeeSelect]);

  return (
    <div style={{ maxWidth: "400px", marginBottom: "20px" }}>
      <Select
        label="Search Employee"
        placeholder="Type to search"
        searchable
        nothingFound={error || "No employees found"}
        data={searchResults}
        onSearchChange={(val) => {
          setSearchText(val);
          fetchEmployees(val);
        }}
        onChange={handleEmployeeSelection}
        disabled={loading}
      />
    </div>
  );
}

// ✅ PropTypes validation
SearchEmployee.propTypes = {
  onEmployeeSelect: PropTypes.func,
  initialSearch: PropTypes.string,
};

export default SearchEmployee;
