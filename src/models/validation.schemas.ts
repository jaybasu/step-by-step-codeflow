/**
 * Validation Schemas
 * Runtime validation schemas for model interfaces
 */

import { z } from 'zod';

// Base schemas
export const timestampSchema = z.string().datetime();
export const durationSchema = z.string().regex(/^\d+[smh](\s+\d+[smh])*$/);
export const statusSchema = z.enum(['pending', 'in-progress', 'success', 'error']);
export const executionStatusSchema = z.enum(['idle', 'running', 'paused', 'completed', 'error']);

// Base entity schema
export const baseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  entityVersion: z.number().optional(),
});

// Progress schema
export const progressInfoSchema = z.object({
  current: z.number().min(0),
  total: z.number().min(0),
  percentage: z.number().min(0).max(100),
  estimatedTimeRemaining: durationSchema.optional(),
  elapsedTime: durationSchema.optional(),
});

// Error details schema
export const errorDetailsSchema = z.object({
  code: z.string(),
  message: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  timestamp: timestampSchema,
  context: z.record(z.string(), z.any()).optional(),
  stackTrace: z.string().optional(),
});

// Step payload schemas
export const extractionPayloadSchema = z.object({
  inputPath: z.string().min(1),
  fileTypes: z.array(z.string()),
  excludePatterns: z.array(z.string()).optional(),
  recursive: z.boolean().optional(),
  maxDepth: z.number().min(1).optional(),
});

export const detectionPayloadSchema = z.object({
  patterns: z.array(z.string()),
  frameworks: z.array(z.string()),
  confidence: z.number().min(0).max(1).optional(),
  includeComments: z.boolean().optional(),
});

export const analysisPayloadSchema = z.object({
  depth: z.enum(['shallow', 'deep', 'comprehensive']),
  includeComments: z.boolean(),
  analyzeComplexity: z.boolean().optional(),
  generateReport: z.boolean().optional(),
});

export const chunkingPayloadSchema = z.object({
  chunkSize: z.number().min(1),
  overlap: z.number().min(0),
  strategy: z.enum(['line', 'function', 'semantic']).optional(),
  preserveStructure: z.boolean().optional(),
});

export const generationPayloadSchema = z.object({
  targetLanguage: z.string().min(1),
  preserveComments: z.boolean(),
  optimizationLevel: z.enum(['none', 'basic', 'aggressive']).optional(),
  codeStyle: z.object({
    indentation: z.enum(['spaces', 'tabs']),
    indentSize: z.number().min(1).max(8),
    quotes: z.enum(['single', 'double']),
    semicolons: z.boolean(),
    trailingCommas: z.boolean(),
  }).optional(),
});

export const validationPayloadSchema = z.object({
  strictMode: z.boolean(),
  linting: z.boolean(),
  typeChecking: z.boolean().optional(),
  securityScan: z.boolean().optional(),
  performanceCheck: z.boolean().optional(),
});

export const customPayloadSchema = z.object({
  script: z.string().optional(),
  command: z.string().optional(),
  parameters: z.record(z.string(), z.any()).optional(),
});

// Step payload union
export const stepPayloadSchema = z.union([
  extractionPayloadSchema,
  detectionPayloadSchema,
  analysisPayloadSchema,
  chunkingPayloadSchema,
  generationPayloadSchema,
  validationPayloadSchema,
  customPayloadSchema,
]);

// Step configuration schema
export const stepConfigurationSchema = z.object({
  timeout: durationSchema.optional(),
  retryAttempts: z.number().min(0).max(10).optional(),
  retryDelay: durationSchema.optional(),
  skipOnError: z.boolean().optional(),
  parallel: z.boolean().optional(),
  conditions: z.array(z.object({
    type: z.enum(['input', 'output', 'environment', 'custom']),
    expression: z.string(),
    message: z.string().optional(),
  })).optional(),
});

// Log entry schema
export const logEntrySchema = z.object({
  id: z.string(),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  message: z.string(),
  timestamp: timestampSchema,
  source: z.string().optional(),
  context: z.record(z.string(), z.any()).optional(),
});

// Step metrics schema
export const stepMetricsSchema = z.object({
  filesProcessed: z.number().min(0).optional(),
  totalFiles: z.number().min(0).optional(),
  linesProcessed: z.number().min(0).optional(),
  totalLines: z.number().min(0).optional(),
  errorsFound: z.number().min(0),
  warningsFound: z.number().min(0),
  performance: z.object({
    throughput: z.number().min(0),
    latency: z.number().min(0),
    errorRate: z.number().min(0).max(100),
    successRate: z.number().min(0).max(100),
  }).optional(),
});

