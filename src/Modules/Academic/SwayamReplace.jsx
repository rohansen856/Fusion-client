import React, { useState, useEffect } from "react";
import { Alert, Select, Button, Table, Text, Tabs, Loader } from "@mantine/core";
import axios from "axios";
import {
  swayamReplaceCheckRoute,
  swayamReplaceSlotsRoute,
  swayamReplaceCoursesRoute,
  swayamCurrentCoursesRoute,
  swayamReplaceSubmitRoute,
} from "../../routes/academicRoutes";
import SwayamYourRequests from "./SwayamYourRequests";

export default function SwayamReplace({ showOnlyForm = false, onSubmitSuccess, refreshKey = 0 }) {
  const [activeTab, setActiveTab] = useState("submit");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [existingSwayamCourse, setExistingSwayamCourse] = useState(null);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [selectedSourceSemester, setSelectedSourceSemester] = useState("");
  const [sourceSlots, setSourceSlots] = useState([]);
  const [selectedSourceSlot, setSelectedSourceSlot] = useState(null);
  const [sourceCourses, setSourceCourses] = useState([]);
  const [selectedSourceCourse, setSelectedSourceCourse] = useState(null);
  const [targetSlots, setTargetSlots] = useState([]);
  const [selectedTargetSlot, setSelectedTargetSlot] = useState("");
  const [targetCourses, setTargetCourses] = useState([]);
  const [selectedTargetCourse, setSelectedTargetCourse] = useState("");
  const [targetSlotsForSelection, setTargetSlotsForSelection] = useState([]);
  const [selectedTargetSlot2, setSelectedTargetSlot2] = useState("");
  const [targetCourses2, setTargetCourses2] = useState([]);
  const [selectedTargetCourse2, setSelectedTargetCourse2] = useState("");
  const [targetSlotsForSelection2, setTargetSlotsForSelection2] = useState([]);

  const [isCurrentSemester, setIsCurrentSemester] = useState(false);
  const [singleSlotAllowed, setSingleSlotAllowed] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [coursesFetched, setCoursesFetched] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  useEffect(() => {
    fetchReplaceData();
  }, [refreshKey]);

  const fetchReplaceData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    setLoading(true);
    setRegistrationError(null);
    try {
      const response = await axios.get(swayamReplaceCheckRoute, {
        headers: { Authorization: `Token ${token}` },
      });

      const data = response.data;

      setIsCurrentSemester(data.is_current_semester || false);
      setSingleSlotAllowed(data.single_slot_allowed || false);
      
      if (data.has_pending_request) {
        setHasPendingRequest(true);
        setError(null);
        setSuccessMessage(null);
        return;
      }
      
      if (data.has_existing) {
        const existing = data.existing_course;
        setExistingSwayamCourse({
          id: existing.id,
          code: existing.code,
          name: existing.name,
          semester: existing.semester,
          slot: existing.slot,
          credits: existing.credits
        });
        setSelectedSourceSemester(String(existing.semester));
        setSelectedSourceSlot(String(existing.slot_id));
        setSelectedSourceCourse(String(existing.id));

        const targetSlotsData = (data.target_slots || [])
          .filter(slot => slot.id !== undefined && slot.id !== null)
          .map(slot => ({
            value: String(slot.id),
            label: slot.name
          }));
        
        setTargetSlots(targetSlotsData);
        setTargetSlotsForSelection(data.target_slots || []);
        setTargetSlotsForSelection2(data.target_slots || []);
      } else {
        if (data.available_semesters && data.available_semesters.length > 0) {
          const semestersData = data.available_semesters.map(sem => ({
            value: String(sem.semester_no),
            label: sem.label
          }));
          setAvailableSemesters(semestersData);
          setTargetSlotsForSelection(data.target_slots || []);
          setTargetSlotsForSelection2(data.target_slots || []);

          if (data.has_sw_in_current && data.target_slots) {
            const targetSlotsData = (data.target_slots || [])
              .filter(slot => slot.id !== undefined && slot.id !== null)
              .map(slot => ({
                value: String(slot.id),
                label: slot.name
              }));
            setTargetSlots(targetSlotsData);
          }
        } else {
          setRegistrationError("No OE courses found from semester 3 onwards. Cannot proceed with replacement.");
        }
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.error || "Failed to load replacement data.";
      setRegistrationError(errorMsg);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleSourceSemesterChange = async (semesterId) => {
    if (!semesterId || semesterId === selectedSourceSemester) {
      return;
    }
    setSelectedSourceSemester(semesterId);
    setSelectedSourceSlot(null);
    setSelectedSourceCourse(null);
    setSourceSlots([]);
    setSourceCourses([]);
    setCoursesFetched(false);

    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(swayamReplaceSlotsRoute, {
        params: { semester_no: semesterId },
        headers: { Authorization: `Token ${token}` }
      });
      setSourceSlots(response.data || []);
    } catch (err) {
      setError("Failed to load source slots.");
    }
  };

  const handleSourceSlotChange = async (slotId) => {
    setSelectedSourceSlot(slotId);
    setSelectedSourceCourse(null);
    setSourceCourses([]);
    setCoursesFetched(false);

    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(swayamReplaceCoursesRoute, {
        params: { 
          semester_no: selectedSourceSemester,
          slot_id: slotId
        },
        headers: { Authorization: `Token ${token}` }
      });
      setSourceCourses(response.data || []);
    } catch (err) {
      setError("Failed to load source courses.");
    } finally {
      setCoursesFetched(true);
    }
  };

  const handleTargetSlotChange = async (slotId) => {
    setSelectedTargetSlot(slotId);
    setSelectedTargetCourse("");
    setTargetCourses([]);
    if (slotId === selectedTargetSlot2) {
      setSelectedTargetSlot2("");
      setSelectedTargetCourse2("");
      setTargetCourses2([]);
    }

    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(swayamCurrentCoursesRoute, {
        params: { slot_id: slotId },
        headers: { Authorization: `Token ${token}` },
      });
      const courses = response.data || [];
      setTargetCourses(courses);
    } catch (err) {
      setError("Failed to load target courses.");
    }
  };

  const handleTargetSlotChange2 = async (slotId) => {
    setSelectedTargetSlot2(slotId);
    setSelectedTargetCourse2("");
    setTargetCourses2([]);
    if (slotId === selectedTargetSlot) {
      setSelectedTargetSlot("");
      setSelectedTargetCourse("");
      setTargetCourses([]);
    }

    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(swayamCurrentCoursesRoute, {
        params: { slot_id: slotId },
        headers: { Authorization: `Token ${token}` },
      });
      const courses = response.data || [];
      setTargetCourses2(courses);
    } catch (err) {
      setError("Failed to load target courses for second slot.");
    }
  };

  const isFormComplete = () => {
    const basicComplete = selectedSourceCourse && selectedTargetSlot && selectedTargetCourse;
    if (!basicComplete) return false;

    // Auto-lock case: only 1 slot required. If slot 2 is partially filled, require it to be complete.
    if (singleSlotAllowed) {
      const slot2Partial = selectedTargetSlot2 || selectedTargetCourse2;
      if (slot2Partial) {
        return (
          !!selectedTargetSlot2 &&
          !!selectedTargetCourse2 &&
          selectedSourceCourse !== selectedTargetCourse &&
          selectedSourceCourse !== selectedTargetCourse2 &&
          selectedTargetCourse !== selectedTargetCourse2 &&
          selectedTargetSlot !== selectedTargetSlot2
        );
      }
      return selectedSourceCourse !== selectedTargetCourse;
    }

    // Normal case: both slots required
    return (
      !!selectedTargetSlot2 &&
      !!selectedTargetCourse2 &&
      selectedSourceCourse !== selectedTargetCourse &&
      selectedSourceCourse !== selectedTargetCourse2 &&
      selectedTargetCourse !== selectedTargetCourse2 &&
      selectedTargetSlot !== selectedTargetSlot2
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    const payload = {
      source_semester: parseInt(selectedSourceSemester, 10),
      source_slot: parseInt(selectedSourceSlot, 10),
      source_course: parseInt(selectedSourceCourse, 10),
      target_slot: parseInt(selectedTargetSlot, 10),
      target_course: parseInt(selectedTargetCourse, 10),
      is_current_semester: isCurrentSemester,
    };
    
    if (selectedTargetSlot2 && selectedTargetCourse2) {
      payload.target_slot_2 = parseInt(selectedTargetSlot2, 10);
      payload.target_course_2 = parseInt(selectedTargetCourse2, 10);
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(swayamReplaceSubmitRoute, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        setSuccessMessage(
          response.data.message || "Swayam replacement request submitted successfully! Awaiting Academic Admin approval."
        );

        if (!existingSwayamCourse) {
          setSelectedSourceSemester("");
          setSelectedSourceSlot("");
          setSelectedSourceCourse("");
          setSourceSlots([]);
          setSourceCourses([]);
        }
        setSelectedTargetSlot("");
        setSelectedTargetCourse("");
        setSelectedTargetSlot2("");
        setSelectedTargetCourse2("");
        setTargetSlots([]);
        setTargetCourses([]);
        setTargetCourses2([]);
        setTargetSlotsForSelection([]);
        setTargetSlotsForSelection2([]);

        setTimeout(() => {
          fetchReplaceData();
          if (!showOnlyForm) {
            setActiveTab("requests");
          }
        }, 1500);

        if (onSubmitSuccess) {
          setTimeout(() => onSubmitSuccess(), 1500);
        }
      }
    } catch (postError) {
      const errorData = postError?.response?.data;
      setError(errorData?.error || "Failed to submit replacement request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (hasPendingRequest) {
    return (
      <Alert color="teal" mb="md">
        You already have a pending or approved replacement request. Please wait for the admin to process it.
      </Alert>
    );
  }

  if (initialLoad) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Loader size="lg" />
      </div>
    );
  }

  const formContent = registrationError ? (
    <Alert color="red" mb="md">
      {registrationError}
    </Alert>
  ) : (
    <>
        {error && (
          <Alert color="red" mb="md" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert color="green" mb="md" withCloseButton onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Text size="sm" color="dimmed" mb="md">
          Replace an existing Swayam course with a new one. This request requires Academic approval.
        </Text>
        
        {singleSlotAllowed ? (
          <Alert color="orange" mb="md" variant="light">
            <strong>Note:</strong> If you have done a Swayam course in a previous semester and it was not used for replacing an Elective (i.e., it remained as Extra Credit), you can select only 1 new Swayam course. If that is not the case, you must select both slots.
          </Alert>
        ) : isCurrentSemester ? (
          <Alert color="orange" mb="md" variant="light">
            <strong>Both Slots Required:</strong> The registered course will be dropped and two new Swayam courses will be registered upon approval.
          </Alert>
        ) : (
          <Alert color="yellow" mb="md" variant="light">
            <strong>Both Slots Required:</strong> You must select two new Swayam courses for this replacement request.
          </Alert>
        )}

        <Table striped withTableBorder mb="md">
        <thead>
          <tr>
            <th colSpan={2} style={{ color: '#c92a2a', fontWeight: 700 }}>Registered Courses (To be Replaced)</th>
          </tr>
        </thead>
        <tbody>
          {existingSwayamCourse ? (
            <>
              <tr>
                <td><strong>Semester:</strong></td>
                <td>{existingSwayamCourse.semester}</td>
              </tr>
              <tr>
                <td><strong>Slot:</strong></td>
                <td>{existingSwayamCourse.slot}</td>
              </tr>
              <tr>
                <td><strong>Course:</strong></td>
                <td>{existingSwayamCourse.code} - {existingSwayamCourse.name}</td>
              </tr>
            </>
          ) : availableSemesters.length > 0 ? (
            <>
              <tr>
                <td style={{ width: '30%', whiteSpace: 'nowrap' }}><strong>Semester:</strong></td>
                <td style={{ width: '70%' }}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Choose source semester"
                    data={availableSemesters}
                    value={selectedSourceSemester}
                    onChange={handleSourceSemesterChange}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td style={{ width: '30%', whiteSpace: 'nowrap' }}><strong>Slot:</strong></td>
                <td style={{ width: '70%' }}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Choose source slot"
                    data={sourceSlots.map(slot => ({ value: String(slot.id), label: slot.name }))}
                    value={selectedSourceSlot}
                    onChange={handleSourceSlotChange}
                    disabled={!selectedSourceSemester || sourceSlots.length === 0}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td style={{ width: '30%', whiteSpace: 'nowrap' }}><strong>Course:</strong></td>
                <td style={{ width: '70%' }}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Choose source course"
                    data={sourceCourses.map(course => ({ 
                      value: String(course.id), 
                      label: `${course.code} - ${course.name}` 
                    }))}
                    value={selectedSourceCourse}
                    onChange={setSelectedSourceCourse}
                    disabled={!selectedSourceSlot || sourceCourses.length === 0}
                    required
                  />
                  {coursesFetched && selectedSourceSlot && sourceCourses.length === 0 && (
                    <Alert color="red" mt="xs" variant="light" p="xs">
                      No eligible courses in this slot for replacement.
                    </Alert>
                  )}
                </td>
              </tr>
            </>
          ) : (
            <tr>
              <td colSpan={2}>
                <Alert color="yellow">
                  {error || "Loading available courses..."}
                </Alert>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Table striped withTableBorder mb="md">
        <thead>
          <tr>
            <th colSpan={2} style={{ color: '#c92a2a', fontWeight: 700 }}>
              {singleSlotAllowed ? "New Swayam Courses - Select At Least One" : "New Swayam Courses - Both Required"}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Target Course 1 */}
          <tr>
            <td><strong>Select New Swayam Slot 1:</strong></td>
            <td>
              <Select
                placeholder="Choose new Swayam slot 1"
                data={existingSwayamCourse
                  ? targetSlots.filter(slot => slot.value !== selectedTargetSlot2)
                  : targetSlotsForSelection
                      .filter(slot => slot.id !== undefined && slot.id !== null && String(slot.id) !== selectedTargetSlot2)
                      .map(slot => ({ value: String(slot.id), label: slot.name }))}
                value={selectedTargetSlot}
                onChange={handleTargetSlotChange}
                disabled={existingSwayamCourse ? targetSlots.length === 0 : targetSlotsForSelection.length === 0}
              />
            </td>
          </tr>
          <tr>
            <td><strong>Select New Swayam Course 1:</strong></td>
            <td>
              <Select
                placeholder="Choose new Swayam course 1"
                data={targetCourses
                  .filter(course => course.id !== undefined && course.id !== null && String(course.id) !== selectedTargetCourse2)
                  .map(course => ({ 
                    value: String(course.id), 
                    label: `${course.code} - ${course.name}` 
                  }))}
                value={selectedTargetCourse}
                onChange={setSelectedTargetCourse}
                disabled={!selectedTargetSlot || targetCourses.length === 0}
              />
            </td>
          </tr>
          
          {/* Target Course 2 */}
          <tr>
            <td colSpan="2" style={{backgroundColor: '#f8f9fa', fontWeight: 'bold', padding: '8px'}}>
              New Swayam Course 2
            </td>
          </tr>
          <tr>
            <td><strong>Select New Swayam Slot 2:</strong></td>
            <td>
              <Select
                placeholder="Choose new Swayam slot 2"
                data={existingSwayamCourse
                  ? targetSlots.filter(slot => slot.value !== selectedTargetSlot)
                  : targetSlotsForSelection2
                      .filter(slot => slot.id !== undefined && slot.id !== null && String(slot.id) !== selectedTargetSlot)
                      .map(slot => ({ value: String(slot.id), label: slot.name }))}
                value={selectedTargetSlot2}
                onChange={handleTargetSlotChange2}
                disabled={existingSwayamCourse ? targetSlots.length === 0 : targetSlotsForSelection2.length === 0}
              />
            </td>
          </tr>
          <tr>
            <td><strong>Select New Swayam Course 2:</strong></td>
            <td>
              <Select
                placeholder="Choose new Swayam course 2"
                data={targetCourses2
                  .filter(course => course.id !== undefined && course.id !== null && String(course.id) !== selectedTargetCourse)
                  .map(course => ({ 
                    value: String(course.id), 
                    label: `${course.code} - ${course.name}` 
                  }))}
                value={selectedTargetCourse2}
                onChange={setSelectedTargetCourse2}
                disabled={!selectedTargetSlot2 || targetCourses2.length === 0}
              />
            </td>
          </tr>
        </tbody>
      </Table>

      <Button
        color="blue"
        onClick={handleSubmit}
        disabled={!isFormComplete() || submitting}
        loading={submitting}
      >
        {submitting ? "Submitting..." : "Submit Replacement Request"}
      </Button>
    </>
  );

  if (showOnlyForm) {
    return formContent;
  }

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Tab value="submit">Submit Replacement Request</Tabs.Tab>
        <Tabs.Tab value="requests">Your Requests</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="submit" pt="md">
        {formContent}
      </Tabs.Panel>

      <Tabs.Panel value="requests" pt="md">
        <SwayamYourRequests requestType="Swayam_Replace" />
      </Tabs.Panel>
    </Tabs>
  );
}
