import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
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

function useCountdown(iso?: string) {
  const [t, setT] = useState({ h: "00", m: "00", s: "00", done: false });
  useEffect(() => {
    if (!iso) return;
    const tick = () => {
      const diff = Math.max(0, new Date(iso).getTime() - Date.now());
      const s = Math.floor(diff / 1000);
      setT({
        h: String(Math.floor(s / 3600)).padStart(2, "0"),
        m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
        s: String(s % 60).padStart(2, "0"),
        done: diff === 0,
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [iso]);
  return t;
}

function PulseDot({ color = colors.success }: { color?: string }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ring = useAnimatedStyle(() => ({
    opacity: 0.5 - v.value * 0.5,
    transform: [{ scale: 1 + v.value * 2.2 }],
  }));
  return (
    <View style={{ width: 10, height: 10, justifyContent: "center", alignItems: "center" }}>
      <Animated.View
        style={[
          { position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: color },
          ring,
        ]}
      />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

function Sparkline() {
  // Faux live signal
  const [d, setD] = useState<number[]>(Array.from({ length: 22 }, () => Math.random()));
  useEffect(() => {
    const iv = setInterval(() => {
      setD((p) => [...p.slice(1), Math.random()]);
    }, 1200);
    return () => clearInterval(iv);
  }, []);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 34, gap: 3 }}>
      {d.map((v, i) => (
        <View
          key={i}
          style={{
            width: 4,
            height: 6 + v * 28,
            backgroundColor: colors.brandPrimary,
            opacity: 0.35 + v * 0.65,
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );
}

const HEX = "0123456789ABCDEF";
function HexStream() {
  const [line, setLine] = useState("");
  useEffect(() => {
    const iv = setInterval(() => {
      let s = "";
      for (let i = 0; i < 32; i++) s += HEX[Math.floor(Math.random() * 16)];
      setLine(s);
    }, 180);
    return () => clearInterval(iv);
  }, []);
  return (
    <Text
      numberOfLines={1}
      style={{
        color: colors.brandPrimary,
        fontFamily: "Menlo",
        fontSize: 10,
        letterSpacing: 1.2,
        opacity: 0.75,
      }}
    >
      {line}
    </Text>
  );
}

export default function Centre() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [vault, setVault] = useState<any | null>(null);
  const [run, setRun] = useState<any | null>(null);
  const pollRef = useRef<any>(null);

  const load = async () => {
    try {
      const [d, v, r] = await Promise.all([
        api.centreDashboard(),
        api.vaultSession(),
        api.printRun(),
      ]);
      setData(d);
      setVault(v);
      setRun(r);
    } catch {}
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 3500);
    return () => clearInterval(pollRef.current);
  }, []);

  const cd = useCountdown(data?.exam_start);
  const vaultUnlocked = vault?.status === "UNLOCKED";
  const stage = !vaultUnlocked
    ? "AWAITING_VAULT"
    : run?.state === "IDLE"
    ? "READY_TO_DECRYPT"
    : run?.state === "DECRYPTING"
    ? "DECRYPTING"
    : run?.state === "PRINTING"
    ? "PRINTING"
    : run?.state === "COMPLETE"
    ? "READY"
    : "DECRYPTED";

  const stageMeta: Record<string, { label: string; tone: any; icon: any }> = {
    AWAITING_VAULT: { label: "AWAITING VAULT", tone: "warning", icon: "hourglass-outline" },
    READY_TO_DECRYPT: { label: "KEY RECEIVED", tone: "info", icon: "key-outline" },
    DECRYPTING: { label: "DECRYPTING", tone: "info", icon: "flash-outline" },
    DECRYPTED: { label: "DECRYPTED", tone: "info", icon: "document-lock-outline" },
    PRINTING: { label: "PRINTING", tone: "info", icon: "print-outline" },
    READY: { label: "READY", tone: "success", icon: "checkmark-circle-outline" },
  };

  const totalPrinted = (run?.printers || []).reduce((a: number, p: any) => a + (p.printed || 0), 0);
  const totalCap = (run?.printers || []).reduce((a: number, p: any) => a + (p.capacity || 0), 0);
  const printProgress = totalCap ? totalPrinted / totalCap : 0;

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          title="Exam Centre · Node"
          subtitle={data?.centre?.name || "Loading…"}
          right={
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <PulseDot />
              <Text style={s.liveText}>LIVE</Text>
            </View>
          }
        />

        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          {/* Command banner */}
          <View style={s.commandBanner}>
            <LinearGradient
              colors={["rgba(56,189,248,0.18)", "rgba(6,182,212,0.02)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ padding: spacing.lg }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View>
                  <Text style={s.cmdK}>EXAM STARTS IN</Text>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                    <Text style={s.cmdBig}>{cd.h}</Text>
                    <Text style={s.cmdColon}>:</Text>
                    <Text style={s.cmdBig}>{cd.m}</Text>
                    <Text style={s.cmdColon}>:</Text>
                    <Text style={s.cmdBig}>{cd.s}</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Badge label={stageMeta[stage].label} tone={stageMeta[stage].tone} icon={stageMeta[stage].icon} />
                  <Text style={s.cmdSub}>{data?.exam || "—"}</Text>
                </View>
              </View>
              <View style={{ height: spacing.md }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={s.cmdMiniK}>NETWORK PULSE</Text>
                  <View style={{ height: 4 }} />
                  <Sparkline />
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.cmdMiniK}>KEY STREAM</Text>
                  <View style={{ width: 170, marginTop: 6 }}>
                    <HexStream />
                    <HexStream />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Vault → Centre pipeline */}
          <View style={{ height: spacing.md }} />
          <GlassCard>
            <SectionTitle title="Vault → Centre Pipeline" />
            <View style={s.pipeline}>
              <View style={s.pipeNode}>
                <View style={[s.pipeIcon, vaultUnlocked && s.pipeIconDone]}>
                  <Ionicons
                    name={vaultUnlocked ? "lock-open-outline" : "lock-closed-outline"}
                    size={16}
                    color={vaultUnlocked ? colors.success : colors.brandPrimary}
                  />
                </View>
                <Text style={s.pipeLbl}>Vault</Text>
                <Text style={s.pipeVal}>
                  {vault?.signatures?.length ?? 0}/{vault?.threshold ?? 3}
                </Text>
              </View>
              <View style={[s.pipeBar, vaultUnlocked && s.pipeBarActive]} />
              <View style={s.pipeNode}>
                <View style={[s.pipeIcon, run?.state && run.state !== "IDLE" && s.pipeIconDone]}>
                  <Ionicons name="key-outline" size={16} color={run?.state && run.state !== "IDLE" ? colors.success : colors.brandPrimary} />
                </View>
                <Text style={s.pipeLbl}>Decrypt</Text>
                <Text style={s.pipeVal}>AES-256</Text>
              </View>
              <View style={[s.pipeBar, (run?.state === "PRINTING" || run?.state === "COMPLETE") && s.pipeBarActive]} />
              <View style={s.pipeNode}>
                <View style={[s.pipeIcon, run?.state === "PRINTING" && s.pipeIconDone, run?.state === "COMPLETE" && s.pipeIconDone]}>
                  <Ionicons name="print-outline" size={16} color={run?.state === "PRINTING" || run?.state === "COMPLETE" ? colors.success : colors.brandPrimary} />
                </View>
                <Text style={s.pipeLbl}>Print</Text>
                <Text style={s.pipeVal}>{totalPrinted}/{totalCap || 900}</Text>
              </View>
            </View>

            <View style={{ height: spacing.md }} />
            {stage === "PRINTING" && (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={s.cmdMiniK}>PRINT PROGRESS</Text>
                  <Text style={s.progressLabel}>
                    {totalPrinted} / {totalCap} · {Math.round(printProgress * 100)}%
                  </Text>
                </View>
                <View style={{ height: 6 }} />
                <View style={s.track}>
                  <View style={[s.trackFill, { width: `${Math.min(100, printProgress * 100)}%` }]} />
                </View>
              </>
            )}
          </GlassCard>

          {/* Primary action */}
          <View style={{ height: spacing.md }} />
          {stage === "AWAITING_VAULT" && (
            <Button
              label="Open Vault Authority"
              icon="shield-checkmark-outline"
              onPress={() => router.push("/vault")}
              testID="centre-goto-vault"
            />
          )}
          {stage === "READY_TO_DECRYPT" && (
            <Button
              label="Run Decryption Ceremony"
              icon="key-outline"
              onPress={() => router.push("/centre/decrypt")}
              testID="centre-start-decrypt"
            />
          )}
          {stage === "DECRYPTING" && (
            <Button
              label="View Ceremony"
              icon="flash-outline"
              onPress={() => router.push("/centre/decrypt")}
              testID="centre-view-ceremony"
            />
          )}
          {stage === "DECRYPTED" && (
            <Button
              label="Preview Paper & Start Printing"
              icon="document-text-outline"
              onPress={() => router.push("/centre/paper-preview")}
              testID="centre-open-preview"
            />
          )}
          {stage === "PRINTING" && (
            <Button
              label="Open Printer Fleet"
              icon="print-outline"
              onPress={() => router.push("/centre/printing")}
              testID="centre-open-printing"
            />
          )}
          {stage === "READY" && (
            <Button
              label="Papers Ready · Open Fleet"
              variant="success"
              icon="checkmark-done-outline"
              onPress={() => router.push("/centre/printing")}
              testID="centre-open-printing-ready"
            />
          )}

          <View style={{ height: spacing.md }} />
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Pressable style={s.metricCard} onPress={() => router.push("/centre/printing")}>
              <Ionicons name="print-outline" size={16} color={colors.brandPrimary} />
              <Text style={s.metricV}>{run?.printers?.length ?? PRINTER_STATIC_LEN}</Text>
              <Text style={s.metricK}>PRINTERS</Text>
            </Pressable>
            <View style={s.metricCard}>
              <Ionicons name="videocam-outline" size={16} color={colors.success} />
              <Text style={s.metricV}>SECURE</Text>
              <Text style={s.metricK}>CCTV</Text>
            </View>
            <Pressable style={s.metricCard} onPress={() => router.push("/centre/tracking")}>
              <Ionicons name="git-network-outline" size={16} color={colors.brandPrimary} />
              <Text style={s.metricV}>{data?.watermark_id?.slice(0, 6) || "—"}</Text>
              <Text style={s.metricK}>WMARK</Text>
            </Pressable>
          </View>

          {/* Chain of custody */}
          <View style={{ height: spacing.md }} />
          <SectionTitle title="Chain of Custody" hint="Every event is hashed and anchored" />
          <View style={s.timeline}>
            {(data?.timeline || []).map((t: any, i: number) => (
              <View key={i} style={s.tRow}>
                <View style={s.tLeft}>
                  <View style={s.tDot} />
                  {i < (data?.timeline?.length || 0) - 1 && <View style={s.tLine} />}
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
              label="Sheet Tracking"
              variant="secondary"
              icon="qr-code-outline"
              onPress={() => router.push("/centre/tracking")}
              style={{ flex: 1 }}
              testID="centre-tracking-button"
            />
            <Button
              label="Reset Print Run"
              variant="ghost"
              icon="refresh-outline"
              onPress={async () => {
                await api.printRunReset();
                await load();
              }}
              style={{ flex: 1 }}
              testID="centre-reset-run"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const PRINTER_STATIC_LEN = 6;

const s = StyleSheet.create({
  liveText: { color: colors.success, fontSize: fs.sm, fontWeight: fw.medium, letterSpacing: 1.4 },
  commandBanner: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: "rgba(15,23,42,0.85)",
  },
  cmdK: { color: colors.brandPrimary, fontSize: fs.sm, letterSpacing: 1.8, fontWeight: fw.medium },
  cmdBig: { color: colors.onSurface, fontSize: fs["3xl"], fontFamily: "Menlo", fontWeight: fw.medium, letterSpacing: 1 },
  cmdColon: { color: colors.brandPrimary, fontSize: fs["2xl"], fontFamily: "Menlo" },
  cmdSub: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 0.4 },
  cmdMiniK: { color: colors.onSurfaceTertiary, fontSize: 10, letterSpacing: 1.4 },
  pipeline: { flexDirection: "row", alignItems: "center", gap: 6 },
  pipeNode: { alignItems: "center", flex: 1 },
  pipeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  pipeIconDone: { borderColor: "rgba(16,185,129,0.5)", backgroundColor: colors.successGlow },
  pipeLbl: { color: colors.onSurface, fontSize: fs.sm, fontWeight: fw.medium },
  pipeVal: { color: colors.onSurfaceTertiary, fontSize: 10, fontFamily: "Menlo", marginTop: 2 },
  pipeBar: { flex: 0.5, height: 2, backgroundColor: colors.border, marginTop: -18 },
  pipeBarActive: { backgroundColor: colors.success },
  metricCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
    alignItems: "flex-start",
    gap: 6,
  },
  metricV: { color: colors.onSurface, fontSize: fs.lg, fontWeight: fw.medium, fontFamily: "Menlo" },
  metricK: { color: colors.onSurfaceTertiary, fontSize: 10, letterSpacing: 1.4 },
  progressLabel: { color: colors.onSurface, fontSize: fs.sm, fontWeight: fw.medium, fontFamily: "Menlo" },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceSecondary, overflow: "hidden" },
  trackFill: { height: "100%", backgroundColor: colors.brandPrimary, borderRadius: 4 },
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
