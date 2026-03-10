import CreateRequest from "../components/CreateRequestForm";
// import FinalBillRequest from "../components/FinalBillRequest";
// import ManageBudget from "../components/ManageBudget";
// import ViewBudget from "../components/ViewBudget";
import RequestsStatus from "../components/RequestsStatus";
import WorkDetails from "../components/WorkDetails";

const RoleBasedFilter = ({ setActiveTab }) => {
  const tabItems = [
    { title: "Requests", component: <RequestsStatus /> },
    {
      title: "Create Request",
      component: <CreateRequest setActiveTab={setActiveTab} />,
    },
    { title: "Work Details", component: <WorkDetails /> },
    // { title: "Generate Final Bill", component: <FinalBillRequest /> },
    // { title: "Manage Budget", component: <ManageBudget /> },
    // { title: "View Budget", component: <ViewBudget /> },
  ];
  const roleBasedTabs = {
    Director: tabItems.filter((tab) => !["Work Details"].includes(tab.title)),
    "Dean (P&D)": tabItems.filter(
      (tab) => !["Work Details"].includes(tab.title),
    ),
    Professor: tabItems.filter((tab) => !["Work Details"].includes(tab.title)),
    "Assistant Professor": tabItems.filter(
      (tab) => !["Work Details"].includes(tab.title),
    ),
    Auditor: tabItems,
    SectionHead_IWD: tabItems,
    EE: tabItems,
    "Executive Engineer (Civil)": tabItems,
    Civil_AE: tabItems,
    Civil_JE: tabItems,
    Electrical_JE: tabItems,
    Electrical_AE: tabItems,
    "Junior Engineer": tabItems,
    "Admin IWD": tabItems,
    "Accounts Admin": tabItems,
  };
  return { roleBasedTabs, tabItems };
};

export default RoleBasedFilter;
