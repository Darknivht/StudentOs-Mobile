import { useState, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";
import { env } from "../lib/env";

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export function usePaystack() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const pendingReference = useRef<string | null>(null);

  const initializePayment = useCallback(async (
    email: string,
    amount: number,
    plan: "plus" | "pro"
  ) => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke<PaystackInitResponse>(
        "paystack-checkout",
        {
          body: { email, amount, plan, user_id: user.id },
        }
      );

      if (error || !data?.status || !data.data) {
        Alert.alert("Payment Error", data?.message || "Failed to initialize payment");
        return;
      }

      pendingReference.current = data.data.reference;
      setCheckoutUrl(data.data.authorization_url);
    } catch (err) {
      Alert.alert("Error", "Could not connect to payment service");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const verifyPayment = useCallback(async (reference: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: { reference, user_id: user.id },
      });

      if (!error && data?.status) {
        Alert.alert("Success", "Your subscription has been upgraded!");
        return true;
      }
      Alert.alert("Verification Failed", "Please contact support if your payment was deducted.");
      return false;
    } catch {
      Alert.alert("Error", "Could not verify payment");
      return false;
    }
  }, [user]);

  const closeCheckout = useCallback(() => {
    setCheckoutUrl(null);
    pendingReference.current = null;
  }, []);

  return {
    loading,
    checkoutUrl,
    setCheckoutUrl,
    pendingReference: pendingReference.current,
    initializePayment,
    verifyPayment,
    closeCheckout,
  };
}