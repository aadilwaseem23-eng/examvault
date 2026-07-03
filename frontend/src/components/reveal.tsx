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
 * Reveal wraps children in a fade + upward slide animation.
 * Web: fires when the element scrolls into view (IntersectionObserver).
 * Native (no observer): fires shortly after mount.
 *
 * Hydration-safety guarantees:
 *  - Initial opacity is 1 on the SSR/CSR mismatch fallback path
 *  - If IntersectionObserver isn't available, content is shown immediately
 *  - If IO fires with isIntersecting=true (element already in view), animation plays
 *  - Content is NEVER stuck invisible
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
  // Start FROM visible if IO is not supported / on native.
  const supportsIO = Platform.OS === "web" && typeof window !== "undefined" && "IntersectionObserver" in window;
  const [ready, setReady] = useState(!supportsIO);
  const p = useSharedValue(supportsIO ? 0 : 1);

  useEffect(() => {
    if (!supportsIO) {
      // Native or IO-less: play once shortly after mount but keep starting opacity 1.
      p.value = 0;
      p.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
      return;
    }
    const node: HTMLElement | null = (wrapRef.current as any) || null;
    if (!node) {
      setReady(true);
      p.value = withDelay(delay, withTiming(1, { duration }));
      return;
    }
    let cancelled = false;
    // Safety net: after 1200ms show unconditionally.
    const safety = window.setTimeout(() => {
      if (cancelled) return;
      setReady(true);
      p.value = withTiming(1, { duration: 400 });
    }, 1200);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setReady(true);
            p.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
            if (once) {
              io.disconnect();
              window.clearTimeout(safety);
            }
          } else if (!once) {
            p.value = withTiming(0, { duration: 300 });
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);
    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * translate }],
  }));

  return (
    <Animated.View
      ref={wrapRef}
      collapsable={false}
      // Even if animation somehow never triggers, content is shown via `ready` fallback.
      style={[aStyle, style, !ready && supportsIO ? null : null]}
    >
      {children}
    </Animated.View>
  );
};
