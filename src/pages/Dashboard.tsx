import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Waves,
  Fish,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Radio,
  ChevronRight,
  Anchor,
  Compass,
  Scan,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings,
  Bell,
  MessageSquare,
  Bot,
  Zap,
  Eye,
  ShieldCheck,
  FileText,
  Activity
} from "lucide-react";
import FinalAssessment from "@/components/FinalAssessment";

/* ──────────────────────────────────────────────────────────────────────────
   DATA & TYPES
   ────────────────────────────────────────────────────────────────────────── */

interface MarineZone {
  id: string;
  name: string;
  icon: React.ElementType;
  depth: string;
  status: "nominal" | "alert" | "critical";
  agents: number;
  temperature: number;
}

interface AgentMessage {
  id: string;
  agent: string;
  role: "lead" | "analyst" | "scout" | "validator";
  avatar: string;
  content: string;
  timestamp: string;
  sentiment: "positive" | "warning" | "critical";
}

interface Metric {
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
  change: string;
  icon: React.ElementType;
  color: string;
  gauge: number;
}

const zones: MarineZone[] = [
  {
    id: "coral-reef",
    name: "Coral Reef Shelf",
    icon: Fish,
    depth: "0-60m",
    status: "nominal",
    agents: 12,
    temperature: 26.4,
  },
  {
    id: "pelagic",
    name: "Open Pelagic Zone",
    icon: Compass,
    depth: "60-200m",
    status: "alert",
    agents: 8,
    temperature: 18.2,
  },
  {
    id: "mesopelagic",
    name: "Mesopelagic Twilight",
    icon: Eye,
    depth: "200-1000m",
    status: "nominal",
    agents: 5,
    temperature: 12.1,
  },
  {
    id: "bathypelagic",
    name: "Bathypelagic Deep",
    icon: Anchor,
    depth: "1000-4000m",
    status: "critical",
    agents: 3,
    temperature: 4.3,
  },
  {
    id: "hadal",
    name: "Hadal Trench Zone",
    icon: Scan,
    depth: "4000m+",
    status: "nominal",
    agents: 2,
    temperature: 1.8,
  },
  {
    id: "coastal",
    name: "Coastal Estuary",
    icon: Waves,
    depth: "0-20m",
    status: "nominal",
    agents: 15,
    temperature: 22.7,
  },
];

const agentMessages: AgentMessage[] = [
  {
    id: "1",
    agent: "CORAL",
    role: "lead",
    avatar: "🐠",
    content:
      "Anomalous thermal gradient detected at coordinates 14.2°N, 120.5°E. Bleaching risk elevated by 23% over baseline. Recommending immediate sensor density increase in Zone A-7.",
    timestamp: "2 min ago",
    sentiment: "warning",
  },
  {
    id: "2",
    agent: "PHALANX",
    role: "analyst",
    avatar: "🔬",
    content:
      "Cross-referencing with historical coral stress data. Current pattern matches 2024 Tonga event precursor within 4.2% margin. Water temperature anomaly correlates with upwelling disruption.",
    timestamp: "5 min ago",
    sentiment: "warning",
  },
  {
    id: "3",
    agent: "SCOUT-7",
    role: "scout",
    avatar: "🔭",
    content:
      "New sonar contact in Bathypelagic zone. Biomass signature consistent with deep-sea aggregation event. No known species cluster matches this acoustic profile. Flagging for review.",
    timestamp: "8 min ago",
    sentiment: "critical",
  },
  {
    id: "4",
    agent: "GAIA",
    role: "validator",
    avatar: "✅",
    content:
      "Dissolved oxygen levels in Coral Reef Shelf have stabilized at 7.8 mg/L following yesterday's adjustment. Salinity readings consistent across all coastal sensors. Zone status: NOMINAL.",
    timestamp: "11 min ago",
    sentiment: "positive",
  },
  {
    id: "5",
    agent: "PHALANX",
    role: "analyst",
    avatar: "🔬",
    content:
      "pH levels in the Mesopelagic Twilight Zone showing gradual acidification trend: 8.12 → 8.08 over 14 days. Rate of change exceeds natural variability. Recommending expanded monitoring.",
    timestamp: "15 min ago",
    sentiment: "warning",
  },
  {
    id: "6",
    agent: "CORAL",
    role: "lead",
    avatar: "🐠",
    content:
      "All reef sensors reporting nominal after recalibration. Species diversity index holding at 4.23 (healthy). Bioacoustic monitoring confirms normal reef activity patterns.",
    timestamp: "22 min ago",
    sentiment: "positive",
  },
];

const metrics: Metric[] = [
  {
    label: "Water Temperature",
    value: "18.4",
    unit: "°C",
    trend: "up",
    change: "+0.3°C",
    icon: Thermometer,
    color: "oklch(0.55 0.12 210)",
    gauge: 62,
  },
  {
    label: "Salinity",
    value: "35.2",
    unit: "PSU",
    trend: "stable",
    change: "±0.1",
    icon: Droplets,
    color: "oklch(0.55 0.1 200)",
    gauge: 74,
  },
  {
    label: "Dissolved Oxygen",
    value: "7.8",
    unit: "mg/L",
    trend: "down",
    change: "-0.2",
    icon: Wind,
    color: "oklch(0.72 0.15 185)",
    gauge: 56,
  },
  {
    label: "pH Level",
    value: "8.12",
    unit: "pH",
    trend: "down",
    change: "-0.02",
    icon: Gauge,
    color: "oklch(0.6 0.08 225)",
    gauge: 81,
  },
];

const roleColors: Record<AgentMessage["role"], string> = {
  lead: "oklch(0.55 0.12 210)",
  analyst: "oklch(0.55 0.1 200)",
  scout: "oklch(0.6 0.08 225)",
  validator: "oklch(0.72 0.15 185)",
};

const sentimentColors: Record<
  AgentMessage["sentiment"],
  { bg: string; border: string; glow: string }
