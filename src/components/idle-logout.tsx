"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";

const INACTIVITY_MS = 90 * 60 * 1000; // 1h30

export default function IdleLogout() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const timerIdRef = useRef<number | null>(null);

  const resetTimer = () => {
    if (timerIdRef.current) {
      window.clearTimeout(timerIdRef.current);
    }

    timerIdRef.current = window.setTimeout(async () => {
      try {
        await supabase.auth.signOut();
      } finally {
        const redirect = encodeURIComponent(pathname || "/");
        router.replace(`/login?redirectedFrom=${redirect}`);
      }
    }, INACTIVITY_MS);
  };

  useEffect(() => {
    resetTimer();

    const activityEvents = [
      "mousemove",
      "keydown",
      "scroll",
      "click",
      "touchstart",
    ];

    const onActivity = () => resetTimer();
    activityEvents.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true }),
    );

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetTimer();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timerIdRef.current) {
        window.clearTimeout(timerIdRef.current);
      }
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, onActivity),
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // Reativa o timer quando a rota mudar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
