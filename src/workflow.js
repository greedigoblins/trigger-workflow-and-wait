const { api } = require('./api');
const { wait } = require('./utils');

async function triggerWorkflow(owner, repo, workflowFileName, ref, clientPayload, githubToken) {
  const response = await api(`repos/${owner}/${repo}/actions/workflows/${workflowFileName}/dispatches`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref, inputs: clientPayload }),
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger workflow: ${response.statusText}`);
  }

  const runId = await getWorkflowRunId(owner, repo, workflowFileName, ref, githubToken);
  return runId;
}

async function getWorkflowRunId(owner, repo, workflowFileName, ref, githubToken) {
  const since = new Date(Date.now() - 120 * 1000).toISOString(); // Two minutes ago
  const query = `event=workflow_dispatch&created=>=${since}&per_page=100`;

  const response = await api(`repos/${owner}/${repo}/actions/workflows/${workflowFileName}/runs?${query}`, {
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const runs = await response.json();
  const runIds = runs.workflow_runs.map(run => run.id);
  return runIds;
}

async function waitForWorkflowToFinish(owner, repo, runId, githubToken) {
  let conclusion = null;
  let status = '';

  while (conclusion === null && status !== 'completed') {
    await wait(10); // Wait for 10 seconds
    const response = await api(`repos/${owner}/${repo}/actions/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const workflow = await response.json();
    conclusion = workflow.conclusion;
    status = workflow.status;
  }

  if (conclusion !== 'success' || status !== 'completed') {
    throw new Error(`Workflow concluded with status: ${conclusion}`);
  }
}

module.exports = {
  triggerWorkflow,
  waitForWorkflowToFinish,
};