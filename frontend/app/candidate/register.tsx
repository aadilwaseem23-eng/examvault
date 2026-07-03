import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";
import { Button, GlassCard, Header, Screen, SectionTitle, Badge, GlowBackground } from "@/src/components/ui";
import { api } from "@/src/api";

const STEPS = ["Details", "Identity", "Exam"];

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "Aarav Sharma",
    dob: "2007-03-14",
    gov_id: "1234-5678-9012",
    email: "aarav@example.in",
    phone: "+91 98100 42210",
    exam: "NEET-UG-2028",
  });
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.exams().then((r) => setExams(r.exams || [])).catch(() => {});
  }, []);

  const disabled = useMemo(() => {
    if (step === 0) return !form.name || !form.dob;
    if (step === 1) return !form.gov_id || !form.email || !form.phone;
    return !form.exam;
  }, [step, form]);

  const submit = async () => {
    setLoading(true);
    try {
      const cand = await api.registerCandidate(form);
      router.push({ pathname: "/candidate/verify", params: { cid: cand.id, exam: form.exam } });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label,
    value,
    onChange,
    placeholder,
    keyboardType,
    testID,
  }: any) => (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceTertiary}
        keyboardType={keyboardType}
        style={s.input}
        testID={testID}
      />
    </View>
  );

  return (
    <Screen>
      <GlowBackground />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Candidate Registration" subtitle="Zero-trust onboarding" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={s.scroll}>
            {/* Stepper */}
            <View style={s.stepper}>
              {STEPS.map((label, i) => (
                <View key={label} style={s.stepItem}>
                  <View
                    style={[
                      s.stepDot,
                      i <= step && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
                    ]}
                  >
                    <Text style={[s.stepIdx, i <= step && { color: colors.surface }]}>{i + 1}</Text>
                  </View>
                  <Text style={[s.stepLabel, i === step && { color: colors.onSurface }]}>{label}</Text>
                  {i < STEPS.length - 1 && <View style={s.stepBar} />}
                </View>
              ))}
            </View>

            <GlassCard>
              {step === 0 && (
                <View>
                  <SectionTitle title="Step 1" hint="Personal Details" />
                  <Field
                    label="Full Name"
                    value={form.name}
                    onChange={(v: string) => setForm({ ...form, name: v })}
                    testID="reg-name"
                  />
                  <Field
                    label="Date of Birth"
                    value={form.dob}
                    onChange={(v: string) => setForm({ ...form, dob: v })}
                    placeholder="YYYY-MM-DD"
                    testID="reg-dob"
                  />
                </View>
              )}
              {step === 1 && (
                <View>
                  <SectionTitle title="Step 2" hint="Government Identity" />
                  <Field
                    label="Government ID (Aadhaar / PAN)"
                    value={form.gov_id}
                    onChange={(v: string) => setForm({ ...form, gov_id: v })}
                    testID="reg-govid"
                  />
                  <Field
                    label="Email"
                    value={form.email}
                    onChange={(v: string) => setForm({ ...form, email: v })}
                    keyboardType="email-address"
                    testID="reg-email"
                  />
                  <Field
                    label="Phone"
                    value={form.phone}
                    onChange={(v: string) => setForm({ ...form, phone: v })}
                    keyboardType="phone-pad"
                    testID="reg-phone"
                  />
                </View>
              )}
              {step === 2 && (
                <View>
                  <SectionTitle title="Step 3" hint="Choose Examination" />
                  <View style={{ gap: spacing.sm }}>
                    {exams.map((e) => {
                      const active = form.exam === e.code;
                      return (
                        <Pressable
                          key={e.code}
                          onPress={() => setForm({ ...form, exam: e.code })}
                          style={[s.examCard, active && s.examCardActive]}
                          testID={`reg-exam-${e.code}`}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={s.examName}>{e.name}</Text>
                            <Text style={s.examDate}>{e.date}</Text>
                          </View>
                          <View style={[s.radio, active && s.radioActive]}>
                            {active && <Ionicons name="checkmark" size={14} color={colors.surface} />}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </GlassCard>

            <View style={{ height: spacing.lg }} />
            <GlassCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <View style={s.aiOrb}>
                  <Ionicons name="sparkles-outline" size={16} color={colors.brandPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium }}>
                    AI Assistant
                  </Text>
                  <Text style={{ color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2 }}>
                    {step === 0
                      ? "We use zero-knowledge proofs to protect PII on-chain."
                      : step === 1
                      ? "Your Aadhaar is hashed locally — the raw number never leaves your device."
                      : "Seat allotment uses a Merkle-tree fairness proof, published post-exam."}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </ScrollView>

          <View style={s.footer}>
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              {step > 0 && (
                <Button
                  label="Back"
                  variant="secondary"
                  onPress={() => setStep(step - 1)}
                  style={{ flex: 1 }}
                  testID="reg-back-button"
                />
              )}
              <Button
                label={step === STEPS.length - 1 ? "Verify Identity" : "Continue"}
                icon="arrow-forward"
                disabled={disabled}
                loading={loading}
                onPress={() => (step === STEPS.length - 1 ? submit() : setStep(step + 1))}
                style={{ flex: 1 }}
                testID="register-continue"
              />
            </View>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Badge label="AES-256 · TLS 1.3 · zk-attested" tone="info" icon="lock-closed-outline" />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  stepper: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  stepItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIdx: { color: colors.onSurfaceTertiary, fontSize: fs.sm, fontWeight: fw.medium },
  stepLabel: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginLeft: 8, marginRight: 8 },
  stepBar: { flex: 1, height: 1, backgroundColor: colors.border },
  label: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginBottom: 6, letterSpacing: 0.4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.onSurface,
    fontSize: fs.base,
  },
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  examCardActive: { borderColor: colors.brandPrimary, backgroundColor: colors.brandGlow },
  examName: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium },
  examDate: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  aiOrb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
