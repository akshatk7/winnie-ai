// Action Library for Universal Campaign Builder
export interface ActionVariant {
  id: string;
  name: string;
  description: string;
  cost: number;
  reach: number;
  expectedImpact: number; // reactivation rate percentage
  personalizedValue?: string; // e.g., "10%", "$25", "2 months"
}

export interface CampaignAction {
  id: string;
  type: 'messaging' | 'promotional';
  category: string;
  name: string;
  description: string;
  icon: string;
  variants: ActionVariant[];
  constraints?: string[];
  minBudget?: number;
}

export interface CampaignConstraint {
  id: string;
  type: 'channel' | 'promotional' | 'frequency' | 'budget';
  name: string;
  description: string;
  rule: string;
  enabled: boolean;
}

export interface UserActionAssignment {
  userId: string;
  actions: string[]; // action variant IDs
  reasoning: string;
  estimatedValue: number;
  channels: string[];
  promoValue?: string;
}

export const messagingActions: CampaignAction[] = [
  {
    id: 'email_templates',
    type: 'messaging',
    category: 'Email',
    name: 'Email Templates',
    description: 'Personalized email campaigns',
    icon: 'Mail',
    variants: [
      {
        id: 'email_welcome_back',
        name: 'Welcome Back Series',
        description: 'Multi-touch welcome back email sequence',
        cost: 0.15,
        reach: 12000,
        expectedImpact: 8
      },
      {
        id: 'email_feature_update',
        name: 'Feature Updates',
        description: 'Highlight new features and improvements',
        cost: 0.12,
        reach: 12000,
        expectedImpact: 6
      },
      {
        id: 'email_success_stories',
        name: 'Success Stories',
        description: 'Customer success and value stories',
        cost: 0.18,
        reach: 12000,
        expectedImpact: 10
      }
    ]
  },
  {
    id: 'sms_templates',
    type: 'messaging',
    category: 'SMS',
    name: 'SMS Templates',
    description: 'Direct SMS messaging campaigns',
    icon: 'Smartphone',
    variants: [
      {
        id: 'sms_quick_tips',
        name: 'Quick Tips',
        description: 'Short valuable financial tips',
        cost: 0.05,
        reach: 4000,
        expectedImpact: 5
      },
      {
        id: 'sms_alerts',
        name: 'Account Alerts',
        description: 'Important account notifications',
        cost: 0.04,
        reach: 4000,
        expectedImpact: 3
      },
      {
        id: 'sms_special_access',
        name: 'Special Access',
        description: 'Exclusive feature access notifications',
        cost: 0.06,
        reach: 4000,
        expectedImpact: 7
      }
    ]
  },
  {
    id: 'push_notifications',
    type: 'messaging',
    category: 'Push',
    name: 'Push Notifications',
    description: 'In-app push notifications',
    icon: 'Bell',
    variants: [
      {
        id: 'push_feature_highlight',
        name: 'Feature Highlights',
        description: 'Showcase key app features',
        cost: 0.02,
        reach: 8000,
        expectedImpact: 4
      },
      {
        id: 'push_usage_insights',
        name: 'Usage Insights',
        description: 'Personalized usage analytics',
        cost: 0.03,
        reach: 8000,
        expectedImpact: 6
      },
      {
        id: 'push_community',
        name: 'Community Updates',
        description: 'Community achievements and milestones',
        cost: 0.02,
        reach: 8000,
        expectedImpact: 3
      }
    ]
  },
  {
    id: 'inapp_messages',
    type: 'messaging',
    category: 'In-App',
    name: 'In-App Messages',
    description: 'Contextual in-app messaging',
    icon: 'MessageSquare',
    variants: [
      {
        id: 'inapp_tutorial',
        name: 'Interactive Tutorials',
        description: 'Guided feature tutorials',
        cost: 0.25,
        reach: 6000,
        expectedImpact: 12
      },
      {
        id: 'inapp_feedback',
        name: 'Feedback Requests',
        description: 'Collect user feedback and suggestions',
        cost: 0.10,
        reach: 6000,
        expectedImpact: 5
      },
      {
        id: 'inapp_achievements',
        name: 'Achievement Notifications',
        description: 'Celebrate user milestones',
        cost: 0.08,
        reach: 6000,
        expectedImpact: 8
      }
    ]
  }
];

