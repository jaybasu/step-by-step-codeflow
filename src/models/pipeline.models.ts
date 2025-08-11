/**
 * Pipeline Domain Models
 * Core business entities for pipeline operations
 */

import { 
  BaseEntity, 
  Status, 
  ExecutionStatus, 
  Timestamp, 
  Duration, 
  ProgressInfo, 
  ErrorDetails, 
  ValidationResult,
  Metadata,
  AuditInfo 
} from './base.models';

// Step Types
export enum StepType {
  EXTRACTION = 'extraction',
  DETECTION = 'detection', 
  ANALYSIS = 'analysis',
  CHUNKING = 'chunking',
  GENERATION = 'generation',
  VALIDATION = 'validation',
  CUSTOM = 'custom'
}

// Pipeline Step Model
export interface PipelineStep extends BaseEntity {
  name: string;
  type: StepType;
  description?: string;
  status: Status;
  progress: ProgressInfo;
  
  // Configuration
  payload: StepPayload;
  configuration: StepConfiguration;
  
  // Execution details
  executionInfo?: StepExecutionInfo;
  
  // Relationships
  substeps?: PipelineStep[];
  dependencies?: string[]; // Step IDs this step depends on
  
  // Monitoring
  logs: LogEntry[];
  metrics: StepMetrics;
  
  // Error handling
  errors: ErrorDetails[];
  warnings: ErrorDetails[];
  
  // Metadata
  tags?: string[];
  metadata?: Metadata;
}

// Step Configuration
export interface StepConfiguration {
  timeout?: Duration;
  retryAttempts?: number;
  retryDelay?: Duration;
  skipOnError?: boolean;
  parallel?: boolean;
  conditions?: StepCondition[];
}

// Step Condition
export interface StepCondition {
  type: 'input' | 'output' | 'environment' | 'custom';
  expression: string;
  message?: string;
}

// Step Payload (typed by step type)
export type StepPayload = 
  | ExtractionPayload 
  | DetectionPayload 
  | AnalysisPayload 
  | ChunkingPayload 
  | GenerationPayload 
  | ValidationPayload 
  | CustomPayload;

export interface ExtractionPayload {
  inputPath: string;
  fileTypes: string[];
  excludePatterns?: string[];
  recursive?: boolean;
  maxDepth?: number;
}

export interface DetectionPayload {
  patterns: string[];
  frameworks: string[];
  confidence?: number;
  includeComments?: boolean;
}

export interface AnalysisPayload {
  depth: 'shallow' | 'deep' | 'comprehensive';
  includeComments: boolean;
  analyzeComplexity?: boolean;
  generateReport?: boolean;
}

export interface ChunkingPayload {
  chunkSize: number;
  overlap: number;
  strategy?: 'line' | 'function' | 'semantic';
  preserveStructure?: boolean;
}

export interface GenerationPayload {
  targetLanguage: string;
  preserveComments: boolean;
  optimizationLevel?: 'none' | 'basic' | 'aggressive';
  codeStyle?: CodeStyleConfig;
}

export interface ValidationPayload {
  strictMode: boolean;
  linting: boolean;
  typeChecking?: boolean;
  securityScan?: boolean;
  performanceCheck?: boolean;
}

export interface CustomPayload {
  script?: string;
  command?: string;
  parameters?: Metadata;
}

// Code style configuration
export interface CodeStyleConfig {
  indentation: 'spaces' | 'tabs';
  indentSize: number;
  quotes: 'single' | 'double';
  semicolons: boolean;
  trailingCommas: boolean;
}

// Step Execution Info
export interface StepExecutionInfo {
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  duration?: Duration;
  estimatedTimeRemaining?: Duration;
  executor?: string;
  resource?: ResourceInfo;
  exitCode?: number;
}

// Resource Info
export interface ResourceInfo {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
}

// Log Entry
export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Timestamp;
  source?: string;
  context?: Metadata;
}

// Step Metrics
export interface StepMetrics {
  filesProcessed?: number;
  totalFiles?: number;
  linesProcessed?: number;
  totalLines?: number;
  errorsFound: number;
  warningsFound: number;
  performance?: PerformanceMetrics;
}

// Performance Metrics
export interface PerformanceMetrics {
  throughput: number; // items per second
  latency: number; // milliseconds
  errorRate: number; // percentage
  successRate: number; // percentage
}

// Pipeline Configuration Model
export interface PipelineConfiguration extends BaseEntity, AuditInfo {
  name: string;
  description?: string;
  version: string;
  
