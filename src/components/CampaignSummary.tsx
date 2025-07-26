import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Users, DollarSign, Target, Bot, BarChart3, Eye, FileText, CheckCircle, Brain } from 'lucide-react';
import { CampaignAction, ActionVariant, messagingActions, promotionalActions } from '@/data/actionLibrary';
import UserProfileModal from './UserProfileModal';
import TemplatePreviewModal from './TemplatePreviewModal';

interface CampaignMetrics {
  totalReach: number;
  expectedReactivations: number;
  totalCost: number;
  projectedROI: number;
}

interface SelectedAction {
  action: CampaignAction;
  variant: ActionVariant;
}

interface CampaignSummaryProps {
  budget: number;
  campaignMetrics: CampaignMetrics;
  selectedActions: SelectedAction[];
  onAccept: () => void;
  onCustomize: () => void;
  onOpenCopilot: () => void;
}

const CampaignSummary: React.FC<CampaignSummaryProps> = ({
  budget,
  campaignMetrics,
  selectedActions,
  onAccept,
  onCustomize,
  onOpenCopilot
}) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedActionForAnalysis, setSelectedActionForAnalysis] = useState<SelectedAction | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedActionForTemplate, setSelectedActionForTemplate] = useState<SelectedAction | null>(null);
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Generate mock user profiles for a specific action
  const generateUsersForAction = (action: SelectedAction) => {
    const baseCount = Math.min(action.variant.reach, 50); // Show up to 50 users
    const users = [];
    const names = ['Alex Johnson', 'Sarah Wilson', 'Mike Chen', 'Emma Davis', 'James Brown', 'Lisa Garcia', 'David Kim', 'Anna Martinez'];
    const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'];
    const segments = ['Premium', 'Standard', 'Basic', 'Enterprise'];
    
    for (let i = 0; i < baseCount; i++) {
      const riskScore = action.action.category === 'Discounts' ? 
        (action.variant.name.includes('50%') ? 0.8 : 
         action.variant.name.includes('30%') ? 0.6 : 0.3) : 0.2;
      
      const isEmailAction = action.action.name.toLowerCase().includes('email');
      const isSMSAction = action.action.name.toLowerCase().includes('sms');
      const isPushAction = action.action.name.toLowerCase().includes('push');
      
      users.push({
        user_id: `user_${action.action.id}_${i + 1000}`,
        name: names[i % names.length],
        email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@example.com`,
        LTV: Math.floor(Math.random() * 15000) + 2000,
        last_active_days: Math.floor(Math.random() * 30) + 1,
        tenure_months: Math.floor(Math.random() * 24) + 6,
        prefers_sms: isSMSAction || Math.random() > 0.6,
        prefers_push: isPushAction || Math.random() > 0.5,
        prefers_email: isEmailAction || Math.random() > 0.3,
        channel_stats: {
          email_open: Math.random() * 0.8 + 0.1,
          sms_click: Math.random() * 0.6 + 0.2,
          push_tap: Math.random() * 0.4 + 0.1
        },
        demographics: {
          age: Math.floor(Math.random() * 40) + 25,
          location: locations[i % locations.length],
          segment: segments[i % segments.length]
        },
        behavior: {
          avg_session_duration: Math.floor(Math.random() * 45) + 5,
          monthly_transactions: Math.floor(Math.random() * 20) + 1,
          last_transaction_days: Math.floor(Math.random() * 15) + 1
        },
        risk_score: riskScore,
        engagement_trend: Array.from({ length: 6 }, (_, j) => ({
          month: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' }),
          score: Math.random() * 0.8 + 0.2
        })),
        recent_interactions: [
          {
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            channel: isEmailAction ? 'Email' : isSMSAction ? 'SMS' : isPushAction ? 'Push' : 'Email',
            type: action.action.type,
            response: Math.random() > 0.5 ? 'Opened' : 'Delivered'
          }
        ]
      });
    }
    return users;
  };

  const handleUserDeepDive = (selectedAction: SelectedAction) => {
    setSelectedActionForAnalysis(selectedAction);
    setShowUserModal(true);
  };

  const handleTemplatePreview = (selectedAction: SelectedAction) => {
    setSelectedActionForTemplate(selectedAction);
    setShowTemplateModal(true);
  };

  const isMessagingAction = (action: CampaignAction) => {
    const actionName = action.name.toLowerCase();
    return actionName.includes('email') || actionName.includes('sms') || 
           actionName.includes('push') || actionName.includes('in-app');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Generated Campaign</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Recommended Campaign
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              AI-optimized campaign for your {formatCurrency(budget)} budget
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={onOpenCopilot}
            className="flex items-center gap-2 hover:shadow-lg transition-shadow"
          >
            <Bot className="h-4 w-4" />
            Ask AI Questions
          </Button>
        </div>

        {/* Campaign Metrics Overview */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl"></div>
          <div className="relative bg-card/80 backdrop-blur-sm border rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-6 text-center">Campaign Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Reach</p>
                      <p className="text-2xl font-bold">{campaignMetrics.totalReach.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Target className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Expected Reactivations</p>
                      <p className="text-2xl font-bold text-success">{campaignMetrics.expectedReactivations.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Cost</p>
                      <p className="text-2xl font-bold">{formatCurrency(campaignMetrics.totalCost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Projected ROI</p>
                      <p className="text-2xl font-bold text-accent">{formatPercentage(campaignMetrics.projectedROI)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Campaign Actions */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Included Actions</CardTitle>
                <CardDescription className="text-base">
                  This campaign includes {selectedActions.length} carefully selected actions to maximize engagement
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {selectedActions.map((selectedAction, index) => (
                <div key={`${selectedAction.action.id}-${selectedAction.variant.id}`}>
                  {index > 0 && <Separator className="my-6" />}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <div className="relative p-6 rounded-xl border border-border/50 hover:border-primary/20 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="text-3xl p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                              {selectedAction.action.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold flex items-center gap-2">
                                {selectedAction.action.name}
                              </h4>
                              <p className="text-muted-foreground font-medium">
                                {selectedAction.variant.name}
                              </p>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20"
                            >
                              {selectedAction.action.category}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-6 leading-relaxed">
                            {selectedAction.variant.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-6 text-sm mb-6">
                            <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="font-medium">{selectedAction.variant.reach.toLocaleString()} users</span>
                            </div>
                            <div className="flex items-center gap-2 bg-success/5 px-3 py-2 rounded-lg">
                              <Target className="h-4 w-4 text-success" />
                              <span className="font-medium">{selectedAction.variant.expectedImpact}% impact</span>
                            </div>
                            <div className="flex items-center gap-2 bg-warning/5 px-3 py-2 rounded-lg">
                              <DollarSign className="h-4 w-4 text-warning" />
                              <span className="font-medium">
                                {selectedAction.variant.cost === 0 
                                  ? 'Free' 
                                  : `${formatCurrency(selectedAction.variant.cost)} per user`
                                }
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserDeepDive(selectedAction)}
                              className="flex items-center gap-2 bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 border-primary/20 hover:border-primary/30 transition-all duration-300"
                            >
                              <BarChart3 className="h-4 w-4" />
                              User Deep Dive
                            </Button>
                            {isMessagingAction(selectedAction.action) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTemplatePreview(selectedAction)}
                                className="flex items-center gap-2 bg-gradient-to-r from-accent/5 to-transparent hover:from-accent/10 border-accent/20 hover:border-accent/30 transition-all duration-300"
                              >
                                <FileText className="h-4 w-4" />
                                View Templates
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Reasoning */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
          <CardHeader className="bg-gradient-to-r from-success/5 to-primary/5 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Brain className="h-5 w-5 text-success" />
              </div>
              <CardTitle className="text-xl">Why This Campaign?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-sm leading-relaxed">
                  <strong className="text-primary">Balanced Approach:</strong> Combines zero-cost messaging with strategic promotional offers to maximize reach while maintaining cost efficiency
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/10">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <p className="text-sm leading-relaxed">
                  <strong className="text-accent">Multi-Channel Reach:</strong> Engages users across their preferred communication channels for maximum engagement potential
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-warning/5 rounded-lg border border-warning/10">
                <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                <p className="text-sm leading-relaxed">
                  <strong className="text-warning">Budget Optimized:</strong> Maximizes impact while staying within your {formatCurrency(budget)} budget constraints
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-success/5 rounded-lg border border-success/10">
                <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                <p className="text-sm leading-relaxed">
                  <strong className="text-success">High ROI Potential:</strong> Expected {formatPercentage(campaignMetrics.projectedROI)} return on investment based on historical performance data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button 
            onClick={onAccept} 
            className="flex-1 h-12 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Accept Campaign
          </Button>
          <Button 
            variant="outline" 
            onClick={onCustomize} 
            className="flex-1 h-12 text-lg border-primary/20 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
          >
            <Target className="h-5 w-5 mr-2" />
            Customize Campaign
          </Button>
        </div>

        {/* User Profile Modal */}
        {showUserModal && selectedActionForAnalysis && (
          <UserProfileModal
            isOpen={showUserModal}
            onClose={() => {
              setShowUserModal(false);
              setSelectedActionForAnalysis(null);
            }}
            userProfiles={generateUsersForAction(selectedActionForAnalysis)}
            segmentSummary={{
              totalUsers: selectedActionForAnalysis.variant.reach,
              avgTenure: 14.5,
              avgLTV: 8750,
              topChannels: [
                { channel: 'Email', preference: selectedActionForAnalysis.action.name.toLowerCase().includes('email') ? 85 : 45 },
                { channel: 'SMS', preference: selectedActionForAnalysis.action.name.toLowerCase().includes('sms') ? 90 : 35 },
                { channel: 'Push', preference: selectedActionForAnalysis.action.name.toLowerCase().includes('push') ? 75 : 25 },
                { channel: 'In-App', preference: 60 }
              ],
              riskDistribution: [
                { risk: 'Low', count: selectedActionForAnalysis.action.category === 'Discounts' ? 20 : 60 },
                { risk: 'Medium', count: selectedActionForAnalysis.action.category === 'Discounts' ? 30 : 30 },
                { risk: 'High', count: selectedActionForAnalysis.action.category === 'Discounts' ? 50 : 10 }
              ]
            }}
          />
        )}

        {/* Template Preview Modal */}
        {showTemplateModal && selectedActionForTemplate && (
          <TemplatePreviewModal
            isOpen={showTemplateModal}
            onClose={() => {
              setShowTemplateModal(false);
              setSelectedActionForTemplate(null);
            }}
            action={selectedActionForTemplate.action}
            variant={selectedActionForTemplate.variant}
          />
        )}
      </div>
    </div>
  );
};

export default CampaignSummary;