export const promotionalActions: CampaignAction[] = [
  {
    id: 'discount_offers',
    type: 'promotional',
    category: 'Discounts',
    name: 'Discount Offers',
    description: 'Percentage-based discounts',
    icon: 'Percent',
    minBudget: 5000,
    variants: [
      {
        id: 'discount_10',
        name: '10% Off (High Engagement)',
        description: '10% discount on fees for 3 months - for highly engaged users',
        cost: 2.50,
        reach: 3200,
        expectedImpact: 12,
        personalizedValue: '10%'
      },
      {
        id: 'discount_15',
        name: '15% Off (Regular Users)',
        description: '15% discount on fees for 3 months - for regular users',
        cost: 3.75,
        reach: 4800,
        expectedImpact: 15,
        personalizedValue: '15%'
      },
      {
        id: 'discount_20',
        name: '20% Off (At-Risk Users)',
        description: '20% discount on fees for 3 months - for at-risk users',
        cost: 5.00,
        reach: 5600,
        expectedImpact: 18,
        personalizedValue: '20%'
      },
      {
        id: 'discount_25',
        name: '25% Off (Moderate Risk)',
        description: '25% discount on fees for 2 months - for moderate churn risk',
        cost: 6.25,
        reach: 2900,
        expectedImpact: 22,
        personalizedValue: '25%'
      },
      {
        id: 'discount_30',
        name: '30% Off (High Risk)',
        description: '30% discount on fees for 2 months - for high churn risk',
        cost: 7.50,
        reach: 2100,
        expectedImpact: 25,
        personalizedValue: '30%'
      },
      {
        id: 'discount_35',
        name: '35% Off (Premium Recovery)',
        description: '35% discount on fees for 2 months - for premium users at risk',
        cost: 8.75,
        reach: 1500,
        expectedImpact: 28,
        personalizedValue: '35%'
      },
      {
        id: 'discount_40',
        name: '40% Off (Critical Retention)',
        description: '40% discount on fees for 1 month - for critical retention cases',
        cost: 10.00,
        reach: 1200,
        expectedImpact: 32,
        personalizedValue: '40%'
      },
      {
        id: 'discount_45',
        name: '45% Off (Last Chance)',
        description: '45% discount on fees for 1 month - last chance offer',
        cost: 11.25,
        reach: 800,
        expectedImpact: 36,
        personalizedValue: '45%'
      },
      {
        id: 'discount_50',
        name: '50% Off (Win-Back)',
        description: '50% discount on fees for 1 month - aggressive win-back',
        cost: 12.50,
        reach: 600,
        expectedImpact: 40,
        personalizedValue: '50%'
      }
    ],
    constraints: ['max_one_discount_per_user']
  },
  {
    id: 'free_months',
    type: 'promotional',
    category: 'Free Months',
    name: 'Free Months',
    description: 'Complimentary service periods',
    icon: 'Calendar',
    minBudget: 10000,
    variants: [
      {
        id: 'free_1_month',
        name: '1 Month Free',
        description: '1 month of free service',
        cost: 15.00,
        reach: 12000,
        expectedImpact: 20,
        personalizedValue: '1 month'
      },
      {
        id: 'free_2_months',
        name: '2 Months Free',
        description: '2 months of free service',
        cost: 30.00,
        reach: 12000,
        expectedImpact: 30,
        personalizedValue: '2 months'
      },
      {
        id: 'free_3_months',
        name: '3 Months Free',
        description: '3 months of free service',
        cost: 45.00,
        reach: 12000,
        expectedImpact: 40,
        personalizedValue: '3 months'
      }
    ],
    constraints: ['max_one_free_period_per_user']
  },
  {
    id: 'cashback_offers',
    type: 'promotional',
    category: 'Cashback',
    name: 'Cashback Offers',
    description: 'Direct cash incentives',
    icon: 'DollarSign',
    minBudget: 15000,
    variants: [
      {
        id: 'cashback_25',
        name: '$25 Cashback',
        description: '$25 cash bonus for reactivation',
        cost: 25.00,
        reach: 12000,
        expectedImpact: 22,
        personalizedValue: '$25'
      },
      {
        id: 'cashback_50',
        name: '$50 Cashback',
        description: '$50 cash bonus for reactivation',
        cost: 50.00,
        reach: 12000,
        expectedImpact: 35,
        personalizedValue: '$50'
      },
      {
        id: 'cashback_100',
        name: '$100 Cashback',
        description: '$100 cash bonus for high-value users',
        cost: 100.00,
        reach: 5000,
        expectedImpact: 45,
        personalizedValue: '$100'
      }
    ],
    constraints: ['max_one_cashback_per_user']
  },
  {
    id: 'fee_waivers',
    type: 'promotional',
    category: 'Fee Waivers',
    name: 'Fee Waivers',
    description: 'Waive specific fees',
    icon: 'Shield',
    minBudget: 3000,
    variants: [
      {
        id: 'waive_transaction',
        name: 'Transaction Fee Waiver',
        description: 'Waive transaction fees for 6 months',
        cost: 8.00,
        reach: 12000,
        expectedImpact: 15,
        personalizedValue: 'Transaction fees'
      },
      {
        id: 'waive_monthly',
        name: 'Monthly Fee Waiver',
        description: 'Waive monthly service fee for 3 months',
        cost: 12.00,
        reach: 12000,
        expectedImpact: 20,
        personalizedValue: 'Monthly fees'
      },
      {
        id: 'waive_annual',
        name: 'Annual Fee Waiver',
        description: 'Waive annual membership fee',
        cost: 35.00,
        reach: 8000,
        expectedImpact: 30,
        personalizedValue: 'Annual fee'
      }
    ],
    constraints: ['max_one_waiver_type_per_user']
  }
];

