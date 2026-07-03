import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors, spacing, radius, fs, fw, IMG } from "@/src/theme";
import { Screen, Header, Button, GlassCard, KV, Badge, SectionTitle } from "@/src/components/ui";

const { width } = Dimensions.get("window");
const CH = Math.min(320, width * 0.8);
const CHECKS = [
  { id: "qr", label: "QR Scan", icon: "qr-code-outline" as const },
  { id: "face", label: "Face Match", icon: "person-circle-outline" as const },
  { id: "id", label: "Gov ID Verify", icon: "id-card-outline" as const },
  { id: "seat", label: "Seat Confirmation", icon: "location-outline" as const },
];

export default function ExamAuth() {
  const router = useRouter();
  const { aid } = useLocalSearchParams<{ aid: string }>();
  const [progress, setProgress] = useState(-1);

  const scan = useSharedValue(0);
  useEffect(() => {
    scan.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false);
  }, []);
  const scanStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scan.value * (CH - 20) }] }));

  const start = () => {
    setProgress(0);
    CHECKS.forEach((_, i) => {
      setTimeout(() => setProgress(i + 1), (i + 1) * 900);
    });
  };

  const done = progress >= CHECKS.length;

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Candidate Authentication" subtitle="Zero-Trust · Multi-factor" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <View style={[s.viewport, { height: CH }]}>
            <Image source={{ uri: IMG.biometric }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={["rgba(15,23,42,0.4)", "rgba(15,23,42,0.15)", "rgba(15,23,42,0.9)"]}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[s.scanLine, scanStyle, { opacity: progress >= 0 && !done ? 1 : 0.2 }]} />
            <View style={s.centerBox}>
              <Ionicons
                name={done ? "shield-checkmark" : "person-outline"}
                size={44}
                color={done ? colors.success : colors.brandPrimary}
              />
            </View>
            <View style={s.vpFooter}>
              <Badge
                label={done ? "GRANTED" : progress >= 0 ? "AUTHENTICATING" : "STANDBY"}
                tone={done ? "success" : "info"}
                icon="finger-print-outline"
              />
            </View>
          </View>

          <View style={{ height: spacing.lg }} />
          <SectionTitle title="Verification Chain" />
          <View style={{ gap: spacing.sm }}>
            {CHECKS.map((c, i) => {
              const active = i < progress;
              return (
                <View key={c.id} style={[s.chkRow, active && s.chkRowActive]}>
                  <View style={[s.chkIcon, active && { borderColor: colors.success, backgroundColor: colors.successGlow }]}>
                    <Ionicons name={c.icon} size={18} color={active ? colors.success : colors.brandPrimary} />
                  </View>
                  <Text style={s.chkLbl}>{c.label}</Text>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  ) : (
                    <Text style={s.chkP}>…</Text>
                  )}
                </View>
              );
            })}
          </View>

          <View style={{ height: spacing.md }} />
          <GlassCard>
            <SectionTitle title="Session" />
            <KV k="Application" v={String(aid || "—")} mono />
            <KV k="Seat" v="R14-S28" />
            <KV k="Hall" v="Block-C · Row 3" />
          </GlassCard>
        </ScrollView>

        <View style={s.footer}>
          {!done ? (
            <Button
              label={progress >= 0 ? "Authenticating…" : "Begin Authentication"}
              icon="scan-outline"
              loading={progress >= 0 && !done}
              onPress={start}
              testID="begin-auth-button"
            />
          ) : (
            <Button
              label="Enter Examination"
              icon="arrow-forward"
              onPress={() => router.push({ pathname: "/candidate/exam", params: { aid } })}
              testID="enter-exam-button"
            />
          )}
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  viewport: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: colors.brandPrimary,
    shadowColor: colors.brandPrimary,
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  centerBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.5)",
    backgroundColor: "rgba(15,23,42,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  vpFooter: { position: "absolute", bottom: 12, left: 12 },
  chkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.5)",
  },
  chkRowActive: { borderColor: "rgba(16,185,129,0.4)", backgroundColor: "rgba(16,185,129,0.06)" },
  chkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  chkLbl: { color: colors.onSurface, fontSize: fs.base, flex: 1 },
  chkP: { color: colors.onSurfaceTertiary, fontSize: fs.base },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
