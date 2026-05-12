import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuthContext";
import { useSubscription } from "./useSubscription";
import type { ChatMessage, Group, GroupMember } from "../types/chat";

const PAGE_SIZE = 25;

export function useGroupMessages(groupId: string | null) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(async (reset = false) => {
    if (!user || !groupId) return;

    setLoading(true);
    const offset = reset ? 0 : messages.length;

    const { data, error } = await supabase
      .from("group_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (!error && data) {
      const sorted = (data as ChatMessage[]).reverse();
      setMessages((prev) => (reset ? sorted : [...sorted, ...prev]));
      setHasMore(data.length === PAGE_SIZE);
    }

    setLoading(false);
  }, [user, groupId, messages.length]);

  const fetchGroupInfo = useCallback(async () => {
    if (!groupId) return;

    const [{ data: groupData }, { data: memberData }] = await Promise.all([
      supabase.from("groups").select("*").eq("id", groupId).single(),
      supabase.from("group_members").select("*").eq("group_id", groupId),
    ]);

    if (groupData) setGroup(groupData as Group);
    if (memberData) setMembers(memberData as GroupMember[]);
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchMessages(true);
      fetchGroupInfo();
    }
  }, [groupId]);

  const createGroup = useCallback(async (name: string, isPublic = false, subject?: string, grade?: string) => {
    if (!user) return null;
    if (subscription.tier === "free") throw new Error("Group creation requires Plus or Pro");

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: newGroup, error } = await supabase
      .from("groups")
      .insert({
        name,
        is_public: isPublic,
        max_members: subscription.tier === "pro" ? 25 : 10,
        subject,
        grade,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (!error && newGroup) {
      await supabase.from("group_members").insert({
        group_id: newGroup.id,
        user_id: user.id,
        role: "owner",
      });
    }

    return newGroup as Group | null;
  }, [user, subscription.tier]);

  const joinGroup = useCallback(async (inviteCode: string) => {
    if (!user) return null;

    const { data: targetGroup } = await supabase
      .from("groups")
      .select("*")
      .eq("invite_code", inviteCode)
      .single();

    if (!targetGroup) throw new Error("Invalid invite code");

    const { count } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", targetGroup.id);

    if (count !== null && count >= targetGroup.max_members) {
      throw new Error("Group is full");
    }

    await supabase.from("group_members").insert({
      group_id: targetGroup.id,
      user_id: user.id,
      role: "member",
    });

    return targetGroup as Group;
  }, [user]);

  const sendGroupMessage = useCallback(async (content: string, mediaUrl?: string, replyToId?: string) => {
    if (!user || !groupId) return null;

    const { data, error } = await supabase
      .from("group_messages")
      .insert({
        group_id: groupId,
        sender_id: user.id,
        content,
        media_url: mediaUrl || null,
        reply_to_id: replyToId || null,
      })
      .select("*")
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data as ChatMessage]);
    }
    return data as ChatMessage | null;
  }, [user, groupId]);

  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!messageIds.length) return;

    await supabase
      .from("group_messages")
      .update({ is_read: true })
      .in("id", messageIds);
  }, []);

  return {
    messages,
    group,
    members,
    loading,
    hasMore,
    fetchMessages,
    createGroup,
    joinGroup,
    sendGroupMessage,
    markAsRead,
  };
}