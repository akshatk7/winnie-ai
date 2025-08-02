import React, { useState, useEffect } from 'react';
import { ChatPane } from './ChatPane';
import { MainPane } from './MainPane';
import { EvidenceDrawer } from './EvidenceDrawer';
import { AudiencePreviewModal } from './AudiencePreviewModal';
import { StickyHeader } from './StickyHeader';

export interface ChatMessage {
  id: string;
  role: 'user' | 'winnie';
  content: string;
  timestamp: Date;
}

export interface RootCause {
  id: string;
  title: string;
  description: string;
  impact: string;
  metric: string;
  definition: string;
  segmentCount: number;
  totalCount: number;
  sqlQuery: string;
}

export interface Campaign {
  id: string;
  title: string;
  targetAudience: number;
  estimatedCost: number;
  estimatedROI: number;
  offerAmount: number;
  upliftPercent: number;
}

export interface Asset {
  id: string;
  type: 'email' | 'push' | 'sms';
  subject?: string;
  content: string;
  editable: boolean;
}

const ChatFirstCopilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<'initial' | 'analyzing' | 'proposal' | 'assets'>('initial');
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [evidenceDrawer, setEvidenceDrawer] = useState<{ open: boolean; data: RootCause | null }>({
    open: false,
    data: null
  });
  const [audienceModal, setAudienceModal] = useState(false);
  const [progressBar, setProgressBar] = useState(false);

  const [rootCauses] = useState<RootCause[]>([
    {
      id: 'churn-7day',
      title: 'Churn increased 23% last 7 days',
      description: 'Users are churning at higher rates, particularly in the mobile segment',
      impact: 'High',
      metric: 'Churn 7-day delta',
      definition: 'Churn = no app_open for 30 days',
      segmentCount: 1234,
      totalCount: 20000,
      sqlQuery: 'SELECT COUNT(*) FROM users WHERE last_active < NOW() - INTERVAL 30 DAY;'
    },
    {
      id: 'engagement-drop',
      title: 'Daily engagement down 15%',
      description: 'Session duration and frequency have declined across all cohorts',
      impact: 'Medium',
      metric: 'Engagement 7-day delta',
      definition: 'Engagement = sessions per day + avg session duration',
      segmentCount: 856,
      totalCount: 15000,
      sqlQuery: 'SELECT AVG(session_duration) FROM sessions WHERE created_at > NOW() - INTERVAL 7 DAY;'
    }
  ]);

  const [campaign, setCampaign] = useState<Campaign>({
    id: 'retention-campaign',
    title: 'Win-back Campaign for At-Risk Users',
    targetAudience: 18234,
    estimatedCost: 2340,
    estimatedROI: 156,
    offerAmount: 10,
    upliftPercent: 5
  });

  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 'email-1',
      type: 'email',
      subject: 'We miss you! Here\'s 20% off your next order',
      content: 'Hi there! We noticed you haven\'t been active lately. Come back and enjoy 20% off your next purchase.',
      editable: false
    },
    {
      id: 'push-1',
      type: 'push',
      content: 'Don\'t miss out! Your 20% discount expires soon 🔥',
      editable: false
    },
    {
      id: 'sms-1',
      type: 'sms',
      content: 'Hey! Your exclusive 20% off code expires in 24hrs. Use: COMEBACK20',
      editable: false
    }
  ]);

  const addMessage = (content: string, role: 'user' | 'winnie' = 'winnie') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const showTypingAndProceed = (message: string, nextStep: typeof currentStep, delay = 1000) => {
    setTypingIndicator(true);
    setTimeout(() => {
      setTypingIndicator(false);
      addMessage(message);
      setCurrentStep(nextStep);
    }, delay);
  };

  const handleUserMessage = (content: string) => {
    addMessage(content, 'user');
    
    if (currentStep === 'initial') {
      showTypingAndProceed(
        "Sure! Let me check your churn metrics and identify the key issues...", 
        'analyzing'
      );
    } else if (currentStep === 'analyzing') {
      showTypingAndProceed(
        "Great insights! Let me generate a targeted campaign proposal for you...", 
        'proposal'
      );
    } else if (currentStep === 'proposal') {
      setProgressBar(true);
      setTimeout(() => setProgressBar(false), 800);
      showTypingAndProceed(
        "Perfect! Now let me create the campaign assets for you...", 
        'assets'
      );
    }
  };

  const updateSliders = (field: 'offerAmount' | 'upliftPercent', value: number) => {
    setCampaign(prev => {
      const updated = { ...prev, [field]: value };
      // Stub ROI formula: uplift % × 2 - offer $
      updated.estimatedROI = updated.upliftPercent * 2 - updated.offerAmount;
      updated.estimatedCost = updated.targetAudience * updated.offerAmount * 0.01; // rough cost calc
      return updated;
    });
  };

  const updateAssetContent = (assetId: string, content: string, subject?: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, content, ...(subject && { subject }) }
        : asset
    ));
  };

  const toggleAssetEdit = (assetId: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, editable: !asset.editable }
        : asset
    ));
  };

  useEffect(() => {
    addMessage("Hi! I'm Winnie, your campaign copilot. I can help you analyze your metrics and create targeted campaigns. What would you like to work on today?");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StickyHeader />
      
      {progressBar && (
        <div id="progBar" className="w-full h-1 bg-primary animate-pulse" />
      )}
      
      <div className="flex flex-1">
        <ChatPane 
          messages={messages}
          typingIndicator={typingIndicator}
          onSendMessage={handleUserMessage}
        />
        
        <MainPane
          currentStep={currentStep}
          rootCauses={rootCauses}
          campaign={campaign}
          assets={assets}
          onOpenEvidence={(data) => setEvidenceDrawer({ open: true, data })}
          onOpenAudiencePreview={() => setAudienceModal(true)}
          onUpdateSliders={updateSliders}
          onUpdateAsset={updateAssetContent}
          onToggleAssetEdit={toggleAssetEdit}
        />
      </div>

      <EvidenceDrawer
        open={evidenceDrawer.open}
        data={evidenceDrawer.data}
        onClose={() => setEvidenceDrawer({ open: false, data: null })}
      />

      <AudiencePreviewModal
        open={audienceModal}
        onClose={() => setAudienceModal(false)}
        targetCount={campaign.targetAudience}
      />
    </div>
  );
};

export default ChatFirstCopilot;