import React from "react";
import EnhancedSectionNavigation from "./EnhancedSectionNavigation";
import ManageLeaveRequest from "./caretaker/ManageLeaverequest";
import NoticeBoardWardenCaretaker from "./all-actors/NoticeBoardWardenCaretaker";
import ImposeFine from "./caretaker/ImposeFine";
import ManageFine from "./caretaker/ManageFine";
import StudentInfo from "./caretaker/StudentInfo";
import UploadAttendance from "./caretaker/UploadAttendance";

const sections = [
  "Notice Board",
  "Manage Leave Request",
  "Fine",
  "Student Allotment",
  "Upload Attendance",
];

const subSections = {
  Fine: ["Impose Fines", "Manage Imposed Fines"],
};

const components = {
  "Notice Board": NoticeBoardWardenCaretaker,
  "Manage Leave Request": ManageLeaveRequest,
  "Fine_Impose Fines": ImposeFine,
  "Fine_Manage Imposed Fines": ManageFine,
  "Student Allotment": StudentInfo,
  "Upload Attendance": UploadAttendance,
};

export default function SectionNavigationCaretaker() {
  return (
    <EnhancedSectionNavigation
      sections={sections}
      subSections={subSections}
      components={components}
      defaultSection="Notice Board"
      userrole="caretaker"
    />
  );
}
