let mockProjectsData = [
  { id: 1, project: "Improve the livelihood of refugees", donor: "Plan International", type: "International", year: 2018, budgetEGP: 1488770, amountUSD: 0, note: "", uniqueProject: "REF-001", stage: "Stage1" },
  { id: 2, project: "Support Community education for refugee chlidren", donor: "Plan International", type: "International", year: 2018, budgetEGP: 669152, amountUSD: 0, note: "", uniqueProject: "REF-002", stage: "Stage1" },
  // ... (add all your mock data here, truncated for brevity)
];

exports.handler = async (event) => {
  if (event.httpMethod === 'PUT') {
    const id = parseInt(event.queryStringParameters.id);
    const projectData = JSON.parse(event.body);
    projectData.stage = projectData.year < 2021 ? 'Stage1' : 'Stage2';
    const index = mockProjectsData.findIndex(p => p.id === id);
    if (index === -1) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Project not found' }) };
    }
    mockProjectsData[index] = { ...mockProjectsData[index], ...projectData };
    return { statusCode: 200, body: JSON.stringify(mockProjectsData[index]) };
  }
  return { statusCode: 405, body: 'Method Not Allowed' };
}; 