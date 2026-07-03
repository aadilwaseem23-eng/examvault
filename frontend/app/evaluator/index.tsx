import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, Button, GlassCard, KV, Badge, SectionTitle, GlowBackground } from "@/src/components/ui";
import { api } from "@/src/api";

export default function EvaluatorDashboard() {
  const [queue, setQueue] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [marks, setMarks] = useState(72);
  const [submitted, setSubmitted] = useState<any | null>(null);

  useEffect(() => {
    api.evalQueue().then((r) => {
      setQueue(r.queue || []);
      setActive(r.queue?.[0] || null);
    });
  }, []);

  const submit = async () => {
    if (!active) return;
    const res = await api.submitEval({
      sheet_id: active.sheet_id,
      marks,
      remarks: "Comprehensive coverage; minor derivation gaps.",
      evaluator_id: "EVL-42",
    });
    setSubmitted(res);
  };

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          title="Evaluation Console"
          subtitle="Blockchain-anchored marking"
          right={<Badge label="EVL-42" tone="info" icon="finger-print-outline" />}
        />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          <SectionTitle title="Queue" hint={`${queue.length} sheets pending`} />
          <View style={{ gap: spacing.sm }}>
            {queue.map((q) => {
              const isActive = active?.sheet_id === q.sheet_id;
              return (
                <View key={q.sheet_id} style={[s.qRow, isActive && s.qActive]}>
                  <View style={s.qLeft}>
                    <Text style={s.qId}>{q.sheet_id}</Text>
                    <Text style={s.qMeta}>
                      {q.subject} · {q.pages}p · SLA {q.sla_minutes}m
                    </Text>
                  </View>
                  <Button
                    label={isActive ? "Active" : "Open"}
                    variant={isActive ? "success" : "ghost"}
                    onPress={() => setActive(q)}
                    style={{ minHeight: 34, paddingHorizontal: 12 }}
                  />
                </View>
              );
            })}
          </View>

          <View style={{ height: spacing.md }} />
          <GlassCard>
            <SectionTitle title="Active Sheet" />
            <KV k="Sheet ID" v={active?.sheet_id || "—"} mono />
            <KV k="Subject" v={active?.subject || "—"} />
            <KV k="Pages" v={String(active?.pages ?? "—")} />
            <View style={{ height: spacing.md }} />
            <Text style={s.k}>MARKS ENTRY</Text>
            <View style={s.marksRow}>
              <Button
                label="−"
                variant="secondary"
                onPress={() => setMarks((m) => Math.max(0, m - 1))}
                style={{ width: 56 }}
                testID="marks-dec"
              />
              <View style={s.marksBox}>
                <Text style={s.marksV}>{marks}</Text>
                <Text style={s.marksTot}>/ 90</Text>
              </View>
              <Button label="+" onPress={() => setMarks((m) => Math.min(90, m + 1))} style={{ width: 56 }} testID="marks-inc" />
            </View>
            <View style={{ height: spacing.md }} />
            <Button
              label={submitted ? "Anchored ✓" : "Submit to Blockchain"}
              variant={submitted ? "success" : "primary"}
              icon="cube-outline"
              onPress={submit}
              disabled={!active || !!submitted}
              testID="eval-submit-button"
            />
          </GlassCard>

          {submitted && (
            <>
              <View style={{ height: spacing.md }} />
              <GlassCard>
                <SectionTitle title="Audit Receipt" />
                <KV k="Eval ID" v={submitted.id} mono />
                <KV k="Chain Hash" v={submitted.chain_hash.slice(0, 22) + "…"} mono />
                <KV k="Block Height" v={`#${submitted.block_height}`} mono />
                <KV k="Submitted" v={submitted.submitted_at.slice(0, 19).replace("T", " ")} mono />
                <View style={{ height: spacing.sm }} />
                <Badge label="IMMUTABLE · REPLAYABLE" tone="success" icon="shield-checkmark-outline" />
              </GlassCard>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  qRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.5)",
  },
  qActive: { borderColor: colors.brandPrimary, backgroundColor: colors.brandGlow },
  qLeft: { flex: 1 },
  qId: { color: colors.onSurface, fontSize: fs.base, fontFamily: "Menlo", fontWeight: fw.medium },
  qMeta: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2 },
  k: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 1.4 },
  marksRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  marksBox: {
    flex: 1,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 6,
  },
  marksV: { color: colors.brandPrimary, fontSize: fs["3xl"], fontFamily: "Menlo", fontWeight: fw.medium },
  marksTot: { color: colors.onSurfaceTertiary, fontSize: fs.lg, fontFamily: "Menlo" },
});
