import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Brain,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Target,
  Bot,
  CheckCircle2,
  Info,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────────────────────── */

export type AssessmentStatus = "Healthy" | "Stressed" | "At Risk";

interface AgentFinding {
  agent: string;
  role: string;
  avatar: string;
  summary: string;
  confidence: number;
  sentiment: "positive" | "warning" | "critical";
}

interface FinalAssessmentProps {
  zoneName?: string;
}

/* ──────────────────────────────────────────────────────────────────────────
   STATUS CONFIG
   ────────────────────────────────────────────────────────────────────────── */

const statusConfig: Record<
  AssessmentStatus,
  {
    icon: React.ElementType;
    color: string;
    glowColor: string;
    bgGlow: string;
    borderColor: string;
    label: string;
    sublabel: string;
  }
> = {
  Healthy: {
    icon: ShieldCheck,
    color: "oklch(0.65 0.16 185)",
    glowColor: "oklch(0.72 0.18 185)",
    bgGlow: "oklch(0.72 0.15 185 / 0.08)",
    borderColor: "oklch(0.72 0.15 185 / 0.25)",
    label: "Healthy",
    sublabel: "All systems operating within normal parameters",
  },
  Stressed: {
    icon: AlertTriangle,
    color: "oklch(0.72 0.14 80)",
    glowColor: "oklch(0.78 0.15 80)",
    bgGlow: "oklch(0.82 0.12 80 / 0.08)",
    borderColor: "oklch(0.82 0.12 80 / 0.25)",
    label: "Stressed",
    sublabel: "Elevated anomalies detected — monitoring closely",
  },
  "At Risk": {
    icon: ShieldAlert,
    color: "oklch(0.6 0.2 25)",
    glowColor: "oklch(0.65 0.22 25)",
    bgGlow: "oklch(0.65 0.2 25 / 0.08)",
    borderColor: "oklch(0.65 0.2 25 / 0.25)",
    label: "At Risk",
    sublabel: "Critical thresholds breached — immediate action required",
  },
};

