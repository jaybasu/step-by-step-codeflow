import { useState } from "react";
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Initialize editor with current steps configuration
      const stepsConfig = steps.map(step => ({
        id: step.id,
        name: step.name,
        payload: step.payload,
        substeps: step.substeps || []
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
      }

      // Update the steps with new configuration while preserving runtime data
      const updatedSteps = steps.map(existingStep => {
        const configStep = parsedConfig.find((s: any) => s.id === existingStep.id);
        if (configStep) {
          return {
            ...existingStep,
            name: configStep.name,
            payload: configStep.payload || {},
            substeps: configStep.substeps || []
          };
        }
        return existingStep;
      });

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
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Pipeline Configuration
          </DialogTitle>
          <DialogDescription>
            Configure pipeline steps and their substeps. Each step can have custom payload configurations and optional substeps.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Validation Error */}
          {validationError && (
            <Badge variant="destructive" className="w-fit">
              {validationError}
            </Badge>
          )}
          
          {/* JSON Editor */}
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
              }}
              theme="vs-dark"
            />
          </div>
          
          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Configuration Structure:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Each step must have an "id" and "name" property</li>
              <li>Add "payload" object for step-specific configuration</li>
              <li>Add "substeps" array for nested sub-processes</li>
              <li>Substeps follow the same structure as main steps</li>
            </ul>
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