import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@monaco-editor/react";
import { usePipelineStore } from "@/stores/pipeline.store";

import { PipelineStepData } from "./DetailPane";

interface SettingsDialogProps {
  steps: PipelineStepData[];
  onSaveSettings: (updatedSteps: PipelineStepData[]) => void;
}

export function SettingsDialog({ steps, onSaveSettings }: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  // Subscribe to store updates to keep Settings dialog in sync
  const storeSteps = usePipelineStore((state) => state.stepData);
  
  // Update editor when store steps change (from individual PayloadEditor)
  useEffect(() => {
    if (isOpen && storeSteps.length > 0) {
      const stepsConfig = storeSteps.map(step => ({
        id: step.id,
        name: step.name,
        payload: step.payload || {},
        chatConfig: step.chatConfig || {
          enabled: false,
          systemPrompt: "",
          model: "gpt-3.5-turbo",
          temperature: 0.7
        },
        substeps: step.substeps ? step.substeps.map(substep => ({
          id: substep.id,
          name: substep.name,
          payload: substep.payload || {},
          chatConfig: substep.chatConfig || {
            enabled: false,
            systemPrompt: "",
            model: "gpt-3.5-turbo",
            temperature: 0.7
          }
        })) : []
      }));
      const newValue = JSON.stringify(stepsConfig, null, 2);
      if (newValue !== editorValue) {
        setEditorValue(newValue);
        setValidationError(null);
      }
    }
  }, [storeSteps, isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Initialize editor with current steps configuration
      const currentSteps = storeSteps.length > 0 ? storeSteps : steps;
      const stepsConfig = currentSteps.map(step => ({
        id: step.id,
        name: step.name,
        payload: step.payload || {},
        chatConfig: step.chatConfig || {
          enabled: false,
          systemPrompt: "",
          model: "gpt-3.5-turbo",
          temperature: 0.7
        },
        substeps: step.substeps ? step.substeps.map(substep => ({
          id: substep.id,
          name: substep.name,
          payload: substep.payload || {},
          chatConfig: substep.chatConfig || {
            enabled: false,
            systemPrompt: "",
            model: "gpt-3.5-turbo",
            temperature: 0.7
          }
        })) : []
      }));
      setEditorValue(JSON.stringify(stepsConfig, null, 2));
      setValidationError(null);
    }
  };

  const handleSaveSettings = async () => {
    setIsUpdating(true);
    try {
      const parsedConfig = JSON.parse(editorValue);
      
      // Validate the configuration structure
      if (!Array.isArray(parsedConfig)) {
        throw new Error("Configuration must be an array of steps");
      }

      for (const step of parsedConfig) {
        if (!step.id || !step.name) {
          throw new Error("Each step must have an 'id' and 'name' property");
        }
        // Validate substeps if they exist
        if (step.substeps && Array.isArray(step.substeps)) {
          for (const substep of step.substeps) {
            if (!substep.id || !substep.name) {
              throw new Error("Each substep must have an 'id' and 'name' property");
            }
          }
        }
      }

      // Update the steps with new configuration while preserving runtime data
      const updatedSteps = steps.map(existingStep => {
        const configStep = parsedConfig.find((s: any) => s.id === existingStep.id);
        if (configStep) {
          return {
            ...existingStep,
            name: configStep.name,
            payload: configStep.payload || {},
            chatConfig: configStep.chatConfig || existingStep.chatConfig,
            substeps: configStep.substeps ? configStep.substeps.map((substep: any) => ({
              id: substep.id,
              name: substep.name,
              status: 'pending' as const,
              progress: 0,
              warnings: 0,
              errors: 0,
              logs: [`Waiting for ${substep.name.toLowerCase()}...`],
              payload: substep.payload || {},
              chatConfig: substep.chatConfig || {
                enabled: false,
                systemPrompt: "",
                model: "gpt-3.5-turbo",
                temperature: 0.7
              }
            })) : []
          };
        }
        return existingStep;
      });

      // Extract payload updates for store sync
      const payloadUpdates = parsedConfig.map((step: any) => ({
        id: step.id,
        payload: step.payload || {}
      }));

      // Update store with all payload changes
      const updateAllStepPayloads = usePipelineStore.getState().updateAllStepPayloads;
      updateAllStepPayloads(payloadUpdates);

      // Call original callback for backward compatibility
      onSaveSettings(updatedSteps);
      setIsOpen(false);
      setValidationError(null);
      
      toast({
        title: "Settings Saved",
        description: "Pipeline configuration has been updated successfully.",
      });
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Invalid JSON format");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setEditorValue(value || "");
    setValidationError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Pipeline Configuration
          </DialogTitle>
          <DialogDescription>
            Configure pipeline steps and their substeps. Each step can have custom payload configurations and optional substeps.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Column - JSON Editor */}
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Configuration Editor</h3>
              {validationError && (
                <Badge variant="destructive" className="text-xs">
                  {validationError}
                </Badge>
              )}
            </div>
            
            <div className="flex-1 border rounded-md overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={editorValue}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                }}
                theme="vs-dark"
              />
            </div>
          </div>
          
          {/* Right Column - Instructions */}
          <div className="w-80 flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Instructions</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Configuration Structure:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  <li>Each step must have an "id" and "name" property</li>
                  <li>Add "payload" object for step-specific configuration</li>
                  <li>Add "chatConfig" object to enable/configure chat for each step</li>
                  <li>Add "substeps" array for nested sub-processes</li>
                  <li>Substeps follow the same structure: id, name, payload, and chatConfig</li>
                  <li>Changes will update step names and configurations in the left panel</li>
                  <li>Runtime data (progress, status, logs) will be preserved</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Example Structure:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`[
  {
    "id": "extraction",
    "name": "File Extraction",
    "payload": {
      "inputPath": "/src",
      "fileTypes": [".js", ".ts"]
    },
    "chatConfig": {
      "enabled": true,
      "systemPrompt": "You are an expert assistant for file extraction tasks.",
      "model": "gpt-4",
      "temperature": 0.3
    },
    "substeps": [
      {
        "id": "scan",
        "name": "Directory Scan",
        "payload": {
          "recursive": true
        },
        "chatConfig": {
          "enabled": false
        }
      }
    ]
  }
]`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Tips:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  <li>Use descriptive names for better clarity</li>
                  <li>Payloads can contain any configuration data</li>
                  <li>Set chatConfig.enabled: true to enable chat for a step</li>
                  <li>Customize systemPrompt for step-specific AI assistance</li>
                  <li>Substeps are optional but useful for complex processes</li>
                  <li>Validate JSON syntax before saving</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSettings}
            disabled={isUpdating || !!validationError}
          >
            {isUpdating ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}