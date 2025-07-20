const mockProjectsData = [
  { id: 1, project: "Improve the livelihood of refugees", donor: "Plan International", type: "International", year: 2018, budgetEGP: 1488770, amountUSD: 0, note: "", uniqueProject: "REF-001", stage: "Stage1" },
  { id: 2, project: "Support Community education for refugee chlidren", donor: "Plan International", type: "International", year: 2018, budgetEGP: 669152, amountUSD: 0, note: "", uniqueProject: "REF-002", stage: "Stage1" },
  // ... (add all your mock data here, truncated for brevity)
];

exports.handler = async (event) => {
  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const projects = mockProjectsData;

  // Calculate statistics
  const totalProjects = projects.length;
  const totalBudget = projects.reduce((sum, project) => sum + project.budgetEGP, 0);
  const uniqueDonors = [...new Set(projects.map(p => p.donor))];
  const uniqueDonorsCount = uniqueDonors.length;
  const internationalDonors = [...new Set(projects.filter(p => p.type === 'International').map(p => p.donor))];
  const nationalDonors = [...new Set(projects.filter(p => p.type === 'National').map(p => p.donor))];
  const stage1Projects = projects.filter(p => p.stage === 'Stage1');
  const stage2Projects = projects.filter(p => p.stage === 'Stage2');
  const stage1Budget = stage1Projects.reduce((sum, project) => sum + project.budgetEGP, 0);
  const stage2Budget = stage2Projects.reduce((sum, project) => sum + project.budgetEGP, 0);
  const yearStats = {};
  projects.forEach(project => {
    if (!yearStats[project.year]) {
      yearStats[project.year] = { count: 0, budget: 0 };
    }
    yearStats[project.year].count++;
    yearStats[project.year].budget += project.budgetEGP;
  });
  const donorStageComparison = {};
  projects.forEach(project => {
    if (!donorStageComparison[project.donor]) {
      donorStageComparison[project.donor] = { Stage1: 0, Stage2: 0, total: 0 };
    }
    donorStageComparison[project.donor][project.stage]++;
    donorStageComparison[project.donor].total++;
  });
  const formatNumber = (num) => num.toLocaleString('en-US');

  return {
    statusCode: 200,
    body: JSON.stringify({
      totalProjects,
      totalBudget: formatNumber(totalBudget),
      uniqueDonors: uniqueDonorsCount,
      internationalDonors: internationalDonors.length,
      nationalDonors: nationalDonors.length,
      stage1Projects: stage1Projects.length,
      stage2Projects: stage2Projects.length,
      stage1Budget: formatNumber(stage1Budget),
      stage2Budget: formatNumber(stage2Budget),
      yearStats: Object.keys(yearStats).reduce((acc, year) => {
        acc[year] = {
          count: yearStats[year].count,
          budget: formatNumber(yearStats[year].budget)
        };
        return acc;
      }, {}),
      donorStageComparison,
      uniqueDonorsList: uniqueDonors,
      internationalDonorsList: internationalDonors,
      nationalDonorsList: nationalDonors
    })
  };
}; 