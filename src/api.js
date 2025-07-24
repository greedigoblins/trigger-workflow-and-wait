const axios = require('axios');

const apiRequest = async (path, method = 'GET', data = null) => {
  const GITHUB_API_URL = process.env.API_URL || 'https://api.github.com';
  const GITHUB_TOKEN = process.env.INPUT_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  
  try {
    const response = await axios({
      method,
      url: `${GITHUB_API_URL}/repos/${process.env.INPUT_OWNER}/${process.env.INPUT_REPO}/actions/${path}`,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      data,
    });
    return response.data;
  } catch (error) {
    console.error('API request failed:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getWorkflowRuns = async (workflowFileName, since, actor) => {
  const query = `event=workflow_dispatch&created=>=${since}${actor ? `&actor=${actor}` : ''}&per_page=100`;
  return await apiRequest(`workflows/${workflowFileName}/runs?${query}`);
};

const triggerWorkflow = async (workflowFileName, ref, inputs) => {
  const data = {
    ref,
    inputs,
  };
  await apiRequest(`workflows/${workflowFileName}/dispatches`, 'POST', data);
};

module.exports = {
  apiRequest,
  getWorkflowRuns,
  triggerWorkflow,
};