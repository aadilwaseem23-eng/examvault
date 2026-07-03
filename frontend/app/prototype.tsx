import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fs, fw, IMG } from "@/src/theme";
import { Button, GlassCard, StatPill, Badge, SectionTitle } from "@/src/components/ui";
import { api } from "@/src/api";

const ROLES = [
  {
    id: "candidate",
    title: "Candidate",
    subtitle: "Register, verify, sit exams, view results",
    icon: "person-circle-outline" as const,
    route: "/candidate/register",
  },
  {
    id: "vault",
    title: "Vault Authority",
    subtitle: "Multi-signature question paper release",
    icon: "shield-checkmark-outline" as const,
    route: "/vault",
  },
  {
    id: "centre",
    title: "Exam Centre",
    subtitle: "Decrypt · Print · Chain-of-custody",
    icon: "print-outline" as const,
    route: "/centre",
  },
  {
    id: "evaluator",
    title: "Evaluator",
    subtitle: "Blockchain-anchored evaluation",
    icon: "create-outline" as const,
    route: "/evaluator",
  },
  {
    id: "analytics",
    title: "Government Analytics",
    subtitle: "National macro-view · incident feed",
    icon: "stats-chart-outline" as const,
    route: "/analytics",
  },
];

export default function Landing() {
  const router = useRouter();
  const [stats, setStats] = useState<any | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="landing-scroll"
        >
          {/* HERO */}
          <View style={styles.hero}>
            <Image source={{ uri: IMG.network }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={["rgba(15,23,42,0.35)", "rgba(15,23,42,0.85)", "#0F172A"]}
              locations={[0, 0.65, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroInner}>
              <View style={styles.brandBadge}>
                <View style={styles.brandDot} />
                <Text style={styles.brandBadgeText}>GOV · DPI · v1.0</Text>
              </View>
              <Text
                numberOfLines={1}
                allowFontScaling={false}
                accessibilityRole="header"
                aria-level={1}
                dataSet={{ examvaultHero: "true" }}
                style={styles.brand}
              >EXAMVAULT</Text>
              <Text style={styles.brandSub}>
                A Zero-Trust Digital Examination Infrastructure
              </Text>
              <Text style={styles.brandTag}>Secure. Transparent. Traceable. Trusted.</Text>

              <View style={{ height: spacing.xl }} />
              <Button
                label="Explore Platform"
                icon="arrow-forward"
                testID="explore-platform-button"
                onPress={() => router.push("/candidate/register")}
              />
              <View style={{ height: spacing.sm }} />
              <Button
                label="Watch Demo"
                variant="secondary"
                icon="play-outline"
                testID="watch-demo-button"
                onPress={() => router.push("/impact")}
              />
            </View>
          </View>

          {/* STATS */}
          <View style={styles.section}>
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <StatPill
                label="Students"
                value={stats ? "30M+" : "—"}
                testID="stat-students"
              />
              <StatPill
                label="Exam Centres"
                value={stats ? `${Math.round((stats.centres || 10248) / 100) / 10}K+` : "—"}
                testID="stat-centres"
              />
            </View>
            <View style={{ height: spacing.md }} />
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <StatPill label="Traceability" value="100%" testID="stat-trace" />
              <StatPill label="Data Integrity" value="99.99%" testID="stat-integrity" />
            </View>
          </View>

          {/* THE PROBLEM */}
          <View style={styles.section}>
            <SectionTitle title="The Problem" hint="Why examinations still leak" />
            <GlassCard>
              <Text style={styles.body}>
                Question papers are physically printed, transported and stored across thousands of centres —
                creating windows for leaks, insider threats, impersonation and tampering.
              </Text>
              <View style={{ height: spacing.md }} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[
                  "Paper leaks",
                  "Insider threats",
                  "Impersonation",
                  "Delayed investigations",
                  "Public trust erosion",
                ].map((t) => (
                  <Badge key={t} label={t} tone="muted" icon="alert-circle-outline" />
                ))}
              </View>
            </GlassCard>
          </View>

          {/* ROLE SELECT */}
          <View style={styles.section}>
            <SectionTitle title="Enter as" hint="Switch persona to explore the full lifecycle" />
            <View style={{ gap: spacing.md }}>
              {ROLES.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => router.push(r.route as any)}
                  testID={`role-${r.id}`}
                  style={({ pressed }) => [
                    styles.roleCard,
                    pressed && { transform: [{ scale: 0.995 }], borderColor: colors.brandPrimary },
                  ]}
                >
                  <View style={styles.roleIcon}>
                    <Ionicons name={r.icon} size={22} color={colors.brandPrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle}>{r.title}</Text>
                    <Text style={styles.roleSub}>{r.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* VERIFY CTA */}
          <View style={styles.section}>
            <GlassCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <Ionicons name="ribbon-outline" size={22} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.body}>Verify a certificate publicly</Text>
                  <Text style={styles.mut}>Anyone can validate blockchain-anchored certificates.</Text>
                </View>
              </View>
              <View style={{ height: spacing.md }} />
              <Button
                label="Verify Certificate"
                variant="ghost"
                icon="shield-checkmark-outline"
                testID="verify-cert-cta"
                onPress={() => router.push("/verify")}
              />
            </GlassCard>
          </View>

          <Text style={styles.foot}>Central Examination Board · Government of India · Prototype 2028</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl },
  hero: {
    // Use CSS clamp on web (hydration-safe), fixed height on native (no SSR).
    ...(Platform.OS === "web"
      ? ({ height: "clamp(440px, 90vw, 620px)" } as any)
      : { height: 520 }),
    overflow: "hidden",
    justifyContent: "flex-end",
    marginBottom: spacing.lg,
  },
  heroInner: { padding: spacing.xl, paddingBottom: spacing.xxl },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: "rgba(56,189,248,0.12)",
    marginBottom: spacing.lg,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandPrimary,
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  brandBadgeText: { color: colors.brandPrimary, fontSize: fs.sm, letterSpacing: 1.4, fontWeight: fw.medium },
  brand: {
    color: colors.onSurface,
    fontWeight: fw.medium,
    ...(Platform.OS === "web"
      ? ({ fontSize: "clamp(2rem, 10vw, 3.25rem)", letterSpacing: "clamp(1.5px, 0.6vw, 4px)", whiteSpace: "nowrap", wordBreak: "keep-all", overflowWrap: "normal", display: "block", maxWidth: "100vw" } as any)
      : { fontSize: fs["4xl"], letterSpacing: 4 }),
  },
  brandSub: { color: colors.onSurfaceSecondary, fontSize: fs.lg, marginTop: spacing.sm, letterSpacing: 0.3, lineHeight: 24 },
  brandTag: { color: colors.brandPrimary, fontSize: fs.base, marginTop: spacing.md, letterSpacing: 1.2 },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  body: { color: colors.onSurface, fontSize: fs.base, lineHeight: 22 },
  mut: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 4 },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTitle: { color: colors.onSurface, fontSize: fs.lg, fontWeight: fw.medium },
  roleSub: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2 },
  foot: {
    color: colors.onSurfaceTertiary,
    fontSize: fs.sm,
    textAlign: "center",
    letterSpacing: 0.6,
    marginTop: spacing.md,
  },
});
