import { useState } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Editor from '@monaco-editor/react';

interface PayloadEditorProps {
  stepId: string;
  payload?: any;
  onSave: (stepId: string, payload: any) => void;
  className?: string;
}

export function PayloadEditor({ stepId, payload, onSave, className }: PayloadEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(JSON.stringify(payload || {}, null, 2));
  const [validationError, setValidationError] = useState<string | null>(null);

  const hasPayload = payload && Object.keys(payload).length > 0;
  
  const previewText = hasPayload 
    ? `{ ${Object.keys(payload).slice(0, 3).join(', ')}${Object.keys(payload).length > 3 ? '...' : ''} }`
    : "No input required";

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(JSON.stringify(payload || {}, null, 2));
    setValidationError(null);
  };

  const handleSave = () => {
    try {
      const parsedPayload = JSON.parse(editValue);
      setValidationError(null);
      onSave(stepId, parsedPayload);
      setIsEditing(false);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(JSON.stringify(payload || {}, null, 2));
    setValidationError(null);
  };

  if (isEditing) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Edit Payload</h4>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave} disabled={!!validationError}>
                <Save className="w-4 h-4 mr-1" />
                Save & Validate
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>

          {validationError && (
            <Badge variant="destructive" className="w-full justify-start">
              {validationError}
            </Badge>
          )}

          <div className="border rounded-md overflow-hidden">
            <Editor
              height="300px"
              defaultLanguage="json"
              value={editValue}
              onChange={(value) => setEditValue(value || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                theme: 'vs-dark',
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium mb-1">Input Payload</h4>
          <p className="text-sm text-muted-foreground font-mono">{previewText}</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleEdit}>
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
    </Card>
  );
}