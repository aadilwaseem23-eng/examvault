import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, Badge, GlassCard, KV, SectionTitle } from "@/src/components/ui";

const QA = [
  { q: "Q12. State Newton's third law of motion.", ans: "For every action, there is an equal and opposite reaction.", mark: 2, max: 2, ok: true },
  { q: "Q13. Balance the redox reaction in acidic medium.", ans: "MnO4⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O", mark: 3, max: 4, ok: true, note: "-1 for missing state" },
  { q: "Q14. Explain photosynthesis light reaction.", ans: "Water is split; ATP and NADPH are generated in thylakoids.", mark: 4, max: 4, ok: true },
  { q: "Q15. Derive lens formula (thin lens approximation).", ans: "1/v − 1/u = 1/f, from refraction at both surfaces.", mark: 2, max: 3, ok: false, note: "Incomplete derivation" },
];

export default function AnswerSheet() {
  const { aid } = useLocalSearchParams<{ aid: string }>();
  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          title="Scanned Answer Sheet"
          subtitle="Every mark auditable · Every stroke hashed"
          right={<Badge label="EVALUATED" tone="success" icon="checkmark-circle-outline" />}
        />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <GlassCard>
            <SectionTitle title="Sheet Metadata" />
            <KV k="Application" v={String(aid || "—")} mono />
            <KV k="Sheet ID" v="AS-2028-10041" mono />
            <KV k="Evaluator" v="EVL-42 · Dr. R. Menon" />
            <KV k="Evaluator Sig" v="0x9c1f…7a" mono />
            <KV k="Block Anchor" v="#1,284,991" mono />
          </GlassCard>

          <View style={{ height: spacing.md }} />
          {QA.map((row, i) => (
            <View key={i} style={s.page}>
              <View style={s.paperBar}>
                <Ionicons name="document-text-outline" size={14} color={colors.brandPrimary} />
                <Text style={s.paperK}>PAGE {i + 3} · WATERMARK B7A11</Text>
              </View>
              <Text style={s.q}>{row.q}</Text>
              <View style={s.paper}>
                <Text style={s.a}>{row.ans}</Text>
              </View>
              <View style={s.markRow}>
                <View style={[s.evaluatorNote, { borderColor: row.ok ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)" }]}>
                  <Ionicons
                    name={row.ok ? "checkmark" : "close"}
                    size={14}
                    color={row.ok ? colors.success : colors.error}
                  />
                  <Text style={[s.noteText, { color: row.ok ? colors.success : colors.error }]}>
                    {row.note || (row.ok ? "Correct" : "Partial")}
                  </Text>
                </View>
                <Text style={s.markPill}>
                  {row.mark} / {row.max}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  page: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
  },
  paperBar: { flexDirection: "row", alignItems: "center", gap: 8 },
  paperK: { color: colors.onSurfaceTertiary, fontFamily: "Menlo", fontSize: fs.sm, letterSpacing: 1.2 },
  q: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium, marginTop: spacing.sm },
  paper: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    minHeight: 60,
  },
  a: { color: "#0F172A", fontSize: fs.base, fontFamily: "Menlo", lineHeight: 20 },
  markRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },
  evaluatorNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  noteText: { fontSize: fs.sm, fontWeight: fw.medium },
  markPill: {
    color: colors.brandPrimary,
    fontFamily: "Menlo",
    fontSize: fs.base,
    fontWeight: fw.medium,
  },
});
