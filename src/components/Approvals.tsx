import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Users, Rocket, FileText, FlaskConical, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovalsProps {
  approvals: {
    brief: boolean;
    experiment: boolean;
    design: boolean;
  };
  onApprove: (type: 'brief' | 'experiment' | 'design') => void;
  onLaunch: () => void;
  budget?: number;
}

const Approvals: React.FC<ApprovalsProps> = ({ approvals, onApprove, onLaunch, budget = 0 }) => {
  const { toast } = useToast();

  const handleXFNApproval = () => {
    toast({
      title: "XFN Approval Requested",
      description: "Cross-functional teams have been notified for review.",
    });
    
    // Simulate approval after delay
    setTimeout(() => {
      onApprove('design');
      toast({
        title: "Design Approved!",
        description: "All collateral has been approved by the design team.",
      });
    }, 2000);
  };

  const allApproved = approvals.brief && approvals.experiment && approvals.design;

  const approvalSteps = [
    {
      id: 'brief',
      title: 'Marketing Brief',
      icon: FileText,
      status: approvals.brief ? 'approved' : 'pending',
      description: 'Campaign strategy and budget approval',
      approver: 'Marketing Leadership'
    },
    {
      id: 'experiment',
      title: 'Experiment Design',
      icon: FlaskConical,
      status: approvals.experiment ? 'approved' : 'pending',
      description: 'A/B test configuration and sample size',
      approver: 'Data Science Team'
    },
    {
      id: 'design',
      title: 'Creative Assets',
      icon: Palette,
      status: approvals.design ? 'approved' : 'pending',
      description: 'Messaging and collateral review',
      approver: 'Design & Legal Teams'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign Approvals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and approve all campaign components before launch
              </p>
            </div>
            {allApproved && (
              <Button onClick={onLaunch} size="lg" className="bg-gradient-to-r from-success to-success/80">
                <Rocket className="h-4 w-4 mr-2" />
                Launch Campaign
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Approval Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Approval Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvalSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      step.status === 'approved' 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <p className="text-xs text-muted-foreground">Approver: {step.approver}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {step.status === 'approved' ? (
                      <Badge variant="default" className="bg-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!approvals.design && (
        <Card>
          <CardHeader>
            <CardTitle>Request Final Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button 
                onClick={handleXFNApproval}
                className="flex-1"
                disabled={!approvals.brief || !approvals.experiment}
              >
                <Users className="h-4 w-4 mr-2" />
                Request XFN Approval
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This will notify Design, Legal, and Compliance teams for final review
            </p>
          </CardContent>
        </Card>
      )}

      {/* Campaign Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Launch Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">12,000</p>
              <p className="text-xs text-muted-foreground">Target Users</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">Channels</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">14</p>
              <p className="text-xs text-muted-foreground">Days Duration</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">${budget ? (budget / 1000).toFixed(0) : '0'}K</p>
              <p className="text-xs text-muted-foreground">Total Budget</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-lg">
            <h4 className="font-semibold mb-2">Ready for Launch</h4>
            <ul className="text-sm space-y-1">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Audience segmented and validated</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>A/B test configuration complete</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Collateral generated and reviewed</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Budget allocated and approved</span>
              </li>
            </ul>
          </div>

          {allApproved && (
            <div className="mt-4 p-4 bg-gradient-to-r from-success/10 to-transparent border border-success/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="font-semibold text-success">All approvals complete!</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Campaign is ready to launch. Click the launch button to begin execution.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stakeholder Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Stakeholder Communication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Marketing Leadership</p>
                <p className="text-sm text-muted-foreground">Strategy and budget oversight</p>
              </div>
              <Badge variant={approvals.brief ? "default" : "outline"}>
                {approvals.brief ? "Approved" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Data Science Team</p>
                <p className="text-sm text-muted-foreground">Experiment design validation</p>
              </div>
              <Badge variant={approvals.experiment ? "default" : "outline"}>
                {approvals.experiment ? "Approved" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Design & Legal</p>
                <p className="text-sm text-muted-foreground">Creative and compliance review</p>
              </div>
              <Badge variant={approvals.design ? "default" : "outline"}>
                {approvals.design ? "Approved" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Approvals;