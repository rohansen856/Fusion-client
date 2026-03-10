import React from "react";
import EnhancedSectionNavigation from "./EnhancedSectionNavigation";
import NoticeBoardWardenCaretaker from "./all-actors/NoticeBoardWardenCaretaker";
import StudentInfo from "./all-actors/StudentInfo";
import AssignRooms from "./warden/AssignRoom";

const sections = ["Notice Board", "Students and Rooms Info", "Assign Room"];

const components = {
  "Notice Board": NoticeBoardWardenCaretaker,
  "Students and Rooms Info": StudentInfo,
  "Assign Room": AssignRooms,
};

export default function SectionNavigationWarden() {
  return (
    <EnhancedSectionNavigation
      sections={sections}
      components={components}
      defaultSection="Notice Board"
      userrole="warden"
    />
  );
}
