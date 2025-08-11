import { useEffect } from 'react';
import { usePipelineStore } from '@/stores/pipeline.store';
import { notificationService } from '@/services/notification.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Pipeline Notifications Hook
 * Integrates store events with notification system
 */
export function usePipelineNotifications() {
  const { toast } = useToast();
  
  const pipelineStatus = usePipelineStore(state => state.pipelineStatus);
  const currentConfiguration = usePipelineStore(state => state.currentConfiguration);
  const lastUpdate = usePipelineStore(state => state.lastUpdate);
  const stepData = usePipelineStore(state => state.stepData);

  // Listen to pipeline status changes
  useEffect(() => {
    if (!currentConfiguration) return;

    switch (pipelineStatus) {
      case 'running':
        notificationService.pipelineStarted(currentConfiguration.name);
        toast({
          title: "Pipeline Started",
          description: `${currentConfiguration.name} is now running`,
        });
        break;
        
      case 'completed':
        const duration = "5m 32s"; // Calculate actual duration
        notificationService.pipelineCompleted(currentConfiguration.name, duration);
        toast({
          title: "Pipeline Completed",
          description: `${currentConfiguration.name} finished successfully`,
        });
        break;
        
      case 'error':
        notificationService.pipelineError(currentConfiguration.name, "Pipeline execution failed");
        toast({
          title: "Pipeline Failed",
          description: "Check the logs for more details",
          variant: "destructive",
        });
        break;
    }
  }, [pipelineStatus, currentConfiguration, toast]);

  // Listen to step completions
  useEffect(() => {
    const completedSteps = stepData.filter(step => step.status === 'success');
    const lastCompletedStep = completedSteps[completedSteps.length - 1];
    
    if (lastCompletedStep && lastUpdate) {
      // Only notify if this is a recent completion
      const timeSinceUpdate = Date.now() - lastUpdate.getTime();
      if (timeSinceUpdate < 5000) { // Within last 5 seconds
        notificationService.stepCompleted(lastCompletedStep.name);
      }
    }
  }, [stepData, lastUpdate]);

  // Integrate with toast system
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    });

    return unsubscribe;
  }, [toast]);
}