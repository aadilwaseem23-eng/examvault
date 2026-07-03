import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, Button, GlassCard, KV, Badge, QRTile, SectionTitle } from "@/src/components/ui";
import { api } from "@/src/api";

export default function AdmitCard() {
  const router = useRouter();
  const { aid } = useLocalSearchParams<{ aid: string }>();
  const [card, setCard] = useState<any | null>(null);

  useEffect(() => {
    if (aid) api.getAdmitCard(aid as string).then(setCard).catch(() => {});
  }, [aid]);

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Digital Admit Card" subtitle="Signed · QR · Cryptographic" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <View style={s.card}>
            <LinearGradient
              colors={["rgba(56,189,248,0.20)", "rgba(6,182,212,0.05)", "rgba(15,23,42,0.9)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ padding: spacing.lg }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={s.cardLabel}>EXAMVAULT · e-ADMIT</Text>
                  <Text style={s.cardTitle}>{card?.exam || "Loading exam…"}</Text>
                </View>
                <View style={s.chip}>
                  <Ionicons name="lock-closed" size={12} color={colors.brandPrimary} />
                  <Text style={s.chipText}>V1</Text>
                </View>
              </View>

              <View style={{ height: spacing.lg }} />
              <View style={s.row}>
                <View style={{ flex: 1, gap: 8 }}>
                  <View>
                    <Text style={s.k}>Candidate</Text>
                    <Text style={s.v} numberOfLines={1}>
                      {card?.candidate?.name || "—"}
                    </Text>
                  </View>
                  <View>
                    <Text style={s.k}>Gov ID</Text>
                    <Text style={s.v}>{card ? `•••• •••• ${card.candidate?.gov_id_masked || ""}` : "—"}</Text>
                  </View>
                  <View>
                    <Text style={s.k}>Seat No.</Text>
                    <Text style={s.v}>{card?.seat_no || "—"}</Text>
                  </View>
                </View>
                <View style={{ marginLeft: spacing.md }}>
                  <QRTile payload={card?.qr_payload || "EXAMVAULT|LOADING"} size={130} />
                </View>
              </View>

              <View style={{ height: spacing.lg }} />
              <View style={s.rowSpread}>
                <View>
                  <Text style={s.k}>Centre</Text>
                  <Text style={s.v}>{card?.centre?.name || "—"}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.k}>Report by</Text>
                  <Text style={s.v}>{card?.reporting_time || "—"}</Text>
                </View>
              </View>

              <View style={{ height: spacing.md }} />
              <View style={s.sigBar}>
                <Ionicons name="finger-print-outline" size={14} color={colors.brandPrimary} />
                <Text style={s.sigText} numberOfLines={1}>
                  sig: {(card?.signature || "").slice(0, 32) || "—"}…
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: spacing.lg }} />
          <GlassCard>
            <SectionTitle title="Cryptographic Proofs" />
            <KV k="Admit ID" v={card?.admit_id || "—"} mono />
            <KV k="Exam Date" v={card?.exam_date || "—"} />
            <KV k="QR Payload" v={(card?.qr_payload || "").slice(0, 30) + "…"} mono />
            <KV k="Issued At" v={card?.issued_at?.slice(0, 19).replace("T", " ") || "—"} mono />
            <View style={{ height: spacing.sm }} />
            <Badge label="Ed25519 Signed · Verifiable Offline" tone="info" icon="shield-checkmark-outline" />
          </GlassCard>
        </ScrollView>

        <View style={s.footer}>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button label="Download" variant="secondary" icon="download-outline" style={{ flex: 1 }} testID="admit-download" />
            <Button
              label="Simulate Exam Day"
              icon="arrow-forward"
              onPress={() => router.push({ pathname: "/candidate/exam-auth", params: { aid } })}
              style={{ flex: 1 }}
              testID="admit-exam-day-button"
            />
          </View>
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
    backgroundColor: colors.surfaceSecondary,
  },
  cardLabel: { color: colors.brandPrimary, fontSize: fs.sm, letterSpacing: 2, fontWeight: fw.medium },
  cardTitle: { color: colors.onSurface, fontSize: fs.xl, fontWeight: fw.medium, marginTop: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
  },
  chipText: { color: colors.brandPrimary, fontSize: fs.sm, fontWeight: fw.medium, letterSpacing: 0.8 },
  row: { flexDirection: "row", alignItems: "center" },
  rowSpread: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  k: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 0.4 },
  v: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium, marginTop: 2 },
  sigBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  sigText: { color: colors.brandPrimary, fontSize: fs.sm, fontFamily: "Menlo", flex: 1 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
