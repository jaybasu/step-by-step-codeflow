import { useState, useEffect } from "react";
import { Play, Pause, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerticalStepper, StepStatus } from "./VerticalStepper";
import { DetailPane, PipelineStepData } from "./DetailPane";
import { SettingsDialog } from "./SettingsDialog";
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
    payload: { inputPath: "/src", fileTypes: [".js", ".ts", ".tsx"] },
    substeps: [
      {
        id: "extraction-scan",
        name: "File Scanning",
        status: "pending",
        progress: 0,
        warnings: 0,
        errors: 0,
        logs: ["Scanning for files..."],
        payload: { recursive: true, excludePatterns: ["node_modules", ".git"] }
      }
    ]
  },
  {
    id: "detection",
    name: "Detection", 
    status: "pending",
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Waiting for extraction to complete..."],
    payload: { patterns: ["async/await", "promise"], frameworks: ["react", "vue"] },
    substeps: [
      {
        id: "pattern-analysis",
        name: "Pattern Analysis",
        status: "pending",
        progress: 0,
        warnings: 0,
        errors: 0,
        logs: ["Analyzing code patterns..."],
        payload: { deepScan: true, confidence: 0.8 }
      }
    ]
  },
  {
    id: "analysis",
    name: "Analysis",
    status: "pending", 
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Analysis pending..."],
    payload: { depth: "deep", includeComments: true },
    substeps: []
  },
  {
    id: "chunking",
    name: "Chunking",
    status: "pending",
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Chunking pending..."],
    payload: { chunkSize: 1000, overlap: 200 },
    substeps: []
  },
  {
    id: "generation",
    name: "Generation",
    status: "pending",
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Generation pending..."],
    payload: { targetLanguage: "typescript", preserveComments: true },
    substeps: []
  },
  {
    id: "validation",
    name: "Validation",
    status: "pending",
    progress: 0,
    warnings: 0,
    errors: 0,
    logs: ["Validation pending..."],
    payload: { strictMode: true, linting: true },
    substeps: []
  },
];

export function Pipeline() {
  console.log("Pipeline component initializing...");
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [steps, setSteps] = useState<StepStatus[]>(PIPELINE_STEPS);
  const [stepData, setStepData] = useState<PipelineStepData[]>(INITIAL_STEP_DATA);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
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

  // Auto-expand active step
  useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < stepData.length) {
      const activeStepId = stepData[currentStepIndex].id;
      setExpandedSteps(prev => new Set([...prev, activeStepId]));
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
    // Toggle expansion when clicking on stepper
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
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

  const handleSaveSettings = (updatedSteps: PipelineStepData[]) => {
    // Update step data with new configuration
    setStepData(updatedSteps);
    
    // Update the steps array used by the vertical stepper
    const updatedBasicSteps = updatedSteps.map(step => ({
      id: step.id,
      name: step.name,
      status: step.status,
      progress: step.progress,
      warnings: step.warnings,
      errors: step.errors
    }));
    setSteps(updatedBasicSteps);
    
    toast({
      title: "Settings Updated",
      description: "Pipeline configuration and step names have been updated in the left panel.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b pipeline-header-corporate">
        <div className="w-full p-6">
          <div className="text-center space-y-3 mb-6">
            <h1 className="text-4xl font-bold text-primary-foreground">Code Conversion Pipeline</h1>
            <p className="text-primary-foreground/90 text-lg">Monitor and control the automated code conversion process</p>
          </div>

          {/* Top Toolbar */}
          <div className="pipeline-card-modern p-6">
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleStartAll}
                  disabled={pipelineStatus === 'running'}
                  className="bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                  aria-label="Start all pipeline steps"
                >
                  <Play className="w-5 h-5 mr-2" aria-hidden="true" />
                  Start Pipeline
                </Button>
              <Button 
                variant="outline"
                onClick={handlePause}
                disabled={pipelineStatus !== 'running'}
                className="bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70 text-white border-0 px-4 py-2 rounded-lg shadow-md"
                aria-label="Pause pipeline execution"
              >
                <Pause className="w-4 h-4 mr-2" aria-hidden="true" />
                Pause
              </Button>
              <Button 
                variant="outline"
                onClick={handleStop}
                disabled={pipelineStatus === 'idle'}
                className="bg-gradient-to-r from-error to-error/80 hover:from-error/90 hover:to-error/70 text-white border-0 px-4 py-2 rounded-lg shadow-md"
                aria-label="Stop and reset pipeline"
              >
                <Square className="w-4 h-4 mr-2" aria-hidden="true" />
                Stop
              </Button>
              <SettingsDialog 
                steps={stepData}
                onSaveSettings={handleSaveSettings}
              />
            </div>
            
            <div className="metric-card bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-3 rounded-lg border border-primary/20">
              <span className="text-foreground/90 text-sm font-medium">
                Status: <span className="text-primary font-bold capitalize">{pipelineStatus}</span>
              </span>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="w-full flex flex-col lg:flex-row h-[calc(100vh-200px)]" role="main">
        {/* Left Column - Vertical Stepper */}
        <aside 
          className={`pipeline-card-modern border-r lg:border-b-0 border-b transition-all duration-300 
            ${isLeftPanelCollapsed 
              ? 'lg:w-16 w-full h-16 lg:h-auto' 
              : 'lg:w-80 w-full h-auto lg:h-auto max-h-48 lg:max-h-none'
            } overflow-y-auto lg:overflow-y-visible`}
          aria-label="Pipeline steps navigation"
        >
          <div className="p-6">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-4">
              {!isLeftPanelCollapsed && (
                <h2 className="font-semibold text-foreground">Pipeline Steps</h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                className="h-8 w-8 p-0"
                aria-label={isLeftPanelCollapsed ? "Expand pipeline steps panel" : "Collapse pipeline steps panel"}
                aria-expanded={!isLeftPanelCollapsed}
              >
                {isLeftPanelCollapsed ? (
                  <ChevronRight className="h-4 w-4 lg:block hidden" aria-hidden="true" />
                ) : (
                  <ChevronLeft className="h-4 w-4 lg:block hidden" aria-hidden="true" />
                )}
                {/* Mobile icons */}
                {isLeftPanelCollapsed ? (
                  <ChevronRight className="h-4 w-4 lg:hidden block rotate-90" aria-hidden="true" />
                ) : (
                  <ChevronLeft className="h-4 w-4 lg:hidden block rotate-90" aria-hidden="true" />
                )}
              </Button>
            </div>
            
            <VerticalStepper 
              steps={steps} 
              activeStepId={currentStepIndex >= 0 ? stepData[currentStepIndex]?.id : undefined}
              onStepClick={handleStepClick}
              isCollapsed={isLeftPanelCollapsed}
            />
          </div>
        </aside>

        {/* Right Column - Detail Pane */}
        <main className="flex-1 bg-background" role="region" aria-label="Pipeline step details">
          <DetailPane 
            steps={stepData}
            currentStepIndex={currentStepIndex}
            expandedSteps={expandedSteps}
            onToggleStepExpansion={toggleStepExpansion}
            onRunStep={handleRunStep}
            onRunFromHere={handleRunFromHere}
            onSavePayload={handleSavePayload}
          />
        </main>
      </div>
    </div>
  );
}