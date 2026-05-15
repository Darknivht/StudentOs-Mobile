import { useAuth } from "./useAuthContext";
import { useCallback } from "react";
import { useRateLimiter } from "../lib/rateLimiter";

export function useGatedFeatures() {
  const { user } = useAuth();
  const rateLimiter = useRateLimiter();

  const gateAI = useCallback(() => {
    if (!rateLimiter.checkLimit("ai")) {
      return { allowed: false, reason: "Too many AI requests. Please wait a moment." };
    }
    return { allowed: true, reason: null };
  }, [rateLimiter]);

  const gateEdgeFunction = useCallback(() => {
    if (!rateLimiter.checkLimit("edge")) {
      return { allowed: false, reason: "Too many requests. Please wait a moment." };
    }
    return { allowed: true, reason: null };
  }, [rateLimiter]);

  const gateQuiz = useCallback(() => {
    return { allowed: true, reason: null };
  }, []);

  const gateFlashcard = useCallback(() => {
    return { allowed: true, reason: null };
  }, []);

  const gateNote = useCallback(() => {
    return { allowed: true, reason: null };
  }, []);

  const gateGroupChat = useCallback(() => {
    return { allowed: true, reason: null };
  }, []);

  const gateFocusMode = useCallback(() => {
    return { allowed: true, reason: null };
  }, []);

  return { gateAI, gateEdgeFunction, gateQuiz, gateFlashcard, gateNote, gateGroupChat, gateFocusMode };
}
