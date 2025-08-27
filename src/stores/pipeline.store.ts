import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { pipelineService, type PipelineConfiguration, type PipelineStepUpdate } from '@/services/pipeline.service';
import type { PipelineStepData } from '@/components/pipeline/DetailPane';
import type { StepStatus } from '@/components/pipeline/VerticalStepper';

/**
 * Pipeline Store - Global State Management
 * Uses Zustand with middleware for enterprise features
 */

export interface PipelineState {
  // Configuration State
  configurations: PipelineConfiguration[];
  currentConfiguration: PipelineConfiguration | null;
  isLoadingConfigurations: boolean;
  configurationError: string | null;

  // Execution State  
  executionId: string | null;
  pipelineStatus: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  steps: StepStatus[];
  stepData: PipelineStepData[];
  currentStepIndex: number;
  
  // UI State
  expandedSteps: Set<string>;
  isLeftPanelCollapsed: boolean;
  selectedStepId: string | null;
  
  // Real-time Updates
  isConnected: boolean;
  lastUpdate: Date | null;
  
  // Performance & Caching
  optimisticUpdates: Map<string, Partial<PipelineStepData>>;
  
  // Payload sync tracking
  payloadUpdateSource: 'settings' | 'individual' | null;
}

export interface PipelineActions {
  // Configuration Actions
  loadConfigurations: () => Promise<void>;
  loadConfiguration: (id: string) => Promise<void>;
  saveConfiguration: (config: Omit<PipelineConfiguration, 'id' | 'version' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCurrentConfiguration: (updates: Partial<PipelineConfiguration>) => void;
  
  // Execution Actions
  startPipeline: () => Promise<void>;
  pausePipeline: () => Promise<void>;
  resumePipeline: () => Promise<void>;
  stopPipeline: () => Promise<void>;
  runStep: (stepId: string) => Promise<void>;
  runFromStep: (stepId: string) => Promise<void>;
  
  // Step Management
  updateStepData: (stepId: string, updates: Partial<PipelineStepData>) => void;
  updateStepPayload: (stepId: string, payload: any, source?: 'settings' | 'individual') => Promise<void>;
  updateAllStepPayloads: (stepUpdates: Array<{id: string, payload: any}>) => void;
  setCurrentStepIndex: (index: number) => void;
  
  // UI Actions
  toggleStepExpansion: (stepId: string) => void;
  setLeftPanelCollapsed: (collapsed: boolean) => void;
  selectStep: (stepId: string | null) => void;
  
  // Real-time Actions
  handleStepUpdate: (update: PipelineStepUpdate) => void;
  connectToUpdates: () => Promise<void>;
  disconnectFromUpdates: () => void;
  
  // Optimistic Updates
  applyOptimisticUpdate: (stepId: string, updates: Partial<PipelineStepData>) => void;
  revertOptimisticUpdate: (stepId: string) => void;
  commitOptimisticUpdate: (stepId: string) => void;
  
  // Utilities
  reset: () => void;
  hydrate: (state: Partial<PipelineState>) => void;
}

type PipelineStore = PipelineState & PipelineActions;

// Initial state
const initialState: PipelineState = {
  configurations: [],
  currentConfiguration: null,
  isLoadingConfigurations: false,
  configurationError: null,
  executionId: null,
  pipelineStatus: 'idle',
  steps: [],
  stepData: [],
  currentStepIndex: -1,
  expandedSteps: new Set(),
  isLeftPanelCollapsed: false,
  selectedStepId: null,
  isConnected: false,
  lastUpdate: null,
  optimisticUpdates: new Map(),
  payloadUpdateSource: null,
};

export const usePipelineStore = create<PipelineStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,

          // Configuration Actions
          loadConfigurations: async () => {
            set((state) => {
              state.isLoadingConfigurations = true;
              state.configurationError = null;
            });

            try {
              const configurations = await pipelineService.getConfigurations();
              set((state) => {
                state.configurations = configurations;
                state.isLoadingConfigurations = false;
              });
            } catch (error) {
              set((state) => {
                state.configurationError = error instanceof Error ? error.message : 'Failed to load configurations';
                state.isLoadingConfigurations = false;
              });
            }
          },

          loadConfiguration: async (id: string) => {
            try {
              const configuration = await pipelineService.getConfiguration(id);
              set((state) => {
                state.currentConfiguration = configuration;
                state.steps = configuration.steps.map(step => ({
                  id: step.id,
                  name: step.name,
                  status: step.status,
                  progress: step.progress,
                  warnings: step.warnings,
                  errors: step.errors
                }));
                state.stepData = configuration.steps;
              });
            } catch (error) {
              set((state) => {
                state.configurationError = error instanceof Error ? error.message : 'Failed to load configuration';
              });
            }
          },

