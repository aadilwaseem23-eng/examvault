import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { Screen, Header, Button, GlassCard, KV, Badge, SectionTitle } from "@/src/components/ui";
import { api } from "@/src/api";

function PrinterCard({ p }: { p: any }) {
  const pct = p.capacity ? p.printed / p.capacity : 0;
  const isPrinting = p.state === "PRINTING";
  const done = p.state === "COMPLETE";
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: isPrinting ? 0.4 + pulse.value * 0.6 : done ? 0.9 : 0.3,
  }));
  return (
    <View style={[pc.card, done && pc.cardDone]}>
      <View style={pc.head}>
        <View style={pc.iconBox}>
          <Ionicons name="print-outline" size={16} color={done ? colors.success : colors.brandPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={pc.pid} numberOfLines={1}>
            {p.id}
          </Text>
          <Text style={pc.bay}>{p.bay} · {p.model}</Text>
        </View>
        <Animated.View style={[pc.stateChip, done && pc.stateChipDone, pulseStyle]}>
          <View style={[pc.stateDot, { backgroundColor: done ? colors.success : isPrinting ? colors.brandPrimary : colors.onSurfaceTertiary }]} />
          <Text style={[pc.stateText, done && { color: colors.success }]}>{done ? "DONE" : p.state}</Text>
        </Animated.View>
      </View>
      <View style={{ height: 8 }} />
      <View style={pc.track}>
        <View style={[pc.trackFill, { width: `${pct * 100}%`, backgroundColor: done ? colors.success : colors.brandPrimary }]} />
      </View>
      <View style={pc.footRow}>
        <Text style={pc.count}>{p.printed} / {p.capacity}</Text>
        <Text style={pc.count}>{Math.round(pct * 100)}%</Text>
      </View>
    </View>
  );
}

