import { useState } from "react";
import { Button } from "@mantine/core";
import AssistantshipForm from "./TA_supervisor";
import AssistantshipStatus from "./TA_supervisorStatus";

function AssistantshipCombined() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <div
        style={{
          margin: "20px 0 0 40px",
          width: "350px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant={tab === 0 ? "filled" : "outline"}
          onClick={() => setTab(0)}
          style={{ marginRight: "10px", flexGrow: 1 }}
        >
          Assistantship Form
        </Button>
        <Button
          variant={tab === 1 ? "filled" : "outline"}
          onClick={() => setTab(1)}
          style={{ flexGrow: 1 }}
        >
          Assistantship Status
        </Button>
      </div>

      {tab === 0 ? <AssistantshipForm /> : <AssistantshipStatus />}
    </>
  );
}

export default AssistantshipCombined;
