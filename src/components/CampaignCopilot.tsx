import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Brain, User, CheckCircle, AlertTriangle, Save, History, RotateCcw, ArrowRight } from 'lucide-react';
import { mockData, hypothesesData, proposalOptions } from '@/data/mockData';
import finnyLogo from '@/assets/finny-logo.png';
import { useToast } from '@/hooks/use-toast';
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

interface SavedProposal {
  id: string;
  name: string;
  selectedOption: number;
  stage: WorkflowStage;
  timestamp: Date;
  state: Partial<CopilotState>;
}

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
  savedProposals: SavedProposal[];
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
    },
    savedProposals: []
  });

  const { toast } = useToast();

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

  const saveProposal = (name: string) => {
    if (state.selectedOption === null) return;
    
    const newProposal: SavedProposal = {
      id: Date.now().toString(),
      name,
      selectedOption: state.selectedOption,
      stage: state.stage,
      timestamp: new Date(),
      state: {
        selectedOption: state.selectedOption,
        chatMessages: state.chatMessages,
        approvals: state.approvals
      }
    };
    
    setState(prev => ({
      ...prev,
      savedProposals: [...prev.savedProposals, newProposal]
    }));
    
    toast({
      title: "Proposal Saved",
      description: `"${name}" has been saved for later review.`
    });
  };

  const loadProposal = (proposal: SavedProposal) => {
    setState(prev => ({
      ...prev,
      selectedOption: proposal.selectedOption,
      stage: proposal.stage,
      chatMessages: proposal.state.chatMessages || [],
      approvals: proposal.state.approvals || prev.approvals
    }));
    
    toast({
      title: "Proposal Loaded",
      description: `"${proposal.name}" has been loaded.`
    });
  };

  const startOver = () => {
    setState({
      stage: 'dashboard',
      selectedOption: null,
      chatMessages: [],
      approvals: {
        brief: false,
        experiment: false,
        design: false
      },
      savedProposals: state.savedProposals // Keep saved proposals
    });
    
    toast({
      title: "Starting Over",
      description: "Workflow has been reset to the beginning."
    });
  };

  const goToNextStage = () => {
    const stages: WorkflowStage[] = ['dashboard', 'chat_diag', 'proposal_choice', 'brief_review', 'experiment_plan', 'collateral', 'approvals', 'final_send'];
    const currentIndex = stages.indexOf(state.stage);
    if (currentIndex < stages.length - 1) {
      updateStage(stages[currentIndex + 1]);
    }
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
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Save Proposal Button */}
              {(state.stage === 'proposal_choice' || state.stage === 'brief_review') && state.selectedOption !== null && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save for Later
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Proposal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Proposal Name</label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="e.g., Holiday Winback Campaign"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                saveProposal(input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <Button 
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).closest('.space-y-4')?.querySelector('input') as HTMLInputElement;
                          if (input?.value.trim()) {
                            saveProposal(input.value.trim());
                            input.value = '';
                          }
                        }}
                        className="w-full"
                      >
                        Save Proposal
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Proposals Tracker */}
              {state.savedProposals.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <History className="w-4 h-4 mr-2" />
                      Proposals ({state.savedProposals.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Saved Proposals</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {state.savedProposals.map((proposal) => (
                        <Card key={proposal.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{proposal.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Option {proposal.selectedOption + 1} • {proposal.timestamp.toLocaleDateString()}
                              </p>
                            </div>
                            <Button size="sm" onClick={() => loadProposal(proposal)}>
                              Load
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Start Over Button */}
              <Button variant="ghost" size="sm" onClick={startOver}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>

              {/* Next Step Button */}
              {state.stage !== 'final_send' && (
                <Button size="sm" onClick={goToNextStage}>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
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