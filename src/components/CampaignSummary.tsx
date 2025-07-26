import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Users, DollarSign, Target, Bot } from 'lucide-react';
import { CampaignAction, ActionVariant, messagingActions, promotionalActions } from '@/data/actionLibrary';

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
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{selectedAction.action.icon}</div>
                    <div>
                      <h4 className="font-semibold">{selectedAction.action.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedAction.variant.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {selectedAction.action.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedAction.action.description}
                  </p>
                  
                  <div className="flex gap-4 text-sm">
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
    </div>
  );
};

export default CampaignSummary;