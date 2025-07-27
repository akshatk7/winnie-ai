import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Copy, ExternalLink, Rocket, Users, BarChart3 } from 'lucide-react';
import { proposalOptions } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface FinalSendProps {
  selectedOption: number | null;
}

const FinalSend: React.FC<FinalSendProps> = ({ selectedOption }) => {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const option = selectedOption !== null ? proposalOptions[selectedOption] : null;
  
  // Fallback data if option is null
  const fallbackOption = {
    reach: 18234,
    expected_reactivations: 3647,
    cost: 25000,
    option: 'Security-First Approach'
  };
  
  const displayOption = option || fallbackOption;

  useEffect(() => {
    // Show success animation
    setTimeout(() => setShowSuccess(true), 500);
  }, []);

  const campaignSpec = {
    campaign_name: "Finny_Churn_Winback_Q1_2024",
    goal: "Reduce churn spike post-promo expiration and competitor pressure",
    audience_logic: "LTV>300 AND last_active_days<=45 AND flagged_incremental=1 AND NOT (recent_message_7d OR churned_30d OR premium_tier OR tenure_lt_21d)",
    incrementality_target: 0.2,
    holdout: 0.1,
    channels: {
      push: {
        day: 1,
        copy: selectedOption === 0 
          ? "Account Security Update - Your account is now more secure with our latest updates. Tap to learn more about enhanced protection."
          : "Special Offer Just for You - 2 months of fee-free banking starts now! Tap to see what's included in your offer."
      },
      inapp: {
        day: 1,
        banner: selectedOption === 0
          ? "✅ Enhanced Security Active - Your account is now more protected than ever"
          : "🎉 2 Months Fee-Free - Experience premium banking without the cost"
      },
      sms: {
        day: 3,
        copy: selectedOption === 0
          ? "Finny here! Your account security has been enhanced with our latest updates. We've improved reliability and added new protection features. Reply STOP to opt out."
          : "Finny here! Special offer: 2 months fee-free banking starting now. Experience our full value with enhanced security. Reply STOP to opt out."
      },
      email: {
        day: 5,
        subject: selectedOption === 0
          ? "Important updates about your Finny account security"
          : "Good news! We're waiving your fees for 2 months",
        body: selectedOption === 0
          ? "Hi there! We've made significant improvements to your account security and reliability..."
          : "Hi there! We know you're exploring your options, and we want to show you why Finny is the right choice..."
      }
    },
    fatigue_score: 0.28,
    expected_reach: displayOption.reach,
    budget_cap: displayOption.cost,
    experiment_config: {
      holdout_percentage: 10,
      primary_kpi: "30_day_card_swipe_rate",
      duration_days: selectedOption === 0 ? 14 : 56,
      statistical_power: 0.8,
      significance_level: 0.05
    },
    platform_integrations: {
      braze: {
        workspace_id: "finny_prod_workspace",
        api_key: "brz_live_****",
        campaign_id: "generated_on_launch"
      },
      segment: {
        workspace_slug: "finny-prod",
        write_key: "seg_write_****",
        audience_id: "churn_risk_cohort_q1_2024"
      },
      figma: {
        file_key: "figma_****",
        brand_tokens: {
          primary_color: "#8B5CF6",
          accent_color: "#E879F9",
          font_family: "Inter"
        }
      }
    },
    created_at: new Date().toISOString(),
    created_by: "winnie_v2.1",
    approval_chain: [
      { role: "marketing_lead", approved_at: new Date().toISOString() },
      { role: "data_science", approved_at: new Date().toISOString() },
      { role: "design_legal", approved_at: new Date().toISOString() }
    ]
  };

  const handleCopySpec = () => {
    navigator.clipboard.writeText(JSON.stringify(campaignSpec, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "Campaign specification has been copied to clipboard.",
    });
  };

  const handleDownloadSpec = () => {
    const blob = new Blob([JSON.stringify(campaignSpec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign_spec.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {showSuccess && (
        <Card className="border-l-4 border-l-success bg-gradient-to-r from-success/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success rounded-full">
                <Rocket className="h-8 w-8 text-success-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-success">🎉 Campaign Successfully Launched!</h2>
                <p className="text-muted-foreground">
                  Your churn mitigation campaign is now live and reaching {displayOption.reach.toLocaleString()} users via Braze
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold">{displayOption.reach.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Users Reached</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-3xl font-bold">{displayOption.expected_reactivations.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Expected Reactivations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm text-muted-foreground">Active Channels</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Rocket className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-3xl font-bold">${displayOption.cost.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <p className="font-medium">Braze</p>
                  <p className="text-sm text-muted-foreground">Campaign deployed</p>
                </div>
              </div>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <p className="font-medium">Segment</p>
                  <p className="text-sm text-muted-foreground">Audience synced</p>
                </div>
              </div>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Synced
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <div>
                  <p className="font-medium">Figma</p>
                  <p className="text-sm text-muted-foreground">Assets linked</p>
                </div>
              </div>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Specification */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaign Specification</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCopySpec}>
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
              <Button variant="outline" onClick={handleDownloadSpec}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-sm">
              <code>{JSON.stringify(campaignSpec, null, 2)}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Monitor Real-time Performance</p>
                <p className="text-sm text-muted-foreground">
                  Track open rates, click-through rates, and early conversion signals in your dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Weekly Analysis Reviews</p>
                <p className="text-sm text-muted-foreground">
                  Scheduled deep-dive sessions every Tuesday to assess experiment progress
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Automated Guardrail Monitoring</p>
                <p className="text-sm text-muted-foreground">
                  Winnie will alert you if fatigue scores or unsubscribe rates exceed thresholds
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <Button variant="outline" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View in Braze Dashboard
            </Button>
            <Button variant="outline" className="flex-1">
              <BarChart3 className="h-4 w-4 mr-2" />
              Open Analytics Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalSend;