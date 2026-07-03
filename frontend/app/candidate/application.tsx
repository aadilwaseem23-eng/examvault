import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, GlassCard, Button, KV, Badge, SectionTitle, GlowBackground } from "@/src/components/ui";
import { api } from "@/src/api";

export default function ApplicationSubmitted() {
  const router = useRouter();
  const { aid } = useLocalSearchParams<{ aid: string }>();
  const [appData, setAppData] = useState<any | null>(null);

  useEffect(() => {
    if (aid) api.getApplication(aid as string).then(setAppData).catch(() => {});
  }, [aid]);

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Application Submitted" subtitle="Payment settled · receipt anchored" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <View style={s.trophy}>
            <View style={s.trophyRing}>
              <Ionicons name="checkmark" size={40} color={colors.success} />
            </View>
            <Text style={s.big}>Application Confirmed</Text>
            <Text style={s.sub}>
              A receipt hash has been anchored on EXAMVAULT-MAINNET.
            </Text>
            <View style={{ height: spacing.md }} />
            <Badge label="ON-CHAIN · CONFIRMED" tone="success" icon="cube-outline" />
          </View>

          <View style={{ height: spacing.xl }} />
          <GlassCard>
            <SectionTitle title="Application" />
            <KV k="Application No." v={String(appData?.id || "—")} mono testID="app-id" />
            <KV k="Exam" v={String(appData?.exam_name || appData?.exam || "—")} />
            <KV k="Centre" v={String(appData?.centre_id || "—")} mono />
            <KV k="Seat" v={String(appData?.seat_no || "—")} mono />
            <KV k="Exam Date" v={String(appData?.exam_date || "—")} />
            <KV k="Receipt Hash" v={String(appData?.receipt_hash || "").slice(0, 22) + "…"} mono />
          </GlassCard>

          <View style={{ height: spacing.md }} />
          <GlassCard>
            <SectionTitle title="What's next" />
            <View style={{ gap: spacing.md }}>
              {[
                { i: "shield-checkmark-outline", t: "Digital Admit Card issued 7 days before exam" },
                { i: "location-outline", t: "Centre auto-allotted using Merkle fairness proof" },
                { i: "notifications-outline", t: "Push alerts for vault release + centre updates" },
              ].map((x) => (
                <View key={x.t} style={s.tipRow}>
                  <Ionicons name={x.i as any} size={16} color={colors.brandPrimary} />
                  <Text style={s.tipText}>{x.t}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>

        <View style={s.footer}>
          <Button
            label="View Digital Admit Card"
            icon="qr-code-outline"
            onPress={() => router.push({ pathname: "/candidate/admit-card", params: { aid } })}
            testID="view-admit-card-button"
          />
          <View style={{ height: spacing.sm }} />
          <Button
            label="Back to Home"
            variant="secondary"
            onPress={() => router.replace("/")}
            testID="back-home-button"
          />
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  trophy: { alignItems: "center", marginTop: spacing.lg },
  trophyRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(16,185,129,0.45)",
    backgroundColor: colors.successGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  big: { color: colors.onSurface, fontSize: fs["2xl"], fontWeight: fw.medium, letterSpacing: 0.3 },
  sub: { color: colors.onSurfaceTertiary, fontSize: fs.base, marginTop: 6, textAlign: "center" },
  tipRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  tipText: { color: colors.onSurfaceSecondary, fontSize: fs.base, flex: 1 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
