/**
 * API Models and DTOs
 * Request/Response interfaces for API communication
 */

import { PaginationParams, PaginatedResponse, ErrorDetails } from './base.models';
import { PipelineConfiguration, PipelineExecution, PipelineStep } from './pipeline.models';

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId: string;
}

// API Error
export interface ApiError {
  code: string;
  message: string;
  details?: ErrorDetails[];
  status: number;
  path?: string;
  timestamp: string;
}

// Authentication Models
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  permissions: Permission[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export interface Permission {
  resource: string;
  actions: string[];
}

// Pipeline API Models
export interface CreatePipelineRequest {
  name: string;
  description?: string;
  steps: CreateStepRequest[];
  executionSettings?: Partial<PipelineConfiguration['executionSettings']>;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  steps?: UpdateStepRequest[];
  executionSettings?: Partial<PipelineConfiguration['executionSettings']>;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreateStepRequest {
  name: string;
  type: string;
  description?: string;
  payload: Record<string, any>;
  configuration?: Partial<PipelineStep['configuration']>;
  substeps?: CreateStepRequest[];
  dependencies?: string[];
}

export interface UpdateStepRequest extends Partial<CreateStepRequest> {
  id?: string;
}

export interface PipelineListRequest extends PaginationParams {
  search?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  environment?: string;
}

export interface PipelineListResponse extends PaginatedResponse<PipelineListItem> {}

export interface PipelineListItem {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
  averageDuration: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Execution API Models
export interface StartExecutionRequest {
  configurationId: string;
  steps?: string[]; // Specific steps to run
  options?: {
    skipValidation?: boolean;
    continueOnError?: boolean;
    parallel?: boolean;
    dryRun?: boolean;
  };
  parameters?: Record<string, any>;
}

export interface StartExecutionResponse {
  executionId: string;
  status: 'started';
  estimatedDuration?: string;
  startedAt: string;
}

export interface ExecutionStatusResponse {
  executionId: string;
  status: PipelineExecution['status'];
  progress: {
    currentStep: number;
    totalSteps: number;
    percentage: number;
  };
  currentStepName?: string;
  startedAt?: string;
  estimatedCompletion?: string;
  duration?: string;
}

export interface ExecutionListRequest extends PaginationParams {
  configurationId?: string;
  status?: PipelineExecution['status'];
  startDate?: string;
  endDate?: string;
  triggeredBy?: string;
}

export interface ExecutionHistoryItem {
  id: string;
  configurationId: string;
  configurationName: string;
  status: PipelineExecution['status'];
  startedAt: string;
  completedAt?: string;
  duration?: string;
  triggeredBy: string;
  triggerType: PipelineExecution['triggerType'];
  stepsCompleted: number;
  totalSteps: number;
  successRate: number;
}

// Step API Models
export interface StepUpdateRequest {
  payload?: Record<string, any>;
  configuration?: Partial<PipelineStep['configuration']>;
}

export interface StepExecutionRequest {
  executionId: string;
  stepId: string;
  action: 'run' | 'skip' | 'retry' | 'stop';
  parameters?: Record<string, any>;
}

export interface StepStatusUpdate {
  stepId: string;
  status: PipelineStep['status'];
  progress: number;
  logs?: string[];
  warnings?: number;
  errors?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Real-time Events
export interface WebSocketMessage<T = any> {
  type: 'step-update' | 'execution-complete' | 'error' | 'heartbeat';
  payload: T;
  timestamp: string;
  executionId?: string;
}

export interface StepUpdateEvent {
  stepId: string;
  executionId: string;
  status: PipelineStep['status'];
  progress: number;
  logs: string[];
  metrics?: Partial<PipelineStep['metrics']>;
  errors?: ErrorDetails[];
  warnings?: ErrorDetails[];
}

export interface ExecutionCompleteEvent {
  executionId: string;
  status: PipelineExecution['status'];
  duration: string;
  results: {
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
    artifacts: number;
  };
}

// Analytics API Models
export interface AnalyticsRequest {
  startDate: string;
  endDate: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
  metrics: AnalyticsMetric[];
  filters?: {
    configurationIds?: string[];
    statuses?: string[];
    userIds?: string[];
  };
}

export enum AnalyticsMetric {
  EXECUTION_COUNT = 'execution_count',
  SUCCESS_RATE = 'success_rate',
  AVERAGE_DURATION = 'average_duration',
  ERROR_RATE = 'error_rate',
  RESOURCE_USAGE = 'resource_usage',
  THROUGHPUT = 'throughput'
}

export interface AnalyticsResponse {
  metrics: {
    [key in AnalyticsMetric]?: AnalyticsDataPoint[];
  };
  summary: AnalyticsSummary;
}

export interface AnalyticsDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface AnalyticsSummary {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: string;
  totalProcessingTime: string;
  peakConcurrency: number;
  mostUsedConfiguration: {
    id: string;
    name: string;
    count: number;
  };
}

// Configuration API Models
export interface ConfigurationValidationRequest {
  configuration: Partial<PipelineConfiguration>;
}

export interface ConfigurationValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  severity: 'warning';
}

export interface ValidationSuggestion {
  field: string;
  message: string;
  suggestedValue?: any;
  rationale: string;
}

// Export/Import Models
export interface ExportRequest {
  configurationIds: string[];
  format: 'json' | 'yaml';
  includeHistory?: boolean;
  includeTemplates?: boolean;
}

export interface ImportRequest {
  file: File;
  options: {
    overwrite?: boolean;
    createTemplates?: boolean;
    validateOnly?: boolean;
  };
}

export interface ImportResult {
  success: boolean;
  imported: {
    configurations: number;
    templates: number;
  };
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  item: string;
  message: string;
  line?: number;
}

export interface ImportWarning {
  item: string;
  message: string;
  line?: number;
}