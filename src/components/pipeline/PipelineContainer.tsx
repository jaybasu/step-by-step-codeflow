import React, { useEffect } from 'react';
import { Pipeline } from './Pipeline';
import { usePipelineStore } from '@/stores/pipeline.store';

/**
 * Pipeline Container - Connects store to UI components
 * Handles initialization and cleanup
 */
export function PipelineContainer() {
  const {
    loadConfigurations,
    reset,
    disconnectFromUpdates,
  } = usePipelineStore();

  useEffect(() => {
    // Initialize configurations on mount
    loadConfigurations();

    // Cleanup on unmount
    return () => {
      disconnectFromUpdates();
    };
  }, [loadConfigurations, disconnectFromUpdates]);

  // Handle page refresh/browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnectFromUpdates();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [disconnectFromUpdates]);

  return <Pipeline />;
}