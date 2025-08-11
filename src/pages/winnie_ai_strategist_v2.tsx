import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Bell, Brain, Check, Download, ShieldCheck, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { anomalyAlerts, channelLiftTable, eligibleUsersBySegment, activeCampaigns, pastResults, metricGoals, diagnosticHypotheses } from "@/data/ai-strategist-mock-data";
import { overlaps, fatigueScore, projectedImprovement } from "@/lib/ai-strategist-utils";

// Types
interface MetricPreference {
  key: string;
  label: string;
}

interface AlertItem {
  id: string;
  metric: string;
  segment: string;
  title: string;
  description: string;
  deltaPct: number;
  direction: "up" | "down";
  severity: "low" | "medium" | "high";
  chart: number[]; // mock sparkline data
  timestamp: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AudienceSegmentBreakdown {
  name: string;
  count: number;
}

interface GovernanceResult {
  collisionsAvoided: { campaign: string; reason: string; impactedUsers: number }[];
  fatigueExcludedUsers: number;
  priorityRuleApplied: string[];
  finalAudienceCount: number;
}

interface CampaignPlan {
  name: string;
  targetMetric: string;
  audience: AudienceSegmentBreakdown[];
  channels: { name: string; reason: string }[];
  incentive?: { type: string; value: string; rationale: string };
  projectedLiftPct: number;
  rationale: string;
  governance: GovernanceResult;
}

// Constants
const ALL_METRICS: MetricPreference[] = [
  { key: "dau", label: "Daily Active Users (DAU)" },
  { key: "churn", label: "Churn Rate" },
  { key: "conversion", label: "Conversion Rate" },
  { key: "retention", label: "Retention" },
  { key: "aov", label: "Average Order Value (AOV)" },
  { key: "engagement", label: "Engagement Rate" },
];

const LS_KEYS = {
  metrics: "winnie_v2_metrics",
};

// Helpers
const formatPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

type Channel = 'email'|'push'|'sms'|'inapp'|'discount';

function mapAlertsForUI() {
  const nowIso = new Date().toISOString();
  return anomalyAlerts.map(a => ({
    id: a.id,
    metric: a.label,
    segment: a.segment,
    title: `${a.label} (${a.segment})`,
    description: `${a.label}: baseline ${a.baseline}${a.label.includes('%') ? '%' : ''}, now ${a.current}${a.label.includes('%') ? '%' : ''}.` ,
    deltaPct: a.change,
    direction: (a.change >= 0 ? 'up' : 'down') as 'up'|'down',
    severity: a.severity,
    chart: a.sparkline,
    timestamp: nowIso,
  }));
}

function getHypotheses(metric: string, segment: string) {
  const key = `${metric}|${segment}`;
  const m = diagnosticHypotheses[key] || [
    { title: 'Behavioral shift', evidence: 'Recent usage pattern change detected.' },
    { title: 'Seasonality', evidence: 'Metric shows expected seasonal variance.' },
    { title: 'Experiment contamination', evidence: 'Overlapping tests may affect outcome.' }
  ];
  return m.slice(0,3);
}

function defaultChannelsForMetric(metricCode: string): Channel[] {
  switch (metricCode) {
    case 'churn_rate':
      return ['push','email','discount'];
    case 'push_ctr':
      return ['push','inapp'];
    case 'retention_30d':
      return ['email','push','inapp'];
    default:
      return ['push','email'];
  }
}

function toAudienceQuery(segment: string): string {
  if (segment === 'highLtv') return 'traits.highLtv == true AND last_active_days > 7';
  if (segment === 'newUsers30d') return 'traits.signup_days <= 30';
  if (segment === 'nyc') return "traits.city == 'NYC'";
  return `traits.${segment} == true`;
}

function buildBrazePlanJson(opts: {
  name: string;
  priority: number;
  targetMetric: string; // code
  segment: string;
  channels: Channel[];
  expectedImprovementPct: number;
}): any {
  const channels = opts.channels.map((c) => ({ type: c, ...(c === 'push' ? { window: '09:00-20:00' } : {}) }));
  return {
    name: opts.name,
    priority: opts.priority,
    target_metric: opts.targetMetric,
    audience_query: toAudienceQuery(opts.segment),
    channels,
    experiment: { holdout_pct: 10, notes: 'RL policy vs status quo' },
    exclusions: ['recent_opt_out', 'credit_risk_block'],
    expected_improvement_pct: Number(opts.expectedImprovementPct.toFixed(1))
  };
}

// Additional helpers
function brazeCsv(rows: any[]) {
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  return csv;
}

function makePlanFromContext(context: { intent: string; cohorts: string[]; channels: string[]; budget?: string; includeIncentive?: boolean; }): CampaignPlan {
  const cohorts = context.cohorts.length ? context.cohorts : ['highLtv'];
  const audience = cohorts.map((seg) => ({ name: seg, count: eligibleUsersBySegment[seg as keyof typeof eligibleUsersBySegment] ?? 8000 }));
  const eligibleMin = audience.reduce((m, a) => Math.min(m, a.count), Infinity);
  const primarySeg = cohorts[0];

  const intent = context.intent.toLowerCase();
  const metricCode = /push|ctr|engagement/.test(intent) && cohorts.includes('nyc')
    ? 'push_ctr'
    : /onboarding|retention|d30/.test(intent)
    ? 'retention_30d'
    : 'churn_rate';

  const chosenChannels = (context.channels.length ? context.channels : defaultChannelsForMetric(metricCode)) as Channel[];
  const discountAllowed = Boolean(context.includeIncentive || context.budget);
  const expectedImprovement = projectedImprovement(chosenChannels, channelLiftTable as any, discountAllowed);

  const today = new Date();
  const start = today.toISOString().slice(0,10);
  const end = new Date(today.getTime() + 7*24*60*60*1000).toISOString().slice(0,10);
  const colliders = activeCampaigns.filter(c => overlaps(start, end, c.start, c.end) && c.segments.some(s => cohorts.includes(s)));

  const collisionsAvoided = colliders.map(c => {
    const overlapSegs = c.segments.filter(s => cohorts.includes(s));
    const impacted = overlapSegs.reduce((n, s) => n + (eligibleUsersBySegment[s as keyof typeof eligibleUsersBySegment] ?? 0), 0);
    return { campaign: c.name, reason: `Overlap on ${overlapSegs.join(', ')}`, impactedUsers: impacted };
  });

  const finalAudienceCount = Number((eligibleMin === Infinity ? 0 : eligibleMin).toFixed(0));

  const hypotheses = getHypotheses(metricCode, primarySeg);
  const rationaleBullets = [
    hypotheses[0]?.title && `${hypotheses[0].title} — ${hypotheses[0].evidence}`,
    hypotheses[1]?.title && `${hypotheses[1].title} — ${hypotheses[1].evidence}`,
    hypotheses[2]?.title && `${hypotheses[2].title} — ${hypotheses[2].evidence}`,
  ].filter(Boolean) as string[];

  const channelReasons: Record<string,string> = {
    push: 'High historical CTR for mobile-centric segments',
    email: 'Richer content and tips',
    sms: 'Urgent nudge with short copy',
    inapp: 'Moment-of-need guidance',
    discount: 'Selective incentive for ROI-positive cohorts'
  };

  const name = metricCode === 'churn_rate' ? `Churn Save – ${primarySeg}`
    : metricCode === 'retention_30d' ? `D30 Retention – ${primarySeg}`
    : `Push CTR – ${primarySeg}`;

  return {
    name,
    targetMetric: metricCode,
    audience,
    channels: chosenChannels.map((c) => ({ name: c, reason: channelReasons[c] })),
    incentive: discountAllowed && chosenChannels.includes('discount') ? { type: 'credit', value: '$5', rationale: 'ROI-positive for high-LTV only' } : undefined,
    projectedLiftPct: expectedImprovement,
    rationale: rationaleBullets.slice(0,1).join(' ') || 'Data-driven channel mix based on recent performance.',
    governance: {
      collisionsAvoided,
      fatigueExcludedUsers: 0,
      priorityRuleApplied: [metricCode === 'churn_rate' ? 'churn-prevention > upsell' : 'engagement > upsell'],
      finalAudienceCount,
    }
  };
}

function exportBrazeData(plan: CampaignPlan, format: 'csv'|'json') {
  const segment = plan.audience[0]?.name || 'highLtv';
  const metricCode = plan.targetMetric.includes('churn') ? 'churn_rate' : plan.targetMetric.includes('retention') ? 'retention_30d' : plan.targetMetric.includes('push') ? 'push_ctr' : 'engagement_rate';
  const doc = buildBrazePlanJson({
    name: plan.name,
    priority: 9,
    targetMetric: metricCode,
    segment,
    channels: plan.channels.map(c => c.name as Channel),
    expectedImprovementPct: plan.projectedLiftPct
  });
  if (format === 'json') {
    return new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  }
  const rows = Array.from({ length: Math.min(200, plan.governance.finalAudienceCount || 100) }).map((_, i) => ({
    external_user_id: `user_${(i+1).toString().padStart(5,'0')}`,
    send_channel: plan.channels[0]?.name || 'push',
    campaign_name: plan.name,
    segment
  }));
  return new Blob([brazeCsv(rows)], { type: 'text/csv' });
}

// Component
const WinnieAIStrategistV2: React.FC = () => {
  const { toast } = useToast();

  const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.metrics);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [alerts, setAlerts] = React.useState<AlertItem[]>([]);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = React.useState("");
  const [sessionContext, setSessionContext] = React.useState<{ cohorts: string[]; channels: string[]; budget?: string; intent: string; includeIncentive?: boolean }>({ cohorts: [], channels: [], intent: "" });
  const [plan, setPlan] = React.useState<CampaignPlan | null>(null);
  const [approved, setApproved] = React.useState<boolean>(false);
  const [stage, setStage] = React.useState<'idle'|'diagnose'|'design'|'govern'|'summarize'>('idle');
  const [selectedAlertId, setSelectedAlertId] = React.useState<string | null>(null);
  const [selectedMetricCode, setSelectedMetricCode] = React.useState<string | null>(null);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [exportJson, setExportJson] = React.useState<string>("");
  const [designAsked, setDesignAsked] = React.useState(false);
  const [whyBullets, setWhyBullets] = React.useState<string[]>([]);

