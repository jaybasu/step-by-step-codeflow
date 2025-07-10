import { Check, X, Loader2, Clock, FileText, Search, BarChart, Grid3X3, Code, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface StepStatus {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'success' | 'error';
  progress?: number;
  warnings?: number;
  errors?: number;
}

interface VerticalStepperProps {
  steps: StepStatus[];
  activeStepId?: string;
  onStepClick: (stepId: string) => void;
  isCollapsed?: boolean;
}

export function VerticalStepper({ steps, activeStepId, onStepClick, isCollapsed = false }: VerticalStepperProps) {
  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'extraction':
        return FileText;
      case 'detection':
        return Search;
      case 'analysis':
        return BarChart;
      case 'chunking':
        return Grid3X3;
      case 'generation':
        return Code;
      case 'validation':
        return Shield;
      default:
        return Clock;
    }
  };

  const getStatusIcon = (status: StepStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-pending" />;
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

  const getStepIconWithStatus = (step: StepStatus) => {
    const StepIconComponent = getStepIcon(step.id);
    
    return (
      <div className="relative">
        <StepIconComponent className={cn("w-5 h-5", getStatusColor(step.status))} />
        {/* Status indicator badge */}
        <div className="absolute -bottom-1 -right-1">
          {step.status === 'pending' && (
            <div className="w-2 h-2 rounded-full bg-pending"></div>
          )}
          {step.status === 'in-progress' && (
            <Loader2 className="w-2 h-2 text-primary animate-spin" />
          )}
          {step.status === 'success' && (
            <div className="w-2 h-2 rounded-full bg-success"></div>
          )}
          {step.status === 'error' && (
            <div className="w-2 h-2 rounded-full bg-error"></div>
          )}
        </div>
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-10 h-10 p-0 rounded-full",
                      activeStepId === step.id && "bg-accent border border-primary/20"
                    )}
                    onClick={() => onStepClick(step.id)}
                  >
                    {getStepIconWithStatus(step)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="space-y-1">
                    <p className="font-medium">{step.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{step.status}</p>
                    {step.progress !== undefined && (
                      <p className="text-xs">{step.progress}% complete</p>
                    )}
                    {step.errors && step.errors > 0 && (
                      <p className="text-xs text-destructive">{step.errors} errors</p>
                    )}
                    {step.warnings && step.warnings > 0 && (
                      <p className="text-xs text-warning">{step.warnings} warnings</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              
              {/* Connector Line for collapsed view */}
              {index < steps.length - 1 && (
                <div className="w-0.5 h-4 bg-border my-1"></div>
              )}
            </div>
          ))}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start">
          {/* Step Content */}
          <div className="flex-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto p-3 text-left",
                activeStepId === step.id && "bg-accent border border-primary/20"
              )}
              onClick={() => onStepClick(step.id)}
            >
              <div className="flex items-center space-x-3 w-full">
                {/* Step Icon with Status */}
                {getStepIconWithStatus(step)}
                
                {/* Step Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={cn("font-medium truncate", getStatusColor(step.status))}>
                      {step.name}
                    </h4>
                    {step.progress !== undefined && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {step.progress}%
                      </span>
                    )}
                  </div>
                  
                  {/* Badges */}
                  <div className="flex items-center space-x-1 mt-1">
                    {step.errors && step.errors > 0 && (
                      <Badge variant="destructive" className="text-xs px-1 py-0">
                        {step.errors} errors
                      </Badge>
                    )}
                    {step.warnings && step.warnings > 0 && (
                      <Badge variant="outline" className="text-xs px-1 py-0 text-warning border-warning">
                        {step.warnings} warnings
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Button>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex items-center justify-center w-6 ml-2">
              <div className="w-0.5 h-12 bg-border"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}