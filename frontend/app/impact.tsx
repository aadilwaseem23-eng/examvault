import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, Button, GlassCard, Badge, SectionTitle, GlowBackground } from "@/src/components/ui";

const FLOW = [
  { i: "cube-outline", t: "Physical Transportation", d: "Trucks, sealed boxes, chain-of-command hand-offs" },
  { i: "shield-checkmark-outline", t: "Digital Vault", d: "AES-256 encrypted paper, sealed at source" },
  { i: "cloud-upload-outline", t: "Encrypted Distribution", d: "Zero physical movement · signed manifests" },
  { i: "print-outline", t: "Secure Local Printing", d: "Decrypt 45m prior · watermark · CCTV verified" },
  { i: "ribbon-outline", t: "Transparent Results", d: "Anchored on-chain · scanned sheet public" },
];

const BENEFITS = [
  { i: "cash-outline", t: "Reduced logistics" },
  { i: "time-outline", t: "Faster release" },
  { i: "eye-outline", t: "Full transparency" },
  { i: "footsteps-outline", t: "Full traceability" },
  { i: "lock-closed-outline", t: "Zero trust" },
  { i: "warning-outline", t: "Fraud reduction" },
  { i: "leaf-outline", t: "Environmental gains" },
  { i: "heart-outline", t: "Student trust" },
];

export default function Impact() {
  const router = useRouter();
  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="From Paper to Proof" subtitle="How ExamVault transforms exams" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <GlassCard>
            <SectionTitle title="Transformation" hint="Every step, cryptographically bound" />
            <View style={{ gap: spacing.md }}>
              {FLOW.map((f, i) => (
                <View key={i} style={s.step}>
                  <View style={s.stepIdx}>
                    <Text style={s.stepIdxT}>{String(i + 1).padStart(2, "0")}</Text>
                  </View>
                  <View style={s.stepIcon}>
                    <Ionicons name={f.i as any} size={18} color={colors.brandPrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.stepT}>{f.t}</Text>
                    <Text style={s.stepD}>{f.d}</Text>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          <View style={{ height: spacing.md }} />
          <SectionTitle title="Benefits" hint="Compound gains across the DPI" />
          <View style={s.grid}>
            {BENEFITS.map((b) => (
              <View key={b.t} style={s.tile}>
                <View style={s.tileIcon}>
                  <Ionicons name={b.i as any} size={18} color={colors.brandPrimary} />
                </View>
                <Text style={s.tileT}>{b.t}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: spacing.lg }} />
          <Button
            label="Return to Landing"
            icon="home-outline"
            onPress={() => router.replace("/")}
            testID="impact-home-button"
          />
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  step: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepIdx: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIdxT: { color: colors.brandPrimary, fontSize: fs.sm, fontFamily: "Menlo", fontWeight: fw.medium },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepT: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium },
  stepD: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  tile: {
    width: "47.5%",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.5)",
    gap: spacing.sm,
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  tileT: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium },
});
