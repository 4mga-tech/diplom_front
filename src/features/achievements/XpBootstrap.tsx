import { useEffect } from "react";

import { claimDailyLoginXpIfNeeded } from "@/src/features/achievements/achievements.service";
import { notifyXpUpdated } from "@/src/features/achievements/xp-events";

export default function XpBootstrap() {
  useEffect(() => {
    let mounted = true;

    const bootstrapXp = async () => {
      try {
        const claimed = await claimDailyLoginXpIfNeeded();

        if (mounted && claimed) {
          notifyXpUpdated();
        }
      } catch (error) {
        console.log("Daily login XP claim failed:", error);
      }
    };

    void bootstrapXp();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
