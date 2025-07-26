import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Users, DollarSign, Target, Bot, BarChart3, Eye, FileText } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recommended Campaign</h2>
          <p className="text-muted-foreground">
            AI-generated campaign optimized for your {formatCurrency(budget)} budget
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={onOpenCopilot}
          className="flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          Ask AI
        </Button>
      </div>

      {/* Campaign Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reach</p>
                <p className="text-xl font-bold">{campaignMetrics.totalReach.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Expected Reactivations</p>
                <p className="text-xl font-bold">{campaignMetrics.expectedReactivations.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-xl font-bold">{formatCurrency(campaignMetrics.totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Projected ROI</p>
                <p className="text-xl font-bold">{formatPercentage(campaignMetrics.projectedROI)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Included Actions</CardTitle>
          <CardDescription>
            This campaign includes {selectedActions.length} carefully selected actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedActions.map((selectedAction, index) => (
            <div key={`${selectedAction.action.id}-${selectedAction.variant.id}`}>
              {index > 0 && <Separator className="my-4" />}
              <div className="p-4 rounded-lg border hover:border-border hover:bg-accent/30 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{selectedAction.action.icon}</div>
                      <div>
                        <h4 className="font-semibold">
                          {selectedAction.action.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedAction.variant.name}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {selectedAction.action.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedAction.variant.description}
                    </p>
                    
                    <div className="flex gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{selectedAction.variant.reach.toLocaleString()} users</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{selectedAction.variant.expectedImpact}% impact</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>
                          {selectedAction.variant.cost === 0 
                            ? 'Free' 
                            : `${formatCurrency(selectedAction.variant.cost)} per user`
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserDeepDive(selectedAction)}
                        className="flex items-center gap-2"
                      >
                        <BarChart3 className="h-3 w-3" />
                        User Deep Dive
                      </Button>
                      {isMessagingAction(selectedAction.action) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTemplatePreview(selectedAction)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-3 w-3" />
                          View Templates
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Campaign Reasoning */}
      <Card>
        <CardHeader>
          <CardTitle>Why This Campaign?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              • <strong>Balanced Approach:</strong> Combines zero-cost messaging with strategic promotional offers
            </p>
            <p>
              • <strong>Multi-Channel Reach:</strong> Engages users across their preferred communication channels
            </p>
            <p>
              • <strong>Budget Optimized:</strong> Maximizes impact while staying within your {formatCurrency(budget)} budget
            </p>
            <p>
              • <strong>High ROI Potential:</strong> Expected {formatPercentage(campaignMetrics.projectedROI)} return on investment
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={onAccept} className="flex-1">
          Accept Campaign
        </Button>
        <Button variant="outline" onClick={onCustomize} className="flex-1">
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
  );
};

export default CampaignSummary;