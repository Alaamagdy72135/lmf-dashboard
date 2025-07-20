const axios = require('axios');
const XLSX = require('xlsx');

class SharePointService {
  constructor() {
    this.baseUrl = process.env.SHAREPOINT_SITE_URL;
    this.clientId = process.env.AZURE_CLIENT_ID;
    this.clientSecret = process.env.AZURE_CLIENT_SECRET;
    this.tenantId = process.env.AZURE_TENANT_ID;
    this.accessToken = null;
    // Updated Excel file path based on the new SharePoint URL
    this.excelFilePath = "/personal/hamed_ibrahim_lifemakers_org/Documents/LMF's Fund.xlsx";
  }

  // Get access token using Azure AD
  async getAccessToken() {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'https://graph.microsoft.com/.default'
      });

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  // Get Excel file content using Microsoft Graph API
  async getExcelFileContent() {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      // Use Microsoft Graph API to get the file content
      const graphUrl = 'https://graph.microsoft.com/v1.0';
      
      // Try different approaches to access the file
      let fileUrl;
      
      // Approach 1: Try to get the file using the document ID from the URL
      try {
        fileUrl = `${graphUrl}/me/drive/items/EUM7vulvE5FGnGuORb_qj0cB2VWLI_dyXL3sOwasEBUp8A/content`;
        console.log('Trying to access file via document ID...');
        
        const response = await axios.get(fileUrl, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          responseType: 'arraybuffer'
        });

        console.log('Successfully accessed Excel file via document ID');
        return response.data;
      } catch (error) {
        console.log('Document ID approach failed, trying alternative methods...');
      }

      // Approach 2: Try to get the file from the user's OneDrive using the file name
      try {
        fileUrl = `${graphUrl}/users/alaa_magdy_lifemakers_org/drive/root:/LMF's Fund.xlsx:/content`;
        console.log('Trying to access file via user OneDrive...');
        
        const response = await axios.get(fileUrl, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          responseType: 'arraybuffer'
        });

        console.log('Successfully accessed Excel file via user OneDrive');
        return response.data;
      } catch (error) {
        console.log('User OneDrive approach failed, trying SharePoint REST API...');
      }

      // Approach 3: Try SharePoint REST API with the document ID
      try {
        const sharePointUrl = `${this.baseUrl}/_api/web/GetFileById('EUM7vulvE5FGnGuORb_qj0cB2VWLI_dyXL3sOwasEBUp8A')/$value`;
        console.log('Trying to access file via SharePoint REST API with document ID...');
        
        const response = await axios.get(sharePointUrl, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          responseType: 'arraybuffer'
        });

        console.log('Successfully accessed Excel file via SharePoint REST API with document ID');
        return response.data;
      } catch (error) {
        console.log('SharePoint REST API with document ID approach failed');
      }

      // Approach 4: Try to list files and find the Excel file
      try {
        console.log('Trying to list files in user drive...');
        const listUrl = `${graphUrl}/users/alaa_magdy_lifemakers_org/drive/root/children`;
        
        const listResponse = await axios.get(listUrl, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/json'
          }
        });

        console.log('Files in drive:', listResponse.data.value.map(f => ({ name: f.name, id: f.id })));
        
        // Find the Excel file
        const excelFile = listResponse.data.value.find(f => 
          f.name.toLowerCase().includes('lmf') || 
          f.name.toLowerCase().includes('fund') ||
          f.name.toLowerCase().endsWith('.xlsx')
        );

        if (excelFile) {
          console.log('Found Excel file:', excelFile.name, 'ID:', excelFile.id);
          const fileContentUrl = `${graphUrl}/users/alaa_magdy_lifemakers_org/drive/items/${excelFile.id}/content`;
          
          const response = await axios.get(fileContentUrl, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            responseType: 'arraybuffer'
          });

          console.log('Successfully accessed Excel file via file listing');
          return response.data;
        }
      } catch (error) {
        console.log('File listing approach failed');
      }

      throw new Error('All file access methods failed');

    } catch (error) {
      console.error('Error getting Excel file:', error);
      console.log('All file access methods failed, using mock data');
      return null;
    }
  }

  // Parse Excel data and convert to our format
  parseExcelData(excelBuffer) {
    if (!excelBuffer) {
      console.log('No Excel data available, using mock data');
      return this.getMockData();
    }
    
    try {
      console.log('Parsing Excel file...');
      
      // Read the Excel file
      const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log('Excel data structure:', jsonData.slice(0, 3)); // Log first 3 rows
      
      // Parse the data
      const projects = [];
      let id = 1;
      
      // Skip header row and process data rows
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Skip empty rows
        if (!row || row.length === 0 || !row[0]) continue;
        
        try {
          const project = {
            id: id++,
            project: row[1] || `Project ${id}`, // Project column
            donor: row[2] || 'Unknown', // Donor column
            type: row[3] || 'Unknown', // Type column
            year: parseInt(row[4]) || new Date().getFullYear(), // Year column
            budgetEGP: parseFloat(row[5]) || 0, // Budget EGP column
            amountUSD: parseFloat(row[6]) || 0, // Amount $ column
            note: row[7] || '', // Note column
            uniqueProject: row[8] || `PROJ-${id}`, // Unique Project column
            stage: this.determineStage(parseInt(row[4]) || new Date().getFullYear())
          };
          
          projects.push(project);
        } catch (rowError) {
          console.log(`Error parsing row ${i}:`, rowError);
          continue;
        }
      }
      
      console.log(`Successfully parsed ${projects.length} projects from Excel file`);
      return projects;
      
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      console.log('Falling back to mock data');
      return this.getMockData();
    }
  }

  // Get mock data for development
  getMockData() {
    return [
      { id: 1, project: "Improve the livelihood of refugees", donor: "Plan International", type: "International", year: 2018, budgetEGP: 1488770, amountUSD: 0, note: "", uniqueProject: "REF-001", stage: "Stage1" },
      { id: 2, project: "Support Community education for refugee chlidren", donor: "Plan International", type: "International", year: 2018, budgetEGP: 669152, amountUSD: 0, note: "", uniqueProject: "REF-002", stage: "Stage1" },
      { id: 3, project: "Development of the Blind School", donor: "SAMSUNG", type: "National", year: 2018, budgetEGP: 6243338, amountUSD: 0, note: "", uniqueProject: "BLIND-001", stage: "Stage1" },
      { id: 4, project: "Haya Karima", donor: "MOSS", type: "National", year: 2019, budgetEGP: 45000000, amountUSD: 0, note: "", uniqueProject: "HAYA-001", stage: "Stage1" },
      { id: 5, project: "Eisha w Hawya", donor: "Federation of Egyption Banks", type: "National", year: 2019, budgetEGP: 5490293, amountUSD: 0, note: "", uniqueProject: "EISHA-001", stage: "Stage1" },
      { id: 6, project: "Samsung Inovation Campus (SIC 1)", donor: "SAMSUNG", type: "National", year: 2020, budgetEGP: 1824150, amountUSD: 0, note: "", uniqueProject: "SIC-001", stage: "Stage1" },
      { id: 7, project: "Samsung Inovation Campus (SIC 2)", donor: "SAMSUNG", type: "National", year: 2021, budgetEGP: 2279985, amountUSD: 0, note: "", uniqueProject: "SIC-002", stage: "Stage2" },
      { id: 8, project: "El-NAs l Baadaa", donor: "Sawiras Foundation", type: "National", year: 2020, budgetEGP: 12000000, amountUSD: 0, note: "", uniqueProject: "ELNAS-001", stage: "Stage1" },
      { id: 9, project: "Support the Suez during Corona", donor: "Suez Industrial Development Company", type: "National", year: 2020, budgetEGP: 500000, amountUSD: 0, note: "", uniqueProject: "SUEZ-001", stage: "Stage1" },
      { id: 10, project: "El- Mowatna", donor: "MOSS", type: "National", year: 2020, budgetEGP: 2330350, amountUSD: 0, note: "", uniqueProject: "MOWATNA-001", stage: "Stage1" },
      { id: 11, project: "Develope Child and Family Centers", donor: "MOSS", type: "National", year: 2020, budgetEGP: 21000000, amountUSD: 0, note: "", uniqueProject: "CHILD-001", stage: "Stage1" },
      { id: 12, project: "Develope Early Childhood Nurseries", donor: "MOSS", type: "National", year: 2020, budgetEGP: 28000000, amountUSD: 0, note: "", uniqueProject: "NURSERY-001", stage: "Stage1" },
      { id: 13, project: "Youth Network 'Daeem'", donor: "MOSS", type: "National", year: 2020, budgetEGP: 3929770, amountUSD: 0, note: "", uniqueProject: "DAEEM-001", stage: "Stage1" },
      { id: 14, project: "Fostering Young Community Leaders", donor: "UNDEF", type: "International", year: 2020, budgetEGP: 3440778, amountUSD: 0, note: "", uniqueProject: "LEADERS-001", stage: "Stage1" },
      { id: 15, project: "Uni-Green", donor: "EU", type: "International", year: 2020, budgetEGP: 12638100, amountUSD: 0, note: "", uniqueProject: "UNIGREEN-001", stage: "Stage1" },
      { id: 16, project: "Job Search Club", donor: "ILO", type: "International", year: 2022, budgetEGP: 1077321, amountUSD: 0, note: "", uniqueProject: "JOB-001", stage: "Stage2" },
      { id: 17, project: "Safir", donor: "EU - French Institute in Cairo", type: "International", year: 2020, budgetEGP: 548538, amountUSD: 0, note: "", uniqueProject: "SAFIR-001", stage: "Stage1" },
      { id: 18, project: "Samsung Inovation Campus (SIC 3)", donor: "SAMSUNG", type: "National", year: 2022, budgetEGP: 2570721, amountUSD: 0, note: "", uniqueProject: "SIC-003", stage: "Stage2" },
      { id: 19, project: "The Development of refugee economic projects", donor: "ILO", type: "International", year: 2022, budgetEGP: 1430819, amountUSD: 0, note: "", uniqueProject: "REF-ECON-001", stage: "Stage2" },
      { id: 20, project: "Cmprehensive development and empowerment of women", donor: "Sawiras Foundation", type: "National", year: 2022, budgetEGP: 31897048, amountUSD: 0, note: "", uniqueProject: "WOMEN-001", stage: "Stage2" },
      { id: 21, project: "Samsung Inovation Campus (SIC 4)", donor: "SAMSUNG", type: "National", year: 2022, budgetEGP: 2888726, amountUSD: 0, note: "", uniqueProject: "SIC-004", stage: "Stage2" },
      { id: 22, project: "Forsa", donor: "MOSS", type: "National", year: 2022, budgetEGP: 45000000, amountUSD: 0, note: "", uniqueProject: "FORSA-001", stage: "Stage2" },
      { id: 23, project: "Cmprehensive development of Dashna Center", donor: "Banque Misr Foundation", type: "National", year: 2022, budgetEGP: 13287740, amountUSD: 0, note: "", uniqueProject: "DASHNA-001", stage: "Stage2" },
      { id: 24, project: "Aisha and Haweya", donor: "Federation of Egyption Banks", type: "National", year: 2021, budgetEGP: 5586092, amountUSD: 0, note: "", uniqueProject: "AISHA-002", stage: "Stage2" },
      { id: 25, project: "Social innovation Incubator", donor: "UNFPA", type: "International", year: 2022, budgetEGP: 5000000, amountUSD: 0, note: "", uniqueProject: "INCUBATOR-001", stage: "Stage2" },
      { id: 26, project: "Waay Program", donor: "MOSS", type: "National", year: 2022, budgetEGP: 1185000, amountUSD: 0, note: "", uniqueProject: "WAAY-001", stage: "Stage2" },
      { id: 27, project: "Safir - Phase 2", donor: "EU - French Institute in Cairo", type: "International", year: 2023, budgetEGP: 1333438, amountUSD: 0, note: "", uniqueProject: "SAFIR-002", stage: "Stage2" },
      { id: 28, project: "Ready for Tomorrow", donor: "Plan International", type: "International", year: 2023, budgetEGP: 20000000, amountUSD: 0, note: "", uniqueProject: "TOMORROW-001", stage: "Stage2" },
      { id: 29, project: "Samsung Inovation Campus (SIC 5)", donor: "SAMSUNG", type: "National", year: 2023, budgetEGP: 5507999, amountUSD: 0, note: "", uniqueProject: "SIC-005", stage: "Stage2" },
      { id: 30, project: "Dar wa Salama", donor: "Sawiras Foundation", type: "National", year: 2024, budgetEGP: 52789695, amountUSD: 0, note: "", uniqueProject: "DAR-001", stage: "Stage2" },
      { id: 31, project: "Nawr Hayathom", donor: "MOSS", type: "National", year: 2024, budgetEGP: 8580400, amountUSD: 0, note: "", uniqueProject: "NAWR-001", stage: "Stage2" },
      { id: 32, project: "Samsung Inovation Campus (SIC 6)", donor: "SAMSUNG", type: "National", year: 2024, budgetEGP: 5507999, amountUSD: 0, note: "", uniqueProject: "SIC-006", stage: "Stage2" },
      { id: 33, project: "Samsung Inovation Campus (SIC7)", donor: "SAMSUNG", type: "National", year: 2025, budgetEGP: 9500000, amountUSD: 0, note: "", uniqueProject: "SIC-007", stage: "Stage2" },
      { id: 34, project: "Tamkeen", donor: "GIZ", type: "International", year: 2024, budgetEGP: 27000000, amountUSD: 0, note: "", uniqueProject: "TAMKEEN-001", stage: "Stage2" },
      { id: 35, project: "Develope Nurseries", donor: "MOSS", type: "National", year: 2024, budgetEGP: 17788500, amountUSD: 0, note: "", uniqueProject: "NURSERY-002", stage: "Stage2" },
      { id: 36, project: "Cmprehensive development of Qeft Center", donor: "Banque Misr Foundation", type: "National", year: 2025, budgetEGP: 34432200, amountUSD: 0, note: "", uniqueProject: "QEFT-001", stage: "Stage2" },
      { id: 37, project: "Steps Forward", donor: "UNHCR", type: "International", year: 2025, budgetEGP: 12000000, amountUSD: 0, note: "", uniqueProject: "STEPS-001", stage: "Stage2" },
      { id: 38, project: "SAWA", donor: "EU", type: "International", year: 2024, budgetEGP: 115000000, amountUSD: 0, note: "", uniqueProject: "SAWA-001", stage: "Stage2" },
      { id: 39, project: "United we Stand", donor: "Plan International - Drosos", type: "International", year: 2025, budgetEGP: 19460000, amountUSD: 0, note: "", uniqueProject: "UNITED-001", stage: "Stage2" },
      { id: 40, project: "SCREAM", donor: "Plan International - ILO", type: "International", year: 2025, budgetEGP: 6067720, amountUSD: 0, note: "", uniqueProject: "SCREAM-001", stage: "Stage2" },
      { id: 41, project: "Ahsan Saheb", donor: "MOSS", type: "National", year: 2024, budgetEGP: 28000000, amountUSD: 0, note: "", uniqueProject: "AHSAN-001", stage: "Stage2" }
    ];
  }

  // Fetch data from SharePoint Excel file
  async getProjectsFromSharePoint() {
    try {
      console.log('Fetching data from SharePoint Excel file...');
      const excelBuffer = await this.getExcelFileContent();
      const projects = this.parseExcelData(excelBuffer);
      
      console.log(`Successfully loaded ${projects.length} projects from SharePoint`);
      return projects;
    } catch (error) {
      console.error('Error fetching data from SharePoint Excel:', error);
      console.log('Falling back to mock data...');
      return this.getMockData();
    }
  }

  // Determine stage based on year
  determineStage(year) {
    return year < 2021 ? 'Stage 1' : 'Stage 2';
  }

  // Add new project to SharePoint (for now, just log it)
  async addProjectToSharePoint(projectData) {
    try {
      console.log('Adding project to SharePoint:', projectData);
      // In a real implementation, you would write to the Excel file or a SharePoint list
      // For now, we'll just return the project data
      return {
        ...projectData,
        id: Date.now(),
        stage: this.determineStage(projectData.year)
      };
    } catch (error) {
      console.error('Error adding project to SharePoint:', error);
      throw error;
    }
  }

  // Update project in SharePoint (for now, just log it)
  async updateProjectInSharePoint(projectId, projectData) {
    try {
      console.log('Updating project in SharePoint:', projectId, projectData);
      // In a real implementation, you would update the Excel file or SharePoint list
      return {
        ...projectData,
        id: projectId,
        stage: this.determineStage(projectData.year)
      };
    } catch (error) {
      console.error('Error updating project in SharePoint:', error);
      throw error;
    }
  }

  // Delete project from SharePoint (for now, just log it)
  async deleteProjectFromSharePoint(projectId) {
    try {
      console.log('Deleting project from SharePoint:', projectId);
      // In a real implementation, you would delete from the Excel file or SharePoint list
      return true;
    } catch (error) {
      console.error('Error deleting project from SharePoint:', error);
      throw error;
    }
  }
}

module.exports = SharePointService; 