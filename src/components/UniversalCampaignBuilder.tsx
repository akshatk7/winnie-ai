import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Gift, 
  Mail, 
  Smartphone, 
  Eye, 
  Percent, 
  Calendar,
  Settings,
  Zap,
  Shield,
  Bell,
  Brain,
  Filter,
  Target,
  BarChart3
} from 'lucide-react';
import { 
  messagingActions, 
  promotionalActions, 
  defaultConstraints, 
  campaignPresets,
  CampaignAction,
  CampaignConstraint,
  UserActionAssignment
} from '@/data/actionLibrary';
import UserProfileModal from './UserProfileModal';
import CampaignCopilotChat from './CampaignCopilotChat';

interface UniversalCampaignBuilderProps {
  selectedOption: number | null;
  onSelectOption: (option: number) => void;
  onNext: () => void;
  budget?: number;
}

interface CampaignState {
  budget: number;
  budgetSet: boolean;
  selectedActions: string[];
  excludedActions: string[];
  constraints: CampaignConstraint[];
  assignments: UserActionAssignment[];
  totalCost: number;
  totalReach: number;
  expectedReactivations: number;
  presetApplied?: string;
}

const iconMap: Record<string, any> = {
  Mail, Smartphone, Bell, MessageSquare, Percent, Calendar, DollarSign, Shield
};

