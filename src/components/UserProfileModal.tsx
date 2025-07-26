import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { User, Users, Mail, MessageSquare, Smartphone, Calendar, DollarSign, Activity, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  LTV: number;
  last_active_days: number;
  tenure_months: number;
  prefers_sms: boolean;
  prefers_push: boolean;
  prefers_email: boolean;
  channel_stats: {
    email_open: number;
    sms_click: number;
    push_tap: number;
  };
  demographics: {
    age: number;
    location: string;
    segment: string;
  };
  behavior: {
    avg_session_duration: number;
    monthly_transactions: number;
    last_transaction_days: number;
  };
  risk_score: number;
  engagement_trend: Array<{ month: string; score: number }>;
  recent_interactions: Array<{
    date: string;
    channel: string;
    type: string;
    response: string;
  }>;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfiles: UserProfile[];
  segmentSummary: {
    totalUsers: number;
    avgTenure: number;
    avgLTV: number;
    topChannels: Array<{ channel: string; preference: number }>;
    riskDistribution: Array<{ risk: string; count: number }>;
  };
}

const generateMockUserProfiles = (count: number): UserProfile[] => {
  const names = ['Alex Johnson', 'Sarah Wilson', 'Mike Chen', 'Emma Davis', 'James Brown', 'Lisa Garcia', 'David Kim', 'Anna Martinez'];
  const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'];
  const segments = ['Premium', 'Standard', 'Basic', 'Enterprise'];
  
  return Array.from({ length: count }, (_, i) => ({
    user_id: `user_${2000 + i}`,
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@email.com`,
    LTV: Math.round((300 + Math.random() * 600) * 100) / 100,
    last_active_days: Math.floor(Math.random() * 30),
    tenure_months: Math.floor(12 + Math.random() * 36),
    prefers_sms: Math.random() > 0.6,
    prefers_push: Math.random() > 0.4,
    prefers_email: Math.random() > 0.3,
    channel_stats: {
      email_open: Math.round(Math.random() * 0.6 * 100) / 100,
      sms_click: Math.round(Math.random() * 0.12 * 100) / 100,
      push_tap: Math.round(Math.random() * 0.25 * 100) / 100
    },
    demographics: {
      age: 25 + Math.floor(Math.random() * 40),
      location: locations[Math.floor(Math.random() * locations.length)],
      segment: segments[Math.floor(Math.random() * segments.length)]
    },
    behavior: {
      avg_session_duration: Math.round((5 + Math.random() * 25) * 100) / 100,
      monthly_transactions: Math.floor(2 + Math.random() * 20),
      last_transaction_days: Math.floor(Math.random() * 14)
    },
    risk_score: Math.round(Math.random() * 100),
    engagement_trend: Array.from({ length: 6 }, (_, j) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][j],
      score: Math.round((50 + Math.random() * 50) * 100) / 100
    })),
    recent_interactions: Array.from({ length: 3 }, (_, k) => ({
      date: new Date(Date.now() - k * 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      channel: ['email', 'sms', 'push'][k % 3],
      type: ['promotional', 'transactional', 'educational'][k % 3],
      response: ['opened', 'clicked', 'ignored'][k % 3]
    }))
  }));
};

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  userProfiles: propUserProfiles, 
  segmentSummary 
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userProfiles] = useState<UserProfile[]>(() => 
    propUserProfiles.length > 0 ? propUserProfiles : generateMockUserProfiles(8)
  );

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--secondary))'];

  const generateAIInsight = (user: UserProfile): string => {
    const insights = [
      `${user.name} is a ${user.demographics.segment.toLowerCase()} user with ${user.tenure_months} months tenure. `,
      `Strong ${user.channel_stats.email_open > 0.4 ? 'email' : user.channel_stats.sms_click > 0.08 ? 'SMS' : 'push'} engagement (${Math.round(Math.max(user.channel_stats.email_open, user.channel_stats.sms_click, user.channel_stats.push_tap) * 100)}% response rate). `,
      `${user.risk_score > 70 ? 'High churn risk' : user.risk_score > 40 ? 'Medium risk' : 'Low risk'} based on recent activity patterns. `,
      `Recommended approach: ${user.risk_score > 60 ? 'Immediate retention offer' : 'Educational content series'}.`
    ];
    return insights.join('');
  };

  if (selectedUser) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
               <DialogTitle className="flex items-center space-x-2">
                 <User className="w-5 h-5" />
                 <span>{selectedUser.name} - Individual Profile</span>
               </DialogTitle>
              <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                ← Back to Overview
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Demographics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Age:</span>
                      <span className="text-sm font-medium">{selectedUser.demographics.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="text-sm font-medium">{selectedUser.demographics.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Segment:</span>
                      <Badge variant="secondary">{selectedUser.demographics.segment}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Account Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">LTV:</span>
                      <span className="text-sm font-bold text-primary">${selectedUser.LTV}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tenure:</span>
                      <span className="text-sm font-medium">{selectedUser.tenure_months}mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Risk Score:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={selectedUser.risk_score} className="w-16 h-2" />
                        <span className="text-sm font-medium">{selectedUser.risk_score}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Active:</span>
                      <span className="text-sm font-medium">{selectedUser.last_active_days}d ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Transactions:</span>
                      <span className="text-sm font-medium">{selectedUser.behavior.monthly_transactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Session:</span>
                      <span className="text-sm font-medium">{selectedUser.behavior.avg_session_duration}m</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Channel Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">Email</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={selectedUser.channel_stats.email_open * 100} className="w-20 h-2" />
                          <span className="text-sm font-medium">{Math.round(selectedUser.channel_stats.email_open * 100)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">SMS</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={selectedUser.channel_stats.sms_click * 100} className="w-20 h-2" />
                          <span className="text-sm font-medium">{Math.round(selectedUser.channel_stats.sms_click * 100)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span className="text-sm">Push</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={selectedUser.channel_stats.push_tap * 100} className="w-20 h-2" />
                          <span className="text-sm font-medium">{Math.round(selectedUser.channel_stats.push_tap * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Engagement Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={selectedUser.engagement_trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Interactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedUser.recent_interactions.map((interaction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{interaction.date}</span>
                          <Badge variant="outline" className="text-xs">{interaction.channel}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{interaction.type}</span>
                          <Badge variant={interaction.response === 'clicked' ? 'default' : interaction.response === 'opened' ? 'secondary' : 'outline'}>
                            {interaction.response}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Usage Patterns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Session Duration:</span>
                      <span className="text-sm font-medium">{selectedUser.behavior.avg_session_duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Transactions:</span>
                      <span className="text-sm font-medium">{selectedUser.behavior.monthly_transactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Transaction:</span>
                      <span className="text-sm font-medium">{selectedUser.behavior.last_transaction_days} days ago</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Channel Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email</span>
                        <Badge variant={selectedUser.prefers_email ? 'default' : 'outline'}>
                          {selectedUser.prefers_email ? 'Preferred' : 'Not Preferred'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SMS</span>
                        <Badge variant={selectedUser.prefers_sms ? 'default' : 'outline'}>
                          {selectedUser.prefers_sms ? 'Preferred' : 'Not Preferred'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Push</span>
                        <Badge variant={selectedUser.prefers_push ? 'default' : 'outline'}>
                          {selectedUser.prefers_push ? 'Preferred' : 'Not Preferred'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI-Generated Profile Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed bg-muted p-4 rounded-lg">
                    {generateAIInsight(selectedUser)}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>User Segment Analysis - {segmentSummary.totalUsers.toLocaleString()} Users</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Segment Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
            <TabsTrigger value="profiles">Individual Profiles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{segmentSummary.totalUsers.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Tenure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{segmentSummary.avgTenure} mo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg LTV</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${segmentSummary.avgLTV}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Risk Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="destructive">High Churn Risk</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Channel Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={segmentSummary.topChannels}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="hsl(var(--primary))"
                        dataKey="preference"
                        label={({ channel, preference }) => `${channel}: ${preference}%`}
                      >
                        {segmentSummary.topChannels.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={segmentSummary.riskDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="risk" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfiles.map((user) => (
                <Card 
                  key={user.user_id} 
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedUser(user)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{user.name}</CardTitle>
                      <Badge variant={user.risk_score > 70 ? 'destructive' : user.risk_score > 40 ? 'secondary' : 'default'}>
                        {user.risk_score > 70 ? 'High Risk' : user.risk_score > 40 ? 'Medium' : 'Low Risk'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">LTV:</span>
                      <span className="font-medium">${user.LTV}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tenure:</span>
                      <span className="font-medium">{user.tenure_months}mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Best Channel:</span>
                      <Badge variant="outline" className="text-xs">
                        {user.channel_stats.email_open > user.channel_stats.sms_click && user.channel_stats.email_open > user.channel_stats.push_tap
                          ? 'Email'
                          : user.channel_stats.sms_click > user.channel_stats.push_tap
                          ? 'SMS'
                          : 'Push'
                        }
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View Details →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;