import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DollarSign, Users, TrendingUp, MessageSquare, Gift } from 'lucide-react';
import { proposalOptions } from '@/data/mockData';

interface ProposalChoiceProps {
  selectedOption: number | null;
  onSelectOption: (option: number) => void;
  onNext: () => void;
}

const ProposalChoice: React.FC<ProposalChoiceProps> = ({ 
  selectedOption, 
  onSelectOption, 
  onNext 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recommended Winback Strategies</CardTitle>
          <p className="text-muted-foreground">
            Based on the analysis, here are two data-driven approaches to reduce churn. 
            Select the strategy that aligns with your budget and goals.
          </p>
        </CardHeader>
      </Card>

      <RadioGroup 
        value={selectedOption?.toString()} 
        onValueChange={(value) => onSelectOption(parseInt(value))}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {proposalOptions.map((option, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedOption === index ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectOption(index)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        {index === 0 ? (
                          <MessageSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Gift className="h-5 w-5 text-accent" />
                        )}
                        <CardTitle className="text-lg">{option.option}</CardTitle>
                      </div>
                    </Label>
                  </div>
                  <Badge variant={index === 0 ? "secondary" : "default"}>
                    {index === 0 ? "Low Cost" : "High Impact"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground ml-8">
                  {option.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{option.reach.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {option.expected_reactivations.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Reactivations</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">${option.cost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                  </div>
                </div>

                {/* ROI Calculation */}
                <div className="p-4 bg-gradient-to-r from-success/10 to-transparent border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Projected ROI</span>
                    <span className="text-lg font-bold text-success">
                      {Math.round((option.expected_reactivations * 485 - option.cost) / option.cost * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on $485 average LTV
                  </p>
                </div>

                {/* Strategy Details */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Strategy Components:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {index === 0 ? (
                      <>
                        <li>• Educational email sequence about product reliability</li>
                        <li>• Push notifications highlighting recent improvements</li>
                        <li>• In-app messaging about security features</li>
                        <li>• SMS updates on service stability</li>
                      </>
                    ) : (
                      <>
                        <li>• 2-month fee waiver for at-risk users</li>
                        <li>• Educational content about value proposition</li>
                        <li>• Personalized offers based on usage patterns</li>
                        <li>• Premium support access during promotion</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Expected Timeline */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Campaign Duration</span>
                  <span className="font-medium">{index === 0 ? '2 weeks' : '8 weeks'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </RadioGroup>

      {selectedOption !== null && (
        <div className="flex justify-center">
          <Button onClick={onNext} size="lg" className="px-8">
            Generate Marketing Brief
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProposalChoice;