const core = require('@actions/core');
const github = require('@actions/github');
const { validateInputs } = require('./utils');
const { triggerWorkflow, waitForWorkflowToFinish } = require('./workflow');

async function run() {
  try {
    const inputs = validateInputs();

    const octokit = github.getOctokit(inputs.github_token);
    const { owner, repo, workflow_file_name, client_payload, ref } = inputs;

    let runIds = [];
    if (inputs.trigger_workflow) {
      const runId = await triggerWorkflow(octokit, owner, repo, workflow_file_name, client_payload, ref);
      runIds.push(runId);
    } else {
      core.info("Skipping triggering the workflow.");
    }

    if (inputs.wait_workflow) {
      for (const runId of runIds) {
        await waitForWorkflowToFinish(octokit, owner, repo, runId);
      }
    } else {
      core.info("Skipping waiting for workflow.");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();