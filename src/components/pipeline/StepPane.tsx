import { useState } from "react";
import { ChevronDown, ChevronRight, Play, AlertTriangle, XCircle, CheckCircle, Clock, Loader2, Search, Edit, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PayloadEditor } from "./PayloadEditor";
import { LogsModal } from "./LogsModal";
import { ChatInterface } from "./ChatInterface";
import { cn } from "@/lib/utils";
import { PipelineStepData } from "./DetailPane";

interface StepPaneProps {
  step: PipelineStepData;
  isExpanded: boolean;
  isActive?: boolean;
  onToggleExpand: () => void;
  onRunStep: () => void;
  onRunFromHere: () => void;
  onSavePayload: (stepId: string, payload: any) => void;
}

export function StepPane({ 
  step, 
  isExpanded, 
  isActive,
  onToggleExpand, 
  onRunStep, 
  onRunFromHere,
  onSavePayload
}: StepPaneProps) {
  const [logSearch, setLogSearch] = useState("");
  const [logLevel, setLogLevel] = useState("all");

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

  const getStatusBadge = () => {
    const statusClasses = {
      'pending': 'status-badge-pending',
      'in-progress': 'status-badge-in-progress',
      'success': 'status-badge-success',
      'error': 'status-badge-error'
    } as const;
    
    return (
      <Badge className={cn("capitalize font-medium", statusClasses[step.status] || 'status-badge-pending')}>
        {step.status.replace('-', ' ')}
      </Badge>
    );
  };

  const filteredLogs = step.logs.filter(log => {
    const matchesSearch = log.toLowerCase().includes(logSearch.toLowerCase());
    if (logLevel === "all") return matchesSearch;
    return matchesSearch && log.toLowerCase().includes(logLevel);
  });

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 status-card-professional",
      isActive && "pipeline-step-active",
      step.status === 'error' && "border-error/50",
      step.status === 'success' && "border-success/50"
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
            
            {/* Step Name and Badge */}
            <h3 className="font-semibold text-foreground">{step.name}</h3>
            {getStatusBadge()}
            
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
              <Badge className="text-xs status-badge-error">
                {step.errors} errors
              </Badge>
            )}
            {step.warnings > 0 && (
              <Badge className="text-xs status-badge-warning">
                {step.warnings} warnings
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
          <div className="p-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className={`grid w-full ${step.chatConfig?.enabled ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="payload">Payload</TabsTrigger>
                {step.chatConfig?.enabled && (
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                )}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Progress Bar with Timing */}
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
                  <Progress value={step.progress} className="h-2 progress-professional" />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-secondary rounded-lg border border-border">
                    <div className="font-semibold text-foreground">
                      {step.filesProcessed || 0}{step.totalFiles ? `/${step.totalFiles}` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">Files</div>
                  </div>
                  <div className="text-center p-3 bg-warning-light rounded-lg border border-warning/20">
                    <div className="font-semibold text-warning">{step.warnings}</div>
                    <div className="text-xs text-muted-foreground">Warnings</div>
                  </div>
                  <div className="text-center p-3 bg-error-light rounded-lg border border-error/20">
                    <div className="font-semibold text-error">{step.errors}</div>
                    <div className="text-xs text-muted-foreground">Errors</div>
                  </div>
                </div>
              </TabsContent>

              {/* Logs Tab */}
              <TabsContent value="logs" className="space-y-4 mt-4">
                {/* Log Controls */}
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search logs..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={logLevel} onValueChange={setLogLevel}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                      <SelectItem value="warning">Warnings</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                  <LogsModal
                    stepName={step.name}
                    logs={step.logs}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Expand
                      </Button>
                    }
                  />
                </div>

                {/* Logs Console */}
                <div className="bg-muted/30 rounded-lg p-3 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                    {filteredLogs.length > 0 ? filteredLogs.join('\n') : 'No logs match your search criteria'}
                  </pre>
                </div>
              </TabsContent>

              {/* Payload Tab */}
              <TabsContent value="payload" className="mt-4">
                <PayloadEditor
                  stepId={step.id}
                  payload={step.payload}
                  onSave={onSavePayload}
                />
              </TabsContent>

              {/* Chat Tab - Only render if enabled */}
              {step.chatConfig?.enabled && (
                <TabsContent value="chat" className="mt-4">
                  <ChatInterface
                    stepId={step.id}
                    chatConfig={step.chatConfig}
                  />
                </TabsContent>
              )}
            </Tabs>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4 pt-4 border-t">
              <Button 
                onClick={onRunStep}
                disabled={step.status === 'in-progress'}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Run This Stage
              </Button>
              <Button 
                variant="outline"
                onClick={onRunFromHere}
                disabled={step.status === 'in-progress'}
                className="flex-1"
              >
                Run From Here →
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}