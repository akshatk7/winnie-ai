import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Send, BarChart3, Loader2 } from 'lucide-react';
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
  const [isThinking, setIsThinking] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(false);

  useEffect(() => {
    // Auto-start the conversation with pre-seeded question
    if (messages.length === 0) {
      setTimeout(() => {
        onAddMessage('user', 'Why is our churn rate spiking? Can you analyze the data and provide insights?');
      }, 500);
    }
  }, []);

  useEffect(() => {
    // Initial AI response asking for permission to dive deeper
    if (messages.length === 1 && messages[0].role === 'user' && !isThinking && !analysisReady) {
      setIsLoading(true);
      setTimeout(() => {
        const initialResponse = `I've analyzed your churn data, recent campaigns, market intelligence, and system incidents. Here are my findings:

**Key Insights:**
• Churn spiked from 4% to 6% starting 3 days ago
• This coincides with the end of your "Spring Saver Offer" campaign
• Competitor activity and technical issues are contributing factors

Do you want me to dive into the data and do a root cause analysis with data driven hypothesis?`;
        
        onAddMessage('assistant', initialResponse);
        setIsLoading(false);
      }, 2000);
    }
  }, [messages, isThinking, analysisReady, onAddMessage]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.toLowerCase();
    onAddMessage('user', input);
    setInput('');
    
    // Check if user is confirming they want the deep analysis
    if ((userMessage.includes('yes') || userMessage.includes('do it') || userMessage.includes('proceed')) && !isThinking && !analysisReady) {
      // Start the thinking process
      setIsThinking(true);
      setTimeout(() => {
        onAddMessage('assistant', 'Starting deep data analysis...');
        
        // After 3 seconds of thinking, show analysis ready
        setTimeout(() => {
          setIsThinking(false);
          setAnalysisReady(true);
        }, 3000);
      }, 1000);
    } else if (!analysisReady) {
      // General response for other messages
      setTimeout(() => {
        onAddMessage('assistant', 'I understand. Feel free to ask any other questions about the churn analysis, or let me know when you\'re ready for the detailed root cause analysis.');
      }, 1000);
    }
  };

  const handleShowAnalysis = () => {
    setShowAnalysis(true);
    onAnalysisComplete();
  };

  return (
    <div className={`${showAnalysis ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'max-w-4xl mx-auto'}`}>
      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Winnie Analysis</span>
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

            {isThinking && (
              <div className="flex space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg p-4 border-2 border-primary/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Thinking...</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analyzing churn patterns, campaign correlations, market data, and system metrics...
                  </p>
                </div>
              </div>
            )}

            {analysisReady && !showAnalysis && (
              <div className="flex space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm mb-3">Analysis complete! I've identified the key drivers of your churn spike.</p>
                  <Button onClick={handleShowAnalysis} className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Churn Cause Analysis Ready
                  </Button>
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

      {/* Hypotheses Analysis - Only show when analysis is ready */}
      {showAnalysis && (
        <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Churn Cause Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAnalysis && hypothesesData.map((hypothesis, index) => (
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
          
          {showAnalysis && (
            <div className="mt-6">
              <Button onClick={() => onNext(50000)} className="w-full">
                Generate Recommended Campaign
              </Button>
            </div>
          )}
        </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatDiagnosis;