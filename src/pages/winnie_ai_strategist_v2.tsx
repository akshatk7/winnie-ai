import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Bell, Brain, Check, Download, ShieldCheck, Send } from "lucide-react";

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

function calcStdDev(arr: number[]) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  return { mean, std: Math.sqrt(variance) };
}

function genSparkline(base: number, noise: number, len = 14, spikeAtEnd?: number) {
  const data: number[] = [];
  for (let i = 0; i < len - 1; i++) {
    data.push(Math.max(0, base + (Math.random() - 0.5) * noise));
  }
  data.push(spikeAtEnd ?? Math.max(0, base + (Math.random() - 0.5) * noise));
  return data.map((v) => Number(v.toFixed(2)));
}

function brazeCsv(rows: any[]) {
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  return csv;
}

// Mock "existing" active campaigns for governance
const ACTIVE_CAMPAIGNS = [
  { name: "Weekly Deals Push", segments: ["all-users", "deal-seekers"], channels: ["push"], active: true },
  { name: "Premium Upsell", segments: ["premium-trial"], channels: ["email"], active: true },
  { name: "Churn Prevention Wave", segments: ["lapsed-30"], channels: ["sms", "push"], active: true },
];

const SEGMENT_SIZES: Record<string, number> = {
  "all-users": 120_000,
  "high-ltv": 12_000,
  "lapsed-30": 15_000,
  "week1-drop": 12_450,
  "premium": 8_400,
  "nyc": 22_300,
  "premium-trial": 5_200,
};

const SEGMENT_FATIGUE: Record<string, number> = {
  "all-users": 2,
  "high-ltv": 3,
  "lapsed-30": 4,
  "week1-drop": 1,
  "premium": 2,
  "nyc": 1,
  "premium-trial": 5,
};

function computeAlerts(): AlertItem[] {
  // Mock 1: churn up for Segment A (high-value)
  const churnSpark = genSparkline(6, 0.8, 14, 8.2); // last point higher
  const { mean, std } = calcStdDev(churnSpark.slice(0, -1));
  const last = churnSpark[churnSpark.length - 1];
  const churnAlert: AlertItem | null = last > mean + 2 * std
    ? {
        id: "alert-1",
        metric: "Churn Rate",
        segment: "high-ltv",
        title: "Churn rate for high-LTV users increased",
        description: `Churn moved to ${last.toFixed(1)}% vs avg ${mean.toFixed(1)}%.`,
        deltaPct: ((last - mean) / mean) * 100,
        direction: "up",
        severity: "high",
        chart: churnSpark,
        timestamp: new Date().toISOString(),
      }
    : null;

  // Mock 2: push engagement up in NYC
  const pushSpark = genSparkline(18, 1.0, 14, 22);
  const { mean: pMean, std: pStd } = calcStdDev(pushSpark.slice(0, -1));
  const pLast = pushSpark[pushSpark.length - 1];
  const pushAlert: AlertItem | null = pLast > pMean + 2 * pStd
    ? {
        id: "alert-2",
        metric: "Push Engagement",
        segment: "nyc",
        title: "Push engagement up for users in NYC",
        description: `CTR ticked up to ${pLast.toFixed(1)}% vs ${pMean.toFixed(1)}% avg.`,
        deltaPct: ((pLast - pMean) / pMean) * 100,
        direction: "up",
        severity: "medium",
        chart: pushSpark,
        timestamp: new Date().toISOString(),
      }
    : null;

  return [churnAlert, pushAlert].filter(Boolean) as AlertItem[];
}

