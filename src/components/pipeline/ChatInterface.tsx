import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  stepId: string;
  chatConfig?: {
    enabled: boolean;
    systemPrompt?: string;
    model?: string;
    temperature?: number;
  };
}

export function ChatInterface({ stepId, chatConfig }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're asking about "${inputValue}". This is a simulated response for step ${stepId}. In a real implementation, this would connect to your AI service with the configured system prompt and model settings.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chatConfig?.enabled) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Chat is not enabled for this step</p>
          <p className="text-sm">Configure it in the Settings dialog</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pipeline-tab-content flex flex-col border rounded-lg bg-background">
      {/* Chat Header */}
      <div className="px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Step Assistant</span>
          {chatConfig.model && (
            <span className="text-xs text-muted-foreground">({chatConfig.model})</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start a conversation about this step</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-2",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.sender === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p>{message.text}</p>
                <p className={cn(
                  "text-xs mt-1 opacity-70",
                  message.sender === 'user' ? "text-primary-foreground" : "text-muted-foreground"
                )}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{animationDelay: '0.1s'}} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{animationDelay: '0.2s'}} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this step..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}