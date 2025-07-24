const core = require('@actions/core');

function validateInputs(inputs) {
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
}

function waitFor(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function formatOutput(name, value) {
    core.setOutput(name, value);
}

module.exports = {
    validateInputs,
    waitFor,
    formatOutput
};