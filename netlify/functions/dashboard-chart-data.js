const mockProjectsData = [
  { id: 1, project: "Improve the livelihood of refugees", donor: "Plan International", type: "International", year: 2018, budgetEGP: 1488770, amountUSD: 0, note: "", uniqueProject: "REF-001", stage: "Stage1" },
  { id: 2, project: "Support Community education for refugee chlidren", donor: "Plan International", type: "International", year: 2018, budgetEGP: 669152, amountUSD: 0, note: "", uniqueProject: "REF-002", stage: "Stage1" },
  // ... (add all your mock data here, truncated for brevity)
];

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Yearly budget comparison
  const yearlyData = mockProjectsData.reduce((acc, project) => {
    const year = project.year;
    if (!acc[year]) {
      acc[year] = { year, budgetEGP: 0, amountUSD: 0, projects: 0 };
    }
    acc[year].budgetEGP += project.budgetEGP;
    acc[year].amountUSD += project.amountUSD;
    acc[year].projects += 1;
    return acc;
  }, {});
  const yearlyChartData = Object.values(yearlyData).sort((a, b) => a.year - b.year);

  // Stage comparison
  const stageData = mockProjectsData.reduce((acc, project) => {
    const stage = project.stage;
    if (!acc[stage]) {
      acc[stage] = { stage, budgetEGP: 0, amountUSD: 0, projects: 0 };
    }
    acc[stage].budgetEGP += project.budgetEGP;
    acc[stage].amountUSD += project.amountUSD;
    acc[stage].projects += 1;
    return acc;
  }, {});
  const stageChartData = Object.values(stageData);

  // Donor comparison
  const donorData = mockProjectsData.reduce((acc, project) => {
    const donor = project.donor;
    if (!acc[donor]) {
      acc[donor] = { donor, budgetEGP: 0, amountUSD: 0, projects: 0 };
    }
    acc[donor].budgetEGP += project.budgetEGP;
    acc[donor].amountUSD += project.amountUSD;
    acc[donor].projects += 1;
    return acc;
  }, {});
  const donorChartData = Object.values(donorData).sort((a, b) => b.budgetEGP - a.budgetEGP);

  return {
    statusCode: 200,
    body: JSON.stringify({
      yearlyData: yearlyChartData,
      stageData: stageChartData,
      donorData: donorChartData
    })
  };
}; 