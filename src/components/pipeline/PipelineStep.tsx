import { useState } from "react";
import { ChevronDown, ChevronRight, Play, AlertTriangle, XCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  isActive?: boolean;
}

interface PipelineStepProps {
  step: PipelineStepData;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRunStep: () => void;
  onRunFromHere: () => void;
}

export function PipelineStep({ 
  step, 
  isExpanded, 
  onToggleExpand, 
  onRunStep, 
  onRunFromHere 
}: PipelineStepProps) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-pending" />;
      case 'in-progress':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-error" />;
    }
  };

  const getProgressColor = () => {
    switch (step.status) {
      case 'pending': return 'bg-pending';
      case 'in-progress': return 'bg-primary';
      case 'success': return 'bg-success';
      case 'error': return 'bg-error';
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      step.isActive && "ring-2 ring-active-step bg-active-step-bg",
      step.status === 'error' && "border-error/20",
      step.status === 'success' && "border-success/20"
    )}>
      {/* Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Expand/Collapse Icon */}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            
            {/* Status Icon */}
            {getStatusIcon()}
            
            {/* Step Name */}
            <h3 className="font-semibold text-foreground">{step.name}</h3>
            
            {/* Mini Progress Bar */}
            <div className="flex items-center space-x-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-300", getProgressColor())}
                  style={{ width: `${step.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{step.progress}%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Error/Warning Badges */}
            {step.errors > 0 && (
              <Badge variant="destructive" className="text-xs">
                errors: {step.errors}
              </Badge>
            )}
            {step.warnings > 0 && (
              <Badge variant="outline" className="text-xs text-warning border-warning">
                warnings: {step.warnings}
              </Badge>
            )}
            
            {/* Run This Step Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRunStep();
              }}
              className="h-7 px-2"
            >
              <Play className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Body - Expandable */}
      {(isExpanded || step.status === 'in-progress') && (
        <div className="border-t bg-card">
          <div className="p-4 space-y-4">
            {/* Full Progress Bar with Timing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {step.elapsedTime && (
                    <span>Elapsed: {step.elapsedTime}</span>
                  )}
                  {step.eta && step.status === 'in-progress' && (
                    <span>ETA: {step.eta}</span>
                  )}
                </div>
              </div>
              <Progress value={step.progress} className="h-2" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-semibold text-foreground">
                  {step.filesProcessed || 0}{step.totalFiles ? `/${step.totalFiles}` : ''}
                </div>
                <div className="text-xs text-muted-foreground">Files</div>
              </div>
              <div className="text-center p-2 bg-warning-light rounded">
                <div className="font-semibold text-warning">{step.warnings}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center p-2 bg-error-light rounded">
                <div className="font-semibold text-error">{step.errors}</div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={onRunStep}
                disabled={step.status === 'in-progress'}
              >
                <Play className="w-4 h-4 mr-2" />
                Run This Stage
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRunFromHere}
                disabled={step.status === 'in-progress'}
              >
                Run From Here →
              </Button>
            </div>

            {/* Logs Console */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Logs</h4>
              <div className="bg-muted/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                  {step.logs.length > 0 ? step.logs.join('\n') : 'No logs available'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}