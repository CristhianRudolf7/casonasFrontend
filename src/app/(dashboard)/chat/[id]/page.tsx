'use client';

import { useParams } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ConversationPage() {
  const { id } = useParams();

  return <ChatInterface conversationId={id as string} />;
}
