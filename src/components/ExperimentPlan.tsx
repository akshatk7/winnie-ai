import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Users, TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react';
import { proposalOptions } from '@/data/mockData';

interface ExperimentPlanProps {
  selectedOption: number | null;
  onApprove: () => void;
}

const ExperimentPlan: React.FC<ExperimentPlanProps> = ({ selectedOption, onApprove }) => {
  const option = selectedOption !== null ? proposalOptions[selectedOption] : null;

  if (!option) {
    return <div>No option selected</div>;
  }

  const totalUsers = option.reach;
  const holdoutSize = Math.round(totalUsers * 0.1);
  const treatmentSize = totalUsers - holdoutSize;
  const duration = selectedOption === 0 ? 14 : 56; // days
  const primaryKPI = "30-day card swipe rate";
  const expectedLift = selectedOption === 0 ? 8 : 16; // percentage points

  // Sample size calculation (simplified)
  const baselineRate = 0.65; // 65% baseline card swipe rate
  const minDetectableEffect = 0.05; // 5 percentage points
  const power = 0.8;
  const alpha = 0.05;
  const calculatedSampleSize = Math.round(
    2 * Math.pow(1.96 + 0.84, 2) * baselineRate * (1 - baselineRate) / Math.pow(minDetectableEffect, 2)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FlaskConical className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Experiment Design & Sample Size</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A/B test configuration for {option.option} campaign
                </p>
              </div>
            </div>
            <Button onClick={onApprove}>
              Approve Experiment Plan
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experiment Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Experiment Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{treatmentSize.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Treatment Group</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{holdoutSize.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Control Group (10%)</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Primary KPI</span>
                <Badge variant="outline">{primaryKPI}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expected Lift</span>
                <span className="font-medium text-success">+{expectedLift}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Experiment Duration</span>
                <span className="font-medium">{duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Statistical Power</span>
                <span className="font-medium">80%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Significance Level</span>
                <span className="font-medium">95%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Size Calculation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Statistical Design</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Size Validation</h4>
              <p className="text-sm text-muted-foreground">
                Required sample size for detecting 5pp change: <span className="font-medium">{calculatedSampleSize.toLocaleString()}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Available sample size: <span className="font-medium text-success">{treatmentSize.toLocaleString()}</span>
              </p>
              <Badge variant="default" className="mt-2">✓ Sufficiently Powered</Badge>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Key Assumptions</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Baseline {primaryKPI}: {(baselineRate * 100).toFixed(0)}%</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Minimum detectable effect: {(minDetectableEffect * 100).toFixed(0)}pp</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Two-tailed test with {((1 - alpha) * 100).toFixed(0)}% confidence</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Random assignment stratified by LTV quintile</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Measurement Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Measurement Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-success">Primary Metrics</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-success" />
                  <span>30-day card swipe rate</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-success" />
                  <span>Churn rate reduction</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-primary">Secondary Metrics</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>App engagement rate</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Customer satisfaction score</span>
                </li>
                <li className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Support ticket volume</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-warning">Guardrail Metrics</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span>Campaign fatigue score</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span>Unsubscribe rate</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span>Brand perception score</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Experiment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary text-primary-foreground rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <p className="font-semibold">Day 0</p>
                <p className="text-xs opacity-90">Launch Campaign</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-semibold">Day 7</p>
                <p className="text-xs text-muted-foreground">First Analysis</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-semibold">Day {Math.round(duration / 2)}</p>
                <p className="text-xs text-muted-foreground">Mid-point Review</p>
              </div>
              <div className="text-center p-4 bg-success text-success-foreground rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2" />
                <p className="font-semibold">Day {duration}</p>
                <p className="text-xs opacity-90">Final Results</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Analysis Schedule</h4>
              <ul className="space-y-1 text-sm">
                <li>• Daily monitoring for guardrail metrics and early warning signals</li>
                <li>• Weekly deep-dive analysis including cohort breakdowns</li>
                <li>• Real-time dashboard for key stakeholders</li>
                <li>• Final comprehensive report with recommendations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExperimentPlan;