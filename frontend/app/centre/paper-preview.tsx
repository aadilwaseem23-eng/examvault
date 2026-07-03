import React, { useEffect, useState } from "react";
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
import { Screen, Header, Button, GlassCard, KV, Badge, SectionTitle, QRTile } from "@/src/components/ui";
import { api } from "@/src/api";

function WatermarkTile({ id }: { id: string }) {
  return (
    <View style={ps.wmTile}>
      <Text style={ps.wmA}>CTR-DEL-014</Text>
      <Text style={ps.wmB}>{id}</Text>
      <Text style={ps.wmA}>2028</Text>
    </View>
  );
}

export default function PaperPreview() {
  const router = useRouter();
  const [paper, setPaper] = useState<any | null>(null);
  const [reveal, setReveal] = useState(0);

  const load = async () => {
    const p = await api.centrePaperPreview();
    setPaper(p);
  };
  useEffect(() => {
    load();
  }, []);

  // Reveal questions with a stagger
  useEffect(() => {
    if (!paper?.decrypted) return;
    setReveal(0);
    const iv = setInterval(() => {
      setReveal((r) => {
        if (r >= (paper.sample_questions?.length || 0)) {
          clearInterval(iv);
          return r;
        }
        return r + 1;
      });
    }, 320);
    return () => clearInterval(iv);
  }, [paper?.decrypted, paper?.sample_questions?.length]);

  const decrypted = paper?.decrypted;

  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -240 + shimmer.value * 480 }],
    opacity: decrypted ? 0.6 : 0.2,
  }));

  const startPrinting = async () => {
    await api.printRunStart();
    router.push("/centre/printing");
  };

  return (
    <Screen>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header
          title="Paper Preview"
          subtitle={paper?.paper_id || "—"}
          right={
            <Badge
              label={decrypted ? "DECRYPTED" : "ENCRYPTED"}
              tone={decrypted ? "success" : "warning"}
              icon={decrypted ? "lock-open-outline" : "lock-closed-outline"}
            />
          }
        />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
          {/* The "paper" */}
          <View style={ps.paper}>
            {/* diagonal watermarks */}
            <View style={ps.wmField} pointerEvents="none">
              {Array.from({ length: 18 }).map((_, i) => {
                const row = Math.floor(i / 3);
                const col = i % 3;
                return (
                  <View
                    key={i}
                    style={[
                      ps.wmSlot,
                      {
                        left: col * 110 - 30,
                        top: row * 90,
                        transform: [{ rotate: "-28deg" }],
                      },
                    ]}
                  >
                    <WatermarkTile id={paper?.watermark || "•••"} />
                  </View>
                );
              })}
            </View>

            {/* Header inside paper */}
            <View style={ps.paperHead}>
              <View>
                <Text style={ps.paperK}>CENTRAL EXAMINATION BOARD · CONFIDENTIAL</Text>
                <Text style={ps.paperT}>NEET UG 2028 · Set A1</Text>
              </View>
              <QRTile payload={`EXAMVAULT|${paper?.paper_id || ""}|${paper?.watermark || ""}`} size={72} />
            </View>

            <View style={ps.paperMeta}>
              <Text style={ps.metaLine}>Duration: 3 hours · 90 questions · 720 marks</Text>
              <Text style={ps.metaLine}>Instructions: Do not open until 09:30 IST.</Text>
              <View style={ps.divider} />
            </View>

            {/* Questions */}
            {(paper?.sample_questions || []).map((q: any, i: number) => (
              <View key={i} style={[ps.q, i >= reveal && ps.qHidden]}>
                <Text style={ps.qNum}>Q{q.n}</Text>
                <Text style={ps.qText}>{decrypted ? q.text : "▓▓▓▓ ▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓."}</Text>
              </View>
            ))}
            {!decrypted && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={ps.q}>
                    <Text style={ps.qNum}>Q{i + 1}</Text>
                    <Text style={ps.qText}>▓▓▓▓▓▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓▓▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓.</Text>
                  </View>
                ))}
              </>
            )}

            {/* Shimmer while encrypted */}
            {!decrypted && (
              <View style={ps.shimmerFrame} pointerEvents="none">
                <Animated.View style={[ps.shimmer, shimmerStyle]} />
              </View>
            )}

            {/* Footer */}
            <View style={ps.paperFoot}>
              <Text style={ps.footK}>WMARK · {paper?.watermark || "•••••"}</Text>
              <Text style={ps.footK}>PAGE 1 / 24</Text>
            </View>
          </View>

          {/* Meta */}
          <View style={{ height: spacing.md }} />
          <GlassCard>
            <SectionTitle title="Forensic Markings" hint="Every printed copy is uniquely traceable" />
            <KV k="Watermark ID" v={paper?.watermark || "—"} mono />
            <KV k="AES Fingerprint" v={paper?.aes_fingerprint ? `${paper.aes_fingerprint.slice(0, 24)}…` : "—"} mono />
            <KV k="Paper" v={paper?.paper_id || "—"} mono />
            <View style={{ height: spacing.sm }} />
            <Badge label="Micro-dot pattern · Invisible IR ink · Per-copy QR" tone="info" icon="finger-print-outline" />
          </GlassCard>
        </ScrollView>

        <View style={ps.footer}>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              label="Back"
              variant="secondary"
              icon="chevron-back"
              onPress={() => router.back()}
              style={{ flex: 1 }}
              testID="preview-back"
            />
            <Button
              label={decrypted ? "Start Print Run" : "Awaiting Decryption"}
              icon="print-outline"
              disabled={!decrypted}
              onPress={startPrinting}
              style={{ flex: 1.5 }}
              testID="preview-start-print"
            />
          </View>
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const ps = StyleSheet.create({
  paper: {
    borderRadius: radius.lg,
    backgroundColor: "#F8FAFC",
    padding: spacing.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  wmField: { ...StyleSheet.absoluteFillObject, opacity: 0.09 },
  wmSlot: { position: "absolute" },
  wmTile: {
    borderWidth: 1,
    borderColor: "#0F172A",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  wmA: { color: "#0F172A", fontSize: 7, fontFamily: "Menlo", letterSpacing: 0.6 },
  wmB: { color: "#0F172A", fontSize: 9, fontFamily: "Menlo", fontWeight: fw.medium, letterSpacing: 1.2 },
  paperHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#0F172A",
    paddingBottom: 10,
  },
  paperK: { color: "#0F172A", fontSize: 9, letterSpacing: 1.6, fontWeight: fw.medium },
  paperT: { color: "#0F172A", fontSize: fs.lg, fontWeight: fw.medium, marginTop: 4 },
  paperMeta: { marginTop: spacing.md },
  metaLine: { color: "#0F172A", fontSize: fs.sm, marginBottom: 2 },
  divider: { height: 1, backgroundColor: "#0F172A", marginTop: spacing.sm, opacity: 0.3 },
  q: { flexDirection: "row", gap: 10, marginTop: spacing.md },
  qHidden: { opacity: 0 },
  qNum: { color: "#0F172A", fontSize: fs.sm, fontWeight: fw.medium, fontFamily: "Menlo", width: 32 },
  qText: { color: "#0F172A", fontSize: fs.sm, flex: 1, lineHeight: 20 },
  shimmerFrame: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  shimmer: {
    width: 240,
    height: "100%",
    backgroundColor: "rgba(56,189,248,0.35)",
    opacity: 0.35,
  },
  paperFoot: {
    marginTop: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(15,23,42,0.15)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footK: { color: "#0F172A", fontSize: 9, fontFamily: "Menlo", letterSpacing: 1.4 },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