export default function Printing() {
  const router = useRouter();
  const [run, setRun] = useState<any | null>(null);
  const [watermarks, setWatermarks] = useState<any[]>([]);
  const pollRef = useRef<any>(null);

  const tick = async () => {
    try {
      const r = await api.printRunTick();
      setRun(r);
      if (r.watermarks && r.watermarks.length) {
        setWatermarks((w) => [...r.watermarks.slice().reverse(), ...w].slice(0, 12));
      }
    } catch {}
  };

  useEffect(() => {
    tick();
    pollRef.current = setInterval(tick, 900);
    return () => clearInterval(pollRef.current);
  }, []);

  const running = run?.state === "PRINTING";
  const done = run?.state === "COMPLETE";
  const total = run?.total_printed || (run?.printers || []).reduce((a: number, p: any) => a + (p.printed || 0), 0);
  const cap = run?.total_capacity || (run?.printers || []).reduce((a: number, p: any) => a + (p.capacity || 0), 0);
  const pct = cap ? total / cap : 0;

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          title="Printer Fleet"
          subtitle="Secure local printing · CCTV verified"
          right={
            <Badge
              label={done ? "COMPLETE" : running ? "PRINTING" : "STANDBY"}
              tone={done ? "success" : "info"}
              icon={done ? "checkmark-done-outline" : "print-outline"}
            />
          }
        />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          {/* Fleet totals */}
          <GlassCard>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View>
                <Text style={ss.k}>TOTAL PRINTED</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                  <Text style={ss.big}>{total}</Text>
                  <Text style={ss.total}>/ {cap}</Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={ss.k}>ETA</Text>
                <Text style={ss.eta}>
                  {done
                    ? "COMPLETE"
                    : running
                    ? `${Math.max(0, Math.round((1 - pct) * 60))}s`
                    : "—"}
                </Text>
              </View>
            </View>
            <View style={{ height: spacing.md }} />
            <View style={ss.track}>
              <View style={[ss.trackFill, { width: `${pct * 100}%` }]} />
            </View>
          </GlassCard>

          {/* Fleet grid */}
          <View style={{ height: spacing.md }} />
          <SectionTitle title="Printer Nodes" hint={`${(run?.printers || []).length} presses · Bay A/B/C`} />
          <View style={{ gap: spacing.sm }}>
            {(run?.printers || []).map((p: any) => (
              <PrinterCard key={p.id} p={p} />
            ))}
          </View>

          {/* Watermark stream */}
          <View style={{ height: spacing.md }} />
          <SectionTitle title="Per-Copy Forensic Stream" hint="Each printed paper is uniquely fingerprinted" />
          <View style={ss.wmList}>
            {watermarks.length === 0 && (
              <Text style={ss.wmEmpty}>Waiting for prints…</Text>
            )}
            {watermarks.map((w, i) => (
              <View key={`${w.printer}-${w.serial}-${i}`} style={ss.wmRow}>
                <View style={ss.wmIcon}>
                  <Ionicons name="qr-code-outline" size={14} color={colors.brandPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ss.wmT}>#{String(w.serial).padStart(3, "0")} · {w.printer}</Text>
                  <Text style={ss.wmH}>QR {w.qr}</Text>
                </View>
                <Text style={ss.wmWm}>{w.watermark}</Text>
              </View>
            ))}
          </View>

          {/* CCTV pane */}
          <View style={{ height: spacing.md }} />
          <GlassCard>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <SectionTitle title="CCTV Feed" hint="Bay-A · Bay-B · Bay-C" />
              <Badge label="LIVE" tone="success" icon="radio-outline" />
            </View>
            <View style={ss.cctvGrid}>
              {["Bay-A", "Bay-B", "Bay-C"].map((b) => (
                <View key={b} style={ss.cctv}>
                  <View style={ss.cctvNoise} />
                  <View style={ss.cctvLabel}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.error }} />
                    <Text style={ss.cctvT}>REC · {b}</Text>
                  </View>
                  <Ionicons name="videocam-outline" size={22} color="rgba(248,250,252,0.3)" />
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>

        <View style={ss.footer}>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              label="Sheet Tracking"
              variant="secondary"
              icon="qr-code-outline"
              onPress={() => router.push("/centre/tracking")}
              style={{ flex: 1 }}
              testID="printing-tracking"
            />
            <Button
              label={done ? "All Papers Ready ✓" : "Back to Centre"}
              variant={done ? "success" : "primary"}
              icon={done ? "checkmark-done-outline" : "arrow-back"}
              onPress={() => router.replace("/centre")}
              style={{ flex: 1.4 }}
              testID="printing-back"
            />
          </View>
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const pc = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
  },
  cardDone: { borderColor: "rgba(16,185,129,0.4)", backgroundColor: "rgba(16,185,129,0.06)" },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  pid: { color: colors.onSurface, fontSize: fs.base, fontFamily: "Menlo", fontWeight: fw.medium },
  bay: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2 },
  stateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  stateChipDone: { backgroundColor: colors.successGlow, borderColor: "rgba(16,185,129,0.4)" },
  stateDot: { width: 6, height: 6, borderRadius: 3 },
  stateText: { color: colors.brandPrimary, fontSize: 10, letterSpacing: 1.2, fontWeight: fw.medium },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceSecondary, overflow: "hidden" },
  trackFill: { height: "100%", borderRadius: 3 },
  footRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  count: { color: colors.onSurfaceTertiary, fontSize: fs.sm, fontFamily: "Menlo" },
});

const ss = StyleSheet.create({
  k: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 1.4 },
  big: { color: colors.onSurface, fontSize: fs["3xl"], fontFamily: "Menlo", fontWeight: fw.medium },
  total: { color: colors.onSurfaceTertiary, fontSize: fs.xl, fontFamily: "Menlo" },
  eta: { color: colors.brandPrimary, fontSize: fs.xl, fontFamily: "Menlo", fontWeight: fw.medium, marginTop: 4 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.surfaceSecondary, overflow: "hidden" },
  trackFill: { height: "100%", backgroundColor: colors.brandPrimary, borderRadius: 5 },
  wmList: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: spacing.sm,
    minHeight: 80,
    gap: 4,
  },
  wmEmpty: { color: colors.onSurfaceTertiary, fontSize: fs.sm, padding: spacing.md, textAlign: "center" },
  wmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  wmIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  wmT: { color: colors.onSurface, fontSize: fs.sm, fontFamily: "Menlo" },
  wmH: { color: colors.onSurfaceTertiary, fontSize: 10, fontFamily: "Menlo", marginTop: 2 },
  wmWm: { color: colors.brandPrimary, fontSize: fs.sm, fontFamily: "Menlo", fontWeight: fw.medium },
  cctvGrid: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  cctv: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: "#050914",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  cctvNoise: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    backgroundColor: "rgba(56,189,248,0.15)",
  },
  cctvLabel: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cctvT: { color: "#F8FAFC", fontSize: 9, fontFamily: "Menlo", letterSpacing: 1.2 },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
