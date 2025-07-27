import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain, User, Send, X, Zap, Target, Shield, BarChart3 } from 'lucide-react';
import { messagingActions, promotionalActions, CampaignConstraint } from '@/data/actionLibrary';

interface CampaignState {
  budget: number;
  budgetSet: boolean;
  selectedActions: string[];
  excludedActions: string[];
  constraints: CampaignConstraint[];
  assignments: any[];
  totalCost: number;
  totalReach: number;
  expectedReactivations: number;
  presetApplied?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionSuggestions?: {
    type: 'add' | 'remove' | 'exclude' | 'constraint';
    items: string[];
  };
}

interface CampaignCopilotChatProps {
  campaignState: CampaignState;
  setCampaignState: React.Dispatch<React.SetStateAction<CampaignState>>;
  onClose: () => void;
}

const CampaignCopilotChat: React.FC<CampaignCopilotChatProps> = ({
  campaignState,
  setCampaignState,
  onClose
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Welcome message
    setMessages([{
      role: 'assistant',
      content: `Hi! I'm Winnie. I can help you optimize your campaign configuration through natural language.

**What I can help with:**
• Add or remove specific actions: "Add SMS quick tips"
• Exclude actions: "Remove all 50% discounts"
• Modify constraints: "Allow up to 4 channels per user"
• Analyze combinations: "Show me users getting email + 20% off"
• Budget optimization: "What's the best use of my remaining budget?"

**Current Campaign:**
• Budget: $${campaignState.budget.toLocaleString()}
• ${campaignState.selectedActions.length} actions selected
• Expected ROI: ${campaignState.totalCost > 0 ? Math.round((campaignState.expectedReactivations * 485 - campaignState.totalCost) / campaignState.totalCost * 100) : 0}%

How can I help optimize your campaign?`,
      timestamp: new Date()
    }]);
  }, []);

  const processUserQuery = (query: string): ChatMessage => {
    const lowerQuery = query.toLowerCase();
    
    // Action management
    if (lowerQuery.includes('add') || lowerQuery.includes('include')) {
      return handleAddActions(query);
    }
    if (lowerQuery.includes('remove') || lowerQuery.includes('delete')) {
      return handleRemoveActions(query);
    }
    if (lowerQuery.includes('exclude')) {
      return handleExcludeActions(query);
    }
    
    // Constraint management
    if (lowerQuery.includes('constraint') || lowerQuery.includes('rule') || lowerQuery.includes('limit')) {
      return handleConstraints(query);
    }
    
    // Analysis requests
    if (lowerQuery.includes('show') || lowerQuery.includes('analyze') || lowerQuery.includes('who')) {
      return handleAnalysis(query);
    }
    
    // Budget optimization
    if (lowerQuery.includes('budget') || lowerQuery.includes('optimize') || lowerQuery.includes('cost')) {
      return handleBudgetOptimization(query);
    }
    
    // General help
    return {
      role: 'assistant',
      content: `I understand you want to modify your campaign. Here are some example commands I can help with:

**Action Management:**
• "Add email welcome back series"
• "Remove all SMS actions"
• "Exclude 50% discount offers"

**Constraint Modification:**
• "Allow maximum 4 channels per user"
• "No user should get both discount and cashback"
• "Increase frequency limit to 6 actions"

**Analysis:**
• "Show me users getting email + discount"
• "Analyze the 30% discount action"
• "Who gets promotional offers?"

Could you be more specific about what you'd like to change?`,
      timestamp: new Date()
    };
  };

  const handleAddActions = (query: string): ChatMessage => {
    const allActions = [...messagingActions, ...promotionalActions];
    const suggestedActions: string[] = [];
    
    // Simple keyword matching for actions
    if (query.includes('email')) {
      suggestedActions.push('email_welcome_back', 'email_feature_update');
    }
    if (query.includes('sms')) {
      suggestedActions.push('sms_quick_tips', 'sms_alerts');
    }
    if (query.includes('push')) {
      suggestedActions.push('push_feature_highlight', 'push_usage_insights');
    }
    if (query.includes('discount') || query.includes('10%')) {
      suggestedActions.push('discount_10');
    }
    if (query.includes('20%')) {
      suggestedActions.push('discount_20');
    }
    if (query.includes('30%')) {
      suggestedActions.push('discount_30');
    }
    if (query.includes('cashback')) {
      suggestedActions.push('cashback_25', 'cashback_50');
    }

    if (suggestedActions.length > 0) {
      // Apply the suggestions
      setCampaignState(prev => ({
        ...prev,
        selectedActions: [...new Set([...prev.selectedActions, ...suggestedActions])],
        excludedActions: prev.excludedActions.filter(id => !suggestedActions.includes(id))
      }));

      const actionNames = suggestedActions.map(id => {
        const action = allActions.find(a => a.variants.some(v => v.id === id));
        const variant = action?.variants.find(v => v.id === id);
        return variant?.name || id;
      });

      return {
        role: 'assistant',
        content: `✅ I've added the following actions to your campaign:

${actionNames.map(name => `• ${name}`).join('\n')}

**Impact on Campaign:**
• Total actions: ${campaignState.selectedActions.length + suggestedActions.length}
• This will increase your expected reactivations and campaign cost

Would you like me to analyze the updated performance or make any other changes?`,
        timestamp: new Date(),
        actionSuggestions: {
          type: 'add',
          items: suggestedActions
        }
      };
    }

    return {
      role: 'assistant',
      content: `I couldn't identify specific actions from your request. Here are some actions you can add:

**Messaging Actions:**
• Email welcome back series
• SMS quick tips
• Push notifications
• In-app tutorials

**Promotional Actions:**
• 10%, 20%, 30% discounts
• Cashback offers ($25, $50, $100)
• Free months (1-3 months)
• Fee waivers

Try: "Add email welcome back and 20% discount"`,
      timestamp: new Date()
    };
  };

  const handleRemoveActions = (query: string): ChatMessage => {
    let actionsToRemove: string[] = [];
    
    if (query.includes('all')) {
      if (query.includes('sms')) {
        actionsToRemove = campaignState.selectedActions.filter(id => id.startsWith('sms_'));
      } else if (query.includes('email')) {
        actionsToRemove = campaignState.selectedActions.filter(id => id.startsWith('email_'));
      } else if (query.includes('promotional') || query.includes('promo')) {
        actionsToRemove = campaignState.selectedActions.filter(id => 
          id.startsWith('discount_') || id.startsWith('cashback_') || id.startsWith('free_')
        );
      } else {
        actionsToRemove = [...campaignState.selectedActions];
      }
    }

    if (actionsToRemove.length > 0) {
      setCampaignState(prev => ({
        ...prev,
        selectedActions: prev.selectedActions.filter(id => !actionsToRemove.includes(id))
      }));

      return {
        role: 'assistant',
        content: `✅ I've removed ${actionsToRemove.length} action(s) from your campaign.

**Updated Campaign:**
• Remaining actions: ${campaignState.selectedActions.length - actionsToRemove.length}
• This will reduce your campaign cost and expected reactivations

Would you like me to suggest replacement actions or analyze the updated performance?`,
        timestamp: new Date()
      };
    }

    return {
      role: 'assistant',
      content: `I couldn't identify which actions to remove. You currently have ${campaignState.selectedActions.length} actions selected.

Try commands like:
• "Remove all SMS actions"
• "Remove promotional offers"
• "Remove 30% discount"
• "Remove all actions"`,
      timestamp: new Date()
    };
  };

  const handleExcludeActions = (query: string): ChatMessage => {
    const actionsToExclude: string[] = [];
    
    if (query.includes('50%')) {
      actionsToExclude.push('discount_50');
    }
    if (query.includes('high value') || query.includes('expensive')) {
      actionsToExclude.push('discount_50', 'cashback_100', 'free_3_months');
    }

    if (actionsToExclude.length > 0) {
      setCampaignState(prev => ({
        ...prev,
        excludedActions: [...new Set([...prev.excludedActions, ...actionsToExclude])],
        selectedActions: prev.selectedActions.filter(id => !actionsToExclude.includes(id))
      }));

      return {
        role: 'assistant',
        content: `✅ I've excluded ${actionsToExclude.length} action(s) from your campaign. These actions are now unavailable for selection.

**Excluded Actions:**
${actionsToExclude.map(id => `• ${id.replace('_', ' ')}`).join('\n')}

This helps ensure your campaign stays within budget and meets your constraints.`,
        timestamp: new Date()
      };
    }

    return {
      role: 'assistant',
      content: `I couldn't identify which actions to exclude. 

Try commands like:
• "Exclude 50% discount offers"
• "Exclude high value promotions"
• "Exclude all cashback offers"`,
      timestamp: new Date()
    };
  };

  const handleConstraints = (query: string): ChatMessage => {
    return {
      role: 'assistant',
      content: `I can help you modify campaign constraints:

**Current Active Constraints:**
${campaignState.constraints.filter(c => c.enabled).map(c => `• ${c.name}: ${c.description}`).join('\n')}

**Available Modifications:**
• Channel limits: "Allow maximum 4 channels per user"
• Promotional limits: "No user gets more than 30% discount"
• Frequency limits: "Maximum 6 actions per user"

What constraint would you like to modify?`,
      timestamp: new Date()
    };
  };

  const handleAnalysis = (query: string): ChatMessage => {
    const totalUsers = 18234;
    const emailUsers = Math.floor(totalUsers * 0.65);
    const discountUsers = Math.floor(totalUsers * 0.40);
    
    return {
      role: 'assistant',
      content: `📊 **Campaign Analysis:**

**Current Action Distribution:**
• ${campaignState.selectedActions.length} unique actions configured
• Estimated ${emailUsers.toLocaleString()} users will receive email
• Estimated ${discountUsers.toLocaleString()} users will receive promotional offers

**Performance Metrics:**
• Total Reach: ${campaignState.totalReach.toLocaleString()} users
• Expected Reactivations: ${campaignState.expectedReactivations.toLocaleString()}
• Total Cost: $${campaignState.totalCost.toLocaleString()}
• Projected ROI: ${campaignState.totalCost > 0 ? Math.round((campaignState.expectedReactivations * 485 - campaignState.totalCost) / campaignState.totalCost * 100) : 0}%

For detailed user-level analysis, use the "Campaign Analysis" tab in the main interface.`,
      timestamp: new Date()
    };
  };

  const handleBudgetOptimization = (query: string): ChatMessage => {
    const remainingBudget = campaignState.budget - campaignState.totalCost;
    
    return {
      role: 'assistant',
      content: `💰 **Budget Analysis:**

**Current Budget Status:**
• Total Budget: $${campaignState.budget.toLocaleString()}
• Allocated: $${campaignState.totalCost.toLocaleString()}
• Remaining: $${remainingBudget.toLocaleString()}

**Optimization Suggestions:**
${remainingBudget > 10000 ? '• Consider adding high-impact promotional actions like 30% discounts' : ''}
${remainingBudget > 5000 ? '• Add more messaging touchpoints for better nurturing' : ''}
${remainingBudget < 1000 ? '• Consider removing expensive actions to stay within budget' : ''}
• Focus on actions with highest ROI per dollar spent

**Highest ROI Actions Currently Available:**
• Email welcome series (low cost, high impact)
• Push notifications (very low cost)
• In-app tutorials (medium cost, high engagement)

Would you like me to automatically optimize your action selection?`,
      timestamp: new Date()
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Process the query and generate response
    setTimeout(() => {
      const assistantMessage = processUserQuery(input);
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>Winnie</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex space-x-4">
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'assistant' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {message.role === 'assistant' ? <Brain className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'assistant'
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to modify your campaign..."
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="w-80 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Commands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Add email welcome series",
                  "Remove all SMS actions", 
                  "Exclude 50% discounts",
                  "Show budget optimization",
                  "Analyze current performance"
                ].map((command, index) => (
                  <Button 
                    key={index}
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-left justify-start text-xs"
                    onClick={() => setInput(command)}
                  >
                    <Zap className="h-3 w-3 mr-2" />
                    {command}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Campaign Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Actions:</span>
                    <Badge variant="secondary">{campaignState.selectedActions.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Excluded:</span>
                    <Badge variant="outline">{campaignState.excludedActions.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget Used:</span>
                    <Badge variant="default">
                      {campaignState.budget > 0 ? Math.round(campaignState.totalCost / campaignState.budget * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignCopilotChat;