/**
 * Base Models and Common Types
 * Foundation interfaces used across the application
 */

// Common status types
export type Status = 'pending' | 'in-progress' | 'success' | 'error';

// Common execution states
export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

// Common severity levels
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

// Time-related types
export type Timestamp = string; // ISO 8601 format
export type Duration = string; // e.g., "5m 32s"

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  entityVersion?: number; // Renamed to avoid conflict
}

// Audit trail
export interface AuditInfo {
  createdBy: string;
  updatedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Metadata interface
export interface Metadata {
  [key: string]: string | number | boolean | null;
}

// Result wrapper
export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
}

// Progress tracking
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  estimatedTimeRemaining?: Duration;
  elapsedTime?: Duration;
}

// File information
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  mimeType: string;
  lastModified: Timestamp;
}

// Error details
export interface ErrorDetails {
  code: string;
  message: string;
  severity: SeverityLevel;
  timestamp: Timestamp;
  context?: Metadata;
  stackTrace?: string;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ErrorDetails[];
  warnings: ErrorDetails[];
}

// Configuration base
export interface ConfigurationBase extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
  tags?: string[];
}

// Resource usage
export interface ResourceUsage {
  cpuPercent: number;
  memoryUsed: number;
  memoryTotal: number;
  diskUsed: number;
  diskTotal: number;
  networkIn: number;
  networkOut: number;
}

// Health check
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    [service: string]: {
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      lastChecked: Timestamp;
    };
  };
  uptime: Duration;
  version: string;
}