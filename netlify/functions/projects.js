let mockProjectsData = [
  { id: 1, project: "Improve the livelihood of refugees", donor: "Plan International", type: "International", year: 2018, budgetEGP: 1488770, amountUSD: 0, note: "", uniqueProject: "REF-001", stage: "Stage1" },
  { id: 2, project: "Support Community education for refugee chlidren", donor: "Plan International", type: "International", year: 2018, budgetEGP: 669152, amountUSD: 0, note: "", uniqueProject: "REF-002", stage: "Stage1" },
  // ... (add all your mock data here, truncated for brevity)
];

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const projectData = JSON.parse(event.body);
    if (!projectData.project || !projectData.donor || !projectData.year) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Project, donor, and year are required' }) };
    }
    projectData.stage = projectData.year < 2021 ? 'Stage1' : 'Stage2';
    projectData.id = mockProjectsData.length + 1;
    projectData.uniqueProject = projectData.uniqueProject || `PROJ-${Date.now()}`;
    mockProjectsData.push(projectData);
    return { statusCode: 201, body: JSON.stringify(projectData) };
  }
  return { statusCode: 405, body: 'Method Not Allowed' };
}; 