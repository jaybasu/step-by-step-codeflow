import { useState, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerticalStepper, StepStatus } from "./VerticalStepper";
import { DetailPane, PipelineStepData } from "./DetailPane";
import { useToast } from "@/hooks/use-toast";

const PIPELINE_STEPS: StepStatus[] = [
  { id: "extraction", name: "Extraction", status: "pending" },
  { id: "detection", name: "Detection", status: "pending" },
  { id: "analysis", name: "Analysis", status: "pending" },
  { id: "chunking", name: "Chunking", status: "pending" },
  { id: "generation", name: "Generation", status: "pending" },
  { id: "validation", name: "Validation", status: "pending" },
];

const INITIAL_STEP_DATA: PipelineStepData[] = [
  {
    id: "extraction",
    name: "Extraction",
    status: "pending",
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Waiting to start extraction process..."],
    totalFiles: 125,
    payload: { inputPath: "/src", fileTypes: [".js", ".ts", ".tsx"] }
  },
  {
    id: "detection",
    name: "Detection", 
    status: "pending",
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Waiting for extraction to complete..."],
    payload: { patterns: ["async/await", "promise"], frameworks: ["react", "vue"] }
  },
  {
    id: "analysis",
    name: "Analysis",
    status: "pending", 
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Analysis pending..."],
    payload: { depth: "deep", includeComments: true }
  },
  {
    id: "chunking",
    name: "Chunking",
    status: "pending",
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Chunking pending..."],
    payload: { chunkSize: 1000, overlap: 200 }
  },
  {
    id: "generation",
    name: "Generation",
    status: "pending",
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Generation pending..."],
    payload: { targetLanguage: "typescript", preserveComments: true }
  },
  {
    id: "validation",
    name: "Validation",
    status: "pending",
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Validation pending..."],
    payload: { strictMode: true, linting: true }
  },
];

