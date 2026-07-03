import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, Button, GlassCard, KV, Badge, SectionTitle, GlowBackground } from "@/src/components/ui";

export default function ExamInProgress() {
  const router = useRouter();
  const { aid } = useLocalSearchParams<{ aid: string }>();
  const [remaining, setRemaining] = useState(3 * 60 * 60);
  const [q, setQ] = useState(37);

  useEffect(() => {
    const iv = setInterval(() => setRemaining((r) => Math.max(0, r - 60)), 1000);
    return () => clearInterval(iv);
  }, []);

  const hh = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Examination · In Progress" subtitle="Every action digitally logged" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <GlassCard>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={s.k}>TIME REMAINING</Text>
                <Text style={s.timer}>{`${hh}:${mm}:${ss}`}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.k}>QUESTION</Text>
                <Text style={s.big}>{q} / 90</Text>
              </View>
            </View>
            <View style={{ height: spacing.md }} />
            <View style={s.track}>
              <View style={[s.trackFill, { width: `${(q / 90) * 100}%` }]} />
            </View>
          </GlassCard>

          <View style={{ height: spacing.md }} />
          <SectionTitle title="Live Integrity Signals" />
          <View style={{ gap: spacing.sm }}>
            {[
              { i: "eye-outline", t: "Attention monitoring", v: "Nominal", tone: "success" },
              { i: "hand-left-outline", t: "Copy-detect scan", v: "Clear", tone: "success" },
              { i: "notifications-outline", t: "Proctor pings", v: "0 events", tone: "info" },
              { i: "cloud-upload-outline", t: "Auto-save", v: "Every 15s · chained", tone: "info" },
            ].map((x) => (
              <View key={x.t} style={s.sig}>
                <View style={s.sigIcon}>
                  <Ionicons name={x.i as any} size={16} color={colors.brandPrimary} />
                </View>
                <Text style={s.sigT}>{x.t}</Text>
                <Badge label={x.v} tone={x.tone as any} />
              </View>
            ))}
          </View>

          <View style={{ height: spacing.md }} />
          <GlassCard>
            <SectionTitle title="Session" />
            <KV k="Application" v={String(aid || "—")} mono />
            <KV k="Auto-save hash" v={"c9f3a1b0…"} mono />
            <KV k="Anchoring interval" v="60s" />
          </GlassCard>

          <View style={{ height: spacing.md }} />
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              label="Prev"
              variant="secondary"
              onPress={() => setQ((v) => Math.max(1, v - 1))}
              style={{ flex: 1 }}
            />
            <Button label="Next" icon="arrow-forward" onPress={() => setQ((v) => Math.min(90, v + 1))} style={{ flex: 1 }} />
          </View>

          <View style={{ height: spacing.md }} />
          <Button
            label="Submit & Anchor Sheet"
            icon="cloud-done-outline"
            variant="success"
            onPress={() => router.push({ pathname: "/candidate/result", params: { aid } })}
            testID="submit-anchor-button"
          />
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  k: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 1.4 },
  timer: { color: colors.brandPrimary, fontSize: fs["2xl"], fontFamily: "Menlo", fontWeight: fw.medium, marginTop: 4 },
  big: { color: colors.onSurface, fontSize: fs.xl, fontWeight: fw.medium, marginTop: 4 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceSecondary, overflow: "hidden" },
  trackFill: { height: "100%", backgroundColor: colors.brandPrimary, borderRadius: 4 },
  sig: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.5)",
  },
  sigIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  sigT: { flex: 1, color: colors.onSurface, fontSize: fs.base },
});