          saveConfiguration: async (config) => {
            try {
              const savedConfig = await pipelineService.saveConfiguration(config);
              set((state) => {
                state.configurations.push(savedConfig);
                state.currentConfiguration = savedConfig;
              });
            } catch (error) {
              set((state) => {
                state.configurationError = error instanceof Error ? error.message : 'Failed to save configuration';
              });
            }
          },

          updateCurrentConfiguration: (updates) => {
            set((state) => {
              if (state.currentConfiguration) {
                Object.assign(state.currentConfiguration, updates);
              }
            });
          },

          // Execution Actions
          startPipeline: async () => {
            const { currentConfiguration } = get();
            if (!currentConfiguration) return;

            try {
              const response = await pipelineService.startPipeline({
                configurationId: currentConfiguration.id,
              });
              
              set((state) => {
                state.executionId = response.executionId;
                state.pipelineStatus = 'running';
                state.currentStepIndex = 0;
              });

              // Connect to real-time updates
              get().connectToUpdates();
            } catch (error) {
              console.error('Failed to start pipeline:', error);
            }
          },

          pausePipeline: async () => {
            const { executionId } = get();
            if (!executionId) return;

            try {
              await pipelineService.pausePipeline(executionId);
              set((state) => {
                state.pipelineStatus = 'paused';
              });
            } catch (error) {
              console.error('Failed to pause pipeline:', error);
            }
          },

          resumePipeline: async () => {
            const { executionId } = get();
            if (!executionId) return;

            try {
              await pipelineService.resumePipeline(executionId);
              set((state) => {
                state.pipelineStatus = 'running';
              });
            } catch (error) {
              console.error('Failed to resume pipeline:', error);
            }
          },

          stopPipeline: async () => {
            const { executionId } = get();
            if (!executionId) return;

            try {
              await pipelineService.stopPipeline(executionId);
              set((state) => {
                state.pipelineStatus = 'idle';
                state.executionId = null;
                state.currentStepIndex = -1;
              });
              
              get().disconnectFromUpdates();
            } catch (error) {
              console.error('Failed to stop pipeline:', error);
            }
          },

          runStep: async (stepId: string) => {
            const { executionId } = get();
            if (!executionId) return;

            try {
              await pipelineService.runStep(executionId, stepId);
            } catch (error) {
              console.error('Failed to run step:', error);
            }
          },

          runFromStep: async (stepId: string) => {
            const { executionId } = get();
            if (!executionId) return;

            try {
              await pipelineService.runFromStep(executionId, stepId);
            } catch (error) {
              console.error('Failed to run from step:', error);
            }
          },

          // Step Management
          updateStepData: (stepId: string, updates: Partial<PipelineStepData>) => {
            set((state) => {
              const stepIndex = state.stepData.findIndex(step => step.id === stepId);
              if (stepIndex !== -1) {
                Object.assign(state.stepData[stepIndex], updates);
                
                // Update steps array as well
                const basicStepIndex = state.steps.findIndex(step => step.id === stepId);
                if (basicStepIndex !== -1) {
                  Object.assign(state.steps[basicStepIndex], {
                    status: updates.status,
                    progress: updates.progress,
                    warnings: updates.warnings,
                    errors: updates.errors,
                  });
                }
              }
              state.lastUpdate = new Date();
            });
          },

          updateStepPayload: async (stepId: string, payload: any, source = 'individual') => {
            const { currentConfiguration } = get();
            
            try {
              // Optimistically update the UI first
              set((state) => {
                const stepIndex = state.stepData.findIndex(step => step.id === stepId);
                if (stepIndex !== -1) {
                  state.stepData[stepIndex].payload = payload;
                }
                state.payloadUpdateSource = source;
                state.lastUpdate = new Date();
              });

              // If there's a backend configuration, save it
              if (currentConfiguration) {
                await pipelineService.updateStepPayload(currentConfiguration.id, stepId, payload);
              }
            } catch (error) {
              console.error('Failed to update step payload:', error);
              // Revert on error - would need original payload for this
            }
          },

