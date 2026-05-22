'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Image as ImageIcon, Send, User, Bot, Loader2, X, Plus } from 'lucide-react';
import { Button, Input, Loading } from '@/components/ui';
import { conversationsApi } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { Conversation, Message } from '@/types';
import MarkdownRenderer from './MarkdownRenderer';
import LoadingAnimation from './LoadingAnimation';

interface ChatInterfaceProps {
  conversationId?: string;
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState<Message | null>(null);
  const MAX_IMAGES = 5;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch conversation if ID is provided
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      return conversationsApi.getById(conversationId);
    },
    enabled: !!conversationId,
    refetchInterval: (query) => {
      // Poll every 2s if the last message is from the user (waiting for AI)
      const data = query.state.data as Conversation | undefined;
      const messages = data?.messages || [];
      if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
        return 2000;
      }
      return false;
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, pendingAssistantMessage]);

  // Reset state when conversationId changes
  useEffect(() => {
    setInput('');
    setImages([]);
    setImagePreviews([]);
    setPendingAssistantMessage(null);
  }, [conversationId]);

  // Mutation for creating a new conversation
  const createConversationMutation = useMutation({
    mutationFn: (data: { message: string; images?: File[] }) =>
      conversationsApi.create(data.message, data.images),
    onSuccess: (data) => {
      if (!data?.id) return;
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Pequeño delay para asegurar que el estado de la mutación se limpie antes de navegar
      setTimeout(() => {
        router.push(`/chat/${data.id}`);
      }, 0);
    },
  });

  // Mutation for adding a message to existing conversation
  const addMessageMutation = useMutation({
    mutationFn: (data: { conversationId: string; content: string; images?: File[] }) =>
      conversationsApi.addMessage(data.conversationId, data.content, data.images),
    onSuccess: (newMessage) => {
      setPendingAssistantMessage(newMessage);
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const remainingSlots = MAX_IMAGES - images.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);

      if (filesToAdd.length > 0) {
        setImages(prev => [...prev, ...filesToAdd]);
        filesToAdd.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const canSend = input.trim() || images.length > 0;
    if (!canSend || createConversationMutation.isPending || addMessageMutation.isPending) return;

    if (conversationId) {
      // Add message to existing conversation
      addMessageMutation.mutate({
        conversationId: conversationId,
        content: input,
        images: images,
      });
    } else {
      // Create new conversation
      createConversationMutation.mutate({
        message: input,
        images: images,
      });
    }

    setInput('');
    setImages([]);
    setImagePreviews([]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewChat = () => {
    router.push('/chat');
  };

  const isPending = createConversationMutation.isPending || addMessageMutation.isPending;
  const messages = conversation?.messages || [];

  return (
    <div className="bg-white flex flex-col h-full w-full overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 leading-none">
                {conversation?.title || 'Nueva Conversación'}
              </h3>
            </div>
          </div>
          {conversationId && (
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              <Plus className="w-4 h-4 mr-1" />
              Nuevo Chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white scroll-smooth">
        <div className={cn(
          "max-w-4xl mx-auto px-4",
          messages.length === 0 && !createConversationMutation.isPending
            ? "h-full flex items-center justify-center overflow-hidden"
            : "py-8 space-y-8"
        )}>
          {isLoadingConversation ? (
            <div className="flex items-center justify-center h-full w-full">
              <Loading size="lg" text="Cargando conversación..." />
            </div>
          ) : messages.length === 0 && !createConversationMutation.isPending ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-primary-50 rounded-full shadow-inner">
                <Bot className="w-16 h-16 text-primary-600" />
              </div>
              <div className="max-w-md">
                <h4 className="text-3xl font-bold text-gray-900 tracking-tight">¿Qué quieres restaurar hoy?</h4>
                <p className="text-gray-500 mt-4 text-lg leading-relaxed">
                  Sube una foto de una fachada, daño estructural o elemento arquitectónico para recibir un análisis detallado.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex gap-4 items-start",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    message.role === 'user'
                      ? "bg-primary-100 text-primary-700"
                      : "bg-primary-600 text-white shadow-md"
                  )}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <div className={cn(
                    "flex-1 space-y-2",
                    message.role === 'user' ? "text-right" : "text-left"
                  )}>
                    {message.role === 'assistant' && (
                      <div className="font-semibold text-primary-600 text-sm uppercase tracking-wider">
                        Agente
                      </div>
                    )}
                    {((message.images && message.images.length > 0) || message.image_path) && (
                      <div className={cn(
                        "flex flex-wrap gap-2 mb-2",
                        message.role === 'user' && "justify-end"
                      )}>
                        {message.images?.map((img) => (
                          <div key={img.id} className="relative w-fit rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                            <img
                              src={`/api/${img.image_path}`}
                              alt="Análisis"
                              className="w-auto max-h-[150px] object-contain bg-gray-50"
                            />
                          </div>
                        ))}
                        {/* Fallback para mensajes antiguos con una sola imagen */}
                        {message.image_path && (!message.images || message.images.length === 0) && (
                          <div className="relative w-fit rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                            <img
                              src={`/api/${message.image_path}`}
                              alt="Consulta"
                              className="w-auto max-h-[150px] object-contain bg-gray-50"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-gray-900 text-lg leading-relaxed">
                      {message.role === 'assistant' ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <div className="inline-block bg-primary-50 text-gray-900 px-4 py-2 rounded-2xl rounded-tr-none text-lg">
                          {message.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Show thinking indicator if last message is from user (waiting for background AI) or mutation is pending */}
              {((messages.length > 0 && messages[messages.length - 1].role === 'user') || addMessageMutation.isPending) && (
                <div className="flex gap-4 items-start animate-in fade-in duration-300">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-primary-600 text-sm uppercase tracking-wider">
                      Agente
                    </div>
                    <LoadingAnimation />
                  </div>
                </div>
              )}

              {/* Show pending for new conversation */}
              {createConversationMutation.isPending && (
                <>
                  <div className="flex gap-4 items-start flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 flex-shrink-0 mt-1">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-4 text-right">
                      <div className="inline-block bg-primary-50 text-gray-900 px-4 py-2 rounded-2xl rounded-tr-none text-lg">
                        {createConversationMutation.variables?.message}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <LoadingAnimation text="Procesando y generando análisis..." />
                  </div>
                </>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          {imagePreviews.length > 0 && (
            <div className="absolute bottom-full mb-4 left-0 flex gap-2 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img src={preview} className="h-20 w-auto max-w-[120px] object-cover rounded-lg border-2 border-primary-100 shadow-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all px-2 py-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-gray-200 text-gray-500 relative"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || images.length >= MAX_IMAGES}
              title={images.length >= MAX_IMAGES ? `Máximo ${MAX_IMAGES} imágenes` : 'Agregar imagen'}
            >
              <ImageIcon className="w-6 h-6" />
              {images.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {images.length}
                </span>
              )}
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre restauración o daños..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg py-6 shadow-none h-12"
              disabled={isPending}
            />

            <button
              type="submit"
              disabled={!input.trim() || isPending}
              className={cn(
                "p-3 rounded-xl transition-all ml-1",
                input.trim() && !isPending
                  ? "bg-primary-600 text-white shadow-lg hover:bg-primary-700 active:scale-95"
                  : "text-gray-300 bg-gray-100"
              )}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Máximo {MAX_IMAGES} imágenes. La IA puede cometer errores. Verifica la información importante.
          </p>
        </form>
      </div>
    </div>
  );
}
