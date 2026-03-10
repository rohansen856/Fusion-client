import { Paper, Title, Grid, Text, Anchor } from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";
import classes from "../../styles/formStyle.module.css";

const formsList = [
  {
    name: "Ethical Clearance Form",
    link: "https://www.iiitdmj.ac.in/rspc.iiitdmj.ac.in/DRSPC/PM/6_IEC_Form.doc",
  },
  {
    name: "FIG Closure",
    link: "https://www.iiitdmj.ac.in/rspc.iiitdmj.ac.in/DRSPC/PM/PM02%20FIG%20Closure.docx",
  },
  {
    name: "FIG Project Proposal Submission Form",
    link: "https://www.iiitdmj.ac.in/rspc.iiitdmj.ac.in/DRSPC/PM/Submission%20form%20of%20FIG.docx",
  },
  {
    name: "Requisition For Publishing Advertisement",
    link: "https://www.iiitdmj.ac.in/rspc.iiitdmj.ac.in/DRSPC/PEM/PEM02%20Requisition%20for%20publishing%20Advt.docx",
  },
  {
    name: "Extension Of Appointment Through Project Investigator",
    link: "https://www.iiitdmj.ac.in/rspc.iiitdmj.ac.in/DRSPC/PEM/PEM09%20Extension%20of%20Appointment%20through%20PI.doc",
  },
  {
    name: "Upgradation Of Appointment Through Committee",
    link: "https://www.iiitdmj.ac.in/rspc.iiitdmj.ac.in/DRSPC/PEM/PEM10%20Upgradation%20of%20Appointment%20through%20Committee%20.doc",
  },
];

function Appendix() {
  return (
    <Paper padding="lg" shadow="s" className={classes.formContainer}>
      <Title order={2} className={classes.formTitle}>
        All RSPC Forms
      </Title>
      <Grid gutter="xl">
        {formsList.map((form, index) => (
          <Grid.Col span={12} key={index}>
            <Text>
              {form.name}{" "}
              <Anchor href={form.link} style={{ fontSize: "0.85em" }}>
                <DownloadSimple size={26} style={{ marginRight: "3px" }} />
              </Anchor>
            </Text>
          </Grid.Col>
        ))}
      </Grid>
    </Paper>
  );
}

export default Appendix;
