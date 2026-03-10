import React from "react";
import { Routes, Route } from "react-router-dom";
import Hr_Dashboard from "./pages/Hr_Dashboard"; // Ensure correct path
import LeavePage from "./pages/LeavePage"; // Adjust the import path if necessary
import CPDA_ADVANCE from "./pages/CPDA_ADVANCE";
import LTC from "./pages/LTC";
import Appraisal from "./pages/Appraisel";
import CPDA_Claim from "./pages/CPDA_Claim";
import FormView from "./pages/FormView";
import CPDA_ADVANCEView from "./pages/CPDA_ADVANCEPageComp/CPDA_ADVANCEView";
import LeaveFormView from "./pages/LeavePageComp/LeaveFormView";
import LeaveFilehandle from "./pages/LeavePageComp/Leave_file_handle";
import LeaveHandleResponsibility from "./pages/LeavePageComp/Leave_Handle_Responsibility";

import AdminLeaveManagement from "./pages/LeavePageComp/AdminLeaveManagement";

import OfflineLeaveForm from "./pages/LeavePageComp/OfflineLeaveForm";

import ViewEmployeeLB from "./pages/LeavePageComp/ViewEmployeeLB";
import AdminLeaveRequests from "./pages/LeavePageComp/AdminLeaveRequests";
// import UpdateLeaveBalance from "./pages/UpdateLeaveBalance";

export default function HR() {
  return (
    <Routes>
      {/* Show welcome message at /hr */}
      <Route path="/" element={<Hr_Dashboard />} />
      {/* Render LeavePage at /hr/leave */}
      <Route path="leave/file_handler/:id" element={<LeaveFilehandle />} />
      <Route path="leave/view/:id" element={<LeaveFormView />} />
      <Route
        path="leave/handle_responsibility/:id"
        element={<LeaveHandleResponsibility />}
      />
      <Route path="leave/*" element={<LeavePage />} />

      {/* Route for the CPDA Advance View page */}
      <Route path="cpda_adv/view/:id" element={<CPDA_ADVANCEView />} />
      <Route path="cpda_adv/*" element={<CPDA_ADVANCE />} />
      <Route path="ltc/*" element={<LTC />} />
      <Route path="appraisal/*" element={<Appraisal />} />
      <Route path="cpda_claim/*" element={<CPDA_Claim />} />
      <Route path="FormView/*" element={<FormView />} />
      <Route path="admin_leave/*" element={<AdminLeaveManagement />} />
      <Route
        path="/admin_leave/view_employees_leave_balance/*"
        element={<ViewEmployeeLB />}
      />
      <Route
        path="admin_leave/review_leave_requests/*"
        element={<AdminLeaveRequests />}
      />

      <Route
        path="admin_leave/manage_offline_leave_form/*"
        element={<OfflineLeaveForm />}
      />
    </Routes>
  );
}
