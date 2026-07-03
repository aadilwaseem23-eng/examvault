import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { colors, spacing, radius, fs, fw, IMG } from "@/src/theme";
import { Button, GlassCard } from "@/src/components/ui";
import { Reveal } from "@/src/components/reveal";

// --- external links (edit these when you publish) ---
const LINKS = {
  pitchDeck: "https://drive.google.com/file/d/EXAMVAULT_PITCH_DECK/view",
  whitepaper: "https://drive.google.com/file/d/EXAMVAULT_WHITEPAPER/view",
  github: "https://github.com/",
  email: "mailto:aadilwaseem234@gmail.com",
  phone: "tel:+918920869628",
};

const openExt = (url: string) => Linking.openURL(url).catch(() => {});

// --------- reusable section wrapper (centers content on wide web) ----------
const MAX_W = 960;
const Container: React.FC<{ children: React.ReactNode; wide?: number }> = ({ children, wide }) => {
  const maxW = wide ?? MAX_W;
  // Use CSS width caps rather than JS-measured min(width, maxW) to avoid
  // hydration flashes when useWindowDimensions returns build-time defaults.
  return (
    <View style={{ width: "100%", alignItems: "center", paddingHorizontal: spacing.lg }}>
      <View style={{ width: "100%", maxWidth: maxW }}>{children}</View>
    </View>
  );
};

const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.eyebrow}>{children}</Text>
);

const SectionH2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.h2}>{children}</Text>
);

