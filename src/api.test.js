const axios = require('axios');
const { apiRequest, getWorkflowRuns, triggerWorkflow } = require('./api');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
      ...originalEnv,
      INPUT_OWNER: 'test-owner',
      INPUT_REPO: 'test-repo',
      INPUT_GITHUB_TOKEN: 'test-token',
      API_URL: 'https://api.github.com'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('apiRequest', () => {
    it('should make a successful GET request', async () => {
      const mockResponse = { data: { id: 123 } };
      mockedAxios.mockResolvedValue(mockResponse);

      const result = await apiRequest('runs/123');

      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.github.com/repos/test-owner/test-repo/actions/runs/123',
        headers: {
          Authorization: 'Bearer test-token',
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        data: null,
      });
      expect(result).toEqual({ id: 123 });
    });

    it('should make a successful POST request with data', async () => {
      const mockResponse = { data: {} };
      const postData = { ref: 'main', inputs: {} };
      mockedAxios.mockResolvedValue(mockResponse);

      await apiRequest('workflows/test.yml/dispatches', 'POST', postData);

      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.github.com/repos/test-owner/test-repo/actions/workflows/test.yml/dispatches',
        headers: {
          Authorization: 'Bearer test-token',
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        data: postData,
      });
    });

    it('should handle API errors with response data', async () => {
      const mockError = new Error('API Error');
      mockError.response = {
        data: { message: 'Not found' }
      };
      mockedAxios.mockRejectedValue(mockError);
      console.error = jest.fn();

      await expect(apiRequest('runs/123')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith('API request failed:', { message: 'Not found' });
    });

    it('should handle API errors without response data', async () => {
      const mockError = new Error('Network error');
      mockedAxios.mockRejectedValue(mockError);
      console.error = jest.fn();

      await expect(apiRequest('runs/123')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith('API request failed:', 'Network error');
    });

    it('should use custom API_URL when provided', async () => {
      process.env.API_URL = 'https://custom-api.github.com';
      const mockResponse = { data: { id: 123 } };
      mockedAxios.mockResolvedValue(mockResponse);

      await apiRequest('runs/123');

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://custom-api.github.com/repos/test-owner/test-repo/actions/runs/123'
        })
      );
    });
  });

  describe('getWorkflowRuns', () => {
    it('should get workflow runs without actor', async () => {
      const mockResponse = { data: { workflow_runs: [{ id: 123 }] } };
      mockedAxios.mockResolvedValue(mockResponse);

      const result = await getWorkflowRuns('test.yml', '2023-01-01T00:00:00Z');

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.github.com/repos/test-owner/test-repo/actions/workflows/test.yml/runs?event=workflow_dispatch&created=>=2023-01-01T00:00:00Z&per_page=100'
        })
      );
      expect(result).toEqual({ workflow_runs: [{ id: 123 }] });
    });

    it('should get workflow runs with actor', async () => {
      const mockResponse = { data: { workflow_runs: [{ id: 123 }] } };
      mockedAxios.mockResolvedValue(mockResponse);

      await getWorkflowRuns('test.yml', '2023-01-01T00:00:00Z', 'test-user');

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.github.com/repos/test-owner/test-repo/actions/workflows/test.yml/runs?event=workflow_dispatch&created=>=2023-01-01T00:00:00Z&actor=test-user&per_page=100'
        })
      );
    });

    it('should handle empty actor parameter', async () => {
      const mockResponse = { data: { workflow_runs: [] } };
      mockedAxios.mockResolvedValue(mockResponse);

      await getWorkflowRuns('test.yml', '2023-01-01T00:00:00Z', '');

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.github.com/repos/test-owner/test-repo/actions/workflows/test.yml/runs?event=workflow_dispatch&created=>=2023-01-01T00:00:00Z&per_page=100'
        })
      );
    });
  });

  describe('triggerWorkflow', () => {
    it('should trigger workflow with ref and inputs', async () => {
      const mockResponse = { data: {} };
      mockedAxios.mockResolvedValue(mockResponse);

      const inputs = { key: 'value' };
      await triggerWorkflow('test.yml', 'main', inputs);

      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.github.com/repos/test-owner/test-repo/actions/workflows/test.yml/dispatches',
        headers: {
          Authorization: 'Bearer test-token',
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        data: {
          ref: 'main',
          inputs: { key: 'value' }
        },
      });
    });

    it('should trigger workflow with empty inputs', async () => {
      const mockResponse = { data: {} };
      mockedAxios.mockResolvedValue(mockResponse);

      await triggerWorkflow('test.yml', 'develop', {});

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ref: 'develop',
            inputs: {}
          }
        })
      );
    });

    it('should handle trigger workflow errors', async () => {
      const mockError = new Error('Workflow not found');
      mockedAxios.mockRejectedValue(mockError);

      await expect(triggerWorkflow('nonexistent.yml', 'main', {}))
        .rejects.toThrow('Workflow not found');
    });
  });
});