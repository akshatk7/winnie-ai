import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Brain, User, CheckCircle, AlertTriangle } from 'lucide-react';
import { mockData, hypothesesData, proposalOptions } from '@/data/mockData';
import finnyLogo from '@/assets/finny-logo.png';
import Dashboard from './Dashboard';
import ChatDiagnosis from './ChatDiagnosis';
import ProposalChoice from './ProposalChoice';
import BriefReview from './BriefReview';
import ExperimentPlan from './ExperimentPlan';
import Collateral from './Collateral';
import Approvals from './Approvals';
import FinalSend from './FinalSend';

export type WorkflowStage = 
  | 'dashboard' 
  | 'chat_diag' 
  | 'proposal_choice' 
  | 'brief_review' 
  | 'experiment_plan' 
  | 'collateral' 
  | 'approvals' 
  | 'final_send';

interface CopilotState {
  stage: WorkflowStage;
  selectedOption: number | null;
  chatMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  approvals: {
    brief: boolean;
    experiment: boolean;
    design: boolean;
  };
}

const CampaignCopilot: React.FC = () => {
  const [state, setState] = useState<CopilotState>({
    stage: 'dashboard',
    selectedOption: null,
    chatMessages: [],
    approvals: {
      brief: false,
      experiment: false,
      design: false
    }
  });

  const updateStage = (newStage: WorkflowStage) => {
    setState(prev => ({ ...prev, stage: newStage }));
  };

  const goBack = () => {
    const stages: WorkflowStage[] = ['dashboard', 'chat_diag', 'proposal_choice', 'brief_review', 'experiment_plan', 'collateral', 'approvals', 'final_send'];
    const currentIndex = stages.indexOf(state.stage);
    if (currentIndex > 0) {
      updateStage(stages[currentIndex - 1]);
    }
  };

  const updateSelectedOption = (option: number) => {
    setState(prev => ({ ...prev, selectedOption: option }));
  };

  const addChatMessage = (role: 'user' | 'assistant', content: string) => {
    setState(prev => ({
      ...prev,
      chatMessages: [
        ...prev.chatMessages,
        { role, content, timestamp: new Date() }
      ]
    }));
  };

  const updateApproval = (type: keyof CopilotState['approvals'], value: boolean) => {
    setState(prev => ({
      ...prev,
      approvals: { ...prev.approvals, [type]: value }
    }));
  };

  const renderCurrentStage = () => {
    switch (state.stage) {
      case 'dashboard':
        return <Dashboard onAskCopilot={() => updateStage('chat_diag')} />;
      case 'chat_diag':
        return (
          <ChatDiagnosis 
            messages={state.chatMessages}
            onAddMessage={addChatMessage}
            onNext={() => updateStage('proposal_choice')}
          />
        );
      case 'proposal_choice':
        return (
          <ProposalChoice 
            selectedOption={state.selectedOption}
            onSelectOption={updateSelectedOption}
            onNext={() => updateStage('brief_review')}
          />
        );
      case 'brief_review':
        return (
          <BriefReview 
            selectedOption={state.selectedOption}
            onApprove={() => {
              updateApproval('brief', true);
              updateStage('experiment_plan');
            }}
          />
        );
      case 'experiment_plan':
        return (
          <ExperimentPlan 
            selectedOption={state.selectedOption}
            onApprove={() => {
              updateApproval('experiment', true);
              updateStage('collateral');
            }}
          />
        );
      case 'collateral':
        return (
          <Collateral 
            selectedOption={state.selectedOption}
            onNext={() => updateStage('approvals')}
          />
        );
      case 'approvals':
        return (
          <Approvals 
            approvals={state.approvals}
            onApprove={(type) => updateApproval(type, true)}
            onLaunch={() => updateStage('final_send')}
          />
        );
      case 'final_send':
        return <FinalSend selectedOption={state.selectedOption} />;
      default:
        return <Dashboard onAskCopilot={() => updateStage('chat_diag')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {state.stage !== 'dashboard' && (
                <Button variant="ghost" onClick={goBack} className="mr-2">
                  ← Back
                </Button>
              )}
              <img src={finnyLogo} alt="Finny" className="h-8 w-auto" />
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">AI Campaign Copilot</h1>
            </div>
            
            {/* Stage Progress */}
            <div className="flex items-center space-x-2">
              {['dashboard', 'chat_diag', 'proposal_choice', 'brief_review', 'experiment_plan', 'collateral', 'approvals', 'final_send'].map((stage, index) => (
                <div 
                  key={stage}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    ['dashboard', 'chat_diag', 'proposal_choice', 'brief_review', 'experiment_plan', 'collateral', 'approvals', 'final_send'].indexOf(state.stage) >= index
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {renderCurrentStage()}
      </main>
    </div>
  );
};

export default CampaignCopilot;