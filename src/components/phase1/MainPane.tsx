import React from 'react';
import { RootCauseCard } from './RootCauseCard';
import { CampaignCard } from './CampaignCard';
import { AssetCard } from './AssetCard';
import type { RootCause, Campaign, Asset } from './ChatFirstCopilot';

interface MainPaneProps {
  currentStep: 'initial' | 'analyzing' | 'proposal' | 'assets';
  rootCauses: RootCause[];
  campaign: Campaign;
  assets: Asset[];
  onOpenEvidence: (data: RootCause) => void;
  onOpenAudiencePreview: () => void;
  onUpdateSliders: (field: 'offerAmount' | 'upliftPercent', value: number) => void;
  onUpdateAsset: (assetId: string, content: string, subject?: string) => void;
  onToggleAssetEdit: (assetId: string) => void;
}

export const MainPane: React.FC<MainPaneProps> = ({
  currentStep,
  rootCauses,
  campaign,
  assets,
  onOpenEvidence,
  onOpenAudiencePreview,
  onUpdateSliders,
  onUpdateAsset,
  onToggleAssetEdit
}) => {
  const renderContent = () => {
    switch (currentStep) {
      case 'initial':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Ready to analyze your metrics
              </h2>
              <p className="text-muted-foreground">
                Start a conversation with Winnie to begin
              </p>
            </div>
          </div>
        );

      case 'analyzing':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold mb-4">Key Issues Identified</h2>
              <div className="grid gap-4">
                {rootCauses.map((cause) => (
                  <RootCauseCard
                    key={cause.id}
                    data={cause}
                    onSeeDetails={() => onOpenEvidence(cause)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'proposal':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold mb-4">Campaign Proposal</h2>
              <CampaignCard
                campaign={campaign}
                onOpenAudiencePreview={onOpenAudiencePreview}
                onUpdateSliders={onUpdateSliders}
              />
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold mb-4">Campaign Assets</h2>
              <div className="grid gap-4">
                {assets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onUpdateContent={onUpdateAsset}
                    onToggleEdit={onToggleAssetEdit}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id="mainPane" className="flex-1 p-6 bg-background overflow-auto">
      {renderContent()}
    </div>
  );
};