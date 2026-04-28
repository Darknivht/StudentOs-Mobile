import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const AuthContext = React.createContext<ReturnType<typeof useAuth> | null>(
  null,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
