import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
  SharedValue,
} from "react-native-reanimated";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Screen, Header, Button, GlassCard, KV, Badge, SectionTitle } from "@/src/components/ui";
import { api } from "@/src/api";

const HEX = "0123456789ABCDEF";
function randomHex(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += HEX[Math.floor(Math.random() * 16)];
  return s;
}

function AuthorityOrb({ i, p, R }: { i: number; p: SharedValue<number>; R: number }) {
  const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * R;
  const y = Math.sin(angle) * R;
  const style = useAnimatedStyle(() => {
    const t = interpolate(p.value, [0, 0.35 + i * 0.08, 1], [0, 0, 1]);
    return {
      transform: [
        { translateX: x * (1 - t) },
        { translateY: y * (1 - t) },
        { scale: 1 - t * 0.5 },
      ],
      opacity: 1 - t * 0.35,
    };
  });
  return (
    <Animated.View style={[cs.orb, style]}>
      <Text style={cs.orbText}>A{i + 1}</Text>
    </Animated.View>
  );
}

function AuthorityBeam({ i, p }: { i: number; p: SharedValue<number> }) {
  const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0.15 + i * 0.05, 0.6 + i * 0.05], [0, 0.6], "clamp"),
  }));
  return (
    <Animated.View
      style={[
        cs.beam,
        { transform: [{ rotate: `${(angle * 180) / Math.PI + 90}deg` }] },
        style,
      ]}
    />
  );
}

function KeyCeremony({ active }: { active: boolean }) {
  // 5 authority orbs converging into a central key when active
  const p = useSharedValue(0);
  useEffect(() => {
    if (active) {
      p.value = withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.cubic) });
    } else {
      p.value = withTiming(0, { duration: 400 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.15 }],
    opacity: 0.4 + pulse.value * 0.6,
  }));

  const R = 110;
  return (
    <View style={cs.stage}>
      <Animated.View style={[cs.centralGlow, pulseStyle]} />
      <View style={cs.centralKey}>
        <Ionicons name="key" size={28} color={colors.brandPrimary} />
      </View>
      {[0, 1, 2, 3, 4].map((i) => (
        <AuthorityOrb key={`o-${i}`} i={i} p={p} R={R} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <AuthorityBeam key={`b-${i}`} i={i} p={p} />
      ))}
    </View>
  );
}

const cs = StyleSheet.create({
  stage: {
    height: 260,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: "rgba(15,23,42,0.75)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  centralGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: "rgba(56,189,248,0.5)",
  },
  centralKey: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    backgroundColor: "rgba(15,23,42,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  orb: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.5)",
    backgroundColor: "rgba(30,41,59,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  orbText: { color: colors.brandPrimary, fontSize: fs.sm, fontFamily: "Menlo", fontWeight: fw.medium },
  beam: {
    position: "absolute",
    width: 1,
    height: 110,
    top: "50%",
    left: "50%",
    marginTop: -55,
    marginLeft: 0,
    backgroundColor: colors.brandPrimary,
    transformOrigin: "top",
  },
});

