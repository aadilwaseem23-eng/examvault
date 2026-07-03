import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSpring,
} from "react-native-reanimated";
import { colors, spacing, radius, fs, fw, IMG } from "@/src/theme";
import {
  Screen,
  Header,
  Button,
  GlassCard,
  KV,
  Badge,
  SectionTitle,
  GlowBackground,
} from "@/src/components/ui";
import { api } from "@/src/api";

const { width } = Dimensions.get("window");

function CountdownText({ deadline }: { deadline?: string }) {
  const [txt, setTxt] = useState("00:00:00");
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
      const s = Math.floor(diff / 1000);
      const hh = String(Math.floor(s / 3600)).padStart(2, "0");
      const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      setTxt(`${hh}:${mm}:${ss}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [deadline]);
  return <Text style={s.countdown}>{txt}</Text>;
}

function VaultVisual({ unlocked }: { unlocked: boolean }) {
  const pulse = useSharedValue(0);
  const rot = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true);
    rot.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.linear }), -1, false);
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.06 }],
    opacity: 0.7 + pulse.value * 0.3,
  }));
  const rotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 360}deg` }],
  }));
  const openStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(unlocked ? 1.06 : 1) }],
  }));
  return (
    <Animated.View style={[vs.wrap, openStyle]}>
      <Image source={{ uri: IMG.vault }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={[
          "rgba(15,23,42,0.5)",
          "rgba(15,23,42,0.2)",
          unlocked ? "rgba(16,185,129,0.65)" : "rgba(15,23,42,0.85)",
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[vs.ring, pulseStyle, unlocked && { borderColor: colors.success }]} />
      <Animated.View style={[vs.orbitRing, rotStyle]}>
        <View style={[vs.dot, { top: -4, left: "50%", marginLeft: -4 }]} />
        <View style={[vs.dot, { bottom: -4, left: "50%", marginLeft: -4 }]} />
        <View style={[vs.dot, { top: "50%", left: -4, marginTop: -4 }]} />
        <View style={[vs.dot, { top: "50%", right: -4, marginTop: -4 }]} />
      </Animated.View>
      <View style={vs.center}>
        <View style={vs.lock}>
          <Ionicons
            name={unlocked ? "lock-open" : "lock-closed"}
            size={36}
            color={unlocked ? colors.success : colors.brandPrimary}
          />
        </View>
        <Text style={[vs.label, unlocked && { color: colors.success }]}>
          {unlocked ? "UNLOCKED" : "SEALED"}
        </Text>
      </View>
    </Animated.View>
  );
}

const vs = StyleSheet.create({
  wrap: {
    height: 260,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.55)",
  },
  orbitRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  dot: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary },
  center: { alignItems: "center", gap: 10 },
  lock: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(15,23,42,0.85)",
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: colors.brandPrimary, fontSize: fs.sm, letterSpacing: 4, fontWeight: fw.medium },
});

