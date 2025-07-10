import { StepPane } from "./StepPane";

export interface PipelineStepData {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'success' | 'error';
  progress: number;
  filesProcessed?: number;
  totalFiles?: number;
  warnings: number;
  errors: number;
  elapsedTime?: string;
  eta?: string;
  logs: string[];
  payload?: any;
}

interface DetailPaneProps {
  steps: PipelineStepData[];
  currentStepIndex: number;
  expandedSteps: Set<string>;
  onToggleStepExpansion: (stepId: string) => void;
  onRunStep: (stepId: string) => void;
  onRunFromHere: (stepId: string) => void;
  onSavePayload: (stepId: string, payload: any) => void;
}

export function DetailPane({ 
  steps, 
  currentStepIndex, 
  expandedSteps, 
  onToggleStepExpansion, 
  onRunStep, 
  onRunFromHere, 
  onSavePayload 
}: DetailPaneProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <h3 className="font-semibold mb-4 text-foreground">Pipeline Steps</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <StepPane
              key={step.id}
              step={step}
              isExpanded={expandedSteps.has(step.id)}
              isActive={index === currentStepIndex}
              onToggleExpand={() => onToggleStepExpansion(step.id)}
              onRunStep={() => onRunStep(step.id)}
              onRunFromHere={() => onRunFromHere(step.id)}
              onSavePayload={onSavePayload}
            />
          ))}
        </div>
      </div>
    </div>
  );
}