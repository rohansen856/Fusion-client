import React from "react";
import EnhancedSectionNavigation from "./EnhancedSectionNavigation";
import NoticeBoard from "./all-actors/NoticeBoard";
import LeaveForm from "./students/LeaveForm";
import LeaveStatus from "./students/LeaveStatus";
import Fine from "./students/Fine";
import AllotedRooms from "./students/AllotedRooms";
import ViewAttendance from "./students/ViewAttendance";

const sections = [
  "Notice Board",
  "My Fine",
  "Leave",
  "Alloted rooms",
  "My Attendance",
];

const subSections = {
  Leave: ["Leave Form", "Leave Status"],
  "Guest Room": ["Book Guest Room", "Booking Status"],
};

const components = {
  "Notice Board": NoticeBoard,
  "Leave_Leave Form": LeaveForm,
  "Leave_Leave Status": LeaveStatus,
  "My Fine": Fine,
  "Alloted rooms": AllotedRooms,
  "My Attendance": ViewAttendance,
};

export default function SectionNavigationStudent() {
  return (
    <EnhancedSectionNavigation
      sections={sections}
      subSections={subSections}
      components={components}
      defaultSection="Notice Board"
      userrole="student"
    />
  );
}
