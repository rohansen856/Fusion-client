import { useState } from "react";
import { Button } from "@mantine/core";

import { useMediaQuery } from "@mantine/hooks";
import NoDuesStatus from "./NoDuesStatus";
import NoduesForm from "./NoduesForm";
import Incharge from "./Incharge";

function NoDuesCombined() {
  const [tab, setTab] = useState(0);
  const isAboveXXs = useMediaQuery("(min-width: 420px)");
  return (
    <>
      <div
        style={{
          margin: isAboveXXs ? "20px 0 0 40px" : "0px",
          width: isAboveXXs ? "300px" : "",
          display: isAboveXXs ? "flex" : "block",
          justifyContent: "space-evenly",
        }}
      >
        <div style={{ display: isAboveXXs ? "flex" : "block" }}>
          <Button
            mr={10}
            mb={10}
            variant={tab === 0 ? "filled" : "outline"}
            onClick={() => setTab(0)}
          >
            NoDues Form
          </Button>
          <Button
            mr={10}
            mb={10}
            variant={tab === 1 ? "filled" : "outline"}
            onClick={() => setTab(1)}
          >
            NoDues Status
          </Button>
          <Button
            mr={10}
            mb={10}
            variant={tab === 2 ? "filled" : "outline"}
            onClick={() => setTab(2)}
          >
            Incharge
          </Button>
        </div>
      </div>
      {tab === 0 ? <NoduesForm /> : tab === 1 ? <NoDuesStatus /> : <Incharge />}
    </>
  );
}

export default NoDuesCombined;