const UniversalCampaignBuilder: React.FC<UniversalCampaignBuilderProps> = ({ 
  selectedOption, 
  onSelectOption, 
  onNext,
  budget = 0
}) => {
  const [campaignState, setCampaignState] = useState<CampaignState>({
    budget: budget,
    budgetSet: budget > 0,
    selectedActions: [],
    excludedActions: [],
    constraints: [...defaultConstraints],
    assignments: [],
    totalCost: 0,
    totalReach: 12000,
    expectedReactivations: 0,
    presetApplied: undefined
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [modalSegment, setModalSegment] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedForAnalysis, setSelectedForAnalysis] = useState<string[]>([]);
  const [showCopilot, setShowCopilot] = useState(false);
  const [activeTab, setActiveTab] = useState('actions');

  // Apply smart defaults when budget is set
  useEffect(() => {
    if (campaignState.budgetSet && campaignState.selectedActions.length === 0) {
      applySmartDefaults();
    }
  }, [campaignState.budgetSet]);

  // Recalculate campaign metrics when actions change
  useEffect(() => {
    calculateCampaignMetrics();
  }, [campaignState.selectedActions, campaignState.excludedActions]);

  const applySmartDefaults = () => {
    const { budget } = campaignState;
    let preset;

    if (budget < 5000) {
      preset = campaignPresets.find(p => p.id === 'conservative_messaging');
    } else if (budget < 15000) {
      preset = campaignPresets.find(p => p.id === 'balanced_engagement');
    } else {
      preset = campaignPresets.find(p => p.id === 'aggressive_winback');
    }

    if (preset) {
      setCampaignState(prev => ({
        ...prev,
        selectedActions: preset.actions,
        presetApplied: preset.id
      }));
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = campaignPresets.find(p => p.id === presetId);
    if (preset) {
      setCampaignState(prev => ({
        ...prev,
        budget: preset.budget,
        budgetSet: true,
        selectedActions: preset.actions,
        presetApplied: presetId
      }));
    }
  };

  const calculateCampaignMetrics = () => {
    const allActions = [...messagingActions, ...promotionalActions];
    let totalCost = 0;
    let expectedReactivations = 0;
    
    campaignState.selectedActions.forEach(actionId => {
      const action = allActions.find(a => 
        a.variants.some(v => v.id === actionId)
      );
      if (action) {
        const variant = action.variants.find(v => v.id === actionId);
        if (variant) {
          totalCost += variant.cost * variant.reach;
          expectedReactivations += Math.floor(variant.reach * variant.expectedImpact / 100);
        }
      }
    });

    setCampaignState(prev => ({
      ...prev,
      totalCost,
      expectedReactivations
    }));
  };

  const toggleAction = (actionId: string) => {
    setCampaignState(prev => {
      const isSelected = prev.selectedActions.includes(actionId);
      return {
        ...prev,
        selectedActions: isSelected 
          ? prev.selectedActions.filter(id => id !== actionId)
          : [...prev.selectedActions, actionId],
        presetApplied: undefined // Clear preset when manually modifying
      };
    });
  };

  const excludeAction = (actionId: string) => {
    setCampaignState(prev => ({
      ...prev,
      excludedActions: prev.excludedActions.includes(actionId)
        ? prev.excludedActions.filter(id => id !== actionId)
        : [...prev.excludedActions, actionId],
      selectedActions: prev.selectedActions.filter(id => id !== actionId)
    }));
  };

  const getAvailableActions = () => {
    const allActions = [...messagingActions, ...promotionalActions];
    return allActions.filter(action => {
      // Filter out promotional actions if budget is too low
      if (action.type === 'promotional' && action.minBudget && campaignState.budget < action.minBudget) {
        return false;
      }
      return true;
    });
  };

  const getActionCombinationAnalysis = (actionIds: string[]) => {
    const allActions = [...messagingActions, ...promotionalActions];
    let combinedReach = 0;
    let combinedCost = 0;
    let combinedReactivations = 0;
    
    actionIds.forEach(actionId => {
      const action = allActions.find(a => 
        a.variants.some(v => v.id === actionId)
      );
      if (action) {
        const variant = action.variants.find(v => v.id === actionId);
        if (variant) {
          combinedReach = Math.max(combinedReach, variant.reach); // Max reach (overlapping users)
          combinedCost += variant.cost * variant.reach;
          combinedReactivations += Math.floor(variant.reach * variant.expectedImpact / 100);
        }
      }
    });

    return { combinedReach, combinedCost, combinedReactivations };
  };

  const renderActionCard = (action: CampaignAction) => {
    const IconComponent = iconMap[action.icon] || MessageSquare;
    
    return (
      <Card key={action.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{action.name}</CardTitle>
            </div>
            <Badge variant={action.type === 'promotional' ? 'default' : 'secondary'}>
              {action.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{action.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {action.variants.map(variant => {
            const isSelected = campaignState.selectedActions.includes(variant.id);
            const isExcluded = campaignState.excludedActions.includes(variant.id);
            const isAvailable = !action.minBudget || campaignState.budget >= action.minBudget;
            
            return (
              <div 
                key={variant.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5' : 
                  isExcluded ? 'border-destructive bg-destructive/5 opacity-50' :
                  !isAvailable ? 'border-muted bg-muted opacity-50' : 'border-border'
                }`}
                onClick={() => isAvailable && !isExcluded && toggleAction(variant.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={isSelected} 
                      disabled={isExcluded || !isAvailable}
                    />
                    <span className="font-medium text-sm">{variant.name}</span>
                    {variant.personalizedValue && (
                      <Badge variant="outline" className="text-xs">
                        {variant.personalizedValue}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      excludeAction(variant.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Filter className="h-3 w-3" />
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">{variant.description}</p>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="font-medium">{variant.reach.toLocaleString()}</p>
                    <p className="text-muted-foreground">Reach</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-success">{variant.expectedImpact}%</p>
                    <p className="text-muted-foreground">Impact</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">${(variant.cost * variant.reach).toLocaleString()}</p>
                    <p className="text-muted-foreground">Cost</p>
                  </div>
                </div>
                
                {!isAvailable && action.minBudget && (
                  <div className="mt-2 text-xs text-destructive">
                    Requires budget of ${action.minBudget.toLocaleString()}+
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  // Budget Configuration Stage
  if (!campaignState.budgetSet) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Universal Campaign Builder</CardTitle>
            <p className="text-muted-foreground">
              Configure your campaign budget and choose from our smart presets or build your own custom campaign.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Presets */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Quick Start Presets</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {campaignPresets.map(preset => (
                  <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-all" 
                        onClick={() => applyPreset(preset.id)}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{preset.name}</h4>
                          <Badge variant="outline">${preset.budget.toLocaleString()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{preset.description}</p>
                        <div className="text-xs text-primary">
                          {preset.actions.length} actions included
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Custom Budget */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Or Set Custom Budget</Label>
              <div className="space-y-2">
                <Label htmlFor="budget">Campaign Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={campaignState.budget}
                  onChange={(e) => setCampaignState(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  className="text-lg font-medium"
                  placeholder="Enter your budget"
                />
              </div>
              
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h4 className="font-medium">Budget Guidelines:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">$0 - $5K</Badge>
                    <span>Messaging-only campaigns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">$5K - $15K</Badge>
                    <span>Light promotional campaigns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">$15K+</Badge>
                    <span>Full promotional campaigns with high-value offers</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setCampaignState(prev => ({ ...prev, budgetSet: true }))}
                className="w-full"
                disabled={campaignState.budget < 0}
              >
                Continue to Campaign Builder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Universal Campaign Builder</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Budget: ${campaignState.budget.toLocaleString()} • 
                {campaignState.presetApplied && ` ${campaignPresets.find(p => p.id === campaignState.presetApplied)?.name} applied`}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setCampaignState(prev => ({ ...prev, budgetSet: false }))}
                size="sm"
              >
                Change Budget
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCopilot(true)}
                size="sm"
              >
                <Brain className="h-4 w-4 mr-1" />
                Winnie
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Campaign Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{campaignState.totalReach.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Reach</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold text-success">{campaignState.expectedReactivations.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Expected Reactivations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">${campaignState.totalCost.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Percent className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">
              {campaignState.totalCost > 0 ? Math.round((campaignState.expectedReactivations * 485 - campaignState.totalCost) / campaignState.totalCost * 100) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">Projected ROI</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actions">Action Library</TabsTrigger>
          <TabsTrigger value="constraints">Constraints & Rules</TabsTrigger>
          <TabsTrigger value="analysis">Campaign Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messaging Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Messaging Actions</h3>
              {messagingActions.map(renderActionCard)}
            </div>

            {/* Promotional Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Promotional Actions</h3>
              {promotionalActions.map(renderActionCard)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="constraints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Campaign Constraints & Rules</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Configure rules that govern how actions are assigned to users.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaignState.constraints.map(constraint => (
                <div key={constraint.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox 
                    checked={constraint.enabled}
                    onCheckedChange={(checked) => {
                      setCampaignState(prev => ({
                        ...prev,
                        constraints: prev.constraints.map(c => 
                          c.id === constraint.id ? { ...c, enabled: checked as boolean } : c
                        )
                      }));
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{constraint.name}</h4>
                    <p className="text-sm text-muted-foreground">{constraint.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{constraint.rule}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analysis & User Assignment</CardTitle>
              <p className="text-muted-foreground">
                Detailed analysis of action assignments and user targeting.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  User-level assignment details, action combination analysis, and deep-dive profiles.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {campaignState.selectedActions.length} actions selected
              </Badge>
              {campaignState.excludedActions.length > 0 && (
                <Badge variant="outline">
                  {campaignState.excludedActions.length} actions excluded
                </Badge>
              )}
            </div>
            <Button 
              onClick={() => {
                onSelectOption(0); // Set as selected campaign
                onNext();
              }}
              disabled={campaignState.selectedActions.length === 0}
              className="px-8"
            >
              Generate Marketing Brief
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Copilot Dialog */}
      {showCopilot && (
        <CampaignCopilotChat
          campaignState={campaignState}
          setCampaignState={setCampaignState}
          onClose={() => setShowCopilot(false)}
        />
      )}

      {/* User Profile Modal */}
      {showUserModal && (
        <UserProfileModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          userProfiles={[]}
          segmentSummary={{
            totalUsers: 12000,
            avgTenure: 28,
            avgLTV: 485,
            topChannels: [
              { channel: 'Email', preference: 65 },
              { channel: 'Push', preference: 45 },
              { channel: 'SMS', preference: 22 }
            ],
            riskDistribution: [
              { risk: 'High', count: 7200 },
              { risk: 'Medium', count: 8234 },
              { risk: 'Low', count: 2800 }
            ]
          }}
        />
      )}
    </div>
  );
};

export default UniversalCampaignBuilder;