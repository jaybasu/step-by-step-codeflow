import { Check, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface StepStatus {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'success' | 'error';
}

interface PipelineStepperProps {
  steps: StepStatus[];
}

export function PipelineStepper({ steps }: PipelineStepperProps) {
  const getStatusIcon = (status: StepStatus['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-pending" />;
      case 'in-progress':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'success':
        return (
          <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
            <Check className="w-3 h-3 text-success-foreground" />
          </div>
        );
      case 'error':
        return (
          <div className="w-5 h-5 rounded-full bg-error flex items-center justify-center">
            <X className="w-3 h-3 text-error-foreground" />
          </div>
        );
    }
  };

  const getStatusColor = (status: StepStatus['status']) => {
    switch (status) {
      case 'pending': return 'text-pending';
      case 'in-progress': return 'text-primary';
      case 'success': return 'text-success';
      case 'error': return 'text-error';
    }
  };

  return (
    <div className="flex items-center justify-between bg-card rounded-lg p-4 shadow-sm border">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {/* Step */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center">
              {getStatusIcon(step.status)}
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs font-medium ${getStatusColor(step.status)} border-current`}
            >
              {step.name}
            </Badge>
          </div>

          {/* Arrow connector */}
          {index < steps.length - 1 && (
            <div className="flex items-center mx-4">
              <div className="w-8 h-0.5 bg-border"></div>
              <div className="w-0 h-0 border-l-[6px] border-l-border border-y-[3px] border-y-transparent ml-1"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}