// Pipeline step schema
export const pipelineStepSchema: z.ZodType<any> = z.lazy(() => z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  type: z.enum(['extraction', 'detection', 'analysis', 'chunking', 'generation', 'validation', 'custom']),
  description: z.string().optional(),
  status: statusSchema,
  progress: progressInfoSchema,
  payload: stepPayloadSchema,
  configuration: stepConfigurationSchema,
  executionInfo: z.object({
    startedAt: timestampSchema.optional(),
    completedAt: timestampSchema.optional(),
    duration: durationSchema.optional(),
    estimatedTimeRemaining: durationSchema.optional(),
    executor: z.string().optional(),
    resource: z.object({
      cpuUsage: z.number().min(0).max(100),
      memoryUsage: z.number().min(0),
      diskUsage: z.number().min(0),
      networkUsage: z.number().min(0),
    }).optional(),
    exitCode: z.number().optional(),
  }).optional(),
  substeps: z.array(pipelineStepSchema).optional(),
  dependencies: z.array(z.string()).optional(),
  logs: z.array(logEntrySchema),
  metrics: stepMetricsSchema,
  errors: z.array(errorDetailsSchema),
  warnings: z.array(errorDetailsSchema),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  entityVersion: z.number().optional(),
}));

// Pipeline execution settings schema
export const pipelineExecutionSettingsSchema = z.object({
  timeout: durationSchema,
  maxConcurrentSteps: z.number().min(1).max(50),
  continueOnError: z.boolean(),
  saveIntermediateResults: z.boolean(),
  cleanupOnFailure: z.boolean(),
  resourceLimits: z.object({
    maxMemory: z.number().min(1),
    maxCpu: z.number().min(1).max(100),
    maxDisk: z.number().min(1),
    maxNetworkBandwidth: z.number().min(1),
  }).optional(),
});

// Pipeline configuration schema
export const pipelineConfigurationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  version: z.string(),
  steps: z.array(pipelineStepSchema).min(1),
  executionSettings: pipelineExecutionSettingsSchema,
  environment: z.enum(['development', 'staging', 'production']),
  schedule: z.object({
    type: z.enum(['cron', 'interval', 'event']),
    expression: z.string(),
    timezone: z.string().optional(),
    isEnabled: z.boolean(),
    nextRun: timestampSchema.optional(),
    lastRun: timestampSchema.optional(),
  }).optional(),
  notifications: z.object({
    onSuccess: z.array(z.enum(['email', 'slack', 'webhook', 'sms'])),
    onFailure: z.array(z.enum(['email', 'slack', 'webhook', 'sms'])),
    onWarning: z.array(z.enum(['email', 'slack', 'webhook', 'sms'])),
    channels: z.object({
      email: z.object({
        recipients: z.array(z.string().email()),
        subject: z.string().optional(),
        template: z.string().optional(),
      }).optional(),
      slack: z.object({
        webhook: z.string().url(),
        channel: z.string(),
        username: z.string().optional(),
      }).optional(),
      webhook: z.object({
        url: z.string().url(),
        headers: z.record(z.string(), z.string()).optional(),
        method: z.enum(['POST', 'PUT']),
      }).optional(),
    }),
  }).optional(),
  isActive: z.boolean(),
  isTemplate: z.boolean(),
  tags: z.array(z.string()),
  category: z.string().optional(),
  metadata: z.record(z.string(), z.any()),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// API request schemas
export const createPipelineRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  steps: z.array(z.object({
    name: z.string().min(1).max(100),
    type: z.string(),
    description: z.string().optional(),
    payload: z.record(z.string(), z.any()),
    configuration: stepConfigurationSchema.partial().optional(),
    substeps: z.array(z.any()).optional(),
    dependencies: z.array(z.string()).optional(),
  })).min(1),
  executionSettings: pipelineExecutionSettingsSchema.partial().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const startExecutionRequestSchema = z.object({
  configurationId: z.string().uuid(),
  steps: z.array(z.string()).optional(),
  options: z.object({
    skipValidation: z.boolean().optional(),
    continueOnError: z.boolean().optional(),
    parallel: z.boolean().optional(),
    dryRun: z.boolean().optional(),
  }).optional(),
  parameters: z.record(z.string(), z.any()).optional(),
});

// Form validation schemas
export const pipelineFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  environment: z.enum(['development', 'staging', 'production']),
  tags: z.array(z.string()),
  steps: z.array(z.object({
    name: z.string().min(1, 'Step name is required'),
    type: z.string().min(1, 'Step type is required'),
    description: z.string().optional(),
    payload: z.record(z.string(), z.any()),
  })).min(1, 'At least one step is required'),
});

// Validation helper functions
export function validatePipelineConfiguration(data: unknown) {
  return pipelineConfigurationSchema.safeParse(data);
}

export function validateCreatePipelineRequest(data: unknown) {
  return createPipelineRequestSchema.safeParse(data);
}

export function validateStartExecutionRequest(data: unknown) {
  return startExecutionRequestSchema.safeParse(data);
}

export function validatePipelineForm(data: unknown) {
  return pipelineFormSchema.safeParse(data);
}

// Type inference helpers
export type PipelineConfigurationInput = z.infer<typeof pipelineConfigurationSchema>;
export type CreatePipelineRequestInput = z.infer<typeof createPipelineRequestSchema>;
export type StartExecutionRequestInput = z.infer<typeof startExecutionRequestSchema>;
export type PipelineFormInput = z.infer<typeof pipelineFormSchema>;