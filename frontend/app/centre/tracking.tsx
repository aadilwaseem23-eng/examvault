import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, GlassCard, Badge, SectionTitle, GlowBackground, KV } from "@/src/components/ui";
import { api } from "@/src/api";

export default function Tracking() {
  const [sheets, setSheets] = useState<any[]>([]);
  useEffect(() => {
    api.sheets().then((r) => setSheets(r.sheets || [])).catch(() => {});
  }, []);

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Answer Sheet Tracking" subtitle="QR · Hash · On-chain custody" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          {sheets.map((sh) => (
            <View key={sh.id} style={{ marginBottom: spacing.md }}>
              <GlassCard>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={s.sid}>{sh.id}</Text>
                    <Text style={s.cid}>{sh.candidate}</Text>
                  </View>
                  <Badge
                    label={sh.status.replace("_", " ")}
                    tone={sh.status === "AT_EVALUATION" ? "success" : "info"}
                    icon="cube-outline"
                  />
                </View>
                <View style={{ height: spacing.sm }} />
                <KV k="SHA-256" v={sh.hash + "…"} mono />
                <View style={{ height: spacing.sm }} />
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingTop: spacing.sm }}>
                  {sh.chain_of_custody.map((c: any, i: number) => (
                    <View key={i} style={s.custRow}>
                      <Ionicons name="git-commit-outline" size={14} color={colors.brandPrimary} />
                      <Text style={s.custT}>{c.ts}</Text>
                      <Text style={s.custE}>{c.event}</Text>
                      <Text style={s.custA}>{c.actor}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  sid: { color: colors.onSurface, fontSize: fs.base, fontFamily: "Menlo", fontWeight: fw.medium },
  cid: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2, fontFamily: "Menlo" },
  custRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  custT: { color: colors.brandPrimary, fontFamily: "Menlo", fontSize: fs.sm, width: 44 },
  custE: { color: colors.onSurface, fontSize: fs.sm, flex: 1 },
  custA: { color: colors.onSurfaceTertiary, fontSize: fs.sm, fontFamily: "Menlo" },
});
