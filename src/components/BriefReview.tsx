import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Share, CheckCircle, Target, DollarSign, Users, AlertTriangle, Home } from 'lucide-react';
import { proposalOptions } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface BriefReviewProps {
  selectedOption: number | null;
  onApprove: () => void;
  budget?: number;
  onStartOver?: () => void;
}

const BriefReview: React.FC<BriefReviewProps> = ({ selectedOption, onApprove, budget = 0, onStartOver }) => {
  const { toast } = useToast();
  const option = selectedOption !== null ? proposalOptions[selectedOption] : null;
  
  // Calculate dynamic values based on budget
  const dynamicReactivations = 1200 + Math.floor(budget / 1000) * 100;
  const dynamicROI = budget === 0 ? 0 : (dynamicReactivations / budget * 100);

  const handleShare = () => {
    toast({
      title: "Brief Shared",
      description: "Marketing brief has been shared with cross-functional teams.",
    });
  };

  if (!option) {
    return <div>No option selected</div>;
  }

  const briefContent = {
    executive_summary: `Our churn rate has spiked from 4% to 6% over the past 3 days, primarily due to the expiration of our Spring Saver campaign, competitive pressure from BankFast's new cashback offer, and lingering trust issues from the recent Plaid outage. We propose implementing a ${option.option.toLowerCase()} strategy to re-engage at-risk users and reduce churn back to baseline levels.`,
    
    problem_statement: `Finny is experiencing a 50% increase in churn rate (from 4% to 6%) starting immediately after the Spring Saver campaign ended. This represents approximately 2,500 additional monthly churns, translating to $1.2M in lost annual revenue based on our $485 average LTV.`,
    
    data_insights: [
      "35% of churn spike attributed to Spring Saver campaign expiration",
      "28% linked to competitor BankFast's aggressive 5% cashback promotion",
      "22% correlated with recent Plaid outage affecting account linking",
      "15% represents baseline seasonal Q1 churn patterns"
    ],
    
    solution_overview: selectedOption === 0 
      ? "Educational messaging about product value and improved reliability targeting users at risk of churn"
      : "Strategic promotional campaign combining fee waivers with educational messaging to retain high-value users",
    
    target_audience: "Users with LTV > $300, last active within 45 days, flagged as incremental based on our ML model. Approximately 18,234 users meet these criteria.",
    
    success_metrics: [
      `Primary: Reduce churn rate from 6% to 4.5% within ${selectedOption === 0 ? '2 weeks' : '8 weeks'}`,
      `Secondary: Reactivate ${dynamicReactivations.toLocaleString()} users`,
      "Tertiary: Maintain customer satisfaction score above 8.5",
      "Monitor: Campaign fatigue score (target: <0.3)"
    ],
    
    budget_allocation: {
      total: budget,
      breakdown: selectedOption === 0 ? {
        "Content Creation": Math.max(1000, Math.floor(budget * 0.4)),
        "Email Platform": Math.max(500, Math.floor(budget * 0.2)),
        "SMS Credits": Math.max(600, Math.floor(budget * 0.25)),
        "Push Notification Service": Math.max(200, Math.floor(budget * 0.08)),
        "Analytics & Monitoring": Math.max(200, Math.floor(budget * 0.07))
      } : {
        "Fee Waivers": Math.max(20000, Math.floor(budget * 0.8)),
        "Content Creation": Math.max(2000, Math.floor(budget * 0.08)),
        "Platform Costs": Math.max(1500, Math.floor(budget * 0.06)),
        "Premium Support": Math.max(1000, Math.floor(budget * 0.04)),
        "Analytics & Monitoring": Math.max(500, Math.floor(budget * 0.02))
      }
    },
    
    excluded_cohorts: [
      "Users messaged within 7 days (fatigue protection)",
      "Users who churned within 30 days (unlikely to convert)",
      "Premium tier users (different retention strategy needed)",
      "Users under 21 days tenure (onboarding focus needed)"
    ],
    
    risks_and_mitigations: [
      {
        risk: "Campaign fatigue from over-messaging",
        mitigation: "Implement frequency capping and exclusion lists"
      },
      {
        risk: selectedOption === 0 ? "Low engagement without incentives" : "High promotional costs impacting margins",
        mitigation: selectedOption === 0 ? "A/B test message urgency and social proof" : "Monitor ROI daily with automatic budget caps"
      }
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Marketing Campaign Brief</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Churn Mitigation Strategy • Generated {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {onStartOver && (
                <Button variant="ghost" onClick={onStartOver}>
                  <Home className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              )}
              <Button variant="outline" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share with XFN
              </Button>
              <Button onClick={onApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Brief
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Brief Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{briefContent.executive_summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Problem Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{briefContent.problem_statement}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data-Driven Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefContent.data_insights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Solution Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{briefContent.solution_overview}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Success Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefContent.success_metrics.map((metric, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <Target className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risks & Mitigations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {briefContent.risks_and_mitigations.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.risk}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{item.mitigation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Strategy</span>
                <Badge>Churn Mitigation Strategy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Budget</span>
                <span className="font-medium">${budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Target Reach</span>
                <span className="font-medium">{option.reach.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expected ROI</span>
                <span className="font-medium text-success">
                  {budget === 0 ? '-' : `${dynamicROI.toFixed(1)}%`}
                </span>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Target Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{briefContent.target_audience}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Excluded Cohorts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefContent.excluded_cohorts.map((cohort, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{cohort}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BriefReview;