/**
 * Models Index
 * Centralized export for all model types
 */

// Base Models
export type * from './base.models';
export * from './base.models';

// Pipeline Models
export type * from './pipeline.models';
export * from './pipeline.models';

// API Models
export type * from './api.models';
export * from './api.models';

// UI Models
export type * from './ui.models';
export * from './ui.models';

// Re-export commonly used types for convenience
export type {
  // Base
  Status,
  ExecutionStatus,
  Timestamp,
  Duration,
  BaseEntity,
  Result,
  ValidationResult,
} from './base.models';

export type {
  // Pipeline
  PipelineStep,
  PipelineConfiguration,
  PipelineExecution,
  StepType,
  StepPayload,
  LogEntry,
} from './pipeline.models';

export type {
  // API
  ApiResponse,
  ApiError,
  User,
  UserRole,
  AuthTokens,
} from './api.models';

export type {
  // UI
  Theme,
  UIState,
  FormState,
  TableState,
  PipelineUIState
} from './ui.models';

// Type guards for runtime type checking
export function isPipelineStep(obj: any): obj is import('./pipeline.models').PipelineStep {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    ['pending', 'in-progress', 'success', 'error'].includes(obj.status);
}

export function isPipelineConfiguration(obj: any): obj is import('./pipeline.models').PipelineConfiguration {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.version === 'string' &&
    Array.isArray(obj.steps);
}

export function isPipelineExecution(obj: any): obj is import('./pipeline.models').PipelineExecution {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.configurationId === 'string' &&
    ['idle', 'running', 'paused', 'completed', 'error'].includes(obj.status);
}

export function isApiError(obj: any): obj is import('./api.models').ApiError {
  return obj &&
    typeof obj.code === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.status === 'number';
}

// Utility types for working with models
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithTimestamps<T> = T & {
  createdAt: import('./base.models').Timestamp;
  updatedAt: import('./base.models').Timestamp;
};

export type WithAudit<T> = T & {
  createdBy: string;
  updatedBy: string;
  createdAt: import('./base.models').Timestamp;
  updatedAt: import('./base.models').Timestamp;
};

// Generic CRUD operations types
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
export type ListFilters<T> = Partial<T> & {
  search?: string;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};