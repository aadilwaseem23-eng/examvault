import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, Button, GlassCard, KV, Badge, SectionTitle, GlowBackground } from "@/src/components/ui";
import { api } from "@/src/api";

export default function Result() {
  const router = useRouter();
  const { aid } = useLocalSearchParams<{ aid: string }>();
  const [r, setR] = useState<any | null>(null);

  useEffect(() => {
    if (aid) api.getResult(aid as string).then(setR).catch(() => {});
  }, [aid]);

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Result" subtitle="Transparent · Verifiable · On-chain" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          {/* Hero scorecard */}
          <View style={s.hero}>
            <LinearGradient
              colors={["rgba(56,189,248,0.25)", "rgba(6,182,212,0.05)", "rgba(15,23,42,0.9)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ padding: spacing.xl }}>
              <Text style={s.k}>{r?.exam || "—"}</Text>
              <Text style={s.name}>{r?.candidate_name || "—"}</Text>
              <View style={{ height: spacing.lg }} />
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                <Text style={s.score}>{r?.marks ?? "—"}</Text>
                <Text style={s.total}>/ {r?.total ?? "720"}</Text>
              </View>
              <View style={{ height: spacing.md }} />
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <View style={s.mini}>
                  <Text style={s.miniK}>PERCENTILE</Text>
                  <Text style={s.miniV}>{r ? `${r.percentile}%` : "—"}</Text>
                </View>
                <View style={s.mini}>
                  <Text style={s.miniK}>ALL-INDIA RANK</Text>
                  <Text style={s.miniV}>{r?.rank ? `#${r.rank}` : "—"}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: spacing.md }} />
          <SectionTitle title="Section-wise Scores" />
          <View style={{ gap: spacing.sm }}>
            {(r?.sections || []).map((sec: any) => {
              const pct = (sec.score / sec.total) * 100;
              return (
                <GlassCard key={sec.name}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={s.sec}>{sec.name}</Text>
                    <Text style={s.secScore}>
                      {sec.score} / {sec.total}
                    </Text>
                  </View>
                  <View style={{ height: 8 }} />
                  <View style={s.track}>
                    <View style={[s.trackFill, { width: `${pct}%` }]} />
                  </View>
                </GlassCard>
              );
            })}
          </View>

          <View style={{ height: spacing.md }} />
          <GlassCard>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <View style={s.verifyIcon}>
                <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.verifiedLbl}>BLOCKCHAIN VERIFIED</Text>
                <Text style={s.verifiedSub}>
                  Anchored on {r?.chain || "EXAMVAULT-MAINNET"} · block #{r?.block_height ?? "—"}
                </Text>
              </View>
            </View>
            <View style={{ height: spacing.md }} />
            <KV k="Certificate ID" v={r?.certificate_id || "—"} mono />
            <KV k="Certificate Hash" v={(r?.certificate_hash || "").slice(0, 22) + "…"} mono />
            <KV k="Issued" v={(r?.issued_at || "").slice(0, 19).replace("T", " ")} mono />
          </GlassCard>

          <View style={{ height: spacing.md }} />
          <View style={{ gap: spacing.sm }}>
            <Button
              label="View Scanned Answer Sheet"
              icon="document-text-outline"
              variant="secondary"
              onPress={() => router.push({ pathname: "/candidate/answer-sheet", params: { aid } })}
              testID="view-answer-sheet-button"
            />
            <Button
              label="Verify Certificate Publicly"
              icon="ribbon-outline"
              variant="ghost"
              onPress={() =>
                router.push({ pathname: "/verify/[id]", params: { id: r?.certificate_id || "DEMO" } })
              }
              testID="verify-cert-button"
            />
            <Button label="Download Certificate" icon="download-outline" testID="download-cert-button" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
  },
  k: { color: colors.brandPrimary, fontSize: fs.sm, letterSpacing: 2, fontWeight: fw.medium },
  name: { color: colors.onSurface, fontSize: fs.xl, marginTop: 4, fontWeight: fw.medium },
  score: { color: colors.onSurface, fontSize: fs["4xl"], fontWeight: fw.medium, letterSpacing: 1 },
  total: { color: colors.onSurfaceTertiary, fontSize: fs.xl },
  mini: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  miniK: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 1.4 },
  miniV: { color: colors.onSurface, fontSize: fs.lg, fontWeight: fw.medium, marginTop: 4 },
  sec: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium },
  secScore: { color: colors.brandPrimary, fontSize: fs.base, fontFamily: "Menlo" },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceSecondary, overflow: "hidden" },
  trackFill: { height: "100%", backgroundColor: colors.brandPrimary },
  verifyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.5)",
    backgroundColor: colors.successGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedLbl: { color: colors.success, fontSize: fs.sm, letterSpacing: 2, fontWeight: fw.medium },
  verifiedSub: { color: colors.onSurfaceSecondary, fontSize: fs.sm, marginTop: 4 },
});
