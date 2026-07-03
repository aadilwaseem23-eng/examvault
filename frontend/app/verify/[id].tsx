import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, Button, GlassCard, KV, Badge, SectionTitle, GlowBackground, QRTile } from "@/src/components/ui";
import { api } from "@/src/api";

export default function VerifyCert() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [certId, setCertId] = useState(id || "EV-CERT-DEMO-001");
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await api.verifyCertificate(certId);
      setData(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Public Certificate Verifier" subtitle="Anyone can validate authenticity" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <GlassCard>
            <SectionTitle title="Certificate ID" hint="Paste or scan the ID on the certificate" />
            <TextInput
              value={certId}
              onChangeText={setCertId}
              style={s.input}
              autoCapitalize="characters"
              placeholderTextColor={colors.onSurfaceTertiary}
              placeholder="EV-CERT-…"
              testID="cert-id-input"
            />
            <View style={{ height: spacing.md }} />
            <Button
              label={loading ? "Verifying…" : "Verify"}
              loading={loading}
              icon="shield-checkmark-outline"
              onPress={run}
              testID="verify-cert-submit"
            />
          </GlassCard>

          {data && (
            <>
              <View style={{ height: spacing.md }} />
              <GlassCard>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <View style={s.badgeCircle}>
                    <Ionicons name="checkmark" size={28} color={colors.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.big}>VERIFIED</Text>
                    <Text style={s.sub}>Blockchain match on {data.chain}</Text>
                  </View>
                  <QRTile payload={data.certificate_id} size={92} />
                </View>
                <View style={{ height: spacing.md }} />
                <KV k="Certificate" v={data.certificate_id} mono />
                <KV k="Issuer" v={data.issuer} />
                <KV k="Block Height" v={`#${data.block_height}`} mono />
                <KV k="Tx Hash" v={data.tx_hash.slice(0, 22) + "…"} mono />
                <KV k="Issued" v={data.issued_at.slice(0, 19).replace("T", " ")} mono />
              </GlassCard>

              <View style={{ height: spacing.md }} />
              <SectionTitle title="Verification Trail" />
              <View style={{ gap: spacing.sm }}>
                {data.history.map((h: any, i: number) => (
                  <View key={i} style={s.trail}>
                    <Ionicons name="git-commit-outline" size={16} color={colors.brandPrimary} />
                    <Text style={s.trailT}>{h.event}</Text>
                    <Text style={s.trailTs}>{h.ts.slice(11, 19)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    color: colors.onSurface,
    padding: 14,
    fontSize: fs.base,
    fontFamily: "Menlo",
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.success,
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  big: { color: colors.success, fontSize: fs.xl, fontWeight: fw.medium, letterSpacing: 1.6 },
  sub: { color: colors.onSurfaceSecondary, fontSize: fs.sm, marginTop: 4 },
  trail: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.5)",
  },
  trailT: { flex: 1, color: colors.onSurface, fontSize: fs.base },
  trailTs: { color: colors.brandPrimary, fontFamily: "Menlo", fontSize: fs.sm },
});