> = {
  positive: {
    bg: "oklch(0.72 0.15 185 / 0.06)",
    border: "oklch(0.72 0.15 185 / 0.2)",
    glow: "oklch(0.72 0.15 185 / 0.08)",
  },
  warning: {
    bg: "oklch(0.85 0.12 85 / 0.06)",
    border: "oklch(0.75 0.12 85 / 0.2)",
    glow: "oklch(0.85 0.12 85 / 0.08)",
  },
  critical: {
    bg: "oklch(0.65 0.2 25 / 0.06)",
    border: "oklch(0.65 0.2 25 / 0.2)",
    glow: "oklch(0.65 0.2 25 / 0.08)",
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   GAUGE COMPONENT — circular SVG arc
   ────────────────────────────────────────────────────────────────────────── */

function RadialGauge({
  value,
  color,
  size = 80,
  strokeWidth = 6,
}: {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference;
  const offset = circumference - filled;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="oklch(0.92 0.01 200)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
      />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SIDEBAR
   ────────────────────────────────────────────────────────────────────────── */

function Sidebar({
  activeZone,
  onZoneChange,
}: {
  activeZone: string;
  onZoneChange: (id: string) => void;
}) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-[oklch(0.9_0.01_200_/_0.5)] bg-[oklch(0.97_0.008_200_/_0.3)] backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-[oklch(0.9_0.01_200_/_0.4)] px-5 py-5">
        <div className="glass-strong flex size-10 items-center justify-center rounded-xl">
          <Waves className="size-5 text-[oklch(0.55_0.12_210)]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-[oklch(0.18_0.03_215)]">
            ORCA
          </h1>
          <p className="text-[10px] font-medium text-[oklch(0.5_0.02_210)]">
            Marine Intelligence
          </p>
        </div>
      </div>

      {/* Zone label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.55_0.02_210)]">
          Marine Zones
        </p>
      </div>

      {/* Zones list */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {zones.map((zone) => {
          const isActive = zone.id === activeZone;
          return (
            <motion.button
              key={zone.id}
              onClick={() => onZoneChange(zone.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`glass glow-hover flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                isActive
                  ? "glow-border"
                  : "hover:bg-[oklch(0.95_0.01_200_/_0.5)]"
              }`}
              style={
                isActive
                  ? {
                      background:
                        "oklch(1 0.005 200 / 0.55)",
                      boxShadow: `0 0 0 1px oklch(0.75 0.15 185 / 0.2), 0 0 20px oklch(0.75 0.15 185 / 0.08)`,
                    }
                  : undefined
              }
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `color-mix(in oklch, ${
                    zone.status === "critical"
                      ? "oklch(0.65 0.2 25)"
                      : zone.status === "alert"
                        ? "oklch(0.85 0.12 85)"
                        : "oklch(0.55 0.12 210)"
                  } 12%, transparent)`,
                }}
              >
                <zone.icon
                  className="size-4"
                  style={{
                    color:
                      zone.status === "critical"
                        ? "oklch(0.65 0.2 25)"
                        : zone.status === "alert"
                          ? "oklch(0.7 0.1 75)"
                          : "oklch(0.55 0.12 210)",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    isActive
                      ? "text-[oklch(0.2_0.03_215)]"
                      : "text-[oklch(0.35_0.02_210)]"
                  }`}
                >
                  {zone.name}
                </p>
                <p className="text-[10px] text-[oklch(0.55_0.01_200)]">
                  {zone.depth} · {zone.agents} agents
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`size-2 rounded-full ${
                    zone.status === "critical"
                      ? "animate-pulse bg-[oklch(0.65_0.2_25)]"
                      : zone.status === "alert"
                        ? "bg-[oklch(0.85_0.12_85)]"
                        : "bg-[oklch(0.72_0.15_185)]"
                  }`}
                />
                {isActive && (
                  <ChevronRight className="size-3.5 text-[oklch(0.5_0.02_210)]" />
                )}
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div className="border-t border-[oklch(0.9_0.01_200_/_0.4)] p-3">
        <div className="glass flex items-center gap-3 rounded-xl px-3 py-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[oklch(0.55_0.12_210_/_0.1)]">
            <Bot className="size-4 text-[oklch(0.55_0.12_210)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[oklch(0.25_0.02_215)]">
              Researcher
            </p>
            <p className="text-[10px] text-[oklch(0.55_0.01_200)]">
              Operator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   AGENT DEBATE FEED
   ────────────────────────────────────────────────────────────────────────── */

function AgentFeed() {
  const [messages, setMessages] = useState(agentMessages);
  const feedRef = useRef<HTMLDivElement>(null);

  // Simulate new agent messages arriving
  useEffect(() => {
    const newMessages: AgentMessage[] = [
      {
        id: "7",
        agent: "SCOUT-7",
        role: "scout",
        avatar: "🔭",
        content:
          "Underwater acoustic array detecting unusual low-frequency signals from the Hadal Trench. Cross-referencing with known geological patterns — no seismic match found. Biological origin probable.",
        timestamp: "just now",
        sentiment: "warning",
      },
      {
        id: "8",
        agent: "GAIA",
        role: "validator",
        avatar: "✅",
        content:
          "Validating Scout-7's acoustic findings. Signal-to-noise ratio is 14.2 dB — well above threshold. This is a confirmed anomaly. Escalating to lead agent for response protocol.",
        timestamp: "just now",
        sentiment: "critical",
      },
    ];

    const timer1 = setTimeout(
      () => setMessages((prev) => [newMessages[0], ...prev]),
      6000,
    );
    const timer2 = setTimeout(
      () => setMessages((prev) => [newMessages[1], ...prev]),
      12000,
    );

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const sentimentIcon = (s: AgentMessage["sentiment"]) => {
    if (s === "positive")
      return <CheckCircle2 className="size-3.5 text-[oklch(0.72_0.15_185)]" />;
    if (s === "warning")
      return (
        <AlertTriangle className="size-3.5 text-[oklch(0.7_0.1_75)]" />
      );
    return <Zap className="size-3.5 text-[oklch(0.65_0.2_25)]" />;
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[oklch(0.9_0.01_200_/_0.4)] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="glass-strong flex size-9 items-center justify-center rounded-xl">
            <MessageSquare className="size-4 text-[oklch(0.55_0.12_210)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[oklch(0.2_0.03_215)]">
              Live Agent Debate
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[oklch(0.72_0.15_185)] opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[oklch(0.72_0.15_185)]" />
              </span>
              <p className="text-[10px] font-medium text-[oklch(0.55_0.02_210)]">
                45 agents active
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="glow-hover glass flex size-8 cursor-pointer items-center justify-center rounded-lg transition-all">
            <Radio className="size-4 text-[oklch(0.55_0.12_210)]" />
          </button>
          <button className="glow-hover glass flex size-8 cursor-pointer items-center justify-center rounded-lg transition-all">
            <Bell className="size-4 text-[oklch(0.5_0.02_210)]" />
          </button>
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const colors = sentimentColors[msg.sentiment];
            const roleColor = roleColors[msg.role];
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="glow-hover group rounded-2xl p-4 transition-all"
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  boxShadow: `0 4px 20px ${colors.glow}, inset 0 1px 0 oklch(1 0 0 / 0.4)`,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="glass-strong flex size-10 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{
                      boxShadow: `0 0 12px ${roleColor}20`,
                    }}
                  >
                    {msg.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: roleColor }}
                      >
                        {msg.agent}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `color-mix(in oklch, ${roleColor} 10%, transparent)`,
                          color: roleColor,
                        }}
                      >
                        {msg.role}
                      </span>
                      {sentimentIcon(msg.sentiment)}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[oklch(0.3_0.02_215)]">
                      {msg.content}
                    </p>
                    <p className="mt-2 text-[10px] text-[oklch(0.55_0.01_200)]">
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="border-t border-[oklch(0.9_0.01_200_/_0.4)] px-5 py-4">
        <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
          <Brain className="size-5 shrink-0 text-[oklch(0.55_0.12_210_/_0.4)]" />
          <input
            type="text"
            placeholder="Ask the agents about ocean data..."
            className="flex-1 bg-transparent text-sm text-[oklch(0.3_0.02_215)] outline-none placeholder:text-[oklch(0.55_0.02_210_/_0.5)]"
          />
          <button className="glow-hover glass flex size-8 cursor-pointer items-center justify-center rounded-xl transition-all hover:bg-[oklch(0.55_0.12_210_/_0.08)]">
            <ChevronRight className="size-4 text-[oklch(0.55_0.12_210)]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   METRICS PANEL
   ────────────────────────────────────────────────────────────────────────── */

function MetricsPanel({ activeZone }: { activeZone: string }) {
  const zone = zones.find((z) => z.id === activeZone) || zones[0];
  const [tick, setTick] = useState(0);

  // Simulate live data fluctuations
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const jitter = (base: number, range: number) =>
    (base + Math.sin(tick * 0.7 + base) * range).toFixed(1);

  const liveMetrics: Metric[] = [
    {
      ...metrics[0],
      value: jitter(18.4, 0.3),
      gauge: Math.min(100, Math.max(0, 62 + Math.sin(tick * 0.5) * 5)),
    },
    {
      ...metrics[1],
      value: jitter(35.2, 0.15),
      gauge: Math.min(100, Math.max(0, 74 + Math.cos(tick * 0.3) * 3)),
    },
    {
      ...metrics[2],
      value: jitter(7.8, 0.2),
      gauge: Math.min(100, Math.max(0, 56 + Math.sin(tick * 0.4) * 4)),
    },
    {
      ...metrics[3],
      value: jitter(8.12, 0.02),
      gauge: Math.min(100, Math.max(0, 81 + Math.cos(tick * 0.6) * 2)),
    },
  ];

  const trendIcon = (t: Metric["trend"]) => {
    if (t === "up")
      return <TrendingUp className="size-3 text-[oklch(0.65_0.15_155)]" />;
    if (t === "down")
      return <TrendingDown className="size-3 text-[oklch(0.6_0.15_25)]" />;
    return <Minus className="size-3 text-[oklch(0.5_0.02_210)]" />;
  };

  return (
    <aside className="flex h-full w-80 flex-col border-l border-[oklch(0.9_0.01_200_/_0.5)] bg-[oklch(0.97_0.008_200_/_0.3)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[oklch(0.9_0.01_200_/_0.4)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="glass-strong flex size-9 items-center justify-center rounded-xl">
            <Gauge className="size-4 text-[oklch(0.55_0.12_210)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[oklch(0.2_0.03_215)]">
              Zone Metrics
            </h2>
            <p className="text-[10px] font-medium text-[oklch(0.55_0.02_210)]">
              {zone.name}
            </p>
          </div>
        </div>
        <button className="glow-hover glass flex size-8 cursor-pointer items-center justify-center rounded-lg transition-all">
          <Settings className="size-4 text-[oklch(0.5_0.02_210)]" />
        </button>
      </div>

      {/* Zone status card */}
      <div className="px-5 pt-4">
        <div
          className="glass glow-hover overflow-hidden rounded-2xl p-4 transition-all"
          style={{
            boxShadow: `0 4px 20px ${
              zone.status === "critical"
                ? "oklch(0.65 0.2 25 / 0.08)"
                : zone.status === "alert"
                  ? "oklch(0.85 0.12 85 / 0.08)"
                  : "oklch(0.72 0.15 185 / 0.06)"
            }`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="relative flex size-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in oklch, ${
                    zone.status === "critical"
                      ? "oklch(0.65 0.2 25)"
                      : zone.status === "alert"
                        ? "oklch(0.85 0.12 85)"
                        : "oklch(0.72 0.15 185)"
                  } 10%, transparent)`,
                }}
              >
                {zone.status === "critical" ? (
                  <AlertTriangle className="size-5 text-[oklch(0.65_0.2_25)]" />
                ) : zone.status === "alert" ? (
                  <AlertTriangle className="size-5 text-[oklch(0.7_0.1_75)]" />
                ) : (
                  <CheckCircle2 className="size-5 text-[oklch(0.72_0.15_185)]" />
                )}
                <span
                  className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white"
                  style={{
                    backgroundColor:
                      zone.status === "critical"
                        ? "oklch(0.65 0.2 25)"
                        : zone.status === "alert"
                          ? "oklch(0.85 0.12 85)"
                          : "oklch(0.72 0.15 185)",
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-[oklch(0.2_0.03_215)]">
                  Status: {zone.status.toUpperCase()}
                </p>
                <p className="text-[10px] text-[oklch(0.5_0.02_210)]">
                  {zone.agents} agents monitoring · {zone.depth}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics list */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {liveMetrics.map((m) => (
          <motion.div
            key={m.label}
            layout
            className="glass glow-hover overflow-hidden rounded-2xl p-4 transition-all"
          >
            <div className="flex items-start gap-4">
              <RadialGauge value={m.gauge} color={m.color} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[oklch(0.45_0.02_210)]">
                    {m.label}
                  </p>
                  {trendIcon(m.trend)}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <motion.span
                    key={m.value}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-[oklch(0.2_0.03_215)]"
                  >
                    {m.value}
                  </motion.span>
                  <span className="text-xs font-medium text-[oklch(0.55_0.02_210)]">
                    {m.unit}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span
                    className={`text-[10px] font-medium ${
                      m.trend === "up"
                        ? "text-[oklch(0.65_0.15_155)]"
                        : m.trend === "down"
                          ? "text-[oklch(0.6_0.15_25)]"
                          : "text-[oklch(0.5_0.02_210)]"
                    }`}
                  >
                    {m.change}
                  </span>
                  <span className="text-[10px] text-[oklch(0.55_0.01_200)]">
                    vs last hour
                  </span>
                </div>
              </div>
            </div>
            {/* Linear mini-bar */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[oklch(0.92_0.01_200)]">
              <motion.div
                key={`${m.label}-${Math.round(m.gauge)}`}
                className="h-full rounded-full"
                style={{ backgroundColor: m.color }}
                initial={{ width: 0 }}
                animate={{ width: `${m.gauge}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="border-t border-[oklch(0.9_0.01_200_/_0.4)] px-5 py-4">
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.55_0.02_210)]">
            Zone Summary
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { label: "Sensors", value: "342", icon: Radio },
              { label: "Alerts", value: "7", icon: AlertTriangle },
              { label: "Species", value: "128", icon: Fish },
              { label: "Uptime", value: "99.7%", icon: CheckCircle2 },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 rounded-xl p-2"
              >
                <s.icon className="size-3.5 text-[oklch(0.55_0.12_210_/_0.5)]" />
                <div>
                  <p className="text-[10px] text-[oklch(0.55_0.01_200)]">
                    {s.label}
                  </p>
                  <p className="text-xs font-bold text-[oklch(0.2_0.03_215)]">
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   MAIN DASHBOARD
   ────────────────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const [activeZone, setActiveZone] = useState("coral-reef");
  const [showAssessment, setShowAssessment] = useState(false);
  
  // State to hold the API Data
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const zone = zones.find((z) => z.id === activeZone) || zones[0];

  // UPDATED: The fetch URL is now a relative path for Vercel
  const evaluateEcosystem = async () => {
    setIsLoadingAI(true);
    
    // We dynamically grab the temperature from the active zone to make it feel real
    const sensorData = {
      temperature: zone.temperature,
      salinity: 34.8,
      dissolved_oxygen: 5.2,
      chlorophyll_a: 4.1,
      ph: 8.1,
      plankton_abundance: 950.0,
      fish_observations: 120
    };

    try {
      const response = await fetch("/api/evaluate-ecosystem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sensorData), 
      });

      const result = await response.json();
      console.log("AI Assessment Received:", result);
      
      setAssessmentData(result);
      setShowAssessment(true); // Auto-open the panel to show results

    } catch (error) {
      console.error("Failed to connect to AI server:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[oklch(0.97_0.008_210)]">
      {/* Left sidebar */}
      <Sidebar activeZone={activeZone} onZoneChange={setActiveZone} />

      {/* Center: Agent debate feed + Final Assessment */}
      <main className="flex flex-1 flex-col overflow-hidden bg-[oklch(0.98_0.005_200_/_0.2)]">
        {/* Top bar */}
        <div className="glass-strong flex items-center justify-between border-b border-[oklch(0.9_0.01_200_/_0.4)] px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-[oklch(0.2_0.03_215)]">
              ORCA Dashboard
            </h2>
            <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[oklch(0.72_0.15_185)] opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[oklch(0.72_0.15_185)]" />
              </span>
              <span className="text-[10px] font-semibold text-[oklch(0.55_0.02_210)]">
                LIVE
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            
            {/* The button triggers the AI API Call */}
            <button
              onClick={evaluateEcosystem}
              disabled={isLoadingAI}
              className={`glow-hover glass flex items-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-semibold transition-all ${
                isLoadingAI ? "opacity-75 cursor-wait" : ""
              } ${
                showAssessment
                  ? "text-[oklch(0.55_0.12_210)]"
                  : "text-[oklch(0.5_0.02_210)]"
              }`}
              style={
                showAssessment
                  ? {
                      boxShadow:
                        "0 0 0 1px oklch(0.75 0.15 185 / 0.15), 0 0 16px oklch(0.75 0.15 185 / 0.06)",
                    }
                  : undefined
              }
            >
              {isLoadingAI ? (
                <Activity className="size-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="size-3.5" />
              )}
              {isLoadingAI ? "Agents Analyzing..." : "Run AI Assessment"}
            </button>
            <span className="text-[10px] text-[oklch(0.55_0.01_200)]">
              Last sync: 3s ago
            </span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="size-1 rounded-full bg-[oklch(0.72_0.15_185)]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Final Assessment panel (collapsible) */}
        <AnimatePresence initial={false}>
          {showAssessment && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="overflow-hidden border-b border-[oklch(0.9_0.01_200_/_0.4)]"
            >
              {/* If we have AI Data, show the Custom Data Panel, otherwise show the original component */}
              {assessmentData ? (
                <div className="p-6 bg-[oklch(0.97_0.008_210_/_0.5)]">
                  <div className="glass-strong rounded-2xl p-6 border border-[oklch(0.55_0.12_210_/_0.2)]"
                       style={{ boxShadow: "0 8px 32px oklch(0.55 0.12 210 / 0.05)" }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-[oklch(0.55_0.12_210_/_0.1)]">
                        <Brain className="size-5 text-[oklch(0.55_0.12_210)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[oklch(0.2_0.03_215)]">
                          Master Reasoning Verdict
                        </h3>
                        <p className="text-xs font-semibold text-[oklch(0.55_0.12_210)] uppercase tracking-wider">
                          Status: {assessmentData.master_reasoning?.ecosystem_status}
                        </p>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm text-[oklch(0.3_0.02_215)] leading-relaxed">
                      {assessmentData.master_reasoning?.combined_explanation}
                    </p>
                    
                    <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[oklch(0.9_0.01_200_/_0.6)] pt-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.01_200)] font-bold">Water Quality Agent</span>
                        <div className="px-3 py-2 rounded-xl bg-[oklch(0.55_0.12_210_/_0.06)] text-xs font-medium text-[oklch(0.55_0.12_210)] border border-[oklch(0.55_0.12_210_/_0.1)]">
                          {assessmentData.water_quality?.assessment} ({(assessmentData.water_quality?.confidence * 100).toFixed(0)}%)
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.01_200)] font-bold">Primary Productivity</span>
                        <div className="px-3 py-2 rounded-xl bg-[oklch(0.72_0.15_185_/_0.06)] text-xs font-medium text-[oklch(0.72_0.15_185)] border border-[oklch(0.72_0.15_185_/_0.1)]">
                          {assessmentData.primary_productivity?.assessment} ({(assessmentData.primary_productivity?.confidence * 100).toFixed(0)}%)
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.01_200)] font-bold">Biodiversity Agent</span>
                        <div className="px-3 py-2 rounded-xl bg-[oklch(0.6_0.08_225_/_0.06)] text-xs font-medium text-[oklch(0.6_0.08_225)] border border-[oklch(0.6_0.08_225_/_0.1)]">
                          {assessmentData.biodiversity?.assessment} ({(assessmentData.biodiversity?.confidence * 100).toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <FinalAssessment zoneName={zone.name} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent feed */}
        <AgentFeed />
      </main>

      {/* Right metrics panel */}
      <MetricsPanel activeZone={activeZone} />
    </div>
  );
}
