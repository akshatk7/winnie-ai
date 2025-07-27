import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Bell, Monitor, RefreshCw, Edit, Users, Clock } from 'lucide-react';
import { proposalOptions } from '@/data/mockData';

interface CollateralProps {
  selectedOption: number | null;
  onNext: () => void;
}

const Collateral: React.FC<CollateralProps> = ({ selectedOption, onNext }) => {
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [collateralContent, setCollateralContent] = useState({
    email: {
      subject: "We miss you! Here's what's new at Finny",
      body: "Hi there! We've been working hard to improve your Finny experience and wanted to share some exciting updates. Our platform now offers enhanced security features, improved user experience, and new tools to help you manage your finances better. We'd love to have you back and show you what's changed. Your financial goals are important to us, and we're here to help you achieve them."
    },
    push: {
      title: "Your Finny account awaits",
      body: "New features and improvements are ready for you. Tap to see what's changed and get back to achieving your financial goals."
    },
    sms: {
      message: "Finny here! We've made improvements to help you reach your financial goals. New security features and tools are waiting. Reply STOP to opt out."
    },
    inapp: {
      banner: "🌟 Welcome back! Discover new features and improvements designed for you"
    }
  });

  const option = selectedOption !== null ? proposalOptions[selectedOption] : null;
  if (!option) return <div>No option selected</div>;

  const handleEdit = (channel: string, field: string, value: string) => {
    setCollateralContent(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleRegenerate = (channel: string) => {
    // Simulate AI regeneration
    const alternatives = {
      email: {
        subject: ["Come back to Finny - New features await", "Your financial journey continues here", "Exciting updates from your Finny team", "We've improved Finny just for you"],
      },
      push: {
        title: ["New Finny features", "Your account needs you", "Financial goals await", "Finny improvements ready"]
      }
    };

    // Simple regeneration simulation
    if (channel === 'email' && alternatives.email.subject) {
      const randomSubject = alternatives.email.subject[Math.floor(Math.random() * alternatives.email.subject.length)];
      handleEdit('email', 'subject', randomSubject);
    }
  };

  const excludedCohorts = [
    { name: "Recently messaged users", count: 2156, reason: "Messaged within 7 days" },
    { name: "Recent churns", count: 892, reason: "Churned within 30 days" },
    { name: "Premium tier", count: 1445, reason: "Different retention strategy" },
    { name: "New users", count: 734, reason: "Under 21 days tenure" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign Collateral</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-generated messaging for your churn mitigation strategy across all channels
              </p>
            </div>
            <Button onClick={onNext}>
              Continue to Approvals
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collateral Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Email</CardTitle>
                </div>
                <Badge variant="outline">Day 5</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject Line</label>
                {editingChannel === 'email-subject' ? (
                  <Textarea
                    value={collateralContent.email.subject}
                    onChange={(e) => handleEdit('email', 'subject', e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded mt-1">{collateralContent.email.subject}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Body</label>
                {editingChannel === 'email-body' ? (
                  <Textarea
                    value={collateralContent.email.body}
                    onChange={(e) => handleEdit('email', 'body', e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded mt-1">{collateralContent.email.body}</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRegenerate('email')}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingChannel(editingChannel === 'email-body' ? null : 'email-body')}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Push Notification */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Push</CardTitle>
                </div>
                <Badge variant="outline">Day 1</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <p className="text-sm bg-muted p-3 rounded mt-1">{collateralContent.push.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Body</label>
                <p className="text-sm bg-muted p-3 rounded mt-1">{collateralContent.push.body}</p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SMS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">SMS</CardTitle>
                </div>
                <Badge variant="outline">Day 3</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Message (160 chars)</label>
                <p className="text-sm bg-muted p-3 rounded mt-1">{collateralContent.sms.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {collateralContent.sms.message.length}/160 characters
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* In-App Banner */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">In-App</CardTitle>
                </div>
                <Badge variant="outline">Day 1</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Banner Message</label>
                <p className="text-sm bg-muted p-3 rounded mt-1">{collateralContent.inapp.banner}</p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Message Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="text-sm">Push</span>
                </div>
                <Badge variant="outline">Day 1</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  <span className="text-sm">In-App</span>
                </div>
                <Badge variant="outline">Day 1</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm">SMS</span>
                </div>
                <Badge variant="outline">Day 3</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm">Email</span>
                </div>
                <Badge variant="outline">Day 5</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-warning" />
                <span>Excluded Cohorts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {excludedCohorts.map((cohort, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{cohort.name}</span>
                    <Badge variant="outline">{cohort.count.toLocaleString()}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{cohort.reason}</p>
                </div>
              ))}
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Excluded</span>
                  <span className="font-bold">
                    {excludedCohorts.reduce((sum, cohort) => sum + cohort.count, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium">Campaign Reach</span>
                  <span className="font-bold text-success">
                    {option.reach.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Fatigue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">0.28</div>
                <p className="text-sm text-muted-foreground">Fatigue Score</p>
                <Badge variant="default" className="mt-2">✓ Low Risk</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Score considers message frequency, channel overlap, and recent campaign exposure
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Collateral;