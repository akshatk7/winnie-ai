import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Send, BarChart3 } from 'lucide-react';
import { hypothesesData } from '@/data/mockData';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatDiagnosisProps {
  messages: ChatMessage[];
  hasAnalyzed: boolean;
  onAddMessage: (role: 'user' | 'assistant', content: string) => void;
  onAnalysisComplete: () => void;
  onNext: (budget: number) => void;
}

const ChatDiagnosis: React.FC<ChatDiagnosisProps> = ({ messages, hasAnalyzed, onAddMessage, onAnalysisComplete, onNext }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState<number>(50000);

  useEffect(() => {
    // Auto-start the conversation
    if (messages.length === 0) {
      setTimeout(() => {
        onAddMessage('user', 'Why is our churn rate spiking? Can you analyze the data and provide insights?');
      }, 500);
    }
  }, []);

  useEffect(() => {
    // Simulate AI response
    if (messages.length === 1 && messages[0].role === 'user' && !hasAnalyzed) {
      setIsLoading(true);
      setTimeout(() => {
        const analysisResponse = `I've analyzed your churn data, recent campaigns, market intelligence, and system incidents. Here are my findings:

**Key Insights:**
• Churn spiked from 4% to 6% starting 3 days ago
• This coincides with the end of your "Spring Saver Offer" campaign
• Competitor activity and technical issues are contributing factors

Let me break down the likely causes with data-driven hypotheses...`;
        
        onAddMessage('assistant', analysisResponse);
        setIsLoading(false);
        onAnalysisComplete();
      }, 2000);
    }
  }, [messages, hasAnalyzed, onAddMessage]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    onAddMessage('user', input);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      onAddMessage('assistant', 'Thank you for the additional context. Based on this information, I recommend we proceed with developing targeted retention campaigns. Would you like to see my recommendations?');
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Copilot Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
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
          
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask follow-up questions..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hypotheses Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Churn Cause Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasAnalyzed && hypothesesData.map((hypothesis, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm">{hypothesis.hypothesis}</h4>
                <Badge variant={
                  hypothesis.confidence === 'High' ? 'default' :
                  hypothesis.confidence === 'Medium' ? 'secondary' : 'outline'
                }>
                  {hypothesis.confidence}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Contribution</span>
                  <span className="font-medium">{hypothesis.contribution}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${hypothesis.contribution}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">{hypothesis.evidence}</p>
            </div>
          ))}
          
          {hasAnalyzed && (
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Budget</label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="Enter budget amount"
                  className="w-full"
                />
              </div>
              <Button onClick={() => onNext(budget)} className="w-full">
                Generate Recommended Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatDiagnosis;