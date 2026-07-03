import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, GlassCard, KV, Badge, SectionTitle, StatPill, GlowBackground } from "@/src/components/ui";
import { api } from "@/src/api";

const { width } = Dimensions.get("window");

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 140, gap: 6, marginTop: spacing.md }}>
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              width: "100%",
              height: `${(v / max) * 100}%`,
              backgroundColor: colors.brandPrimary,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              opacity: 0.4 + (v / max) * 0.6,
            }}
          />
          <Text style={{ color: colors.onSurfaceTertiary, fontSize: 9, marginTop: 4, fontFamily: "Menlo" }}>
            {String(i).padStart(2, "0")}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function Analytics() {
  const [a, setA] = useState<any | null>(null);
  useEffect(() => {
    api.analytics().then(setA).catch(() => {});
  }, []);

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          title="National Analytics"
          subtitle="Government · Live cycle"
          right={<Badge label="OPERATIONAL" tone="success" icon="pulse-outline" />}
        />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <StatPill label="Registered" value={a ? `${(a.registered / 1e6).toFixed(1)}M` : "—"} />
            <StatPill label="Attendance" value={a ? `${a.attendance_pct}%` : "—"} />
          </View>
          <View style={{ height: spacing.md }} />
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <StatPill label="Centres" value={a ? `${a.active_centres.toLocaleString()}` : "—"} />
            <StatPill label="Incidents" value={a ? `${a.incidents}` : "—"} />
          </View>

          <View style={{ height: spacing.md }} />
          <GlassCard>
            <SectionTitle title="Hourly Verifications" hint="Face + liveness · rolling 12h" />
            <BarChart data={a?.hourly_verifications || []} />
          </GlassCard>

          <View style={{ height: spacing.md }} />
          <GlassCard>
            <SectionTitle title="Latency" hint="p95 across all nodes" />
            <KV k="Avg. Verification" v={a ? `${a.avg_verification_sec}s` : "—"} mono />
            <KV k="Paper Release Dispatch" v={a ? `${a.avg_paper_release_sec}s` : "—"} mono />
            <KV k="Suspicious Flags" v={a ? `${a.suspicious_flags}` : "—"} mono />
          </GlassCard>

          <View style={{ height: spacing.md }} />
          <SectionTitle title="Top Incidents" hint="Auto-triaged by severity" />
          <View style={{ gap: spacing.sm }}>
            {(a?.top_incidents || []).map((inc: any) => {
              const tone = inc.severity === "high" ? "error" : inc.severity === "medium" ? "warning" : "info";
              return (
                <View key={inc.id} style={s.inc}>
                  <View style={s.incIcon}>
                    <Ionicons name="warning-outline" size={16} color={colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.incT}>{inc.type}</Text>
                    <Text style={s.incM}>{inc.id} · {inc.centre}</Text>
                  </View>
                  <Badge label={inc.severity.toUpperCase()} tone={tone as any} />
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  inc: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.5)",
  },
  incIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
    backgroundColor: "rgba(245,158,11,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  incT: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium },
  incM: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2, fontFamily: "Menlo" },
});
