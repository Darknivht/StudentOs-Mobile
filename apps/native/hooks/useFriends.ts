import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";

export type FriendshipStatus = "pending" | "accepted" | "blocked";

export interface Friend {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  school: string | null;
  level: number;
  status: FriendshipStatus;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from("friendships")
      .select("*, profiles!friendships_recipient_id_fkey(id, full_name, avatar_url, school, level)")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (data) {
      const results: Friend[] = (data as any[]).map((entry) => ({
        user_id: entry.user_id === user.id ? entry.friend_id : entry.user_id,
        full_name: entry.profiles?.full_name || "",
        avatar_url: entry.profiles?.avatar_url,
        school: entry.profiles?.school,
        level: entry.profiles?.level || 1,
        status: entry.status,
      }));

      setFriends(results.filter((f) => f.status === "accepted"));
      setPendingRequests(results.filter((f) => f.status === "pending"));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user, fetchFriends]);

  const sendFriendRequest = useCallback(async (recipientId: string) => {
    if (!user) return null;

    const { error } = await supabase.from("friendships").insert({
      user_id: user.id,
      friend_id: recipientId,
      status: "pending",
    } as any);

    if (!error) {
      fetchFriends();
    }
    return error;
  }, [user, fetchFriends]);

  const respondToRequest = useCallback(async (friendshipId: string, status: "accepted" | "blocked") => {
    if (!user) return null;

    const { error } = await supabase
      .from("friendships")
      .update({ status })
      .eq("id", friendshipId);

    if (!error) {
      fetchFriends();
    }
    return error;
  }, [user, fetchFriends]);

  return { friends, pendingRequests, loading, fetchFriends, sendFriendRequest, respondToRequest };
}