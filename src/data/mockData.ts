// Mock data for the Finny AI Campaign Copilot

export interface ChurnMetric {
  date: string;
  churn_rate: number;
}

export interface Campaign {
  campaign_id: number;
  name: string;
  end_date: string;
}

export interface CompetitorNews {
  date: string;
  headline: string;
  region: string;
}

export interface Incident {
  date: string;
  summary: string;
  resolved: boolean;
}

export interface SegmentEvent {
  user_id: string;
  LTV: number;
  last_active_days: number;
  prefers_sms: boolean;
  prefers_push: boolean;
  prefers_email: boolean;
  channel_stats: {
    email_open: number;
    sms_click: number;
    push_tap: number;
  };
}

export interface FigmaTokens {
  brand_color: string;
  accent_color: string;
  font_head: string;
  font_body: string;
  logo: string;
}

// Generate mock data
const generateMockChurnData = (): ChurnMetric[] => {
  const data: ChurnMetric[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    let churnRate = 4.0; // baseline
    if (i <= 2) {
      churnRate = 6.0; // spike in last 3 days
    } else if (i <= 7) {
      churnRate = 4.5 + Math.random() * 0.5; // slight increase last week
    } else {
      churnRate = 3.8 + Math.random() * 0.4; // normal variation
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      churn_rate: Math.round(churnRate * 100) / 100
    });
  }
  
  return data;
};

const generateMockSegmentData = (): SegmentEvent[] => {
  const data: SegmentEvent[] = [];
  
  for (let i = 0; i < 1000; i++) {
    data.push({
      user_id: `user_${1000 + i}`,
      LTV: Math.round((200 + Math.random() * 800) * 100) / 100,
      last_active_days: Math.floor(Math.random() * 90),
      prefers_sms: Math.random() > 0.7,
      prefers_push: Math.random() > 0.5,
      prefers_email: Math.random() > 0.3,
      channel_stats: {
        email_open: Math.round(Math.random() * 0.4 * 100) / 100,
        sms_click: Math.round(Math.random() * 0.08 * 100) / 100,
        push_tap: Math.round(Math.random() * 0.2 * 100) / 100
      }
    });
  }
  
  return data;
};

export const mockData = {
  churnMetrics: generateMockChurnData(),
  
  campaigns: [
    {
      campaign_id: 101,
      name: "Spring Saver Offer",
      end_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ] as Campaign[],
  
  competitorNews: [
    {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      headline: "BankFast launches 5% cash-back rewards in NYC",
      region: "NY"
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      headline: "CreditUnion+ reduces fees across all accounts",
      region: "CA"
    }
  ] as CompetitorNews[],
  
  incidents: [
    {
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      summary: "Plaid account linking outage affecting 12% of users",
      resolved: true
    },
    {
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      summary: "Mobile app login delays during peak hours",
      resolved: true
    }
  ] as Incident[],
  
  segmentEvents: generateMockSegmentData(),
  
  figmaTokens: {
    brand_color: "#8B5CF6",
    accent_color: "#E879F9", 
    font_head: "Inter",
    font_body: "Inter",
    logo: "/src/assets/finny-logo.png"
  } as FigmaTokens
};

export const hypothesesData = [
  {
    hypothesis: "Spring Saver campaign expiration caused reversion to higher fees",
    contribution: 35,
    confidence: "High",
    evidence: "Campaign ended 3 days ago, churn spike began immediately after"
  },
  {
    hypothesis: "Competitor BankFast's 5% cashback offer is attracting price-sensitive users",
    contribution: 28,
    confidence: "Medium", 
    evidence: "News broke yesterday, affects same demographic in NYC market"
  },
  {
    hypothesis: "Recent Plaid outage damaged trust in account linking reliability",
    contribution: 22,
    confidence: "Medium",
    evidence: "Outage affected 12% of users, timing correlates with churn uptick"
  },
  {
    hypothesis: "Natural seasonal churn increase as users reassess finances post-holidays",
    contribution: 15,
    confidence: "Low",
    evidence: "Historical pattern shows slight Q1 increases, but this spike is unusual"
  }
];

export const proposalOptions = [
  {
    option: "Messaging-Only Winback",
    reach: 18234,
    expected_reactivations: 1460,
    cost: 2500,
    description: "Educational messaging about product value and improved reliability"
  },
  {
    option: "Promotional Winback",
    reach: 18234,
    expected_reactivations: 2920,
    cost: 25000,
    description: "2-month fee waiver + educational messaging combo"
  }
];