export default function VaultScreen() {
  const router = useRouter();
  const [session, setSession] = useState<any | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => api.vaultSession().then(setSession).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const signed = session?.signatures || [];
  const isSigned = (id: string) => signed.some((x: any) => x.authority_id === id);
  const unlocked = session?.status === "UNLOCKED";

  const sign = async (id: string) => {
    setBusy(id);
    try {
      const res = await api.vaultSign(id);
      setSession(res);
    } catch {
    } finally {
      setBusy(null);
    }
  };

  const reset = async () => {
    setBusy("__reset");
    try {
      const res = await api.vaultReset();
      setSession(res);
    } finally {
      setBusy(null);
    }
  };

  const authorities = session?.authorities || [];
  const progress = signed.length / (session?.threshold || 3);

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          title="Multi-Signature Vault"
          subtitle="Threshold cryptography · 3-of-5"
          right={
            <Badge
              label={unlocked ? "UNLOCKED" : "SEALED"}
              tone={unlocked ? "success" : "info"}
              icon={unlocked ? "lock-open-outline" : "lock-closed-outline"}
            />
          }
        />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          <VaultVisual unlocked={unlocked} />

          <View style={{ height: spacing.md }} />
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={s.metric}>
              <Text style={s.metricLabel}>PAPER ID</Text>
              <Text style={s.metricValue} numberOfLines={1}>
                {session?.paper_id || "—"}
              </Text>
            </View>
            <View style={s.metric}>
              <Text style={s.metricLabel}>RELEASE IN</Text>
              <CountdownText deadline={session?.release_deadline} />
            </View>
          </View>

          <View style={{ height: spacing.md }} />
          <GlassCard>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={s.hint}>THRESHOLD PROGRESS</Text>
              <Text style={s.progressLabel}>
                {signed.length} of {session?.threshold || 3}
              </Text>
            </View>
            <View style={{ height: spacing.sm }} />
            <View style={s.track}>
              <View style={[s.trackFill, { width: `${Math.min(100, progress * 100)}%` }]} />
            </View>
            <View style={{ height: spacing.sm }} />
            <KV k="AES-256 fingerprint" v={`${(session?.aes_fingerprint || "").slice(0, 22)}…`} mono />
          </GlassCard>

          <View style={{ height: spacing.md }} />
          <SectionTitle title="Authorities" hint="Any 3 of 5 must approve to unlock" />
          <View style={{ gap: spacing.sm }}>
            {authorities.map((a: any) => {
              const done = isSigned(a.id);
              return (
                <View key={a.id} style={[s.auth, done && s.authDone]}>
                  <View style={[s.authIcon, done && { borderColor: colors.success, backgroundColor: colors.successGlow }]}>
                    <Ionicons
                      name={done ? "checkmark-circle" : "person-outline"}
                      size={20}
                      color={done ? colors.success : colors.brandPrimary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.authName}>{a.name}</Text>
                    <Text style={s.authRole}>
                      {a.role} · {a.org}
                    </Text>
                  </View>
                  {done ? (
                    <Badge label="SIGNED" tone="success" icon="finger-print-outline" />
                  ) : (
                    <Button
                      label={busy === a.id ? "…" : "Sign"}
                      variant="ghost"
                      onPress={() => sign(a.id)}
                      disabled={unlocked || busy === a.id}
                      testID={`vault-sign-${a.id}`}
                      style={{ minHeight: 36, paddingHorizontal: 12 }}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {unlocked && (
            <>
              <View style={{ height: spacing.md }} />
              <GlassCard>
                <SectionTitle title="Release Manifest" hint="Signed decryption key dispatched to nodes" />
                <KV k="Chain block" v={`#${1_284_991}`} mono />
                <KV k="Nodes notified" v="10,248 centres" />
                <KV k="Dispatch latency" v="1.9s" />
              </GlassCard>
            </>
          )}

          <View style={{ height: spacing.lg }} />
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              label="Reset Session"
              variant="secondary"
              icon="refresh-outline"
              onPress={reset}
              style={{ flex: 1 }}
              testID="vault-reset-button"
            />
            <Button
              label={unlocked ? "View Centre" : "Awaiting Threshold"}
              icon={unlocked ? "arrow-forward" : "hourglass-outline"}
              disabled={!unlocked}
              onPress={() => router.push("/centre")}
              style={{ flex: 1 }}
              testID="vault-release-button"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  metric: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
    gap: 4,
  },
  metricLabel: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 1.4 },
  metricValue: { color: colors.onSurface, fontSize: fs.lg, fontWeight: fw.medium, fontFamily: "Menlo" },
  countdown: { color: colors.brandPrimary, fontSize: fs.lg, fontFamily: "Menlo", letterSpacing: 1.4, fontWeight: fw.medium },
  hint: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 1.4 },
  progressLabel: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceSecondary, overflow: "hidden" },
  trackFill: { height: "100%", backgroundColor: colors.brandPrimary, borderRadius: 4 },
  auth: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
  },
  authDone: { borderColor: "rgba(16,185,129,0.4)", backgroundColor: "rgba(16,185,129,0.06)" },
  authIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  authName: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium },
  authRole: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2 },
});
