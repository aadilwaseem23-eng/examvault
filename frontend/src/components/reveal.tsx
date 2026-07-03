import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";

/**
 * Reveal wraps children in a fade + upward slide animation that fires
 * once the element scrolls into view. On native (no IntersectionObserver),
 * it fires shortly after mount.
 */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translate?: number;
  style?: StyleProp<ViewStyle>;
  once?: boolean;
}> = ({ children, delay = 0, duration = 700, translate = 24, style, once = true }) => {
  const wrapRef = useRef<any>(null);
  const [visible, setVisible] = useState(Platform.OS !== "web");
  const p = useSharedValue(Platform.OS === "web" ? 0 : 1);

  useEffect(() => {
    if (Platform.OS !== "web") {
      p.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
      return;
    }
    // Web path: IntersectionObserver on the host node
    // wrapRef.current is a react-native-web View which maps to a DOM node
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node: HTMLElement | null = (wrapRef.current as any) || null;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      p.value = withDelay(delay, withTiming(1, { duration }));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            p.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
            p.value = withTiming(0, { duration: 300 });
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * translate }],
  }));

  return (
    <Animated.View ref={wrapRef} collapsable={false} style={[aStyle, style]}>
      <View style={{ opacity: visible || Platform.OS !== "web" ? 1 : 0.001 }}>{children}</View>
    </Animated.View>
  );
};
