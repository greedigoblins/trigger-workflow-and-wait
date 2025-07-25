const core = require('@actions/core');

function getInputs() {
    return {
        owner: core.getInput('owner', { required: true }),
        repo: core.getInput('repo', { required: true }),
        github_token: core.getInput('github_token', { required: true }),
        workflow_file_name: core.getInput('workflow_file_name', { required: true }),
        wait_interval: core.getInput('wait_interval') || '10',
        propagate_failure: core.getInput('propagate_failure') !== 'false',
        trigger_workflow: core.getInput('trigger_workflow') !== 'false',
        wait_workflow: core.getInput('wait_workflow') !== 'false',
        client_payload: core.getInput('client_payload') || '{}',
        ref: core.getInput('ref') || 'main'
    };
}

function validateInputs(inputs) {
    if (!inputs) {
        inputs = getInputs();
    }
    
    if (!inputs.owner) {
        throw new Error('Owner is a required argument.');
    }
    if (!inputs.repo) {
        throw new Error('Repo is a required argument.');
    }
    if (!inputs.github_token) {
        throw new Error('GitHub token is required.');
    }
    if (!inputs.workflow_file_name) {
        throw new Error('Workflow File Name is required.');
    }
    
    return inputs;
}

function waitFor(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function formatOutput(name, value) {
    core.setOutput(name, value);
}

module.exports = {
    getInputs,
    validateInputs,
    waitFor,
    formatOutput
};