const mockProjectsData = [
  { id: 1, project: "Improve the livelihood of refugees", donor: "Plan International", type: "International", year: 2018, budgetEGP: 1488770, amountUSD: 0, note: "", uniqueProject: "REF-001", stage: "Stage1" },
  { id: 2, project: "Support Community education for refugee chlidren", donor: "Plan International", type: "International", year: 2018, budgetEGP: 669152, amountUSD: 0, note: "", uniqueProject: "REF-002", stage: "Stage1" },
  // ... (add all your mock data here, truncated for brevity)
];

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const projects = [...new Set(mockProjectsData.map(p => p.project))];
  const donors = [...new Set(mockProjectsData.map(p => p.donor))];
  const types = [...new Set(mockProjectsData.map(p => p.type))];
  const years = [...new Set(mockProjectsData.map(p => p.year))].sort();
  const stages = [...new Set(mockProjectsData.map(p => p.stage))];

  return {
    statusCode: 200,
    body: JSON.stringify({
      projects,
      donors,
      types,
      years,
      stages
    })
  };
}; 