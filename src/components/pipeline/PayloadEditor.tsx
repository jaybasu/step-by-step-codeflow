import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Editor from '@monaco-editor/react';
import { usePipelineStore } from "@/stores/pipeline.store";

interface PayloadEditorProps {
  stepId: string;
  payload?: any;
  onSave: (stepId: string, payload: any) => void;
  className?: string;
}

export function PayloadEditor({ stepId, payload, onSave, className }: PayloadEditorProps) {
  const [editValue, setEditValue] = useState(JSON.stringify(payload || {}, null, 2));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Subscribe to store updates for this specific step
  const storePayload = usePipelineStore((state) => 
    state.stepData.find(step => step.id === stepId)?.payload
  );

  // Update editor when store payload changes (from Settings dialog)
  useEffect(() => {
    if (storePayload && JSON.stringify(storePayload) !== JSON.stringify(payload)) {
      setEditValue(JSON.stringify(storePayload, null, 2));
      setValidationError(null);
    }
  }, [storePayload, payload]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const parsedPayload = JSON.parse(editValue);
      setValidationError(null);
      
      // Use store method for proper sync
      const updateStepPayload = usePipelineStore.getState().updateStepPayload;
      await updateStepPayload(stepId, parsedPayload, 'individual');
      
      // Also call the original callback for backward compatibility
      onSave(stepId, parsedPayload);
      
      // Simulate update delay for better UX
      setTimeout(() => {
        setIsUpdating(false);
      }, 500);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Invalid JSON');
      setIsUpdating(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setEditValue(value || '');
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div className={`pipeline-tab-content ${className}`}>
      <Card className="h-full p-4 flex flex-col">
        <div className="flex flex-col h-full space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Payload Configuration</h4>
            <Button 
              size="sm" 
              onClick={handleUpdate} 
              disabled={!!validationError || isUpdating}
              className="status-badge-in-progress"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
          </div>

          {validationError && (
            <Badge className="w-full justify-start status-badge-error">
              Invalid JSON: {validationError}
            </Badge>
          )}

          <div className="flex-1 border rounded-lg overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={editValue}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                theme: 'vs-light',
                formatOnPaste: true,
                formatOnType: true,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            Edit the JSON payload above and click Update to apply changes to this pipeline step.
          </p>
        </div>
      </Card>
    </div>
  );
}