export function Pipeline() {
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [steps, setSteps] = useState<StepStatus[]>(PIPELINE_STEPS);
  const [stepData, setStepData] = useState<PipelineStepData[]>(INITIAL_STEP_DATA);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [selectedStepId, setSelectedStepId] = useState<string>(PIPELINE_STEPS[0].id);
  const { toast } = useToast();

  // Simulate pipeline execution
  useEffect(() => {
    if (pipelineStatus === 'running' && currentStepIndex >= 0 && currentStepIndex < steps.length) {
      const currentStep = stepData[currentStepIndex];
      
      if (currentStep.status === 'pending' || currentStep.status === 'in-progress') {
        const interval = setInterval(() => {
          setStepData(prev => prev.map((step, index) => {
            if (index === currentStepIndex) {
              const newProgress = Math.min(step.progress + Math.random() * 15, 100);
              const isComplete = newProgress >= 100;
              
              return {
                ...step,
                status: isComplete ? 'success' : 'in-progress',
                progress: newProgress,
                filesProcessed: Math.floor((newProgress / 100) * (step.totalFiles || 50)),
                elapsedTime: `${Math.floor(Math.random() * 60)}s`,
                eta: !isComplete ? `${Math.floor(Math.random() * 30)}s` : undefined,
                warnings: isComplete ? Math.floor(Math.random() * 3) : step.warnings,
                errors: isComplete && Math.random() > 0.8 ? Math.floor(Math.random() * 2) : step.errors,
                logs: [
                  ...step.logs,
                  `Processing... ${newProgress.toFixed(1)}% complete`,
                  ...(isComplete ? ["✓ Step completed successfully"] : [])
                ].slice(-10), // Keep last 10 log entries
                isActive: !isComplete
              };
            }
            return step;
          }));

          setSteps(prev => prev.map((step, index) => ({
            ...step,
            status: index === currentStepIndex 
              ? (stepData[currentStepIndex].progress >= 100 ? 'success' : 'in-progress')
              : step.status
          })));

          if (stepData[currentStepIndex].progress >= 100) {
            setCurrentStepIndex(prev => prev + 1);
          }
        }, 1000);

        return () => clearInterval(interval);
      }
    }

    if (currentStepIndex >= steps.length) {
      setPipelineStatus('idle');
      setCurrentStepIndex(-1);
      toast({
        title: "Pipeline Complete",
        description: "All pipeline steps have been executed successfully.",
      });
    }
  }, [pipelineStatus, currentStepIndex, stepData, steps.length, toast]);

  // Auto-select active step
  useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < stepData.length) {
      const activeStepId = stepData[currentStepIndex].id;
      setSelectedStepId(activeStepId);
    }
  }, [currentStepIndex, stepData]);

  const handleStartAll = () => {
    setPipelineStatus('running');
    setCurrentStepIndex(0);
    // Reset all steps
    setSteps(PIPELINE_STEPS);
    setStepData(INITIAL_STEP_DATA.map(step => ({ ...step, progress: 0, status: 'pending' })));
    toast({
      title: "Pipeline Started",
      description: "Code conversion pipeline is now running.",
    });
  };

  const handlePause = () => {
    setPipelineStatus('paused');
    toast({
      title: "Pipeline Paused",
      description: "Pipeline execution has been paused.",
    });
  };

  const handleStop = () => {
    setPipelineStatus('idle');
    setCurrentStepIndex(-1);
    setStepData(prev => prev.map(step => ({ ...step, status: 'pending', progress: 0, isActive: false })));
    setSteps(PIPELINE_STEPS);
    toast({
      title: "Pipeline Stopped",
      description: "Pipeline execution has been stopped and reset.",
    });
  };

  const handleRunStep = (stepId: string) => {
    const stepIndex = stepData.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setPipelineStatus('running');
      setCurrentStepIndex(stepIndex);
      setStepData(prev => prev.map((step, index) => 
        index === stepIndex ? { ...step, status: 'pending', progress: 0 } : step
      ));
    }
  };

  const handleRunFromHere = (stepId: string) => {
    const stepIndex = stepData.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setPipelineStatus('running');
      setCurrentStepIndex(stepIndex);
      // Reset this step and all subsequent steps
      setStepData(prev => prev.map((step, index) => 
        index >= stepIndex ? { ...step, status: 'pending', progress: 0 } : step
      ));
      setSteps(prev => prev.map((step, index) => 
        index >= stepIndex ? { ...step, status: 'pending' } : step
      ));
    }
  };

  const handleStepClick = (stepId: string) => {
    setSelectedStepId(stepId);
  };

  const handleSavePayload = (stepId: string, payload: any) => {
    setStepData(prev => prev.map(step => 
      step.id === stepId ? { ...step, payload } : step
    ));
    toast({
      title: "Payload Updated",
      description: `Configuration for ${stepId} has been saved.`,
    });
  };

  const selectedStep = stepData.find(step => step.id === selectedStepId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-3xl font-bold text-foreground">Code Conversion Pipeline</h1>
            <p className="text-muted-foreground">Monitor and control the automated code conversion process</p>
          </div>

          {/* Top Toolbar */}
          <div className="flex items-center justify-between">
            {/* Control Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleStartAll}
                disabled={pipelineStatus === 'running'}
              >
                <Play className="w-4 h-4 mr-2" />
                Start All
              </Button>
              <Button 
                variant="outline"
                onClick={handlePause}
                disabled={pipelineStatus !== 'running'}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button 
                variant="outline"
                onClick={handleStop}
                disabled={pipelineStatus === 'idle'}
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Status: <span className="font-medium capitalize">{pipelineStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto flex h-[calc(100vh-200px)]">
        {/* Left Column - Vertical Stepper */}
        <div className="w-80 border-r bg-card p-6">
          <h3 className="font-semibold mb-4 text-foreground">Pipeline Steps</h3>
          <VerticalStepper 
            steps={steps} 
            activeStepId={selectedStepId}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Right Column - Detail Pane */}
        <div className="flex-1 bg-background">
          <DetailPane 
            step={selectedStep}
            onRunStep={handleRunStep}
            onRunFromHere={handleRunFromHere}
            onSavePayload={handleSavePayload}
          />
        </div>
      </div>
    </div>
  );
}