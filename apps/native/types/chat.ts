export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id?: string;
  group_id?: string;
  content: string;
  media_url?: string | null;
  reply_to_id?: string | null;
  reply_preview?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  last_message?: ChatMessage | null;
  last_message_at?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  is_public: boolean;
  max_members: number;
  subject?: string;
  grade?: string;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface ChatParticipant {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  is_online?: boolean;
}