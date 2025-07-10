import { useState } from "react";
import { Play, ChevronRight, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayloadEditor } from "./PayloadEditor";
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
  payload?: any;
}

interface DetailPaneProps {
  step?: PipelineStepData;
  onRunStep: (stepId: string) => void;
  onRunFromHere: (stepId: string) => void;
  onSavePayload: (stepId: string, payload: any) => void;
}

export function DetailPane({ step, onRunStep, onRunFromHere, onSavePayload }: DetailPaneProps) {
  const [logSearch, setLogSearch] = useState("");
  const [logLevel, setLogLevel] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  if (!step) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Select a Pipeline Step</h3>
          <p>Click on a step from the left to view its details</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-pending';
      case 'in-progress': return 'text-primary';
      case 'success': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'outline',
      'in-progress': 'default',
      'success': 'default',
      'error': 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} 
             className={cn("capitalize", getStatusColor(status))}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const filteredLogs = step.logs.filter(log => {
    const matchesSearch = log.toLowerCase().includes(logSearch.toLowerCase());
    if (logLevel === "all") return matchesSearch;
    return matchesSearch && log.toLowerCase().includes(logLevel);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold">{step.name}</h2>
            {getStatusBadge(step.status)}
          </div>
          <div className="text-sm text-muted-foreground">
            {step.progress}% Complete
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={step.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {step.filesProcessed || 0}
              {step.totalFiles ? `/${step.totalFiles}` : ''} files processed
            </span>
            <div className="flex space-x-4">
              {step.elapsedTime && <span>Elapsed: {step.elapsedTime}</span>}
              {step.eta && step.status === 'in-progress' && <span>ETA: {step.eta}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Logs
          </TabsTrigger>
          <TabsTrigger value="payload" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Payload
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {/* Overview Tab */}
          <TabsContent value="overview" className="h-full p-6 space-y-6 overflow-y-auto mt-0">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Files Processed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {step.filesProcessed || 0}
                    {step.totalFiles && <span className="text-sm text-muted-foreground">/{step.totalFiles}</span>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{step.warnings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-error">{step.errors}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Logs Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {step.logs.slice(-5).map((log, index) => (
                    <div key={index} className="text-sm font-mono text-muted-foreground border-l-2 border-muted pl-3">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="h-full p-6 space-y-4 overflow-hidden mt-0">
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
            </div>

            {/* Logs Display */}
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-0 h-full">
                <pre className="text-xs font-mono p-4 h-full overflow-y-auto bg-muted/30 whitespace-pre-wrap">
                  {filteredLogs.length > 0 ? filteredLogs.join('\n') : 'No logs match your search criteria'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payload Tab */}
          <TabsContent value="payload" className="h-full p-6 overflow-y-auto mt-0">
            <PayloadEditor
              stepId={step.id}
              payload={step.payload}
              onSave={onSavePayload}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Action Buttons */}
      <div className="border-t p-4 bg-card">
        <div className="flex space-x-3">
          <Button 
            onClick={() => onRunStep(step.id)}
            disabled={step.status === 'in-progress'}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Run This Stage
          </Button>
          <Button 
            variant="outline"
            onClick={() => onRunFromHere(step.id)}
            disabled={step.status === 'in-progress'}
            className="flex-1"
          >
            Run From Here
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}