export default function MarketingLanding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 780;
  const isTiny = width < 380;

  // --------- Hydration-safe hero sizing ---------
  // Rationale: JS-computed viewport-dependent fontSize causes an SSR/CSR
  // hydration mismatch on Android after refresh (the static HTML paints
  // *before* hydration runs and re-measures). Fix: use CSS `clamp()` on
  // web (viewport-aware at paint time, zero JS dependency) with
  // `whiteSpace: nowrap` so the wordmark can NEVER wrap character-by-character.
  // Native gets a static fallback since native has no SSR.
  const heroTitleStyle = Platform.OS === "web"
    ? ({
        fontSize: "clamp(2rem, 10vw, 5rem)",
        letterSpacing: "clamp(1.5px, 0.6vw, 4px)",
        whiteSpace: "nowrap",
        wordBreak: "keep-all",
        overflowWrap: "normal",
        display: "block",
      } as any)
    : { fontSize: 44, letterSpacing: 3 };
  const heroSubStyle = Platform.OS === "web"
    ? ({ fontSize: "clamp(15px, 2.2vw, 22px)", lineHeight: 26, wordBreak: "normal", overflowWrap: "break-word" } as any)
    : { fontSize: 18, lineHeight: 26 };

  // running counter on the hero stats
  const [count, setCount] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = Date.now();
    const anim = () => {
      const p = Math.min(1, (Date.now() - start) / 1600);
      setCount(Math.floor(30_412_780 * (0.9 + 0.1 * p)));
      if (p < 1) raf = requestAnimationFrame(anim);
    };
    anim();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Head>
        <title>ExamVault | Blockchain & AI Powered Digital Examination Infrastructure</title>
        <meta
          name="description"
          content="ExamVault is a secure digital public infrastructure for high-stakes examinations powered by AI, Blockchain, Cryptography, Zero Trust Architecture and Multi-Signature Security."
        />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#0F172A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="canonical" href="https://examvault-delta.vercel.app" />
        <link rel="icon" type="image/png" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        {/* Open Graph */}
        <meta property="og:site_name" content="ExamVault" />
        <meta property="og:title" content="ExamVault" />
        <meta property="og:description" content="Blockchain & AI Powered Digital Examination Infrastructure" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://examvault-delta.vercel.app" />
        <meta property="og:image" content="https://examvault-delta.vercel.app/og-image.png" />
        <meta property="og:image:secure_url" content="https://examvault-delta.vercel.app/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ExamVault — Blockchain & AI Powered Digital Examination Infrastructure" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ExamVault" />
        <meta name="twitter:description" content="Blockchain & AI Powered Digital Examination Infrastructure" />
        <meta name="twitter:image" content="https://examvault-delta.vercel.app/og-image.png" />
        {/* Hydration-safe global CSS: prevents Android portrait character-wrap on the hero,
            eliminates horizontal scroll, and enforces baseline dark background before JS mounts. */}
        <style>{`
          html, body, #root { background-color: #0F172A; margin: 0; padding: 0; }
          html, body { overflow-x: hidden; }
          [data-examvault-hero] {
            white-space: nowrap !important;
            word-break: keep-all !important;
            overflow-wrap: normal !important;
            display: block !important;
            max-width: 100vw;
          }
          [data-examvault-hero-sub] { word-break: normal !important; overflow-wrap: break-word !important; }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
        `}</style>
      </Head>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          showsVerticalScrollIndicator={false}
          testID="marketing-scroll"
        >
          {/* ============================== HERO ============================== */}
          <View style={[styles.hero, { minHeight: isWide ? 640 : 620 }]}>
            <Image source={{ uri: IMG.network }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={["rgba(15,23,42,0.35)", "rgba(15,23,42,0.75)", "#0F172A"]}
              locations={[0, 0.6, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Top nav */}
            <Container wide={1120}>
              <View style={styles.topNav}>
                <View style={styles.brandBadge}>
                  <View style={styles.brandDot} />
                  <Text style={styles.brandBadgeText}>GOV · DPI · v1.0</Text>
                </View>
                <View style={styles.navLinks}>
                  {isWide && (
                    <>
                      <NavLink label="About" onPress={() => scrollTo("about")} />
                      <NavLink label="Problem" onPress={() => scrollTo("problem")} />
                      <NavLink label="Architecture" onPress={() => scrollTo("arch")} />
                      <NavLink label="Prototype" onPress={() => router.push("/prototype")} />
                    </>
                  )}
                  <Pressable
                    onPress={() => router.push("/prototype")}
                    style={styles.navCta}
                    testID="nav-try-prototype"
                  >
                    <Text style={styles.navCtaT}>Try Prototype</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.surface} />
                  </Pressable>
                </View>
              </View>
            </Container>

            {/* Hero content */}
            <Container wide={1120}>
              <View style={[styles.heroInner, { paddingTop: isWide ? 72 : 32 }]}>
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  accessibilityRole="header"
                  aria-level={1}
                  dataSet={{ examvaultHero: "true" }}
                  style={[styles.brand, heroTitleStyle]}
                >
                  EXAMVAULT
                </Text>
                <Text
                  dataSet={{ examvaultHeroSub: "true" }}
                  style={[styles.brandSub, heroSubStyle, { maxWidth: isWide ? 620 : "100%" }]}
                >
                  A Blockchain & AI Powered Examination Infrastructure for Secure, Transparent and Trusted Assessments
                </Text>
                <Text style={styles.brandTag}>Secure. Transparent. Traceable. Trusted.</Text>

                <View style={{ height: spacing.xl }} />
                <View style={{ flexDirection: isWide ? "row" : "column", gap: spacing.md, alignSelf: "flex-start" }}>
                  <Button
                    label="Try Live Prototype"
                    icon="rocket-outline"
                    testID="hero-try-prototype"
                    onPress={() => router.push("/prototype")}
                    style={{ minWidth: 200 }}
                  />
                  <Button
                    label="Watch the Story"
                    variant="secondary"
                    icon="play-outline"
                    onPress={() => scrollTo("about")}
                    style={{ minWidth: 180 }}
                    testID="hero-watch-story"
                  />
                </View>
              </View>
            </Container>
          </View>

          {/* ============================== HERO STATS ============================== */}
          <Container wide={1080}>
            <View style={{ marginTop: isTiny ? -20 : -40 }}>
              <View style={styles.statRow}>
                <StatBig value={`${(count / 1_000_000).toFixed(1)}M+`} label="Registered candidates" />
                <StatBig value="10,248" label="Exam centres" />
                <StatBig value="99.99%" label="Data integrity" />
                <StatBig value="100%" label="Traceability" />
              </View>
            </View>
          </Container>

          {/* ============================== APPLICABLE ACROSS ============================== */}
          <View style={{ marginTop: spacing.xxl }}>
            <Container wide={1080}>
              <Text style={styles.applicableK}>APPLICABLE ACROSS EVERY HIGH-STAKES ASSESSMENT</Text>
              <View style={styles.applicableRow}>
                {[
                  { i: "school-outline", t: "University Entrance" },
                  { i: "business-outline", t: "Civil Services" },
                  { i: "cash-outline", t: "Banking Exams" },
                  { i: "medkit-outline", t: "Medical & Nursing" },
                  { i: "hammer-outline", t: "Engineering" },
                  { i: "shield-outline", t: "Defence & Police" },
                  { i: "briefcase-outline", t: "Professional Licensing" },
                  { i: "globe-outline", t: "International Testing" },
                ].map((c) => (
                  <View key={c.t} style={styles.applicablePill}>
                    <Ionicons name={c.i as any} size={14} color={colors.brandPrimary} />
                    <Text style={styles.applicablePillT}>{c.t}</Text>
                  </View>
                ))}
              </View>
            </Container>
          </View>

          {/* ============================== VISION ============================== */}
          <View style={{ marginTop: spacing.xxxl }}>
            <Container wide={880}>
              <View style={styles.visionCard}>
                <LinearGradient
                  colors={["rgba(56,189,248,0.16)", "rgba(16,185,129,0.06)", "rgba(15,23,42,0.9)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={{ padding: isWide ? spacing.xxl : spacing.xl }}>
                  <SectionEyebrow>OUR VISION</SectionEyebrow>
                  <Text style={[styles.visionQ, isWide && { fontSize: 32, lineHeight: 44 }]}>
                    Imagine a future where every examination is secure by design
                    <Text style={{ color: colors.brandPrimary }}>{"\u00A0\u2014\u00A0"}not by trust, but by technology.</Text>
                  </Text>
                </View>
              </View>
            </Container>
          </View>

          {/* ============================== ABOUT ============================== */}
          <View nativeID="about" style={{ marginTop: spacing.xxxl }}>
            <Container>
              <SectionEyebrow>ABOUT · 01</SectionEyebrow>
              <SectionH2>What is ExamVault?</SectionH2>
              <Text style={styles.lead}>
                ExamVault is a next-generation Digital Public Infrastructure (DPI) that secures the
                entire high-stakes examination lifecycle with AI, Blockchain, Cryptography and Zero-Trust
                architecture — replacing physical trust with cryptographic trust.
              </Text>
              <View style={{ height: spacing.xl }} />
              <View style={[styles.gridCards, !isWide && { flexDirection: "column" }]}>
                <FeatureCard icon="shield-checkmark-outline" title="Zero Trust" body="Every action authenticated, authorised, encrypted, digitally signed and audit-logged." />
                <FeatureCard icon="cube-outline" title="Blockchain" body="Immutable custody trails, tamper-evident evaluation, on-chain certificate anchoring." />
                <FeatureCard icon="sparkles-outline" title="AI Verification" body="Face + liveness + duplicate detection at 4.8s p95 across 10,000+ centres." />
              </View>
            </Container>
          </View>

          {/* ============================== PROBLEM ============================== */}
          <View nativeID="problem" style={{ marginTop: spacing.xxxl }}>
            <Container>
              <SectionEyebrow>PROBLEM · 02</SectionEyebrow>
              <SectionH2>Why examinations still leak</SectionH2>
              <Text style={styles.lead}>
                Question papers are physically printed, transported and stored across thousands of centres —
                creating windows for leaks, insider threats, impersonation and tampering. Even after tighter
                controls, the process itself remains the weakness.
              </Text>
              <View style={{ height: spacing.xl }} />
              <View style={[styles.gridCards, !isWide && { flexDirection: "column" }]}>
                <ProblemCard n="01" title="Paper leaks" body="Printed masters travel hundreds of miles before being locked in vaults." />
                <ProblemCard n="02" title="Insider threats" body="Every hand-off is an opportunity — printers, couriers, storage, unlockers." />
                <ProblemCard n="03" title="Delayed investigations" body="Physical audit trails are slow, brittle, and often after-the-fact." />
              </View>
              <View style={{ height: spacing.lg }} />
              <GlassCard>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
                  <Ionicons name="alert-circle-outline" size={22} color={colors.warning} />
                  <Text style={styles.body}>
                    Inspired by recent high-stakes examination security challenges around the world:
                    additional physical security cannot fix a fundamentally physical process. The remedy
                    must be architectural — replace transport with cryptography.
                  </Text>
                </View>
              </GlassCard>
            </Container>
          </View>

          {/* ============================== ARCHITECTURE ============================== */}
          <View nativeID="arch" style={{ marginTop: spacing.xxxl }}>
            <Container>
              <SectionEyebrow>ARCHITECTURE · 03</SectionEyebrow>
              <SectionH2>How the trust flows</SectionH2>
              <Text style={styles.lead}>
                Six cryptographically-linked stages replace the physical supply chain of question papers,
                answer sheets and results.
              </Text>
              <View style={{ height: spacing.xl }} />
              <View style={{ gap: spacing.md }}>
                {[
                  { icon: "lock-closed-outline", t: "Question Paper Development", d: "Prepared inside secure facility · AES-256 encrypted at source · no admin can read the plaintext." },
                  { icon: "key-outline", t: "Multi-Signature Digital Vault", d: "3-of-5 threshold cryptography · release requires quorum of independent authorities." },
                  { icon: "print-outline", t: "Secure Local Printing", d: "Decrypt 45m before exam · CCTV-verified · every copy carries a unique QR + invisible watermark." },
                  { icon: "person-outline", t: "Candidate Authentication", d: "AI face-match + liveness + government ID + seat confirmation in under 5s." },
                  { icon: "git-network-outline", t: "Answer Sheet Custody", d: "Each sheet hashed + chained across evaluation nodes with full provenance." },
                  { icon: "ribbon-outline", t: "Transparent Results", d: "Scanned evaluated sheets visible to student · certificates anchored on chain · public verifier for institutions." },
                ].map((s, i) => (
                  <Reveal key={i} delay={i * 70} translate={20}>
                    <View style={styles.archRow}>
                      <View style={styles.archIdx}>
                        <Text style={styles.archIdxT}>{String(i + 1).padStart(2, "0")}</Text>
                      </View>
                      <View style={styles.archIconBox}>
                        <Ionicons name={s.icon as any} size={20} color={colors.brandPrimary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.archT}>{s.t}</Text>
                        <Text style={styles.archD}>{s.d}</Text>
                      </View>
                    </View>
                  </Reveal>
                ))}
              </View>
            </Container>
          </View>

          {/* ============================== CURRENT vs EXAMVAULT ============================== */}
          <View style={{ marginTop: spacing.xxxl }}>
            <Container>
              <SectionEyebrow>COMPARISON · 04</SectionEyebrow>
              <SectionH2>Current process vs ExamVault</SectionH2>
              <Text style={styles.lead}>
                Understand the shift in a single glance — every point of physical weakness replaced by
                a cryptographic guarantee.
              </Text>
              <View style={{ height: spacing.xl }} />

              {/* Column headers */}
              <View style={styles.cmpHeadRow}>
                <View style={[styles.cmpHead, styles.cmpHeadLeft]}>
                  <Ionicons name="close-circle-outline" size={16} color={colors.error} />
                  <Text style={styles.cmpHeadT}>Current Process</Text>
                </View>
                <View style={[styles.cmpHead, styles.cmpHeadRight]}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                  <Text style={[styles.cmpHeadT, { color: colors.success }]}>ExamVault</Text>
                </View>
              </View>

              {[
                { l: "Physical paper transportation", r: "Encrypted digital distribution", li: "cube-outline", ri: "cloud-upload-outline" },
                { l: "Manual identity verification", r: "AI-assisted identity verification", li: "eye-off-outline", ri: "sparkles-outline" },
                { l: "Multiple leak points", r: "Multi-Signature Digital Vault", li: "warning-outline", ri: "lock-closed-outline" },
                { l: "Difficult investigations", r: "Immutable blockchain audit trail", li: "search-outline", ri: "cube-outline" },
                { l: "Manual certificate verification", r: "Instant blockchain verification", li: "document-outline", ri: "flash-outline" },
              ].map((row, i) => (
                <Reveal key={i} delay={i * 90} translate={22}>
                  <View style={styles.cmpRow}>
                    <View style={[styles.cmpCell, styles.cmpCellLeft]}>
                      <View style={styles.cmpIconL}>
                        <Ionicons name={row.li as any} size={16} color={colors.error} />
                      </View>
                      <Text style={styles.cmpLeftT} numberOfLines={2}>{row.l}</Text>
                    </View>
                    <View style={[styles.cmpCell, styles.cmpCellRight]}>
                      <View style={styles.cmpIconR}>
                        <Ionicons name={row.ri as any} size={16} color={colors.success} />
                      </View>
                      <Text style={styles.cmpRightT} numberOfLines={2}>{row.r}</Text>
                    </View>
                  </View>
                </Reveal>
              ))}
            </Container>
          </View>

          {/* ============================== TRY PROTOTYPE ============================== */}
          <View style={{ marginTop: spacing.xxxl }}>
            <Container>
              <View style={styles.tryCard}>
                <LinearGradient
                  colors={["rgba(56,189,248,0.24)", "rgba(6,182,212,0.06)", "rgba(15,23,42,0.95)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={{ padding: isWide ? spacing.xxl : spacing.xl }}>
                  <SectionEyebrow>DEMO · 05</SectionEyebrow>
                  <SectionH2>Try the live prototype</SectionH2>
                  <Text style={styles.lead}>
                    Explore the full lifecycle across 5 personas — Candidate, Vault Authority, Exam Centre,
                    Evaluator and Government Analytics. Sign the 3-of-5 vault, watch the AES-256 ceremony,
                    print papers with per-copy watermarks, and verify a certificate publicly.
                  </Text>
                  <View style={{ height: spacing.lg }} />
                  <View style={{ flexDirection: isWide ? "row" : "column", gap: spacing.md, flexWrap: "wrap" }}>
                    <Chip icon="person-circle-outline" label="Candidate" onPress={() => router.push("/candidate/register")} />
                    <Chip icon="shield-checkmark-outline" label="Vault Authority" onPress={() => router.push("/vault")} />
                    <Chip icon="print-outline" label="Exam Centre" onPress={() => router.push("/centre")} />
                    <Chip icon="create-outline" label="Evaluator" onPress={() => router.push("/evaluator")} />
                    <Chip icon="stats-chart-outline" label="Analytics" onPress={() => router.push("/analytics")} />
                  </View>
                  <View style={{ height: spacing.xl }} />
                  <Button
                    label="Launch Prototype"
                    icon="rocket-outline"
                    onPress={() => router.push("/prototype")}
                    testID="cta-launch-prototype"
                    style={{ alignSelf: "flex-start", minWidth: 220 }}
                  />
                </View>
              </View>
            </Container>
          </View>

          {/* ============================== RESOURCES ============================== */}
          <View style={{ marginTop: spacing.xxxl }}>
            <Container>
              <SectionEyebrow>RESOURCES · 06</SectionEyebrow>
              <SectionH2>Read the story in depth</SectionH2>
              <View style={{ height: spacing.lg }} />
              <View style={[styles.gridCards, !isWide && { flexDirection: "column" }]}>
                <ResourceCard
                  icon="easel-outline"
                  title="Pitch Deck"
                  body="15-slide investor / government pitch."
                  cta="Open deck"
                  onPress={() => openExt(LINKS.pitchDeck)}
                  testID="res-pitchdeck"
                />
                <ResourceCard
                  icon="document-text-outline"
                  title="Whitepaper"
                  body="Technical whitepaper: cryptography, threshold vault, chain design."
                  cta="Read paper"
                  onPress={() => openExt(LINKS.whitepaper)}
                  testID="res-whitepaper"
                />
                <ResourceCard
                  icon="logo-github"
                  title="GitHub"
                  body="Source code, issues, roadmap."
                  cta="View repo"
                  onPress={() => openExt(LINKS.github)}
                  testID="res-github"
                />
              </View>
            </Container>
          </View>

          {/* ============================== CONTACT ============================== */}
          <View style={{ marginTop: spacing.xxxl }}>
            <Container>
              <SectionEyebrow>CONTACT · 07</SectionEyebrow>
              <SectionH2>Get in touch</SectionH2>
              <Text style={styles.lead}>
                For partnerships, pilots or press — reach out. We reply within one working day.
              </Text>
              <View style={{ height: spacing.lg }} />
              <View style={[styles.gridCards, !isWide && { flexDirection: "column" }]}>
                <ContactCard
                  icon="mail-outline"
                  label="Email"
                  value="aadilwaseem234@gmail.com"
                  onPress={() => openExt(LINKS.email)}
                  testID="contact-email"
                />
                <ContactCard
                  icon="call-outline"
                  label="Phone"
                  value="+91 8920869628"
                  onPress={() => openExt(LINKS.phone)}
                  testID="contact-phone"
                />
              </View>
            </Container>
          </View>

          {/* ============================== FOOTER ============================== */}
          <View style={{ marginTop: spacing.xxxl, paddingVertical: spacing.xl }}>
            <Container>
              {/* Prototype disclaimer */}
              <View style={styles.disclaimer}>
                <View style={styles.disclaimerHead}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.brandPrimary} />
                  <Text style={styles.disclaimerTitle}>Prototype Status</Text>
                </View>
                <Text style={styles.disclaimerBody}>
                  ExamVault is a conceptual product prototype created to demonstrate how AI, Blockchain,
                  Cryptography and Zero Trust principles can strengthen the security and transparency of
                  high-stakes examinations. This prototype focuses on user experience, workflow validation
                  and system architecture rather than production deployment.
                </Text>
              </View>

              <View
                style={{
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                  paddingTop: spacing.lg,
                  marginTop: spacing.lg,
                  flexDirection: isWide ? "row" : "column",
                  justifyContent: "space-between",
                  alignItems: isWide ? "center" : "flex-start",
                  gap: spacing.md,
                }}
              >
                <Text style={styles.foot}>© 2028 ExamVault · Prototype for public benefit</Text>
                <Text style={styles.foot}>Central Examination Board · Government of India</Text>
              </View>
            </Container>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// -------- Section-scroll helper for web anchors --------
function scrollTo(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ------------------------------ subcomponents ------------------------------
const NavLink: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <Pressable onPress={onPress} style={styles.navLink}>
    <Text style={styles.navLinkT}>{label}</Text>
  </Pressable>
);

const StatBig: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={styles.statBig}>
    <Text style={styles.statBigV}>{value}</Text>
    <Text style={styles.statBigL}>{label}</Text>
  </View>
);

const FeatureCard: React.FC<{ icon: any; title: string; body: string }> = ({ icon, title, body }) => (
  <View style={styles.featCard}>
    <View style={styles.featIcon}>
      <Ionicons name={icon} size={20} color={colors.brandPrimary} />
    </View>
    <Text style={styles.featT}>{title}</Text>
    <Text style={styles.featB}>{body}</Text>
  </View>
);

const ProblemCard: React.FC<{ n: string; title: string; body: string }> = ({ n, title, body }) => (
  <View style={styles.probCard}>
    <Text style={styles.probN}>{n}</Text>
    <Text style={styles.probT}>{title}</Text>
    <Text style={styles.probB}>{body}</Text>
  </View>
);

const Chip: React.FC<{ icon: any; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <Pressable onPress={onPress} style={styles.chip}>
    <Ionicons name={icon} size={14} color={colors.brandPrimary} />
    <Text style={styles.chipT}>{label}</Text>
  </Pressable>
);

const ResourceCard: React.FC<{ icon: any; title: string; body: string; cta: string; onPress: () => void; testID?: string }> = ({
  icon,
  title,
  body,
  cta,
  onPress,
  testID,
}) => (
  <Pressable onPress={onPress} style={styles.resCard} testID={testID}>
    <View style={styles.resIcon}>
      <Ionicons name={icon} size={20} color={colors.brandPrimary} />
    </View>
    <Text style={styles.featT}>{title}</Text>
    <Text style={styles.featB}>{body}</Text>
    <View style={{ height: spacing.sm }} />
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Text style={styles.resCta}>{cta}</Text>
      <Ionicons name="arrow-forward" size={14} color={colors.brandPrimary} />
    </View>
  </Pressable>
);

const ContactCard: React.FC<{ icon: any; label: string; value: string; onPress: () => void; testID?: string }> = ({
  icon,
  label,
  value,
  onPress,
  testID,
}) => (
  <Pressable onPress={onPress} style={styles.contactCard} testID={testID}>
    <View style={styles.contactIcon}>
      <Ionicons name={icon} size={20} color={colors.brandPrimary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.contactL}>{label}</Text>
      <Text style={styles.contactV}>{value}</Text>
    </View>
    <Ionicons name="arrow-forward" size={16} color={colors.onSurfaceTertiary} />
  </Pressable>
);

// ------------------------------ styles ------------------------------
const styles = StyleSheet.create({
  hero: { overflow: "hidden", justifyContent: "flex-start" },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  navLinks: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  navLink: { paddingHorizontal: 8, paddingVertical: 6 },
  navLinkT: { color: colors.onSurfaceSecondary, fontSize: fs.sm, letterSpacing: 0.4 },
  navCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  navCtaT: { color: colors.surface, fontSize: fs.sm, fontWeight: fw.medium, letterSpacing: 0.4 },
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
  heroInner: { paddingBottom: spacing.xxl },
  brand: { color: colors.onSurface, fontSize: 48, fontWeight: fw.medium, letterSpacing: 4, includeFontPadding: false as any },
  brandSub: { color: colors.onSurfaceSecondary, fontSize: fs.lg, marginTop: spacing.sm, letterSpacing: 0.3, lineHeight: 26 },
  brandTag: { color: colors.brandPrimary, fontSize: fs.base, marginTop: spacing.md, letterSpacing: 1.2 },

  statRow: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" },
  statBig: {
    flex: 1,
    minWidth: 140,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.85)",
  },
  statBigV: { color: colors.onSurface, fontSize: fs["2xl"], fontWeight: fw.medium, letterSpacing: 0.5 },
  statBigL: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 4, letterSpacing: 0.5 },

  eyebrow: { color: colors.brandPrimary, fontSize: fs.sm, letterSpacing: 2.4, fontWeight: fw.medium },
  h2: { color: colors.onSurface, fontSize: fs["3xl"], fontWeight: fw.medium, letterSpacing: 0.4, marginTop: 8, marginBottom: spacing.md },
  lead: { color: colors.onSurfaceSecondary, fontSize: fs.lg, lineHeight: 26, maxWidth: 720 },
  body: { color: colors.onSurface, fontSize: fs.base, lineHeight: 22, flex: 1 },

  gridCards: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" },
  featCard: {
    flex: 1,
    minWidth: 240,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
    gap: spacing.sm,
  },
  featIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  featT: { color: colors.onSurface, fontSize: fs.lg, fontWeight: fw.medium },
  featB: { color: colors.onSurfaceTertiary, fontSize: fs.base, lineHeight: 22 },

  probCard: {
    flex: 1,
    minWidth: 240,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
    gap: 6,
  },
  probN: { color: colors.brandPrimary, fontSize: fs.sm, letterSpacing: 2, fontFamily: "Menlo", fontWeight: fw.medium },
  probT: { color: colors.onSurface, fontSize: fs.lg, fontWeight: fw.medium, marginTop: 4 },
  probB: { color: colors.onSurfaceTertiary, fontSize: fs.base, lineHeight: 22 },

  archRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
  },
  archIdx: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  archIdxT: { color: colors.brandPrimary, fontSize: fs.sm, fontFamily: "Menlo", fontWeight: fw.medium },
  archIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  archT: { color: colors.onSurface, fontSize: fs.lg, fontWeight: fw.medium },
  archD: { color: colors.onSurfaceTertiary, fontSize: fs.base, marginTop: 4, lineHeight: 22 },

  tryCard: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
  },
  chipT: { color: colors.brandPrimary, fontSize: fs.sm, fontWeight: fw.medium, letterSpacing: 0.4 },

  resCard: {
    flex: 1,
    minWidth: 240,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
    gap: 8,
  },
  resIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  resCta: { color: colors.brandPrimary, fontSize: fs.base, fontWeight: fw.medium },

  contactCard: {
    flex: 1,
    minWidth: 240,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  contactL: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 0.4 },
  contactV: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium, marginTop: 2 },

  foot: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 0.4 },

  // Prototype disclaimer
  disclaimer: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
    padding: spacing.lg,
    gap: 8,
  },
  disclaimerHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  disclaimerTitle: {
    color: colors.brandPrimary,
    fontSize: fs.sm,
    letterSpacing: 2,
    fontWeight: fw.medium,
    textTransform: "uppercase",
  },
  disclaimerBody: {
    color: colors.onSurfaceSecondary,
    fontSize: fs.base,
    lineHeight: 22,
  },

  // Vision
  visionCard: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  visionQ: {
    color: colors.onSurface,
    fontSize: fs["2xl"],
    lineHeight: 34,
    fontWeight: fw.medium,
    letterSpacing: 0.2,
    marginTop: spacing.md,
    maxWidth: 780,
  },

  // Comparison
  cmpHeadRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.sm },
  cmpHead: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  cmpHeadLeft: {
    borderColor: "rgba(239,68,68,0.35)",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  cmpHeadRight: {
    borderColor: "rgba(16,185,129,0.4)",
    backgroundColor: "rgba(16,185,129,0.08)",
  },
  cmpHeadT: {
    color: colors.error,
    fontSize: fs.sm,
    fontWeight: fw.medium,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  cmpRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cmpCell: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  cmpCellLeft: {
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.5)",
  },
  cmpCellRight: {
    borderColor: "rgba(16,185,129,0.3)",
    backgroundColor: "rgba(16,185,129,0.05)",
  },
  cmpIconL: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.35)",
    backgroundColor: "rgba(239,68,68,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cmpIconR: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.35)",
    backgroundColor: "rgba(16,185,129,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cmpLeftT: {
    color: colors.onSurfaceSecondary,
    fontSize: fs.base,
    flex: 1,
    textDecorationLine: "line-through",
    textDecorationColor: "rgba(239,68,68,0.5)",
  },
  cmpRightT: {
    color: colors.onSurface,
    fontSize: fs.base,
    fontWeight: fw.medium,
    flex: 1,
  },
  cmpMobileArrow: {
    alignSelf: "center",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },

  // Applicable-across strip
  applicableK: {
    color: colors.onSurfaceTertiary,
    fontSize: fs.sm,
    letterSpacing: 2.4,
    fontWeight: fw.medium,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  applicableRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  applicablePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(30,41,59,0.55)",
  },
  applicablePillT: {
    color: colors.onSurfaceSecondary,
    fontSize: fs.sm,
    fontWeight: fw.medium,
    letterSpacing: 0.4,
  },
});
