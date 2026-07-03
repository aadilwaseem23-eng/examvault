import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
import { api } from "@/src/api";

const { width } = Dimensions.get("window");
const CAM_H = Math.min(360, width * 0.9);

export default function Verify() {
  const router = useRouter();
  const { cid, exam } = useLocalSearchParams<{ cid: string; exam: string }>();
  const [stage, setStage] = useState<"idle" | "scanning" | "done">("idle");
  const [result, setResult] = useState<any | null>(null);

  const scan = useSharedValue(0);
  useEffect(() => {
    scan.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.linear }), -1, false);
  }, []);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (scan.value * (CAM_H - 24)) }],
    opacity: stage === "scanning" ? 1 : 0.35,
  }));

  const doVerify = async () => {
    if (!cid) return;
    setStage("scanning");
    setTimeout(async () => {
      try {
        const res = await api.verifyCandidate(cid as string);
        setResult(res);
        setStage("done");
      } catch {
        setStage("idle");
      }
    }, 2200);
  };

  const proceed = async () => {
    try {
      const apply = await api.createApplication({
        candidate_id: cid,
        exam,
        centre_pref: "CTR-DEL-014",
      });
      router.push({ pathname: "/candidate/application", params: { aid: apply.id } });
    } catch {}
  };

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Identity Verification" subtitle="Face · Liveness · Duplicate" />
        <View style={s.scroll}>
          {/* Camera viewfinder */}
          <View style={[s.cam, { height: CAM_H }]}>
            <Image source={{ uri: IMG.biometric }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={["rgba(15,23,42,0.4)", "rgba(15,23,42,0.1)", "rgba(15,23,42,0.85)"]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
            {/* corner reticles */}
            {[
              { top: 12, left: 12, br: [3, 0, 0, 0] },
              { top: 12, right: 12, br: [0, 3, 0, 0] },
              { bottom: 12, left: 12, br: [0, 0, 0, 3] },
              { bottom: 12, right: 12, br: [0, 0, 3, 0] },
            ].map((r, i) => (
              <View
                key={i}
                style={[
                  s.corner,
                  {
                    top: (r as any).top,
                    left: (r as any).left,
                    right: (r as any).right,
                    bottom: (r as any).bottom,
                  },
                ]}
              />
            ))}
            <Animated.View style={[s.scanLine, scanStyle]} />
            <View style={s.reticleCenter}>
              <View style={s.reticleRing} />
            </View>
            <View style={s.camFooter}>
              <Badge
                label={
                  stage === "idle"
                    ? "READY"
                    : stage === "scanning"
                    ? "SCANNING"
                    : "VERIFIED"
                }
                tone={stage === "done" ? "success" : stage === "scanning" ? "info" : "muted"}
                icon={stage === "done" ? "checkmark-circle-outline" : "scan-outline"}
              />
              <Text style={s.camLatency}>lat 148ms · liveness engine v3.2</Text>
            </View>
          </View>

          {/* Results */}
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <GlassCard>
              <SectionTitle title="Verification Signals" />
              <KV k="Candidate ID" v={String(cid || "—")} mono testID="verify-cid" />
              <KV
                k="Face Match"
                v={result ? `${(result.face_match * 100).toFixed(2)}%` : "—"}
                mono
                testID="verify-facematch"
              />
              <KV
                k="Liveness Score"
                v={result ? `${(result.liveness * 100).toFixed(2)}%` : "—"}
                mono
              />
              <KV
                k="Duplicate Score"
                v={result ? `${(result.duplicate_score * 100).toFixed(2)}%` : "—"}
                mono
              />
              <KV
                k="Signature"
                v={result ? `${result.signature.slice(0, 18)}…` : "—"}
                mono
              />
            </GlassCard>

            {stage === "done" && (
              <View style={s.successBar}>
                <View style={s.successDot}>
                  <Ionicons name="checkmark" size={16} color={colors.surface} />
                </View>
                <Text style={s.successText}>Zero-Trust Identity Attested</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.footer}>
          {stage !== "done" ? (
            <Button
              label={stage === "scanning" ? "Verifying…" : "Start Face + Liveness Scan"}
              icon="scan-circle-outline"
              loading={stage === "scanning"}
              onPress={doVerify}
              testID="start-verify-button"
            />
          ) : (
            <Button
              label="Submit Application"
              icon="arrow-forward"
              onPress={proceed}
              testID="submit-application-button"
            />
          )}
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  cam: {
    margin: spacing.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.surfaceSecondary,
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: colors.brandPrimary,
    borderWidth: 2,
    borderRadius: 4,
    opacity: 0.85,
  },
  scanLine: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: colors.brandPrimary,
    shadowColor: colors.brandPrimary,
    shadowRadius: 12,
    shadowOpacity: 1,
  },
  reticleCenter: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  reticleRing: {
    width: 180,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: "rgba(56,189,248,0.45)",
  },
  camFooter: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  camLatency: { color: colors.onSurfaceTertiary, fontSize: fs.sm },
  successBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successGlow,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.35)",
  },
  successDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  successText: { color: colors.success, fontSize: fs.base, fontWeight: fw.medium },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
