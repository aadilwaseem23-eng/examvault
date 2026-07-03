import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fs, fw } from "@/src/theme";

// ---------- Screen shell ----------
export const Screen: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => <View style={[{ flex: 1, backgroundColor: colors.surface }, style]}>{children}</View>;

// ---------- Header ----------
export const Header: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: boolean;
  right?: React.ReactNode;
}> = ({ title, subtitle, onBack = true, right }) => {
  const router = useRouter();
  return (
    <View style={h.wrap} testID="screen-header">
      <View style={h.row}>
        {onBack ? (
          <Pressable
            onPress={() => router.back()}
            style={h.back}
            testID="header-back-button"
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={20} color={colors.onSurface} />
          </Pressable>
        ) : (
          <View style={h.back} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={h.title}>{title}</Text>
          {!!subtitle && <Text style={h.sub}>{subtitle}</Text>}
        </View>
        <View style={{ minWidth: 36, alignItems: "flex-end" }}>{right}</View>
      </View>
    </View>
  );
};
const h = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  back: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.onSurface, fontSize: fs.lg, fontWeight: fw.medium, letterSpacing: 0.2 },
  sub: { color: colors.onSurfaceTertiary, fontSize: fs.sm, marginTop: 2 },
});

// ---------- Glass Card ----------
export const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}> = ({ children, style, intensity = 40 }) => (
  <View style={[g.card, style]}>
    <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
    <View style={g.tint} />
    <View style={{ padding: spacing.lg }}>{children}</View>
  </View>
);
const g = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  tint: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.55)" },
});

// ---------- Button ----------
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export const Button: React.FC<{
  label: string;
  onPress?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}> = ({ label, onPress, variant = "primary", disabled, loading, icon, testID, style }) => {
  const stylesByVariant: Record<BtnVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.brandPrimary, fg: colors.surface },
    secondary: { bg: colors.surfaceSecondary, fg: colors.onSurface, border: colors.border },
    ghost: { bg: "transparent", fg: colors.brandPrimary, border: colors.brandPrimary },
    danger: { bg: colors.error, fg: "#450A0A" },
    success: { bg: colors.success, fg: "#022C22" },
  };
  const s = stylesByVariant[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        b.btn,
        {
          backgroundColor: s.bg,
          borderColor: s.border ?? s.bg,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={s.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={16} color={s.fg} />}
          <Text style={[b.label, { color: s.fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
};
const b = StyleSheet.create({
  btn: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  label: { fontSize: fs.base, fontWeight: fw.medium, letterSpacing: 0.3 },
});

// ---------- Stat Pill ----------
export const StatPill: React.FC<{ label: string; value: string; testID?: string }> = ({
  label,
  value,
  testID,
}) => (
  <View style={sp.wrap} testID={testID}>
    <Text style={sp.value}>{value}</Text>
    <Text style={sp.label}>{label}</Text>
  </View>
);
const sp = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: "rgba(30,41,59,0.5)",
    gap: 4,
  },
  value: { color: colors.onSurface, fontSize: fs.xl, fontWeight: fw.medium, letterSpacing: 0.3 },
  label: { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 0.4 },
});

// ---------- Badge ----------
export const Badge: React.FC<{
  label: string;
  tone?: "success" | "warning" | "info" | "muted" | "error";
  icon?: keyof typeof Ionicons.glyphMap;
}> = ({ label, tone = "info", icon }) => {
  const map = {
    success: { fg: colors.success, bg: colors.successGlow, border: "rgba(16,185,129,0.35)" },
    warning: { fg: colors.warning, bg: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.35)" },
    info: { fg: colors.brandPrimary, bg: colors.brandGlow, border: "rgba(56,189,248,0.35)" },
    muted: { fg: colors.onSurfaceTertiary, bg: "rgba(148,163,184,0.1)", border: colors.border },
    error: { fg: colors.error, bg: "rgba(239,68,68,0.14)", border: "rgba(239,68,68,0.35)" },
  }[tone];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: radius.pill,
        backgroundColor: map.bg,
        borderWidth: 1,
        borderColor: map.border,
      }}
    >
      {icon && <Ionicons name={icon} size={12} color={map.fg} />}
      <Text style={{ color: map.fg, fontSize: fs.sm, fontWeight: fw.medium, letterSpacing: 0.4 }}>
        {label}
      </Text>
    </View>
  );
};

