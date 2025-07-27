import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStage: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStage, className }) => {
  const stages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'chat_diag', label: 'Analysis' },
    { id: 'campaign_summary', label: 'Campaign Setup' },
    { id: 'brief_review', label: 'Brief Review' },
    { id: 'experiment_plan', label: 'Experiment' },
    { id: 'collateral', label: 'Collateral' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'final_send', label: 'Final Send' }
  ];

  const currentIndex = stages.findIndex(stage => stage.id === currentStage);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors",
            index <= currentIndex 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {index + 1}
          </div>
          {index < stages.length - 1 && (
            <div className={cn(
              "w-8 h-0.5 mx-1 transition-colors",
              index < currentIndex ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;