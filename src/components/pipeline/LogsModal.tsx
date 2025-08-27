import { useState } from "react";
import { Search, X, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogsModalProps {
  stepName: string;
  logs: string[];
  trigger?: React.ReactNode;
}

export function LogsModal({ stepName, logs, trigger }: LogsModalProps) {
  const [logSearch, setLogSearch] = useState("");
  const [logLevel, setLogLevel] = useState("all");

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.toLowerCase().includes(logSearch.toLowerCase());
    if (logLevel === "all") return matchesSearch;
    return matchesSearch && log.toLowerCase().includes(logLevel);
  });

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
      <Maximize2 className="h-3 w-3" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Logs - {stepName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filter Controls */}
        <div className="flex space-x-4 pb-4">
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
        <ScrollArea className="flex-1 bg-muted/30 rounded-lg p-4">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
            {filteredLogs.length > 0 ? filteredLogs.join('\n') : 'No logs match your search criteria'}
          </pre>
        </ScrollArea>

        {/* Footer Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>
      </DialogContent>
    </Dialog>
  );
}