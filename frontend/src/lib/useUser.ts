"use client";

import { useEffect, useState } from "react";
import { getToken, logout, me } from "@/lib/api";
import type { User } from "@/lib/types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    me()
      .then(setUser)
      .catch(() => {
        logout();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  return { user, ready };
}
