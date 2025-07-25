const { triggerWorkflow: triggerWorkflowAPI, getWorkflowRuns, apiRequest } = require('./api');
const { waitFor } = require('./utils');
const core = require('@actions/core');

async function triggerWorkflow(octokit, owner, repo, workflowFileName, clientPayload, ref) {
  try {
    core.info(`Triggering workflow ${workflowFileName} in ${owner}/${repo}`);
    
    // Parse client payload if it's a string
    let inputs = {};
    if (clientPayload) {
      try {
        inputs = typeof clientPayload === 'string' ? JSON.parse(clientPayload) : clientPayload;
      } catch (error) {
        core.warning(`Failed to parse client_payload: ${error.message}`);
      }
    }

    // Trigger the workflow using our API function
    await triggerWorkflowAPI(workflowFileName, ref, inputs);
    
    // Wait a bit for the workflow to start
    await waitFor(5);
    
    // Get the most recent workflow run ID
    const runId = await getWorkflowRunId(workflowFileName, ref || 'main');
    
    // Generate the workflow run URL
    const workflowUrl = `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
    
    core.info(`Workflow triggered successfully. Run ID: ${runId}`);
    core.info(`📋 Workflow URL: ${workflowUrl}`);
    core.info(`🔗 Click here to view the running workflow: ${workflowUrl}`);
    
    // Set outputs for other steps to use
    core.setOutput('workflow_id', runId);
    core.setOutput('workflow_url', workflowUrl);
    
    return runId;
  } catch (error) {
    core.error(`Failed to trigger workflow: ${error.message}`);
    throw error;
  }
}

async function getWorkflowRunId(workflowFileName, ref) {
  try {
    // Get recent workflow runs (within last 5 minutes)
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const response = await getWorkflowRuns(workflowFileName, since);
    
    if (response.workflow_runs && response.workflow_runs.length > 0) {
      // Return the most recent run ID
      return response.workflow_runs[0].id;
    } else {
      throw new Error('No recent workflow runs found');
    }
  } catch (error) {
    core.error(`Failed to get workflow run ID: ${error.message}`);
    throw error;
  }
}

async function waitForWorkflowToFinish(octokit, owner, repo, runId) {
  try {
    const workflowUrl = `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
    
    core.info(`Waiting for workflow run ${runId} to complete...`);
    core.info(`🔗 Monitor progress at: ${workflowUrl}`);
    
    let conclusion = null;
    let status = '';
    let attempts = 0;
    const maxAttempts = 120; // 20 minutes max (120 * 10 seconds)

    while (conclusion === null && status !== 'completed' && attempts < maxAttempts) {
      await waitFor(10); // Wait for 10 seconds
      attempts++;
      
      // Get workflow run status
      const response = await apiRequest(`runs/${runId}`);
      conclusion = response.conclusion;
      status = response.status;
      
      // Show URL reminder every 30 attempts (5 minutes)
      if (attempts % 30 === 0) {
        core.info(`⏱️  Still waiting... View progress: ${workflowUrl}`);
      }
      
      core.info(`Workflow status: ${status}, conclusion: ${conclusion || 'none'} (attempt ${attempts}/${maxAttempts})`);
    }

    if (attempts >= maxAttempts) {
      core.error(`⏰ Timeout waiting for workflow to complete after ${maxAttempts * 10} seconds`);
      core.error(`🔗 Check final status at: ${workflowUrl}`);
      throw new Error(`Timeout waiting for workflow to complete after ${maxAttempts * 10} seconds`);
    }

    if (status === 'completed') {
      if (conclusion === 'success') {
        core.info(`✅ Workflow completed successfully!`);
        core.info(`🎉 View completed workflow: ${workflowUrl}`);
      } else {
        core.error(`❌ Workflow completed with conclusion: ${conclusion}`);
        core.error(`🔗 View failed workflow: ${workflowUrl}`);
        throw new Error(`Workflow completed with conclusion: ${conclusion}`);
      }
    } else {
      core.error(`❌ Workflow did not complete. Status: ${status}`);
      core.error(`🔗 Check workflow status: ${workflowUrl}`);
      throw new Error(`Workflow did not complete. Status: ${status}`);
    }

    return { conclusion, status };
  } catch (error) {
    core.error(`Failed while waiting for workflow: ${error.message}`);
    throw error;
  }
}

module.exports = {
  triggerWorkflow,
  waitForWorkflowToFinish,
};