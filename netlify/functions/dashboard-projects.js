const mockProjectsData = [
  { id: 1, project: "Improve the livelihood of refugees", donor: "Plan International", type: "International", year: 2018, budgetEGP: 1488770, amountUSD: 0, note: "", uniqueProject: "REF-001", stage: "Stage1" },
  { id: 2, project: "Support Community education for refugee chlidren", donor: "Plan International", type: "International", year: 2018, budgetEGP: 669152, amountUSD: 0, note: "", uniqueProject: "REF-002", stage: "Stage1" },
  // ... (add all your mock data here, truncated for brevity)
];

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let projectsData = mockProjectsData;
  const params = event.queryStringParameters || {};

  if (params.project) {
    projectsData = projectsData.filter(p => p.project.toLowerCase().includes(params.project.toLowerCase()));
  }
  if (params.donor) {
    projectsData = projectsData.filter(p => p.donor.toLowerCase().includes(params.donor.toLowerCase()));
  }
  if (params.type) {
    projectsData = projectsData.filter(p => p.type === params.type);
  }
  if (params.year) {
    projectsData = projectsData.filter(p => p.year === parseInt(params.year));
  }
  if (params.stage) {
    projectsData = projectsData.filter(p => p.stage === params.stage);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(projectsData)
  };
}; 