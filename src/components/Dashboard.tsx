import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Brain, AlertTriangle, Users, DollarSign, ArrowRight, Send, UserCheck, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockData } from '@/data/mockData';
import { Input } from '@/components/ui/input';

interface DashboardProps {
  onAskCopilot: (prefilledMessage?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAskCopilot }) => {
  const currentChurn = 6.0;
  const previousChurn = 4.0;
  const churnChange = currentChurn - previousChurn;

  const [quickAskInput, setQuickAskInput] = React.useState('');

  const handleOpportunityClick = (message: string) => {
    onAskCopilot(message);
  };

  const handleQuickAsk = () => {
    if (quickAskInput.trim()) {
      onAskCopilot(quickAskInput);
      setQuickAskInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
                <div className="flex items-center space-x-2">
                  <p className="text-3xl font-bold text-destructive">{currentChurn}%</p>
                  <Badge variant="destructive" className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{churnChange}%</span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">vs last week</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold">124.2k</p>
                <p className="text-xs text-success">+2.1% vs last week</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold">$2.1M</p>
                <p className="text-xs text-success">+5.4% vs last week</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg LTV</p>
                <p className="text-3xl font-bold">$485</p>
                <p className="text-xs text-muted-foreground">-1.2% vs last week</p>
              </div>
              <TrendingDown className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Alert Card */}
      <Card className="border-l-4 border-l-destructive bg-gradient-to-r from-destructive/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Churn Spike Detected</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Churn rate increased by 50% over the past 3 days
                </p>
              </div>
            </div>
            <Button onClick={() => onAskCopilot()} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Brain className="h-4 w-4 mr-2" />
              Ask Winnie
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Churn Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Churn Rate Trend (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData.churnMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  domain={[3, 7]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`${value}%`, 'Churn Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="churn_rate" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaign Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.campaigns.map((campaign) => (
              <div key={campaign.campaign_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground">Ended {campaign.end_date}</p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.competitorNews.map((news, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{news.headline}</p>
                  <p className="text-xs text-muted-foreground">{news.region} • {news.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Opportunities Section */}
      <div id="opportunitiesSection" className="space-y-4">
        <h2 className="text-xl font-semibold">Opportunities</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-6 w-6 text-warning" />
                  <div>
                    <CardTitle className="text-lg">Onboarding Drop-Off</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      42% of new users fail KYC in first 7 days
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Potential revenue impact: $180k/month
                </div>
                <Button 
                  onClick={() => handleOpportunityClick("Can you audit our onboarding flow and suggest quick wins?")}
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <span>Analyze & fix</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Dormant Power Users</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      3,810 high-LTV users inactive &gt; 30 days
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Average LTV: $1,240 per user
                </div>
                <Button 
                  onClick={() => handleOpportunityClick("Help me create a reactivation campaign for dormant high-value users")}
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <span>Reactivate</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Ask Bar - Sticky */}
      <div id="quickAskBar" className="fixed bottom-6 right-6 z-50 max-w-sm fade-in">
        <Card className="shadow-xl border-2">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Quick ask Winnie..."
                value={quickAskInput}
                onChange={(e) => setQuickAskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickAsk()}
                className="flex-1"
              />
              <Button 
                onClick={handleQuickAsk}
                size="sm"
                className="px-3"
                disabled={!quickAskInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;