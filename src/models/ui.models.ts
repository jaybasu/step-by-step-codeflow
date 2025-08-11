/**
 * UI Models and State Interfaces
 * Client-side state management and UI-specific types
 */

import { PipelineConfiguration, PipelineExecution, PipelineStep } from './pipeline.models';
import { User } from './api.models';

// Theme and Appearance
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

// Navigation and Routing
export interface NavigationState {
  currentRoute: string;
  previousRoute?: string;
  breadcrumbs: Breadcrumb[];
  sidebarCollapsed: boolean;
  activeMenu: string;
}

export interface Breadcrumb {
  label: string;
  path: string;
  isClickable: boolean;
}

// UI State Management
export interface UIState {
  // Layout
  layout: LayoutState;
  
  // Theme
  theme: ThemeConfig;
  
  // Navigation
  navigation: NavigationState;
  
  // Modals and Dialogs
  modals: ModalState;
  
  // Notifications
  notifications: NotificationState;
  
  // Loading states
  loading: LoadingState;
  
  // Preferences
  preferences: UserPreferences;
}

// Layout State
export interface LayoutState {
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  panelSizes: {
    left: number;
    center: number;
    right: number;
  };
  fullscreenMode: boolean;
  compactMode: boolean;
}

// Modal State
export interface ModalState {
  [modalId: string]: {
    isOpen: boolean;
    data?: any;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
  };
}

// Notification State
export interface NotificationState {
  toasts: ToastNotification[];
  banners: BannerNotification[];
  unreadCount: number;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp: string;
}

export interface BannerNotification {
  id: string;
  type: 'maintenance' | 'update' | 'warning' | 'info';
  message: string;
  isdismissible: boolean;
  expiresAt?: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Loading State
export interface LoadingState {
  global: boolean;
  [key: string]: boolean; // Feature-specific loading states
}

// User Preferences
export interface UserPreferences {
  // General
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // UI
  theme: ThemeConfig;
  layout: Partial<LayoutState>;
  
  // Pipeline
  pipelineDefaults: PipelinePreferences;
  
  // Notifications
  notificationSettings: NotificationPreferences;
  
  // Advanced
  developerMode: boolean;
  debugMode: boolean;
}

export interface PipelinePreferences {
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  showAdvancedOptions: boolean;
  defaultTimeout: string;
  defaultRetryAttempts: number;
  compactStepView: boolean;
  showStepTimings: boolean;
  expandLogsOnError: boolean;
}

export interface NotificationPreferences {
  showToasts: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  desktopNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// Pipeline UI State
export interface PipelineUIState {
  // Current pipeline
  currentPipeline: PipelineConfiguration | null;
  currentExecution: PipelineExecution | null;
  
  // View state
  view: 'list' | 'detail' | 'execution' | 'logs';
  selectedStepId: string | null;
  expandedSteps: Set<string>;
  
  // Filters and search
  filters: PipelineFilters;
  searchQuery: string;
  
  // UI preferences
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  logLevel: LogLevel;
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Real-time connections
  isConnectedToUpdates: boolean;
  lastUpdateTimestamp: string | null;
}

export interface PipelineFilters {
  status?: PipelineStep['status'][];
  type?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  executionStatus?: PipelineExecution['status'][];
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'all';

// Form States
export interface FormState<T = any> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export type FormErrors<T> = {
  [K in keyof T]?: string | FormErrors<T[K]>;
};

export type FormTouched<T> = {
  [K in keyof T]?: boolean | FormTouched<T[K]>;
};

// Pipeline Configuration Form
export interface PipelineConfigFormState extends FormState<PipelineConfigFormData> {
  activeStep: number;
  totalSteps: number;
  previewMode: boolean;
}

export interface PipelineConfigFormData {
  name: string;
  description: string;
  environment: 'development' | 'staging' | 'production';
  tags: string[];
  steps: StepFormData[];
  executionSettings: ExecutionSettingsFormData;
  schedule?: ScheduleFormData;
  notifications?: NotificationSettingsFormData;
}

export interface StepFormData {
  id?: string;
  name: string;
  type: string;
  description: string;
  payload: Record<string, any>;
  configuration: StepConfigurationFormData;
  substeps: StepFormData[];
  dependencies: string[];
}

export interface StepConfigurationFormData {
  timeout: string;
  retryAttempts: number;
  retryDelay: string;
  skipOnError: boolean;
  parallel: boolean;
}

export interface ExecutionSettingsFormData {
  timeout: string;
  maxConcurrentSteps: number;
  continueOnError: boolean;
  saveIntermediateResults: boolean;
  cleanupOnFailure: boolean;
}

export interface ScheduleFormData {
  type: 'cron' | 'interval' | 'event';
  expression: string;
  timezone: string;
  isEnabled: boolean;
}

export interface NotificationSettingsFormData {
  onSuccess: string[];
  onFailure: string[];
  onWarning: string[];
  email?: {
    recipients: string[];
    subject: string;
  };
  slack?: {
    webhook: string;
    channel: string;
  };
  webhook?: {
    url: string;
    method: 'POST' | 'PUT';
    headers: Array<{ key: string; value: string }>;
  };
}

// Table and List States
export interface TableState<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  sorting: {
    field: string | null;
    direction: 'asc' | 'desc' | null;
  };
  selection: {
    selectedIds: Set<string>;
    selectAll: boolean;
  };
  filters: Record<string, any>;
}

// Dashboard State
export interface DashboardState {
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isEditing: boolean;
  timeRange: TimeRange;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'log' | 'status';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: WidgetConfig;
  data?: any;
  loading: boolean;
  error?: string;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  positions: {
    [widgetId: string]: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

export interface WidgetConfig {
  dataSource: string;
  refreshInterval?: number;
  filters?: Record<string, any>;
  display?: Record<string, any>;
}

export interface TimeRange {
  start: string;
  end: string;
  preset?: 'last_hour' | 'last_day' | 'last_week' | 'last_month' | 'custom';
}

// Search and Filter State
export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  suggestions: string[];
  loading: boolean;
  hasMore: boolean;
  totalResults: number;
}

export interface SearchFilters {
  type?: string[];
  tags?: string[];
  status?: string[];
  dateRange?: TimeRange;
  [key: string]: any;
}

export interface SearchResult {
  id: string;
  type: 'pipeline' | 'execution' | 'step' | 'log' | 'artifact';
  title: string;
  description: string;
  highlights: string[];
  score: number;
  metadata: Record<string, any>;
}