function makePlanFromContext(context: {
  intent: string;
  cohorts: string[];
  channels: string[];
  budget?: string;
  includeIncentive?: boolean;
}): CampaignPlan {
  const audience: AudienceSegmentBreakdown[] = context.cohorts.map((c) => ({
    name: c,
    count: SEGMENT_SIZES[c] ?? Math.round(5000 + Math.random() * 5000),
  }));

  const targetMetric =
    context.intent.includes("churn") || context.cohorts.includes("lapsed-30")
      ? "Churn Rate"
      : context.intent.includes("onboarding") || context.cohorts.includes("week1-drop")
      ? "Onboarding Completion"
      : "Engagement";

  const channels = (context.channels.length ? context.channels : ["push", "email"]).map((c) => ({
    name: c,
    reason:
      c === "push"
        ? "High historical CTR for mobile-centric segments"
        : c === "email"
        ? "Best for richer content and tips"
        : c === "sms"
        ? "Urgent nudge with short copy"
        : "In-product nudge at moment of need",
  }));

  const includeIncentive = context.includeIncentive || /discount|credit|incentive/i.test(context.intent);
  const incentive = includeIncentive
    ? { type: "credit", value: "$5", rationale: "ROI-positive for high-LTV segments only" }
    : undefined;

  // Governance
  const initialCount = audience.reduce((a, s) => a + s.count, 0);

  const collisionsAvoided: GovernanceResult["collisionsAvoided"] = [];
  const intersecting = ACTIVE_CAMPAIGNS.filter((c) => c.active && c.channels.some((ch) => channels.some((cc) => cc.name === ch)));
  intersecting.forEach((c) => {
    const overlaps = c.segments.filter((s) => audience.some((a) => a.name === s));
    if (overlaps.length) {
      const impacted = overlaps.reduce((n, s) => n + (SEGMENT_SIZES[s] ?? 0), 0);
      collisionsAvoided.push({ campaign: c.name, reason: `Overlap on ${overlaps.join(", ")}`, impactedUsers: impacted });
    }
  });

  // Message fatigue: exclude users in segments with fatigue >= 5
  const fatigueExcludedUsers = audience
    .filter((a) => (SEGMENT_FATIGUE[a.name] ?? 0) >= 5)
    .reduce((n, a) => n + a.count, 0);

  const finalAudienceCount = Math.max(0, initialCount - fatigueExcludedUsers);

  const priorityRuleApplied = [
    targetMetric === "Churn Rate" ? "churn-prevention prioritized over upsell" : "engagement prioritized over upsell",
  ];

  const projectedLiftPct = targetMetric === "Churn Rate" ? 4.0 : targetMetric === "Onboarding Completion" ? 6.0 : 3.0;

  return {
    name: targetMetric === "Churn Rate" ? "Churn Prevention Nudge" : targetMetric === "Onboarding Completion" ? "Onboarding Tips Push" : "Engagement Boost",
    targetMetric,
    audience,
    channels,
    incentive,
    projectedLiftPct,
    rationale:
      targetMetric === "Churn Rate"
        ? "Focus on early-week inactivity; combine push reminders with in-app tips."
        : targetMetric === "Onboarding Completion"
        ? "Address verification friction with timely nudges and optional small incentive."
        : "Use multi-channel touchpoints to revive interest among light users.",
    governance: {
      collisionsAvoided,
      fatigueExcludedUsers,
      priorityRuleApplied,
      finalAudienceCount,
    },
  };
}

function exportBrazeData(plan: CampaignPlan, format: "csv" | "json") {
  const rows = Array.from({ length: Math.min(200, plan.governance.finalAudienceCount) }).map((_, i) => {
    const id = `user_${(i + 1).toString().padStart(5, "0")}`;
    const channel = plan.channels[0]?.name ?? "push";
    return {
      external_user_id: id,
      send_channel: channel,
      campaign_name: plan.name,
      segment: plan.audience[0]?.name ?? "unknown",
      incentive: plan.incentive ? `${plan.incentive.type}:${plan.incentive.value}` : "none",
      trigger_properties: JSON.stringify({ rationale: plan.rationale }),
    };
  });

  if (format === "json") {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    return blob;
  }
  const csv = rows.length ? brazeCsv(rows) : "";
  const blob = new Blob([csv], { type: "text/csv" });
  return blob;
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

  React.useEffect(() => {
    document.title = "Winnie AI Strategist v2 | Governance & Collision Avoidance";
    setAlerts(computeAlerts());
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
    if (/lapsed|churn/i.test(t)) out.push("lapsed-30");
    if (/high[- ]?ltv|high value/i.test(t)) out.push("high-ltv");
    if (/onboarding|week 1|first week|verification/i.test(t)) out.push("week1-drop");
    if (/premium/i.test(t)) out.push("premium");
    if (/nyc|new york/i.test(t)) out.push("nyc");
    if (out.length === 0) out.push("all-users");
    return Array.from(new Set(out));
  }

  function deriveChannelsFromText(t: string): string[] {
    const channels: string[] = [];
    if (/push/i.test(t)) channels.push("push");
    if (/email/i.test(t)) channels.push("email");
    if (/sms/i.test(t)) channels.push("sms");
    if (/in[- ]?app/i.test(t)) channels.push("in-app");
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