  // Steps
  steps: PipelineStep[];
  
  // Execution settings
  executionSettings: PipelineExecutionSettings;
  
  // Environment
  environment: 'development' | 'staging' | 'production';
  
  // Scheduling
  schedule?: PipelineSchedule;
  
  // Notifications
  notifications?: NotificationSettings;
  
  // Status
  isActive: boolean;
  isTemplate: boolean;
  
  // Metadata
  tags: string[];
  category?: string;
  metadata: Metadata;
}

// Pipeline Execution Settings
export interface PipelineExecutionSettings {
  timeout: Duration;
  maxConcurrentSteps: number;
  continueOnError: boolean;
  saveIntermediateResults: boolean;
  cleanupOnFailure: boolean;
  resourceLimits?: ResourceLimits;
}

// Resource Limits
export interface ResourceLimits {
  maxMemory: number; // MB
  maxCpu: number; // percentage
  maxDisk: number; // MB
  maxNetworkBandwidth: number; // Mbps
}

// Pipeline Schedule
export interface PipelineSchedule {
  type: 'cron' | 'interval' | 'event';
  expression: string; // cron expression or interval
  timezone?: string;
  isEnabled: boolean;
  nextRun?: Timestamp;
  lastRun?: Timestamp;
}

// Notification Settings
export interface NotificationSettings {
  onSuccess: NotificationChannel[];
  onFailure: NotificationChannel[];
  onWarning: NotificationChannel[];
  channels: {
    email?: EmailNotificationConfig;
    slack?: SlackNotificationConfig;
    webhook?: WebhookNotificationConfig;
  };
}

// Notification Channels
export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'sms';

export interface EmailNotificationConfig {
  recipients: string[];
  subject?: string;
  template?: string;
}

export interface SlackNotificationConfig {
  webhook: string;
  channel: string;
  username?: string;
}

export interface WebhookNotificationConfig {
  url: string;
  headers?: Record<string, string>;
  method: 'POST' | 'PUT';
}

// Pipeline Execution Model
export interface PipelineExecution extends BaseEntity {
  configurationId: string;
  configurationVersion: string;
  status: ExecutionStatus;
  
  // Execution details
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  duration?: Duration;
  triggeredBy: string;
  triggerType: 'manual' | 'scheduled' | 'event' | 'api';
  
  // Progress
  currentStepIndex: number;
  totalSteps: number;
  progress: ProgressInfo;
  
  // Steps execution
  stepExecutions: StepExecution[];
  
  // Results
  results?: ExecutionResults;
  
  // Error handling
  errors: ErrorDetails[];
  
  // Resource usage
  resourceUsage?: ResourceInfo;
  
  // Metadata
  metadata: Metadata;
}

// Step Execution
export interface StepExecution {
  stepId: string;
  stepName: string;
  status: Status;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  duration?: Duration;
  
  // Results
  input?: Metadata;
  output?: Metadata;
  
  // Monitoring
  logs: LogEntry[];
  metrics: StepMetrics;
  
  // Error details
  errors: ErrorDetails[];
  warnings: ErrorDetails[];
}

// Execution Results
export interface ExecutionResults {
  success: boolean;
  summary: string;
  artifacts: Artifact[];
  reports: Report[];
  metrics: ExecutionMetrics;
}

// Artifact
export interface Artifact {
  id: string;
  name: string;
  type: 'file' | 'report' | 'data' | 'log';
  path: string;
  size: number;
  mimeType: string;
  createdAt: Timestamp;
  description?: string;
}

// Report
export interface Report {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'performance' | 'error';
  format: 'json' | 'html' | 'pdf' | 'csv';
  content: string | object;
  createdAt: Timestamp;
}

// Execution Metrics
export interface ExecutionMetrics {
  totalDuration: Duration;
  stepMetrics: { [stepId: string]: StepMetrics };
  resourceUsage: ResourceInfo;
  throughput: number;
  successRate: number;
  errorRate: number;
}

// Pipeline Template
export interface PipelineTemplate extends BaseEntity {
  name: string;
  description: string;
  category: string;
  version: string;
  
  // Template configuration
  configuration: Omit<PipelineConfiguration, 'id' | 'createdAt' | 'updatedAt'>;
  
  // Template metadata
  author: string;
  tags: string[];
  usageCount: number;
  rating?: number;
  
  // Validation
  validation: ValidationResult;
}