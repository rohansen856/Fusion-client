import PropTypes from "prop-types";
import { Breadcrumbs, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { CaretRight } from "@phosphor-icons/react";
import classes from "../../Dashboard/Dashboard.module.css";

function RSPCBreadcrumbs({ projectTitle }) {
  const navigate = useNavigate();
  const items = [
    <Text
      className={`${classes.fusionText} ${classes.selectoptions}`}
      fw={600}
      onClick={() => navigate("/research")}
    >
      Research Projects
    </Text>,
  ];
  if (projectTitle) {
    items.push(
      <Text className={classes.fusionText} fw={600}>
        {projectTitle}
      </Text>,
    );
  }

  return (
    <Breadcrumbs
      separator={
        <CaretRight className={classes.fusionCaretIcon} weight="bold" />
      }
      mt="xs"
      ml={{ md: "lg" }}
    >
      {items}
    </Breadcrumbs>
  );
}

RSPCBreadcrumbs.propTypes = {
  projectTitle: PropTypes.string,
};
export default RSPCBreadcrumbs;
