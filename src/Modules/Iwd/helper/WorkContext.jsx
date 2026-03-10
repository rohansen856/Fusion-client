import React, { createContext, useState } from "react";
import PropTypes from "prop-types";

export const WorkContext = createContext();

export function WorkProvider({ children }) {
  const [workDetails, setWorkDetails] = useState();
  const contextValue = React.useMemo(
    () => ({ workDetails, setWorkDetails }),
    [workDetails],
  );
  return (
    <WorkContext.Provider value={contextValue}>{children}</WorkContext.Provider>
  );
}
WorkProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
