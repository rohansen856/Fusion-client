import React, { useState } from "react";
import { Table, Select, Button, Text, Container } from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";
import "../../../style/Pcc_Admin/InsightsPage.css";

function InsightsPage() {
  const [selectedYear, setSelectedYear] = useState("2021");

  const applicationsByYear = {
    2021: [
      { label: "Pending", count: 100, color: "#0056b3" },
      { label: "Approved", count: 70, color: "#32cd32" },
      { label: "Reverted", count: 30, color: "#ff6347" },
    ],
    2022: [
      { label: "Pending", count: 120, color: "#0056b3" },
      { label: "Approved", count: 80, color: "#32cd32" },
      { label: "Reverted", count: 40, color: "#ff6347" },
    ],
  };

  const applications = applicationsByYear[selectedYear] || [];
  const totalApplications = applications.reduce(
    (sum, app) => sum + app.count,
    0,
  );

  const handleDownload = () => {
    const csvContent = `Status,Count,Percentage\n${applications
      .map(
        (app) =>
          `${app.label},${app.count},${(
            (app.count / totalApplications) *
            100
          ).toFixed(2)}%`,
      )
      .join("\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Applications_${selectedYear}.csv`);
    link.click();
  };

  return (
    <Container id="pms-insights-page">
      <Text order={2} align="left" id="pms-page-title">
        Applications Overview - {selectedYear}
      </Text>
      <Text align="left" size="sm" mb="lg" id="pms-description">
        Select a year from the dropdown below to view the statistics of
        applications for that year. You can also download the data as a CSV file
        for further analysis.
      </Text>

      <div id="pms-filter">
        <Text size="sm" weight={600}>
          Select Year:
        </Text>
        <Select
          id="pms-year-select"
          data={Object.keys(applicationsByYear)}
          value={selectedYear}
          onChange={(value) => setSelectedYear(value)}
          radius="md"
          size="sm"
        />
      </div>

      <div id="pms-insights-content">
        <div id="pms-chart-section">
          <svg
            width="100%"
            height="300"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {
              applications.reduce(
                (acc, app, index) => {
                  const { startAngle } = acc;
                  const sweepAngle = (app.count / totalApplications) * 360;
                  const endAngle = startAngle + sweepAngle;

                  const largeArcFlag = sweepAngle > 180 ? 1 : 0;
                  const [startX, startY] = [
                    50 + 40 * Math.cos((Math.PI * startAngle) / 180),
                    50 + 40 * Math.sin((Math.PI * startAngle) / 180),
                  ];
                  const [endX, endY] = [
                    50 + 40 * Math.cos((Math.PI * endAngle) / 180),
                    50 + 40 * Math.sin((Math.PI * endAngle) / 180),
                  ];

                  const midAngle = startAngle + sweepAngle / 2;
                  const [textX, textY] = [
                    50 + 25 * Math.cos((Math.PI * midAngle) / 180),
                    50 + 25 * Math.sin((Math.PI * midAngle) / 180),
                  ];

                  acc.slices.push(
                    <g key={index}>
                      <path
                        d={`M50,50 L${startX},${startY} A40,40 0 ${largeArcFlag} 1 ${endX},${endY} Z`}
                        fill={app.color}
                      />
                      <text
                        x={textX}
                        y={textY}
                        fontSize="4"
                        fill="#fff"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {((app.count / totalApplications) * 100).toFixed(1)}%
                      </text>
                    </g>,
                  );

                  acc.startAngle = endAngle;
                  return acc;
                },
                { slices: [], startAngle: 0 },
              ).slices
            }
          </svg>

          <div id="pms-legend">
            {applications.map((app, index) => (
              <div key={index} id="pms-legend-item">
                <div
                  id="pms-legend-color"
                  style={{ backgroundColor: app.color }}
                />
                <span id="pms-legend-label">{app.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="pms-table-section">
          <Text id="pms-table-title" align="center" mb="md">
            Applications Data
          </Text>
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={index}>
                  <td>{app.label}</td>
                  <td>{app.count}</td>
                  <td>{((app.count / totalApplications) * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <div id="pms-download-csv-button">
        <Button
          radius="md"
          size="md"
          variant="outline"
          leftIcon={<DownloadSimple size={16} />}
          onClick={handleDownload}
          id="pms-download-button"
        >
          Download CSV
        </Button>
      </div>
    </Container>
  );
}

export default InsightsPage;