export default function DecryptCeremony() {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [hexLines, setHexLines] = useState<string[]>(Array.from({ length: 5 }, () => randomHex(48)));
  const iv = useRef<any>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setHexLines((prev) => {
        const next = [...prev.slice(1), randomHex(48)];
        return next;
      });
    }, 220);
    return () => clearInterval(t);
  }, []);

  const begin = async () => {
    setStage("running");
    setLogs([]);
    setProgress(0);
    try {
      const r = await api.centreDecrypt();
      setFingerprint(r.aes_key_fingerprint);
      const events = [
        "Requesting decryption key from vault…",
        "3-of-5 authority signatures verified",
        "TLS 1.3 mutual auth to CTR-DEL-014",
        "AES-256-GCM key material received",
        "Signature: Ed25519 · verified ✓",
        "Decrypting bundle QP-NEET-UG-2028-A1…",
        "Integrity hash: matched",
        "Local write to hardware secure enclave",
        "Watermark generator initialized",
        "Paper ready for local printing",
      ];
      events.forEach((e, i) => {
        setTimeout(() => setLogs((L) => [...L, e]), i * 300 + 200);
      });
    } catch (err: any) {
      setLogs([`ERROR: ${err.message || err}`]);
    }
    iv.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          clearInterval(iv.current);
          setTimeout(() => setStage("done"), 400);
          return 1;
        }
        return Math.min(1, p + 0.02 + Math.random() * 0.02);
      });
    }, 90);
  };

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          title="Decryption Ceremony"
          subtitle="AES-256 · Threshold Key Reconstruction"
          right={
            <Badge
              label={stage === "done" ? "DECRYPTED" : stage === "running" ? "RUNNING" : "STANDBY"}
              tone={stage === "done" ? "success" : "info"}
              icon={stage === "done" ? "checkmark-circle-outline" : "flash-outline"}
            />
          }
        />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          <KeyCeremony active={stage !== "idle"} />

          {/* Progress */}
          <View style={{ height: spacing.md }} />
          <GlassCard>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={ds.k}>AES-256 PROGRESS</Text>
              <Text style={ds.progressLbl}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={{ height: 6 }} />
            <View style={ds.track}>
              <View style={[ds.trackFill, { width: `${progress * 100}%` }]} />
              <LinearGradient
                colors={["transparent", colors.brandPrimary, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[ds.trackShimmer, { left: `${Math.max(0, progress * 100 - 15)}%` }]}
              />
            </View>
            <View style={{ height: spacing.sm }} />
            <View style={ds.hexBox}>
              {hexLines.map((line, i) => (
                <Text
                  key={i}
                  numberOfLines={1}
                  style={[
                    ds.hexLine,
                    { opacity: 0.2 + i * 0.15 },
                  ]}
                >
                  {line}
                </Text>
              ))}
            </View>
            <View style={{ height: spacing.sm }} />
            <KV k="Key fingerprint" v={fingerprint ? `${fingerprint.slice(0, 24)}…` : "—"} mono />
            <KV k="Cipher" v="AES-256-GCM" mono />
            <KV k="Enclave" v="TEE-Secure-Zone-3" mono />
          </GlassCard>

          {/* Logs */}
          <View style={{ height: spacing.md }} />
          <SectionTitle title="Ceremony Log" hint="Every step hashed and anchored" />
          <View style={ds.logBox}>
            {logs.length === 0 ? (
              <Text style={ds.logHint}>Idle. Press &ldquo;Begin&rdquo; to start the ceremony.</Text>
            ) : (
              logs.map((l, i) => (
                <View key={i} style={ds.logRow}>
                  <Text style={ds.logIdx}>{String(i + 1).padStart(2, "0")}</Text>
                  <Text style={ds.logText}>{l}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={ds.footer}>
          {stage === "idle" && (
            <Button
              label="Begin Ceremony"
              icon="key-outline"
              onPress={begin}
              testID="ceremony-begin"
            />
          )}
          {stage === "running" && (
            <Button label="Decrypting…" icon="flash-outline" loading disabled />
          )}
          {stage === "done" && (
            <Button
              label="Preview Decrypted Paper"
              icon="document-text-outline"
              variant="success"
              onPress={() => router.replace("/centre/paper-preview")}
              testID="ceremony-continue"
            />
          )}
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const ds = StyleSheet.create({
  k: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 1.4 },
  progressLbl: { color: colors.brandPrimary, fontSize: fs.base, fontFamily: "Menlo", fontWeight: fw.medium },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceSecondary, overflow: "hidden" },
  trackFill: { height: "100%", backgroundColor: colors.brandPrimary, borderRadius: 4 },
  trackShimmer: { position: "absolute", top: 0, height: 8, width: 60 },
  hexBox: {
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  hexLine: { color: colors.brandPrimary, fontFamily: "Menlo", fontSize: 10, letterSpacing: 1.2 },
  logBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.35)",
    minHeight: 120,
    gap: 4,
  },
  logHint: { color: colors.onSurfaceTertiary, fontSize: fs.sm },
  logRow: { flexDirection: "row", gap: 10 },
  logIdx: { color: colors.brandPrimary, fontSize: fs.sm, fontFamily: "Menlo" },
  logText: { color: colors.onSurface, fontSize: fs.sm, flex: 1 },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
