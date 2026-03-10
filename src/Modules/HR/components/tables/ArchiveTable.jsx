import React from "react";
import { Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Eye, MapPin } from "@phosphor-icons/react";
import "./Table.css"; // Ensure this path is correct
import { EmptyTable } from "./EmptyTable";

const ArchiveTable = ({ title, data, formType = undefined }) => {
  const navigate = useNavigate();

  const headers = ["FileID", "User", "Designation", "Date", "View", "Track"];

  const handleViewClick = (id) => {
    const viewUrlMap = {
      leave: `/hr/leave/file_handler/${id}?archive=true`,
      cpda_adv: `/hr/cpda_adv/file_handler/${id}?archive=true`,
      ltc: `/hr/ltc/file_handler/${id}?archive=true`,
      cpda_claim: `/hr/cpda_claim/file_handler/${id}?archive=true`,
      appraisal: `/hr/appraisal/file_handler/${id}?archive=true`,
    };

    console.log(viewUrlMap[formType]);
    navigate(viewUrlMap[formType]); // Default to leaveform if formType is not matched
  };
  const handleTrackClick = (id) => {
    console.log(formType);

    const trackUrlMap = {
      leave: `/hr/FormView/leaveform_track/${id}`,
      cpda_adv: `/hr/FormView/cpda_adv_track/${id}`,
      ltc: `/hr/FormView/ltc_track/${id}`,
      cpda_claim: `/hr/FormView/cpda_claim_track/${id}`,
      appraisal: `/hr/FormView/appraisal_track/${id}`,
    };

    console.log(trackUrlMap[formType]);
    navigate(trackUrlMap[formType]); // Default to leaveform_track if formType is not matched
  };

  return (
    <div className="app-container">
      <Title
        order={2}
        style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
      >
        {title}
      </Title>
      {data.length == 0 && (
        <EmptyTable
          title="No new Archive requests found!"
          message="There is no new Archive request available. Please check back later."
        />
      )}
      {headers.length > 0 && data.length > 0 ? (
        <div className="form-table-container">
          <table className="form-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr className="table-row" key={index}>
                  {console.log(item.id)}
                  <td>{item.id}</td>
                  <td>{item.uploader}</td>
                  <td>{item.designation}</td>
                  <td>{item.upload_date}</td>
                  <td>
                    <span
                      className="text-link"
                      onClick={() => handleViewClick(item.id)}
                    >
                      <Eye size={20} />
                      View
                    </span>
                  </td>
                  <td>
                    <span
                      className="text-link"
                      onClick={() => handleTrackClick(item.id)}
                    >
                      <MapPin size={20} />
                      Track
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ArchiveTable;
