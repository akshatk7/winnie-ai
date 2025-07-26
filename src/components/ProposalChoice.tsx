import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Users, TrendingUp, MessageSquare, Gift, Mail, Smartphone, Eye, Percent, Calendar } from 'lucide-react';
import { proposalOptions } from '@/data/mockData';
import UserProfileModal from './UserProfileModal';

interface ProposalChoiceProps {
  selectedOption: number | null;
  onSelectOption: (option: number) => void;
  onNext: () => void;
}

interface BuildingBlock {
  type: 'promo' | 'messaging';
  title: string;
  description: string;
  cost: number;
  reach: number;
  reactivations: number;
  details: any;
}

interface CampaignOption {
  title: string;
  totalCost: number;
  totalReach: number;
  totalReactivations: number;
  blocks: BuildingBlock[];
}

const ProposalChoice: React.FC<ProposalChoiceProps> = ({ 
  selectedOption, 
  onSelectOption, 
  onNext 
}) => {
  const [budgetInput, setBudgetInput] = useState<number>(25000);
  const [roiTarget, setRoiTarget] = useState<number>(26);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [modalSegment, setModalSegment] = useState<string>('');

  // Generate dynamic campaigns based on budget
  const generatePersonalizedCampaigns = (budget: number): CampaignOption[] => {
    const baseCost = budget * 0.1; // 10% of budget for messaging-only
    const promoCost = budget * 0.9; // 90% for promotional
    
    // Calculate personalized promo values based on budget
    const discountPercent = Math.min(30, Math.floor(budget / 1000)); // Higher budget = higher discount
    const freeMonths = Math.min(3, Math.floor(budget / 10000)); // Higher budget = more free months
    
    return [
      {
        title: "Messaging-Only Winback",
        totalCost: baseCost,
        totalReach: 18234,
        totalReactivations: Math.floor(18234 * 0.08),
        blocks: [
          {
            type: 'messaging',
            title: 'Multi-Channel Education Series',
            description: 'Personalized messaging across preferred channels',
            cost: baseCost,
            reach: 18234,
            reactivations: Math.floor(18234 * 0.08),
            details: {
              subComponents: [
                { channel: 'email', reach: 12000, templates: ['Value Reminder', 'Feature Update', 'Success Stories'] },
                { channel: 'sms', reach: 4000, templates: ['Quick Tips', 'Account Alert', 'Special Access'] },
                { channel: 'push', reach: 8000, templates: ['App Feature', 'Usage Insight', 'Community Update'] },
                { channel: 'inapp', reach: 6000, templates: ['Tutorial', 'Feature Highlight', 'Feedback Request'] }
              ]
            }
          }
        ]
      },
      {
        title: "Promotional Winback",
        totalCost: promoCost,
        totalReach: 18234,
        totalReactivations: Math.floor(18234 * 0.16),
        blocks: [
          {
            type: 'promo',
            title: `${discountPercent}% Off + ${freeMonths} Months Free`,
            description: `Personalized ${discountPercent}% discount with ${freeMonths} free months`,
            cost: promoCost * 0.75,
            reach: 18234,
            reactivations: Math.floor(18234 * 0.12),
            details: {
              discountPercent,
              freeMonths,
              eligibilityCriteria: 'Users with LTV > $400 and tenure > 12 months',
              duration: `${freeMonths * 4} weeks`
            }
          },
          {
            type: 'messaging',
            title: 'Promotional Support Messaging',
            description: 'Educational content to support the promotional offer',
            cost: promoCost * 0.25,
            reach: 18234,
            reactivations: Math.floor(18234 * 0.04),
            details: {
              subComponents: [
                { channel: 'email', reach: 18234, templates: ['Offer Announcement', 'Value Explanation', 'Last Chance'] },
                { channel: 'sms', reach: 12000, templates: ['Offer Reminder', 'Deadline Alert'] },
                { channel: 'push', reach: 15000, templates: ['Offer Available', 'Limited Time'] }
              ]
            }
          }
        ]
      }
    ];
  };

  const campaigns = generatePersonalizedCampaigns(budgetInput);

  const handleViewProfiles = (blockType: string) => {
    setModalSegment(blockType);
    setShowUserModal(true);
  };

  const segmentSummary = {
    totalUsers: 18234,
    avgTenure: 28,
    avgLTV: 485,
    topChannels: [
      { channel: 'Email', preference: 65 },
      { channel: 'Push', preference: 45 },
      { channel: 'SMS', preference: 22 },
      { channel: 'In-App', preference: 33 }
    ],
    riskDistribution: [
      { risk: 'High', count: 7200 },
      { risk: 'Medium', count: 8234 },
      { risk: 'Low', count: 2800 }
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recommended Winback Strategies</CardTitle>
          <p className="text-muted-foreground">
            Configure your budget and ROI targets to generate personalized campaign building blocks. 
            Each strategy is dynamically optimized based on your inputs.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(Number(e.target.value))}
                className="text-lg font-medium"
              />
              <p className="text-xs text-muted-foreground">
                Higher budgets unlock better promotional offers
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roi">Target ROI (%)</Label>
              <Input
                id="roi"
                type="number"
                value={roiTarget}
                onChange={(e) => setRoiTarget(Number(e.target.value))}
                className="text-lg font-medium"
              />
              <p className="text-xs text-muted-foreground">
                Current projected ROI based on $485 avg LTV
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <RadioGroup 
        value={selectedOption?.toString()} 
        onValueChange={(value) => onSelectOption(parseInt(value))}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign, index) => (
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
                    <RadioGroupItem value={index.toString()} id={`campaign-${index}`} />
                    <Label htmlFor={`campaign-${index}`} className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        {index === 0 ? (
                          <MessageSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Gift className="h-5 w-5 text-accent" />
                        )}
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      </div>
                    </Label>
                  </div>
                  <Badge variant={index === 0 ? "secondary" : "default"}>
                    {index === 0 ? "Low Cost" : "High Impact"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Campaign Summary Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{campaign.totalReach.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Reach</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {campaign.totalReactivations.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Reactivations</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">${campaign.totalCost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                  </div>
                </div>

                {/* ROI Calculation */}
                <div className="p-4 bg-gradient-to-r from-success/10 to-transparent border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Projected ROI</span>
                    <span className="text-lg font-bold text-success">
                      {Math.round((campaign.totalReactivations * 485 - campaign.totalCost) / campaign.totalCost * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on $485 average LTV
                  </p>
                </div>

                <Separator />

                {/* Building Blocks */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Campaign Building Blocks:</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfiles(campaign.title);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Profiles
                    </Button>
                  </div>
                  
                  {campaign.blocks.map((block, blockIndex) => (
                    <Card key={blockIndex} className="bg-background border-dashed">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Block Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {block.type === 'promo' ? (
                                <Percent className="w-4 h-4 text-accent" />
                              ) : (
                                <MessageSquare className="w-4 h-4 text-primary" />
                              )}
                              <span className="font-medium text-sm">{block.title}</span>
                            </div>
                            <Badge variant={block.type === 'promo' ? 'default' : 'secondary'}>
                              {block.type === 'promo' ? 'Promotional' : 'Messaging'}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground">{block.description}</p>

                          {/* Block Metrics */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="font-medium">{block.reach.toLocaleString()}</p>
                              <p className="text-muted-foreground">Reach</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-success">{block.reactivations.toLocaleString()}</p>
                              <p className="text-muted-foreground">Reactive</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">${block.cost.toLocaleString()}</p>
                              <p className="text-muted-foreground">Cost</p>
                            </div>
                          </div>

                          {/* Block Details */}
                          {block.type === 'promo' ? (
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount:</span>
                                <span className="font-medium">{block.details.discountPercent}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Free Months:</span>
                                <span className="font-medium">{block.details.freeMonths}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="font-medium">{block.details.duration}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs font-medium">Channel Distribution:</p>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                {block.details.subComponents.map((sub: any, subIndex: number) => (
                                  <div key={subIndex} className="flex items-center space-x-1">
                                    {sub.channel === 'email' && <Mail className="w-3 h-3" />}
                                    {sub.channel === 'sms' && <MessageSquare className="w-3 h-3" />}
                                    {sub.channel === 'push' && <Smartphone className="w-3 h-3" />}
                                    {sub.channel === 'inapp' && <Calendar className="w-3 h-3" />}
                                    <span className="capitalize">{sub.channel}: {sub.reach.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        userProfiles={[]}
        segmentSummary={segmentSummary}
      />
    </div>
  );
};

export default ProposalChoice;