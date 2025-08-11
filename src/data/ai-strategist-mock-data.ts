export const anomalyAlerts = [
  { id: 'a1', metric: 'churn_rate', label: 'Churn rate', segment: 'highLtv', baseline: 6.1, current: 8.2, change: +2.1, sparkline: [6.1, 6.3, 6.4, 8.2], severity: 'high' as const },
  { id: 'a2', metric: 'push_ctr', label: 'Push engagement (CTR)', segment: 'nyc', baseline: 18.0, current: 22.0, change: +4.0, sparkline: [18.0, 18.8, 20.4, 22.0], severity: 'medium' as const },
  { id: 'a3', metric: 'retention_30d', label: '30-day retention', segment: 'newUsers30d', baseline: 41, current: 37, change: -4, sparkline: [41, 40, 39, 37], severity: 'medium' as const }
];

export const channelLiftTable = {
  email: 0.8,    // +0.8pp
  push: 1.2,     // +1.2pp
  sms: 2.1,      // +2.1pp
  inapp: 1.0,    // +1.0pp
  discount: 4.0  // +4.0pp (applied only if budget allows)
} as const;

export const eligibleUsersBySegment = {
  highLtv: 12000,
  newUsers30d: 18000,
  nyc: 9000
};

export const activeCampaigns = [
  { id: 'c1', name: 'Card Upgrade Nudge', start: '2025-08-14', end: '2025-08-18', segments: ['highLtv'], dailyTouches: 1, channels: ['email'] },
  { id: 'c2', name: 'Deposit Reminder', start: '2025-08-15', end: '2025-08-22', segments: ['newUsers30d'], dailyTouches: 1, channels: ['push'] },
  { id: 'c3', name: 'NYC Promo Week', start: '2025-08-16', end: '2025-08-24', segments: ['nyc'], dailyTouches: 2, channels: ['push','sms'] }
];

export const pastResults = [
  { combo: 'push+email', segment: 'newUsers30d', lift_pct: 1.8 },
  { combo: 'push+discount', segment: 'highLtv', lift_pct: 5.0 },
  { combo: 'sms', segment: 'nyc', lift_pct: 2.0 }
];

// Default “metric → goal direction” mapping
export const metricGoals = {
  churn_rate: 'down',
  push_ctr: 'up',
  retention_30d: 'up',
  conversion_rate: 'up',
  aov: 'up',
  dau: 'up',
  engagement_rate: 'up'
} as const;

// Diagnose hypotheses map
export const diagnosticHypotheses: Record<string, { title: string; evidence: string }[]> = {
  'churn_rate|highLtv': [
    { title: 'Promo window expired', evidence: 'Offer exposure down −27% WoW.' },
    { title: 'Push opt-in down', evidence: 'Push opt-in −4.2pp MoM.' },
    { title: 'Service latency spike', evidence: 'Checkout p95 latency +180ms in last 7 days.' }
  ],
  'push_ctr|nyc': [
    { title: 'Localized content test', evidence: 'Geo-targeted headlines CTR +3.1pp vs control.' },
    { title: 'Send-time shift to commute hours', evidence: 'Morning sends CTR +2.4pp over midday.' },
    { title: 'In-app inbox cleanup', evidence: 'Unread inbox items −18% WoW.' }
  ],
  'retention_30d|newUsers30d': [
    { title: 'Onboarding step-3 drop (ID verify)', evidence: 'Step-3 completion −6.7pp vs prior month.' },
    { title: 'Value prop mismatch (referrals)', evidence: 'Referred cohort D30 −4.9pp vs organic.' },
    { title: 'Notification fatigue in week 1', evidence: 'Avg touches 4.1/day vs cap 2/day.' }
  ]
};

export type Severity = 'low'|'medium'|'high';
export type ChannelType = keyof typeof channelLiftTable;