// ---------- Row helpers ----------
export const KV: React.FC<{ k: string; v: string; mono?: boolean; testID?: string }> = ({
  k,
  v,
  mono,
  testID,
}) => (
  <View style={kv.row} testID={testID}>
    <Text style={kv.k}>{k}</Text>
    <Text style={[kv.v, mono && { fontFamily: "Menlo" }]} numberOfLines={1}>
      {v}
    </Text>
  </View>
);
const kv = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, gap: 12 },
  k: { color: colors.onSurfaceTertiary, fontSize: fs.sm },
  v: { color: colors.onSurface, fontSize: fs.base, fontWeight: fw.medium, flexShrink: 1, textAlign: "right" },
});

// ---------- Divider ----------
export const Divider: React.FC = () => (
  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.md }} />
);

// ---------- Fake QR (SVG-free) ----------
export const QRTile: React.FC<{ payload: string; size?: number }> = ({ payload, size = 140 }) => {
  const cells = 21;
  const cellSize = size / cells;
  const grid: boolean[][] = [];
  let h = 2166136261;
  for (const c of payload) {
    h ^= c.charCodeAt(0);
    h = (h * 16777619) >>> 0;
  }
  for (let y = 0; y < cells; y++) {
    grid[y] = [];
    for (let x = 0; x < cells; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      grid[y][x] = (h & 1) === 1;
    }
  }
  const finders = [
    [0, 0],
    [0, cells - 7],
    [cells - 7, 0],
  ];
  const inFinder = (x: number, y: number) =>
    finders.some(([fy, fx]) => y >= fy && y < fy + 7 && x >= fx && x < fx + 7);
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: "#F8FAFC",
        padding: 6,
        borderRadius: 8,
      }}
    >
      <View style={{ width: "100%", height: "100%", flexDirection: "column" }}>
        {grid.map((row, y) => (
          <View key={y} style={{ flexDirection: "row", flex: 1 }}>
            {row.map((on, x) => {
              const finder = inFinder(x, y);
              const finderInner =
                (y < 7 && x < 7 && y >= 2 && y <= 4 && x >= 2 && x <= 4) ||
                (y < 7 && x >= cells - 7 && y >= 2 && y <= 4 && x >= cells - 5 && x <= cells - 3) ||
                (y >= cells - 7 && x < 7 && y >= cells - 5 && y <= cells - 3 && x >= 2 && x <= 4);
              const finderBorder =
                (y < 7 && x < 7 && !(y >= 1 && y <= 5 && x >= 1 && x <= 5)) ||
                (y < 7 && x >= cells - 7 && !(y >= 1 && y <= 5 && x >= cells - 6 && x <= cells - 2)) ||
                (y >= cells - 7 && x < 7 && !(y >= cells - 6 && y <= cells - 2 && x >= 1 && x <= 5));
              const black = finder ? finderBorder || finderInner : on;
              return (
                <View
                  key={x}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: black ? colors.surface : "transparent",
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

// ---------- Section title ----------
export const SectionTitle: React.FC<{ title: string; hint?: string; style?: StyleProp<TextStyle> }> = ({
  title,
  hint,
  style,
}) => (
  <View style={{ marginBottom: spacing.md }}>
    <Text
      style={[
        { color: colors.onSurfaceTertiary, fontSize: fs.sm, letterSpacing: 1.6, textTransform: "uppercase" },
        style,
      ]}
    >
      {title}
    </Text>
    {!!hint && <Text style={{ color: colors.onSurfaceSecondary, fontSize: fs.base, marginTop: 4 }}>{hint}</Text>}
  </View>
);

// ---------- Glow background ----------
export const GlowBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <LinearGradient
      colors={["rgba(56,189,248,0.16)", "rgba(15,23,42,0)"]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <LinearGradient
      colors={["rgba(16,185,129,0.10)", "rgba(15,23,42,0)"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    {children}
  </View>
);
