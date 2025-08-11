import { apiClient } from '@/lib/api';
import type { PipelineStepData } from '@/components/pipeline/DetailPane';

/**
 * Pipeline Service Layer
 * Encapsulates all pipeline-related business logic and API calls
 */

export interface PipelineConfiguration {
  id: string;
  name: string;
  steps: PipelineStepData[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineExecutionRequest {
  configurationId: string;
  steps?: string[]; // Optional: specific steps to run
  options?: {
    skipValidation?: boolean;
    continueOnError?: boolean;
    parallel?: boolean;
  };
}

export interface PipelineExecutionResponse {
  executionId: string;
  status: 'started' | 'running' | 'completed' | 'failed';
  startedAt: string;
  estimatedDuration?: number;
}

export interface PipelineStepUpdate {
  stepId: string;
  status: 'pending' | 'in-progress' | 'success' | 'error';
  progress: number;
  logs?: string[];
  warnings?: number;
  errors?: number;
  metadata?: any;
}

class PipelineService {
  private readonly basePath = '/pipeline';

  /**
   * Configuration Management
   */
  async getConfigurations(): Promise<PipelineConfiguration[]> {
    return apiClient.get<PipelineConfiguration[]>(`${this.basePath}/configurations`);
  }

  async getConfiguration(id: string): Promise<PipelineConfiguration> {
    return apiClient.get<PipelineConfiguration>(`${this.basePath}/configurations/${id}`);
  }

  async saveConfiguration(config: Omit<PipelineConfiguration, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<PipelineConfiguration> {
    return apiClient.post<PipelineConfiguration>(`${this.basePath}/configurations`, config);
  }

  async updateConfiguration(id: string, config: Partial<PipelineConfiguration>): Promise<PipelineConfiguration> {
    return apiClient.put<PipelineConfiguration>(`${this.basePath}/configurations/${id}`, config);
  }

  async deleteConfiguration(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/configurations/${id}`);
  }

  /**
   * Pipeline Execution
   */
  async startPipeline(request: PipelineExecutionRequest): Promise<PipelineExecutionResponse> {
    return apiClient.post<PipelineExecutionResponse>(`${this.basePath}/execute`, request);
  }

  async pausePipeline(executionId: string): Promise<void> {
    return apiClient.post(`${this.basePath}/executions/${executionId}/pause`);
  }

  async resumePipeline(executionId: string): Promise<void> {
    return apiClient.post(`${this.basePath}/executions/${executionId}/resume`);
  }

  async stopPipeline(executionId: string): Promise<void> {
    return apiClient.post(`${this.basePath}/executions/${executionId}/stop`);
  }

  async getExecutionStatus(executionId: string): Promise<PipelineExecutionResponse> {
    return apiClient.get<PipelineExecutionResponse>(`${this.basePath}/executions/${executionId}`);
  }

  /**
   * Step Management
   */
  async runStep(executionId: string, stepId: string): Promise<void> {
    return apiClient.post(`${this.basePath}/executions/${executionId}/steps/${stepId}/run`);
  }

  async runFromStep(executionId: string, stepId: string): Promise<void> {
    return apiClient.post(`${this.basePath}/executions/${executionId}/steps/${stepId}/run-from`);
  }

  async updateStepPayload(configId: string, stepId: string, payload: any): Promise<void> {
    return apiClient.put(`${this.basePath}/configurations/${configId}/steps/${stepId}/payload`, { payload });
  }

  /**
   * Real-time Updates
   */
  async subscribeToStepUpdates(executionId: string, callback: (update: PipelineStepUpdate) => void): Promise<() => void> {
    // WebSocket or Server-Sent Events implementation
    const eventSource = new EventSource(`${apiClient}/pipeline/executions/${executionId}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const update: PipelineStepUpdate = JSON.parse(event.data);
        callback(update);
      } catch (error) {
        console.error('Failed to parse step update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  /**
   * Validation and Utilities
   */
  async validateConfiguration(config: PipelineConfiguration): Promise<{ isValid: boolean; errors: string[] }> {
    return apiClient.post<{ isValid: boolean; errors: string[] }>(`${this.basePath}/validate`, config);
  }

  async getAvailableStepTypes(): Promise<{ id: string; name: string; description: string; schema: any }[]> {
    return apiClient.get(`${this.basePath}/step-types`);
  }

  async exportConfiguration(id: string, format: 'json' | 'yaml' = 'json'): Promise<Blob> {
    const response = await apiClient.get(`${this.basePath}/configurations/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }

  async importConfiguration(file: File): Promise<PipelineConfiguration> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post<PipelineConfiguration>(`${this.basePath}/configurations/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Analytics and Monitoring
   */
  async getExecutionHistory(limit = 50): Promise<PipelineExecutionResponse[]> {
    return apiClient.get<PipelineExecutionResponse[]>(`${this.basePath}/executions`, {
      params: { limit },
    });
  }

  async getStepMetrics(stepId: string, timeRange = '24h'): Promise<{
    averageDuration: number;
    successRate: number;
    errorRate: number;
    totalExecutions: number;
  }> {
    return apiClient.get(`${this.basePath}/steps/${stepId}/metrics`, {
      params: { timeRange },
    });
  }
}

// Export singleton instance
export const pipelineService = new PipelineService();

// Export class for testing
export { PipelineService };