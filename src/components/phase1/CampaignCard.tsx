import React from 'react';
import { Users, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { Campaign } from './ChatFirstCopilot';

interface CampaignCardProps {
  campaign: Campaign;
  onOpenAudiencePreview: () => void;
  onUpdateSliders: (field: 'offerAmount' | 'upliftPercent', value: number) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onOpenAudiencePreview,
  onUpdateSliders
}) => {
  return (
    <Card id="campaignCard" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {campaign.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Target Audience */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Target audience</span>
            <span className="font-medium">{campaign.targetAudience.toLocaleString()}</span>
          </div>
          <Button
            id="previewBtn"
            variant="outline"
            size="sm"
            onClick={onOpenAudiencePreview}
          >
            View sample users
          </Button>
        </div>

        {/* ROI Sandbox */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium">ROI Sandbox</h4>
          
          {/* Offer Amount Slider */}
          <div className="space-y-2">
            <Label htmlFor="sliderOffer" className="text-sm">
              Offer Amount: ${campaign.offerAmount}
            </Label>
            <Slider
              id="sliderOffer"
              min={1}
              max={30}
              step={1}
              value={[campaign.offerAmount]}
              onValueChange={([value]) => onUpdateSliders('offerAmount', value)}
              className="w-full"
            />
          </div>

          {/* Uplift Percent Slider */}
          <div className="space-y-2">
            <Label htmlFor="sliderUplift" className="text-sm">
              Expected Uplift: {campaign.upliftPercent}%
            </Label>
            <Slider
              id="sliderUplift"
              min={1}
              max={20}
              step={1}
              value={[campaign.upliftPercent]}
              onValueChange={([value]) => onUpdateSliders('upliftPercent', value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated Cost</span>
            </div>
            <div className="text-lg font-semibold">
              ${campaign.estimatedCost.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">ROI</span>
            </div>
            <div className={`text-lg font-semibold ${
              campaign.estimatedROI > 0 ? 'text-green-600' : 'text-destructive'
            }`}>
              {campaign.estimatedROI > 0 ? '+' : ''}{campaign.estimatedROI}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};