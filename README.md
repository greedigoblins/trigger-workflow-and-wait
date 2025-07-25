# Trigger Workflow and Wait GitHub Action

This GitHub Action allows you to trigger a workflow in a specified repository and wait for its completion. It is useful for orchestrating complex workflows that depend on the successful execution of other workflows.

[![CI](https://github.com/greedigoblins/trigger-workflow-and-wait/actions/workflows/ci.yml/badge.svg)](https://github.com/greedigoblins/trigger-workflow-and-wait/actions/workflows/ci.yml)

## Features

- ✅ Trigger workflows in any repository you have access to
- ✅ Wait for triggered workflows to complete
- ✅ Configurable wait intervals and timeouts
- ✅ Proper error handling and failure propagation
- ✅ Optimized bundle size using `@vercel/ncc`
- ✅ Comprehensive test coverage

## Usage

### Basic Usage

```yaml
name: Trigger Workflow and Wait

on:
  workflow_dispatch:

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger another workflow
        uses: greedigoblins/trigger-workflow-and-wait@v1
        with:
          owner: 'your-github-username'
          repo: 'your-repo-name'
          github_token: ${{ secrets.GITHUB_TOKEN }}
          workflow_file_name: 'your-workflow-file.yml'
```

### Advanced Usage

```yaml
name: Complex Workflow Orchestration

on:
  push:
    branches: [ main ]

jobs:
  trigger-and-wait:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger deployment workflow
        uses: greedigoblins/trigger-workflow-and-wait@v1
        with:
          owner: 'my-org'
          repo: 'deployment-repo'
          github_token: ${{ secrets.DEPLOY_TOKEN }}
          workflow_file_name: 'deploy.yml'
          wait_interval: '30'           # Check every 30 seconds
          propagate_failure: 'true'     # Fail this job if triggered workflow fails
          trigger_workflow: 'true'      # Actually trigger the workflow
          wait_workflow: 'true'         # Wait for completion
```

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `owner` | The owner of the repository | ✅ | |
| `repo` | The name of the repository | ✅ | |
| `github_token` | GitHub token with repo access | ✅ | |
| `workflow_file_name` | The name of the workflow file to trigger | ✅ | |
| `wait_interval` | The interval to wait between checks (in seconds) | ❌ | `10` |
| `propagate_failure` | Whether to propagate failure to the upstream job | ❌ | `true` |
| `trigger_workflow` | Whether to trigger the workflow | ❌ | `true` |
| `wait_workflow` | Whether to wait for the workflow to finish | ❌ | `true` |

### Outputs

| Output | Description |
|--------|-------------|
| `workflow_id` | The ID of the triggered workflow |
| `workflow_url` | The URL of the triggered workflow |

## Publishing and Releases

This action uses automated releases with GitHub Actions:

### Creating a Release

Create a new tag following semantic versioning then use the publish feature in github.

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Version Tags

- **Specific versions**: `v1.0.0`, `v1.1.0`, `v2.0.0`
- **Major version tags**: `v1`, `v2` (automatically updated)

Users can reference either:
- `greedigoblins/trigger-workflow-and-wait@v1` (always latest v1.x.x)
- `greedigoblins/trigger-workflow-and-wait@v1.0.0` (specific version)

## Inputs

- `owner`: **Required**. The owner of the repository where the workflow is located.
- `repo`: **Required**. The name of the repository where the workflow is located.
- `github_token`: **Required**. A GitHub token with permissions to trigger workflows.
- `workflow_file_name`: **Required**. The name of the workflow file to trigger.
- `wait_workflow`: **Optional**. Set to `true` to wait for the triggered workflow to finish. Default is `true`.
- `propagate_failure`: **Optional**. Set to `true` to propagate the failure of the triggered workflow to the calling workflow. Default is `true`.
- `wait_interval`: **Optional**. The interval in seconds to wait between checks for the workflow status. Default is `10`.
- `client_payload`: **Optional**. A JSON string containing inputs to pass to the triggered workflow.
- `ref`: **Optional**. The git reference for the workflow run (branch, tag, or commit SHA). Default is `main`.

## Outputs

- `workflow_id`: The ID of the triggered workflow run.
- `workflow_url`: The URL of the triggered workflow run.
- `conclusion`: The conclusion of the workflow run (success, failure, etc.).
- `status`: The status of the workflow run (completed, in_progress, etc.).

## Example

Here is an example of how to use this action in a workflow:

```yaml
name: Example Workflow

on:
  push:
    branches:
      - main

jobs:
  trigger-workflow:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger another workflow
        uses: ./trigger-workflow-and-wait
        with:
          owner: your-github-username
          repo: your-repo-name
          github_token: ${{ secrets.GITHUB_TOKEN }}
          workflow_file_name: your-workflow-file.yml
```

## Development

This action is built using Node.js and uses `@vercel/ncc` to create a single, minified bundle for optimal performance in GitHub Actions.

### Building

To build the action:

```bash
npm run build
```

This creates a bundled version in the `dist/` directory that includes all dependencies.

### Testing

Run the test suite:

```bash
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Development Workflow

1. Create a feature branch
1. Make changes to the source code in the `src/` directory
1. Run tests to ensure everything works: `npm test`
1. Build the action: `npm run build:complete`
1. Commit both source and built files
1. Create a PR to `main`
1. Someone with admin access can publish the package

## License

This project is licensed under the MIT License. See the LICENSE file for details.