const agentFindings: AgentFinding[] = [
  {
    agent: "CORAL",
    role: "Lead Analyst",
    avatar: "🐠",
    summary:
      "Thermal gradient analysis complete. Bleaching risk at 23% above baseline across Zone A-7. Coral resilience index holds at 0.74 — within survivable range but trending downward.",
    confidence: 89,
    sentiment: "warning",
  },
  {
    agent: "PHALANX",
    role: "Data Analyst",
    avatar: "🔬",
    summary:
      "Cross-referenced 14 months of historical data. Current anomaly signature matches pre-stress patterns. Upwelling disruption confirmed as primary driver. pH correlation at r=0.82.",
    confidence: 94,
    sentiment: "warning",
  },
  {
    agent: "SCOUT-7",
    role: "Field Scout",
    avatar: "🔭",
    summary:
      "Acoustic monitoring reports unusual deep-sea aggregation in Bathypelagic zone. Biomass signature unclassified. Sonar-to-biology match confidence: moderate. Recommend continued observation.",
    confidence: 67,
    sentiment: "critical",
  },
  {
    agent: "GAIA",
    role: "Validator",
    avatar: "✅",
    summary:
      "All sensor readings validated against independent calibration sources. Dissolved oxygen stable at 7.8 mg/L. Salinity uniform across coastal grid. Data integrity: 99.2%.",
    confidence: 97,
    sentiment: "positive",
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   CONFIDENCE RADIAL GAUGE — large, detailed
   ────────────────────────────────────────────────────────────────────────── */

function ConfidenceGauge({
  value,
  color,
  size = 160,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference;
  const offset = circumference - filled;

  const tickCount = 40;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const innerR = radius - 8;
    const outerR = radius - 3;
    return {
      x1: size / 2 + Math.cos(rad) * innerR,
      y1: size / 2 + Math.sin(rad) * innerR,
      x2: size / 2 + Math.cos(rad) * outerR,
      y2: size / 2 + Math.sin(rad) * outerR,
      active: i / tickCount <= value / 100,
    };
  });

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.92 0.01 200 / 0.5)"
          strokeWidth={strokeWidth}
        />
        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={
              t.active
                ? color
                : "oklch(0.88 0.01 200 / 0.4)"
            }
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}
        {/* Filled arc */}
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
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 12px ${color}50)` }}
        />
      </svg>
      {/* Center value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-4xl font-bold"
          style={{ color }}
        >
          {value}%
        </motion.span>
        <span className="mt-0.5 text-[10px] font-medium text-[oklch(0.5_0.02_210)]">
          Confidence
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SENTIMENT HELPERS
   ────────────────────────────────────────────────────────────────────────── */

const sentimentMap = {
  positive: {
    color: "oklch(0.65 0.16 185)",
    bg: "oklch(0.72 0.15 185 / 0.06)",
    border: "oklch(0.72 0.15 185 / 0.15)",
    icon: CheckCircle2,
  },
  warning: {
    color: "oklch(0.72 0.14 80)",
    bg: "oklch(0.82 0.12 80 / 0.06)",
    border: "oklch(0.82 0.12 80 / 0.15)",
    icon: AlertTriangle,
  },
  critical: {
    color: "oklch(0.6 0.2 25)",
    bg: "oklch(0.65 0.2 25 / 0.06)",
    border: "oklch(0.65 0.2 25 / 0.15)",
    icon: ShieldAlert,
  },
};

const trendIcon = (confidence: number) => {
  if (confidence >= 85)
    return <TrendingUp className="size-3.5 text-[oklch(0.65_0.16_185)]" />;
  if (confidence >= 60)
    return <Minus className="size-3.5 text-[oklch(0.72_0.14_80)]" />;
  return <TrendingDown className="size-3.5 text-[oklch(0.6_0.2_25)]" />;
};

/* ──────────────────────────────────────────────────────────────────────────
   FINAL ASSESSMENT COMPONENT
   ────────────────────────────────────────────────────────────────────────── */

export default function FinalAssessment({
  zoneName = "Coral Reef Shelf",
}: FinalAssessmentProps) {
  const [status] = useState<AssessmentStatus>("Stressed");
  const [expanded, setExpanded] = useState(true);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Animate confidence on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedConfidence(86), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className="mx-5 mb-5 overflow-hidden rounded-3xl"
      style={{
        background: `linear-gradient(135deg, oklch(1 0.005 200 / 0.5) 0%, oklch(0.97 0.01 195 / 0.35) 100%)`,
        border: `1px solid ${config.borderColor}`,
        boxShadow: `0 8px 40px ${config.bgGlow}, inset 0 1px 0 oklch(1 0 0 / 0.5)`,
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
      }}
    >
      {/* ── Header / Status Banner ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center justify-between px-7 py-5 transition-colors hover:bg-[oklch(0_0_0_/_0.01)]"
      >
        <div className="flex items-center gap-4">
          <div
            className="relative flex size-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `color-mix(in oklch, ${config.color} 12%, transparent)`,
              boxShadow: `0 0 24px ${config.bgGlow}`,
            }}
          >
            <StatusIcon className="size-6" style={{ color: config.color }} />
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ border: `2px solid ${config.color}` }}
              animate={{
                opacity: [0.4, 0.15, 0.4],
                scale: [1, 1.12, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.55_0.02_210)]">
              Final Assessment — {zoneName}
            </p>
            {/* Glowing status text */}
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-0.5 text-2xl font-extrabold tracking-tight"
              style={{
                color: config.color,
                textShadow: `0 0 30px ${config.glowColor}40, 0 0 60px ${config.glowColor}20`,
              }}
            >
              {config.label}
            </motion.h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `color-mix(in oklch, ${config.color} 10%, transparent)`,
              color: config.color,
              boxShadow: `0 0 12px ${config.bgGlow}`,
            }}
          >
            {config.sublabel}
          </span>
          {expanded ? (
            <ChevronUp className="size-5 text-[oklch(0.5_0.02_210)]" />
          ) : (
            <ChevronDown className="size-5 text-[oklch(0.5_0.02_210)]" />
          )}
        </div>
      </button>

      {/* ── Collapsible Body ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            className="overflow-hidden"
          >
            <div className="border-t border-[oklch(0.9_0.01_200_/_0.4)] px-7 pb-7 pt-6">
              {/* ── 2×2 Grid ── */}
              <div className="grid grid-cols-2 gap-5">
                {/* ── Cell 1: Combined Explanation ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="row-span-2 flex flex-col rounded-2xl p-5"
                  style={{
                    background: "oklch(1 0.003 200 / 0.4)",
                    border: "1px solid oklch(1 0 0 / 0.45)",
                    boxShadow:
                      "inset 0 1px 0 oklch(1 0 0 / 0.5), 0 4px 20px oklch(0 0 0 / 0.03)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.55_0.12_210_/_0.08)]">
                      <FileText className="size-3.5 text-[oklch(0.55_0.12_210)]" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.4_0.02_210)]">
                      Combined Explanation
                    </p>
                  </div>
                  <div className="flex-1 space-y-3 text-[13px] leading-relaxed text-[oklch(0.32_0.02_215)]">
                    <p>
                      The <strong className="text-[oklch(0.55_0.12_210)]">CORAL</strong> lead
                      agent detected a sustained thermal anomaly at coordinates{" "}
                      <strong>14.2°N, 120.5°E</strong>, triggering a
                      multi-agent investigation across three monitoring zones.
                    </p>
                    <p>
                      <strong className="text-[oklch(0.55_0.1_200)]">PHALANX</strong> correlated
                      this with 14 months of historical data, confirming the
                      pattern as a precursor to coral bleaching events. The
                      upwelling disruption is the primary causal mechanism, with
                      a pH correlation coefficient of r=0.82.
                    </p>
                    <p>
                      <strong className="text-[oklch(0.6_0.08_225)]">SCOUT-7</strong> flagged an
                      unclassified acoustic anomaly in the Bathypelagic zone that
                      may be related to shifting deep-water currents.{" "}
                      <strong className="text-[oklch(0.72_0.15_185)]">GAIA</strong> validated
                      all sensor integrity at 99.2%, confirming data reliability.
                    </p>
                    <div
                      className="mt-2 flex items-start gap-2 rounded-xl p-3"
                      style={{
                        background: `color-mix(in oklch, ${config.color} 5%, transparent)`,
                        border: `1px solid ${config.borderColor}`,
                      }}
                    >
                      <Info className="mt-0.5 size-3.5 shrink-0" style={{ color: config.color }} />
                      <p className="text-[11px] font-medium" style={{ color: config.color }}>
                        Overall assessment: Ecosystem shows{" "}
                        <strong>moderate stress indicators</strong>. Recommended
                        action: increase monitoring density in affected zones and
                        prepare thermal mitigation protocols.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* ── Cell 2: Confidence Score ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="flex flex-col items-center justify-center rounded-2xl p-5"
                  style={{
                    background: "oklch(1 0.003 200 / 0.4)",
                    border: "1px solid oklch(1 0 0 / 0.45)",
                    boxShadow:
                      "inset 0 1px 0 oklch(1 0 0 / 0.5), 0 4px 20px oklch(0 0 0 / 0.03)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.55_0.12_210_/_0.08)]">
                      <Target className="size-3.5 text-[oklch(0.55_0.12_210)]" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.4_0.02_210)]">
                      Confidence Score
                    </p>
                  </div>
                  <ConfidenceGauge
                    value={animatedConfidence}
                    color={config.color}
                    size={150}
                  />
                  <div className="mt-3 flex items-center gap-2">
                    {trendIcon(animatedConfidence)}
                    <span className="text-[11px] font-medium text-[oklch(0.5_0.02_210)]">
                      Based on 4 agent reports
                    </span>
                  </div>
                </motion.div>

                {/* ── Cell 3: Agent-Wise Findings ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: "oklch(1 0.003 200 / 0.4)",
                    border: "1px solid oklch(1 0 0 / 0.45)",
                    boxShadow:
                      "inset 0 1px 0 oklch(1 0 0 / 0.5), 0 4px 20px oklch(0 0 0 / 0.03)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.72_0.15_185_/_0.08)]">
                      <Bot className="size-3.5 text-[oklch(0.72_0.15_185)]" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.4_0.02_210)]">
                      Agent-Wise Findings
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {agentFindings.map((finding, i) => {
                      const sm = sentimentMap[finding.sentiment];
                      const SentimentIcon = sm.icon;
                      return (
                        <motion.div
                          key={finding.agent}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.4 + i * 0.08,
                            duration: 0.4,
                          }}
                          className="group rounded-xl p-3 transition-all"
                          style={{
                            background: sm.bg,
                            border: `1px solid ${sm.border}`,
                            boxShadow: `inset 0 1px 0 oklch(1 0 0 / 0.3)`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{finding.avatar}</span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: sm.color }}
                              >
                                {finding.agent}
                              </span>
                              <span className="text-[9px] text-[oklch(0.55_0.01_200)]">
                                {finding.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <SentimentIcon
                                className="size-3"
                                style={{ color: sm.color }}
                              />
                              <span
                                className="text-[10px] font-bold"
                                style={{ color: sm.color }}
                              >
                                {finding.confidence}%
                              </span>
                            </div>
                          </div>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-[oklch(0.35_0.02_210)]">
                            {finding.summary}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
