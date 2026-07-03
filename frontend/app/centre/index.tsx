import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import {
  Screen,
  Header,
  Button,
  GlassCard,
  KV,
  Badge,
  SectionTitle,
  StatPill,
  GlowBackground,
} from "@/src/components/ui";
import { api } from "@/src/api";

export default function Centre() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    api.centreDashboard().then(setData).catch(() => {});
  }, []);

  const timeline = data?.timeline || [];

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          title="Exam Centre Node"
          subtitle={data?.centre?.name || "Loading…"}
          right={<Badge label="LIVE" tone="success" icon="radio-outline" />}
        />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <StatPill label="Printed" value={`${data?.printed_count ?? 0}`} testID="centre-printed" />
            <StatPill label="Seats" value={`${data?.total_seats ?? 0}`} />
          </View>
          <View style={{ height: spacing.md }} />
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <StatPill label="Printer" value={data?.printer?.status || "—"} />
            <StatPill label="CCTV" value={data?.cctv_stream || "—"} />
          </View>

          <View style={{ height: spacing.md }} />
          <GlassCard>
            <SectionTitle title="Paper Bundle" />
            <KV k="Status" v={data?.paper_status || "—"} />
            <KV k="Printer ID" v={data?.printer?.id || "—"} mono />
            <KV k="Watermark" v={data?.watermark_id || "—"} mono />
            <KV k="Queue" v={`${data?.printer?.queue ?? 0} jobs`} />
            <View style={{ height: spacing.sm }} />
            <Badge label="AES-256 · CCTV verified · Local-only" tone="info" icon="videocam-outline" />
          </GlassCard>

          <View style={{ height: spacing.md }} />
          <SectionTitle title="Chain of Custody" hint="Every event is hashed and anchored" />
          <View style={s.timeline}>
            {timeline.map((t: any, i: number) => (
              <View key={i} style={s.tRow}>
                <View style={s.tLeft}>
                  <View style={s.tDot} />
                  {i < timeline.length - 1 && <View style={s.tLine} />}
                </View>
                <View style={{ flex: 1, paddingBottom: spacing.md }}>
                  <View style={s.tHead}>
                    <Text style={s.tTime}>{t.ts}</Text>
                    <Text style={s.tHash}>{t.hash}</Text>
                  </View>
                  <Text style={s.tEvent}>{t.event}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: spacing.md }} />
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              label="Answer Sheet Tracking"
              icon="qr-code-outline"
              variant="secondary"
              onPress={() => router.push("/centre/tracking")}
              style={{ flex: 1 }}
              testID="centre-tracking-button"
            />
            <Button
              label="Candidate Auth"
              icon="scan-outline"
              onPress={() => router.push({ pathname: "/candidate/exam-auth", params: { aid: "DEMO" } })}
              style={{ flex: 1 }}
              testID="centre-auth-button"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  timeline: { paddingLeft: 4 },
  tRow: { flexDirection: "row", gap: spacing.md },
  tLeft: { alignItems: "center", width: 16 },
  tDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandPrimary,
    marginTop: 4,
    shadowColor: colors.brandPrimary,
    shadowRadius: 8,
    shadowOpacity: 0.7,
  },
  tLine: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 2 },
  tHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tTime: { color: colors.brandPrimary, fontFamily: "Menlo", fontSize: fs.sm },
  tHash: { color: colors.onSurfaceTertiary, fontFamily: "Menlo", fontSize: fs.sm },
  tEvent: { color: colors.onSurface, fontSize: fs.base, marginTop: 4 },
});
