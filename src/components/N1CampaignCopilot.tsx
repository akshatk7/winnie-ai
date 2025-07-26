import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Brain, 
  User, 
  Zap, 
  Target, 
  BarChart3, 
  CheckCircle, 
  Rocket,
  RefreshCw,
  Edit,
  Share
} from 'lucide-react';
import { mockData, hypothesesData, proposalOptions } from '@/data/mockData';
import { toast } from 'sonner';

type Stage = 'chat_reasoning' | 'brief_review' | 'experiment_plan' | 'collateral' | 'approvals' | 'final_send';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const N1CampaignCopilot = () => {
  const [stage, setStage] = useState<Stage>('chat_reasoning');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const examplePrompts = [
    "Churn is up, diagnose",
    "Push fatigue complaints rising",
    "We need Q3 onboarding lift"
  ];

  const handleExamplePrompt = (prompt: string) => {
    setCurrentInput(prompt);
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (message?: string) => {
    const content = message || currentInput;
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsThinking(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: 'reasoning_response',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsThinking(false);
    }, 800);
  };

  const handleHypothesisSelection = (index: number) => {
    setSelectedHypothesis(index);
    const followUp: ChatMessage = {
      role: 'assistant',
      content: 'options_response',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, followUp]);
  };

  const handleOptionSelection = (option: string) => {
    setSelectedOption(option);
    setStage('brief_review');
  };

  const renderChatMessage = (message: ChatMessage, index: number) => {
    if (message.content === 'reasoning_response') {
      return (
        <div key={index} className="flex gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="prose prose-sm">
              <p>Acknowledged... 🧠 <strong>Analyzing data patterns...</strong></p>
              
              <div className="bg-background/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-foreground">Root Cause Analysis</h4>
                {hypothesesData.map((hypothesis, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{idx + 1}. {hypothesis.hypothesis}</span>
                      <span className="text-sm text-muted-foreground">{hypothesis.contribution}%</span>
                    </div>
                    <Progress value={hypothesis.contribution} className="h-2" />
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Which root cause should we tackle first? <strong>Choose 1-4:</strong>
              </p>
              
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4].map(num => (
                  <Button
                    key={num}
                    variant="outline"
                    size="sm"
                    onClick={() => handleHypothesisSelection(num - 1)}
                    className="w-8 h-8 p-0"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (message.content === 'options_response' && selectedHypothesis !== null) {
      return (
        <div key={index} className="flex gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="prose prose-sm">
              <p>Perfect! Focusing on: <strong>{hypothesesData[selectedHypothesis].hypothesis}</strong></p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {proposalOptions.map((option, idx) => (
                  <Card key={idx} className="cursor-pointer hover:bg-accent/50 transition-colors" 
                        onClick={() => handleOptionSelection(option.option)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{option.option}</CardTitle>
                      <CardDescription className="text-xs">{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Reach</span>
                        <span className="font-medium">{option.reach.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Expected Reactivations</span>
                        <span className="font-medium">{option.expected_reactivations}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Cost</span>
                        <span className="font-medium">${option.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>ROI</span>
                        <span className="font-medium text-green-600">2.6x</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className="flex gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          {message.role === 'user' ? (
            <User className="w-4 h-4" />
          ) : (
            <Brain className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-sm">{message.content}</p>
          </div>
          <span className="text-xs text-muted-foreground mt-1">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  const renderBriefReview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Marketing Brief
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Problem Statement</h4>
            <p className="text-sm text-muted-foreground">
              Churn rate spiked to 6% (+2% vs baseline) following Spring Saver Offer expiration, 
              particularly impacting high-LTV users in competitive markets.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Selected Hypothesis</h4>
            <p className="text-sm text-muted-foreground">
              {selectedHypothesis !== null ? hypothesesData[selectedHypothesis].hypothesis : 'None selected'}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Solution & Budget</h4>
            <p className="text-sm text-muted-foreground">
              {selectedOption} campaign targeting 18,234 incremental users with personalized 
              channel optimization. Budget cap: $25,000.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Success Metrics</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>30-day card swipe increase: +20%</li>
              <li>Churn reduction: 2% points</li>
              <li>ROI target: 2.6x</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => toast.success("Brief shared with cross-functional team")}>
          <Share className="w-4 h-4 mr-2" />
          Share with XFN
        </Button>
        <Button onClick={() => setStage('experiment_plan')}>
          Approve Brief
        </Button>
      </div>
    </div>
  );

  const renderExperimentPlan = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Experiment Design
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Hold-out Control</h4>
              <p className="text-2xl font-bold text-primary">10%</p>
              <p className="text-sm text-muted-foreground">1,823 users</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Treatment Group</h4>
              <p className="text-2xl font-bold text-primary">90%</p>
              <p className="text-sm text-muted-foreground">16,411 users</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold mb-2">Primary KPI</h4>
            <p className="text-sm text-muted-foreground">30-day card swipe rate</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Sample Size Calculation</h4>
            <p className="text-sm text-muted-foreground">
              Power: 80% | Significance: 95% | Minimum Detectable Effect: 2%
            </p>
          </div>
          
          <Badge variant="secondary" className="w-fit">
            <Zap className="w-3 h-3 mr-1" />
            Dynamic Fatigue Guardrail: ≤3 messages per user per week
          </Badge>
        </CardContent>
      </Card>
      
      <Button onClick={() => setStage('collateral')} className="w-full">
        Approve Experiment
      </Button>
    </div>
  );

  const renderCollateral = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Email', 'Push', 'SMS', 'In-App'].map((channel) => (
          <Card key={channel}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{channel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/50 rounded p-3 text-xs">
                {channel === 'Email' && (
                  <div>
                    <strong>Subject:</strong> Your exclusive offer is waiting<br/>
                    <strong>Preview:</strong> Don't miss out on 2% cashback...
                  </div>
                )}
                {channel === 'Push' && "🎯 Exclusive 2% cashback offer expires soon! Tap to activate."}
                {channel === 'SMS' && "Hi! Your 2% cashback offer expires in 24h. Activate now: link.co/activate"}
                {channel === 'In-App' && "✨ Special offer: 2% cashback on all purchases this week!"}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Auto-Excluded Cohorts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Users messaged in last 7 days (2,341 users)</li>
            <li>• Opted out of promotional emails (892 users)</li>
            <li>• Recent support ticket (156 users)</li>
          </ul>
        </CardContent>
      </Card>
      
      <Button onClick={() => setStage('approvals')} className="w-full">
        Review Collateral
      </Button>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Campaign Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <span className="text-sm">Design Review</span>
            <Badge variant="secondary">Pending</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <span className="text-sm">Legal Compliance</span>
            <Badge variant="secondary">Pending</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <span className="text-sm">Budget Approval</span>
            <Badge variant="secondary">Pending</Badge>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => toast.success("Design approved by XFN team")}
          className="flex-1"
        >
          Request XFN Approval
        </Button>
        <Button 
          onClick={() => setStage('final_send')}
          className="flex-1"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Launch Campaign
        </Button>
      </div>
    </div>
  );

  const renderFinalSend = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Campaign Launched!</h2>
        <p className="text-muted-foreground">
          Campaign launched to 18,234 users via Braze (simulated)
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Campaign Specification</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto">
{JSON.stringify({
  "campaign_name": "Finny_N1_Winback",
  "audience_sql": "LTV > 300 AND last_active > 45d AND flagged_incremental = 1",
  "per_user_channel_map": {"user_123": "sms", "user_456": "email"},
  "holdout": 0.1,
  "fatigue_rule": "≤3 msgs per 7d",
  "channels": {
    "email": {"day": 1, "subject": "Your exclusive offer is waiting"},
    "sms": {"day": 3, "copy": "Hi! Your 2% cashback offer expires in 24h"},
    "push": {"day": 1, "copy": "🎯 Exclusive 2% cashback offer expires soon!"}
  },
  "budget_cap": 25000,
  "expected_roi": 2.6
}, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Copilot – N=1 Marketing
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Connected → Braze • Segment • Figma
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {stage === 'chat_reasoning' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Reasoning
                </CardTitle>
                <CardDescription>
                  Describe your marketing challenge and let AI analyze the data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Example prompts */}
                {messages.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Try these examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {examplePrompts.map((prompt, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExamplePrompt(prompt)}
                          className="text-xs"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Chat messages */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map(renderChatMessage)}
                  {isThinking && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-sm">🧠 Thinking...</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe your marketing challenge..."
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={() => handleSendMessage()}>Send</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {stage === 'brief_review' && (
          <div className="max-w-4xl mx-auto">
            {renderBriefReview()}
          </div>
        )}

        {stage === 'experiment_plan' && (
          <div className="max-w-4xl mx-auto">
            {renderExperimentPlan()}
          </div>
        )}

        {stage === 'collateral' && (
          <div className="max-w-6xl mx-auto">
            {renderCollateral()}
          </div>
        )}

        {stage === 'approvals' && (
          <div className="max-w-4xl mx-auto">
            {renderApprovals()}
          </div>
        )}

        {stage === 'final_send' && (
          <div className="max-w-4xl mx-auto">
            {renderFinalSend()}
          </div>
        )}
      </div>
    </div>
  );
};