export const defaultConstraints: CampaignConstraint[] = [
  {
    id: 'max_3_channels',
    type: 'channel',
    name: 'Channel Limit',
    description: 'Maximum 3 channels per user',
    rule: 'max_channels_per_user <= 3',
    enabled: true
  },
  {
    id: 'no_conflicting_promos',
    type: 'promotional',
    name: 'No Conflicting Promotions',
    description: 'Users cannot receive conflicting promotional offers',
    rule: 'max_one_discount_per_user AND max_one_free_period_per_user AND max_one_cashback_per_user',
    enabled: true
  },
  {
    id: 'max_50_percent_discount',
    type: 'promotional',
    name: 'Maximum Discount Limit',
    description: 'No user gets more than 50% discount',
    rule: 'discount_percentage <= 50',
    enabled: true
  },
  {
    id: 'frequency_limit',
    type: 'frequency',
    name: 'Frequency Limit',
    description: 'Maximum 5 actions per user',
    rule: 'total_actions_per_user <= 5',
    enabled: true
  },
  {
    id: 'budget_allocation',
    type: 'budget',
    name: 'Budget Allocation',
    description: 'Total campaign cost cannot exceed budget',
    rule: 'total_cost <= available_budget',
    enabled: true
  }
];

export const campaignPresets = [
  {
    id: 'conservative_messaging',
    name: 'Conservative Messaging',
    description: 'Messaging-only campaign with broad reach',
    budget: 2500,
    actions: ['email_welcome_back', 'push_feature_highlight', 'inapp_tutorial'],
    constraints: ['max_3_channels', 'frequency_limit']
  },
  {
    id: 'balanced_engagement',
    name: 'Balanced Engagement',
    description: 'Light promotions with comprehensive messaging',
    budget: 10000,
    actions: ['email_welcome_back', 'sms_quick_tips', 'discount_10', 'waive_transaction'],
    constraints: ['max_3_channels', 'no_conflicting_promos', 'frequency_limit']
  },
  {
    id: 'aggressive_winback',
    name: 'Aggressive Winback',
    description: 'High-value promotions with multi-channel support',
    budget: 25000,
    actions: ['email_welcome_back', 'sms_quick_tips', 'push_feature_highlight', 'discount_30', 'cashback_50'],
    constraints: ['max_3_channels', 'no_conflicting_promos', 'max_50_percent_discount', 'frequency_limit']
  }
];