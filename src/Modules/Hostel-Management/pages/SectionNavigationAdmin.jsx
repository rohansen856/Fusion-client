import React from "react";
import EnhancedSectionNavigation from "./EnhancedSectionNavigation";
import NoticeBoard from "./all-actors/NoticeBoard";
import ViewHostel from "./hostel-admin/ViewHostel";
import AssignBatch from "./hostel-admin/AssignBatch";
import AssignCaretaker from "./hostel-admin/AssignCaretaker";

const sections = [
  "Notice Board",
  "View Hostel",
  "Manage Hostel",
  "Manage Batch",
];

const components = {
  "Notice Board": NoticeBoard,
  "View Hostel": ViewHostel,
  "Manage Batch": AssignBatch,
  "Manage Hostel": AssignCaretaker,
};

export default function SectionNavigationAdmin() {
  return (
    <EnhancedSectionNavigation
      sections={sections}
      components={components}
      defaultSection="Notice Board"
      userrole="admin"
    />
  );
}