          updateAllStepPayloads: (stepUpdates: Array<{id: string, payload: any}>) => {
            set((state) => {
              stepUpdates.forEach(({ id, payload }) => {
                const stepIndex = state.stepData.findIndex(step => step.id === id);
                if (stepIndex !== -1) {
                  state.stepData[stepIndex].payload = payload;
                }
              });
              state.payloadUpdateSource = 'settings';
              state.lastUpdate = new Date();
            });
          },

          setCurrentStepIndex: (index: number) => {
            set((state) => {
              state.currentStepIndex = index;
            });
          },

          // UI Actions
          toggleStepExpansion: (stepId: string) => {
            set((state) => {
              if (state.expandedSteps.has(stepId)) {
                state.expandedSteps.delete(stepId);
              } else {
                state.expandedSteps.add(stepId);
              }
            });
          },

          setLeftPanelCollapsed: (collapsed: boolean) => {
            set((state) => {
              state.isLeftPanelCollapsed = collapsed;
            });
          },

          selectStep: (stepId: string | null) => {
            set((state) => {
              state.selectedStepId = stepId;
            });
          },

          // Real-time Actions
          handleStepUpdate: (update: PipelineStepUpdate) => {
            set((state) => {
              const stepIndex = state.stepData.findIndex(step => step.id === update.stepId);
              if (stepIndex !== -1) {
                Object.assign(state.stepData[stepIndex], {
                  status: update.status,
                  progress: update.progress,
                  warnings: update.warnings || state.stepData[stepIndex].warnings,
                  errors: update.errors || state.stepData[stepIndex].errors,
                  logs: update.logs || state.stepData[stepIndex].logs,
                });
                
                // Update basic steps array
                const basicStepIndex = state.steps.findIndex(step => step.id === update.stepId);
                if (basicStepIndex !== -1) {
                  Object.assign(state.steps[basicStepIndex], {
                    status: update.status,
                    progress: update.progress,
                    warnings: update.warnings,
                    errors: update.errors,
                  });
                }
              }
              state.lastUpdate = new Date();
            });
          },

          connectToUpdates: async () => {
            const { executionId } = get();
            if (!executionId || get().isConnected) return;

            try {
              const unsubscribe = await pipelineService.subscribeToStepUpdates(
                executionId,
                get().handleStepUpdate
              );
              
              set((state) => {
                state.isConnected = true;
              });
              
              // Store cleanup function
              (window as any)._pipelineUnsubscribe = unsubscribe;
            } catch (error) {
              console.error('Failed to connect to updates:', error);
            }
          },

          disconnectFromUpdates: () => {
            if ((window as any)._pipelineUnsubscribe) {
              (window as any)._pipelineUnsubscribe();
              delete (window as any)._pipelineUnsubscribe;
            }
            
            set((state) => {
              state.isConnected = false;
            });
          },

          // Optimistic Updates
          applyOptimisticUpdate: (stepId: string, updates: Partial<PipelineStepData>) => {
            set((state) => {
              state.optimisticUpdates.set(stepId, updates);
            });
            get().updateStepData(stepId, updates);
          },

          revertOptimisticUpdate: (stepId: string) => {
            const { optimisticUpdates } = get();
            if (optimisticUpdates.has(stepId)) {
              // Revert logic would need original state
              set((state) => {
                state.optimisticUpdates.delete(stepId);
              });
            }
          },

          commitOptimisticUpdate: (stepId: string) => {
            set((state) => {
              state.optimisticUpdates.delete(stepId);
            });
          },

          // Utilities
          reset: () => {
            get().disconnectFromUpdates();
            set((state) => {
              Object.assign(state, initialState);
              state.optimisticUpdates = new Map();
              state.expandedSteps = new Set();
            });
          },

          hydrate: (partialState: Partial<PipelineState>) => {
            set((state) => {
              Object.assign(state, partialState);
            });
          },
        }))
      ),
      {
        name: 'pipeline-store',
        partialize: (state) => ({
          // Only persist UI preferences
          isLeftPanelCollapsed: state.isLeftPanelCollapsed,
          expandedSteps: Array.from(state.expandedSteps),
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Convert array back to Set
            state.expandedSteps = new Set(state.expandedSteps as any);
            state.optimisticUpdates = new Map();
          }
        },
      }
    ),
    {
      name: 'pipeline-store',
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors for better performance
export const selectPipelineStatus = (state: PipelineStore) => state.pipelineStatus;
export const selectCurrentStep = (state: PipelineStore) => 
  state.currentStepIndex >= 0 ? state.stepData[state.currentStepIndex] : null;
export const selectStepById = (stepId: string) => (state: PipelineStore) =>
  state.stepData.find(step => step.id === stepId);