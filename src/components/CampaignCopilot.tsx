import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Brain, User, CheckCircle, AlertTriangle, Save, History } from 'lucide-react';
import ProgressBar from '@/components/ui/progress-bar';
import { mockData, hypothesesData, proposalOptions } from '@/data/mockData';

import { useToast } from '@/hooks/use-toast';
import Dashboard from './Dashboard';
import ChatDiagnosis from './ChatDiagnosis';
import UniversalCampaignBuilder from './UniversalCampaignBuilder';
import CampaignSummary from './CampaignSummary';
import { generateRecommendedCampaign } from '@/utils/campaignRecommendation';
import BriefReview from './BriefReview';
import ExperimentPlan from './ExperimentPlan';
import Collateral from './Collateral';
import Approvals from './Approvals';
import FinalSend from './FinalSend';

export type WorkflowStage = 
  | 'dashboard' 
  | 'chat_diag' 
  | 'campaign_summary'
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
  budget: number | null;
  recommendedCampaign: any | null;
  hasAnalyzed: boolean;
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
  prefilledMessage?: string;
  showOnboardingCards: boolean;
}

const CampaignCopilot: React.FC = () => {
  const [state, setState] = useState<CopilotState>({
    stage: 'dashboard',
    selectedOption: null,
    budget: null,
    recommendedCampaign: null,
    hasAnalyzed: false,
    chatMessages: [],
    approvals: {
      brief: false,
      experiment: false,
      design: false
    },
    savedProposals: [],
    showOnboardingCards: false
  });

  const { toast } = useToast();

  const updateStage = (newStage: WorkflowStage) => {
    setState(prev => ({ ...prev, stage: newStage }));
  };

  const goBack = () => {
    const stages: WorkflowStage[] = ['dashboard', 'chat_diag', 'campaign_summary', 'proposal_choice', 'brief_review', 'experiment_plan', 'collateral', 'approvals', 'final_send'];
    const currentIndex = stages.indexOf(state.stage);
    if (currentIndex > 0) {
      updateStage(stages[currentIndex - 1]);
    }
  };

  const updateSelectedOption = (option: number) => {
    setState(prev => ({ ...prev, selectedOption: option }));
  };

  const updateBudget = (budget: number) => {
    setState(prev => ({ ...prev, budget }));
  };

  const updateRecommendedCampaign = (campaign: any) => {
    setState(prev => ({ ...prev, recommendedCampaign: campaign }));
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

  const updateAnalysisStatus = (hasAnalyzed: boolean) => {
    setState(prev => ({ ...prev, hasAnalyzed }));
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


  const renderCurrentStage = () => {
    switch (state.stage) {
      case 'dashboard':
        return <Dashboard onAskCopilot={(prefilledMessage) => {
          if (prefilledMessage) {
            setState(prev => ({ ...prev, prefilledMessage }));
          }
          updateStage('chat_diag');
        }} />;
      case 'chat_diag':
        return (
          <ChatDiagnosis 
            messages={state.chatMessages}
            hasAnalyzed={state.hasAnalyzed}
            onAddMessage={addChatMessage}
            onAnalysisComplete={() => updateAnalysisStatus(true)}
            prefilledMessage={state.prefilledMessage}
            showOnboardingCards={state.showOnboardingCards}
            onShowOnboardingCards={() => setState(prev => ({ ...prev, showOnboardingCards: true }))}
            onNext={(budget: number) => {
              updateBudget(budget);
              const campaign = generateRecommendedCampaign(budget);
              updateRecommendedCampaign(campaign);
              updateStage('campaign_summary');
            }}
          />
        );
      case 'campaign_summary':
        return (
          <CampaignSummary 
            budget={state.budget || 0}
            campaignMetrics={state.recommendedCampaign?.metrics || { totalReach: 0, expectedReactivations: 0, totalCost: 0, projectedROI: 0 }}
            selectedActions={state.recommendedCampaign?.selectedActions || []}
            onAccept={() => {
              // Set selectedOption to 0 (AI-Generated Multi-Channel Messaging) for campaign summary flow
              updateSelectedOption(0);
              updateStage('brief_review');
            }}
            onCustomize={() => updateStage('proposal_choice')}
            onOpenCopilot={() => {}}
            onBudgetChange={updateBudget}
          />
        );
      case 'proposal_choice':
        return (
          <UniversalCampaignBuilder
            selectedOption={state.selectedOption}
            onSelectOption={updateSelectedOption}
            onNext={() => updateStage('brief_review')}
            budget={state.budget || 0}
          />
        );
      case 'brief_review':
        return (
          <BriefReview 
            selectedOption={state.selectedOption}
            budget={state.budget || 0}
            onApprove={() => {
              updateApproval('brief', true);
              updateStage('experiment_plan');
            }}
            onStartOver={() => updateStage('dashboard')}
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
            budget={state.budget || 0}
          />
        );
      case 'final_send':
        return <FinalSend selectedOption={state.selectedOption} budget={state.budget || 0} />;
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
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-primary">Hooli Marketing</h1>
                <p className="text-sm text-muted-foreground">powered by Winnie 🐻</p>
              </div>
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

            </div>
            
            {/* Stage Progress */}
            {state.stage !== 'dashboard' && (
              <ProgressBar currentStage={state.stage} />
            )}
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