  React.useEffect(() => {
    document.title = "Winnie AI Strategist v2 | Governance & Collision Avoidance";
    setAlerts(mapAlertsForUI());
  }, []);

  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.metrics, JSON.stringify(selectedMetrics));
  }, [selectedMetrics]);

  const sendAssistant = (content: string) =>
    setChatMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content, timestamp: Date.now() }]);
  const sendUser = (content: string) => setChatMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content, timestamp: Date.now() }]);

  function startReactiveSession(prefill?: string) {
    setPlan(null);
    setApproved(false);
    const msg = prefill || "I want to improve onboarding completion.";
    sendUser(msg);
    setSessionContext({ cohorts: [], channels: [], intent: msg.toLowerCase() });
    setTimeout(() => {
      sendAssistant(
        "Great — to tailor recommendations: 1) Which cohorts should we focus on? (e.g., users signed up in last 30 days) 2) What channels should we consider? (email, push, SMS, in-app) 3) Any budget constraints for incentives?"
      );
    }, 150);
  }

  function handleInvestigateAlert(a: AlertItem) {
    const prefill = `I want to address ${a.metric.toLowerCase()} for ${a.segment.replace(/-/g, " ")}.`;
    startReactiveSession(prefill);
  }

  function deriveCohortsFromText(t: string): string[] {
    const out: string[] = [];
    if (/churn|save|lapse|win[- ]?back/i.test(t)) out.push('highLtv');
    if (/onboarding|verify|week\s*1|first\s*week|completion|retention/i.test(t)) out.push('newUsers30d');
    if (/nyc|new york/i.test(t)) out.push('nyc');
    return Array.from(new Set(out.length ? out : ['highLtv']));
  }

  function deriveChannelsFromText(t: string): string[] {
    const channels: string[] = [];
    if (/push/i.test(t)) channels.push("push");
    if (/email/i.test(t)) channels.push("email");
    if (/sms/i.test(t)) channels.push("sms");
    if (/in[- ]?app/i.test(t)) channels.push("inapp");
    return Array.from(new Set(channels));
  }

  function onSend() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    sendUser(text);

    // Update context
    const cohorts = Array.from(new Set([
      ...sessionContext.cohorts,
      ...deriveCohortsFromText(text),
    ]));
    const channels = Array.from(new Set([
      ...sessionContext.channels,
      ...deriveChannelsFromText(text),
    ]));
    const includeIncentive = /\$\d+|discount|credit|incentive/i.test(text) || sessionContext.includeIncentive;
    const budget = /\$\s?\d+/.test(text) ? (text.match(/\$\s?\d+/)?.[0] ?? undefined) : sessionContext.budget;

    const nextContext = { ...sessionContext, cohorts, channels, includeIncentive, budget };
    setSessionContext(nextContext);

    // Heuristic: if we have at least one cohort and one channel, produce a plan
    const ready = cohorts.length > 0 && channels.length > 0;
    if (ready) {
      const p = makePlanFromContext(nextContext);
      setPlan(p);
      setTimeout(() => {
        sendAssistant(
          `Here is a campaign plan:\n\n` +
            `• Name: ${p.name}\n` +
            `• Target metric: ${p.targetMetric}\n` +
            `• Audience: ${p.audience.map((a) => `${a.name} (${a.count.toLocaleString()})`).join(", ")}\n` +
            `• Channels: ${p.channels.map((c) => c.name).join(", ")}\n` +
            (p.incentive ? `• Incentive: ${p.incentive.value} (${p.incentive.rationale})\n` : "") +
            `• Projected lift: ${p.projectedLiftPct.toFixed(1)}%\n` +
            `• Rationale: ${p.rationale}\n\n` +
            `Governance checks:` +
            `\n- Collisions avoided: ${p.governance.collisionsAvoided.map((c) => `${c.campaign} (${c.impactedUsers.toLocaleString()} users)`).join(", ") || "none"}` +
            `\n- Fatigue exclusions: ${p.governance.fatigueExcludedUsers.toLocaleString()} users` +
            `\n- Priority rules: ${p.governance.priorityRuleApplied.join(", ")}` +
            `\n- Final audience size: ${p.governance.finalAudienceCount.toLocaleString()} users\n\n` +
            `Approve to export targeting data for Braze.`
        );
      }, 250);
    } else {
      setTimeout(() => {
        sendAssistant(
          "Thanks — noted. Could you confirm 1) cohorts we should include and 2) channels to use? You can also mention any budget or incentive preferences."
        );
      }, 200);
    }
  }

  function onApprove() {
    setApproved(true);
    toast({ title: "Campaign approved", description: "You can now export Braze targeting data.", duration: 2500 });
  }

  function onReject() {
    setApproved(false);
    setPlan(null);
    toast({ title: "Campaign rejected", description: "I’ll refine once you share adjustments.", duration: 2500 });
  }

  function onExport(format: "csv" | "json") {
    if (!plan) return;
    const blob = exportBrazeData(plan, format);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `braze_targeting_${plan.name.replace(/\s+/g, "_").toLowerCase()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${format.toUpperCase()}`, description: `Saved ${format.toUpperCase()} for Braze.`, duration: 2500 });
  }

  const metricsConfigured = selectedMetrics.length > 0;

  return (
    <div className="container mx-auto max-w-[1280px] px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Winnie AI Strategist v2</h1>
          <p className="text-sm text-muted-foreground">Governance + collision avoidance. Outputs Braze-ready targeting.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="animate-fade-in">Beta</Badge>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left column: Metric preferences + Alerts */}
        <section className="xl:col-span-1 space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> Metric Preferences</CardTitle>
              <CardDescription>Choose the metrics you care about most to personalize alerts and recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_METRICS.map((m) => {
                  const checked = selectedMetrics.includes(m.key);
                  return (
                    <Button
                      key={m.key}
                      type="button"
                      variant={checked ? "default" : "outline"}
                      className={cn("justify-start", checked && "ring-1 ring-primary")}
                      onClick={() =>
                        setSelectedMetrics((prev) =>
                          prev.includes(m.key) ? prev.filter((k) => k !== m.key) : [...prev, m.key]
                        )
                      }
                    >
                      {checked ? <Check className="mr-2 h-4 w-4" /> : <span className="mr-2 w-4" />} {m.label}
                    </Button>
                  );
                })}
              </div>
              {!metricsConfigured && (
                <p className="mt-3 text-xs text-muted-foreground">Tip: select at least one metric to enable personalized alerts.</p>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Active Alerts</CardTitle>
              <CardDescription>Daily anomaly scan (&gt; 2σ) across your key segments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length === 0 && (
                <p className="text-sm text-muted-foreground">No anomalies detected today.</p>
              )}
              {alerts.map((a) => (
                <div key={a.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={a.severity === "high" ? "destructive" : "secondary"}>{a.severity}</Badge>
                        <span className="font-medium">{a.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                      <p className={cn("text-xs", a.direction === "up" ? "text-foreground" : "text-foreground")}>{formatPct(a.deltaPct)} vs baseline • Segment: {a.segment}</p>
                    </div>
                    <div className="ml-4 hidden sm:block">
                      <div className="h-14 w-28 rounded bg-muted flex items-end gap-1 p-1">
                        {a.chart.map((v, i) => (
                          <div key={i} className="bg-primary/70" style={{ height: `${10 + v}%`, width: 4 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" onClick={() => handleInvestigateAlert(a)}>Investigate</Button>
                    <Button size="sm" variant="outline" onClick={() => startReactiveSession(`Help me improve ${a.metric.toLowerCase()}.`)}>See suggestions</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Right column: Chat + Governance */}
        <section className="xl:col-span-2 space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Reasoning Session</CardTitle>
              <CardDescription>Ask questions, explore root causes, and design campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                  <div className="h-[420px] rounded-md border p-3 overflow-y-auto bg-background">
                    <div className="space-y-3">
                      {chatMessages.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          Try: <span className="font-medium">“I want to improve onboarding completion.”</span>
                        </div>
                      )}
                      {chatMessages.map((m) => (
                        <div key={m.id} className={cn("max-w-[90%]", m.role === "user" ? "ml-auto" : "mr-auto")}> 
                          <div className={cn("rounded-md p-3 text-sm shadow-sm", m.role === "user" ? "bg-primary/10" : "bg-muted")}>{m.content}</div>
                          <div className="mt-1 text-[10px] text-muted-foreground">{new Date(m.timestamp).toLocaleTimeString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="Type your question..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onSend()}
                    />
                    <Button onClick={onSend} aria-label="Send"><Send className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => startReactiveSession()} aria-label="Start with example">Start</Button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Governance</CardTitle>
                      <CardDescription>Collision avoidance and fatigue management.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!plan && (
                        <p className="text-sm text-muted-foreground">Design a plan to see checks.</p>
                      )}
                      {plan && (
                        <div className="space-y-3 text-sm">
                          <div>
                            <div className="font-medium">Collisions avoided</div>
                            <ul className="list-disc pl-5">
                              {plan.governance.collisionsAvoided.length === 0 ? (
                                <li>None</li>
                              ) : (
                                plan.governance.collisionsAvoided.map((c, idx) => (
                                  <li key={idx}>{c.campaign} — {c.reason} ({c.impactedUsers.toLocaleString()} users)</li>
                                ))
                              )}
                            </ul>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="font-medium">Fatigue exclusions</div>
                              <div className="text-muted-foreground">{plan.governance.fatigueExcludedUsers.toLocaleString()} users</div>
                            </div>
                            <div>
                              <div className="font-medium">Final audience</div>
                              <div className="text-muted-foreground">{plan.governance.finalAudienceCount.toLocaleString()} users</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Priority rules</div>
                            <div className="text-muted-foreground">{plan.governance.priorityRuleApplied.join(", ")}</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Summary</CardTitle>
                      <CardDescription>Approve or request changes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!plan && <p className="text-sm text-muted-foreground">No plan yet.</p>}
                      {plan && (
                        <div className="space-y-3">
                          <div className="text-sm">
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-muted-foreground">Target metric: {plan.targetMetric}</div>
                            <div>Channels: {plan.channels.map((c) => c.name).join(", ")}</div>
                            {plan.incentive && <div>Incentive: {plan.incentive.value}</div>}
                            <div>Projected lift: {plan.projectedLiftPct.toFixed(1)}%</div>
                          </div>
                          <Separator />
                          <div className="flex flex-wrap gap-2">
                            {!approved ? (
                              <>
                                <Button onClick={onApprove}>Approve</Button>
                                <Button variant="outline" onClick={onReject}>Request changes</Button>
                              </>
                            ) : (
                              <>
                                <Button onClick={() => onExport("csv")}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                                <Button variant="outline" onClick={() => onExport("json")}><Download className="mr-2 h-4 w-4" /> Export JSON</Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="text-xs text-muted-foreground">© {new Date().getFullYear()} Winnie. Strategist v2 demo — mock data only.</footer>
    </div>
  );
};

export default WinnieAIStrategistV2;
