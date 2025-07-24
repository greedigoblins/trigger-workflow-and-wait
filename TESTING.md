# Testing Guide

This guide explains how to test the trigger-workflow-and-wait action using the provided test workflows.

## Setup

1. **Create a personal access token** with the following permissions:
   - `repo` (Full control of private repositories)
   - `actions:write` (Write access to actions)

2. **Add the token as a repository secret**:
   - Go to your repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `YOUR_TOKEN_SECRET` (or update the workflow file with your preferred name)
   - Value: Your personal access token

## Test Workflows

### 1. Test Receiver (`test-receiver.yml`)
This workflow receives triggers and simulates work.

**Features:**
- Displays trigger information
- Processes inputs
- Simulates work with delays
- Can simulate failure if input contains "fail"

### 2. Test Trigger Sender (`test-trigger-sender.yml`)
This workflow uses your action to trigger other workflows.

**Features:**
- Manually triggered via workflow_dispatch
- Configurable target repository and workflow
- Waits for completion and displays results

## How to Test

### Basic Test
1. Go to GitHub Actions in your repository
2. Click on "Test Trigger (Sender)"
3. Click "Run workflow"
4. Fill in the inputs:
   - **Target repository**: `greedigoblins/trigger-workflow-and-wait` (or your repo)
   - **Workflow file**: `test-receiver.yml`
   - **Test message**: `Hello from trigger test!`
5. Click "Run workflow"

The sender will:
1. Extract owner/repo from the input
2. Use your action to trigger the receiver workflow
3. Wait for it to complete
4. Display the results

### Test Failure Handling
1. Run the sender workflow again
2. Set **Test message** to: `This should fail`
3. The receiver will run the failure job and exit with code 1
4. The sender should detect this failure and propagate it

### Test Different Repositories
If you want to test triggering workflows in different repositories:
1. Make sure your token has access to both repositories
2. Update the **Target repository** input to `owner/repo-name`
3. Ensure the target repository has a workflow file you want to trigger

## Expected Behavior

### Success Case
- ✅ Sender workflow triggers successfully
- ✅ Receiver workflow runs and completes
- ✅ Sender displays workflow ID and URL
- ✅ Both workflows show success status

### Failure Case
- ✅ Sender workflow triggers successfully
- ❌ Receiver workflow fails (intentionally)
- ❌ Sender workflow fails due to propagate_failure: true
- ✅ Error is properly reported

## Troubleshooting

### Common Issues

1. **"Resource not accessible by integration"**
   - Your token doesn't have sufficient permissions
   - Make sure the token has `repo` and `actions:write` permissions

2. **"Workflow file not found"**
   - Check the workflow file name (must include `.yml` extension)
   - Ensure the file exists in `.github/workflows/` directory

3. **"Repository not found"**
   - Check the repository name format (`owner/repo`)
   - Ensure your token has access to the target repository

4. **Workflow doesn't trigger**
   - Verify the target workflow has `workflow_dispatch` trigger
   - Check if the repository has actions enabled

### Debug Information

The workflows include detailed logging to help with debugging:
- Repository information
- Token permissions (without exposing the token)
- Workflow trigger details
- Step-by-step execution logs

## Next Steps

Once testing is successful:
1. Remove or disable the test workflows if not needed
2. Create a proper release tag (e.g., `v1.0.0`)
3. Publish to GitHub Actions Marketplace
4. Update documentation with real-world examples
