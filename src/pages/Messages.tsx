import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import demoMessages from '@/data/demoMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  user_id: string;
  vendor_id: string;
  service_id?: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    id: string;
    full_name?: string;
    phone?: string;
  };
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  status?: 'pending' | 'failed' | 'sent';
}

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingMap, setPendingMap] = useState<Record<string, Message>>({});

  useEffect(() => {
    checkAuth();
    fetchConversations();
    const cleanup = subscribeToMessages();

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  // Handle incoming vendor info from navigation state
  useEffect(() => {
    if (location.state && location.state.vendorId && currentUserId) {
      handleCreateOrFindConversation(
        location.state.vendorId,
        location.state.vendorName,
        location.state.serviceId
      );
      // Clear the state after handling
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, currentUserId]);

  const handleCreateOrFindConversation = async (
    vendorId: string,
    vendorName: string,
    serviceId?: string
  ) => {
    try {
      // Check if conversation already exists
      const existingConv = conversations.find(
        (c) => c.vendor_id === vendorId || c.user_id === vendorId
      );

      if (existingConv) {
        // Select existing conversation
        setSelectedConversation(existingConv);
        await fetchMessages(existingConv.id);
        toast.success(`Opened chat with ${vendorName}`);
        return;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations' as any)
        .insert({
          user_id: currentUserId,
          vendor_id: vendorId,
          service_id: serviceId,
          last_message_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;

      // Fetch vendor profile
      const { data: vendorProfile } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('id', vendorId)
        .single();

      const newConv: Conversation = {
        ...data,
        other_user: vendorProfile || { id: vendorId, full_name: vendorName },
        unread_count: 0,
      };

      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setMessages([]);
      toast.success(`Started chat with ${vendorName}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      
      // Demo mode fallback
      const demoConv: Conversation = {
        id: `demo-conv-${Date.now()}`,
        user_id: currentUserId,
        vendor_id: vendorId,
        service_id: serviceId,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        other_user: {
          id: vendorId,
          full_name: vendorName,
          phone: '+234 XXX XXX XXXX',
        },
        unread_count: 0,
      };

      setConversations((prev) => [demoConv, ...prev]);
      setSelectedConversation(demoConv);
      setMessages([]);
      toast.success(`Started chat with ${vendorName} (demo mode)`);
    }
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUserId(user.id);
  };

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversations' as any)
        .select(`
          *,
          messages(id, is_read)
        `)
        .or(`user_id.eq.${user.id},vendor_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch other user details for each conversation
      const conversationsWithUsers = await Promise.all(
        (data || []).map(async (conv: any) => {
          const otherUserId = conv.user_id === user.id ? conv.vendor_id : conv.user_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, phone')
            .eq('id', otherUserId)
            .single();

          return {
            ...conv,
            other_user: profile,
            unread_count: conv.messages?.filter((m: any) => !m.is_read && m.sender_id !== user.id).length || 0,
          };
        })
      );

      setConversations(conversationsWithUsers as Conversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Fallback to demo conversations when running in demo mode or on failure
      if (import.meta.env.VITE_USE_DEMO_VENDORS === 'true') {
        const demoUserId = currentUserId || 'demo-user';
        const demoConvs = demoMessages.generateDemoConversations(demoUserId);
        setConversations(demoConvs as unknown as Conversation[]);
      } else {
        toast.error('Failed to load conversations');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data || []) as unknown as Message[]);

      // Mark messages as read
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('messages' as any)
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id);
      }
      // Optimistically set unread_count to 0 for this conversation in the UI
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c)));
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (import.meta.env.VITE_USE_DEMO_VENDORS === 'true') {
        const demoUserId = currentUserId || 'demo-user';
        const demoMessagesData = demoMessages.generateDemoMessages(conversationId, demoUserId);
        setMessages(demoMessagesData as unknown as Message[]);
      } else {
        toast.error('Failed to load messages');
      }
    }
  };

  // Mark messages read for a conversation (safe to call repeatedly)
  const markConversationRead = async (conversationId: string) => {
    try {
      // Optimistic UI update
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c)));

      // If not in demo mode, persist read state
      if (import.meta.env.VITE_USE_DEMO_VENDORS !== 'true') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('messages' as any)
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', user.id);
        }
      }
    } catch (err) {
      console.warn('Failed to mark conversation read', err);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      // small timeout to wait for DOM render
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
    }
  }, [messages]);

  // Group messages by day for rendering
  const groupMessagesByDay = (msgs: Message[]) => {
    const groups: { day: string; label: string; items: Message[] }[] = [];
    msgs.forEach((m) => {
      const d = new Date(m.created_at);
      const dayKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      let g = groups.find((x) => x.day === dayKey);
      if (!g) {
        g = { day: dayKey, label, items: [] };
        groups.push(g);
      }
      g.items.push(m);
    });
    return groups;
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMessage = payload.new as Message;
        if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
          // If the user is viewing the conversation, append and mark as read optimistically
          setMessages((prev) => [...prev, newMessage]);

            if (newMessage.sender_id !== currentUserId) {
            // mark as read in UI (match by id)
            setMessages((prev) => prev.map((m) => (m.id === newMessage.id ? { ...m, is_read: true } : m)));
            setConversations((prev) => prev.map((c) => (c.id === selectedConversation.id ? { ...c, unread_count: 0 } : c)));

            // persist read state if not demo
            if (import.meta.env.VITE_USE_DEMO_VENDORS !== 'true') {
              supabase
                .from('messages' as any)
                .update({ is_read: true })
                .eq('id', newMessage.id)
                .then(({ error }) => {
                  if (error) console.warn('Failed to mark incoming message read', error);
                });
            }
          }
        }

        // Refresh conversation list counts/timestamps
        fetchConversations();
      })
      .subscribe();

    return () => {
      try {
        if (typeof supabase.removeChannel === 'function') supabase.removeChannel(channel);
        else if (typeof channel?.unsubscribe === 'function') channel.unsubscribe();
      } catch (e) {
        console.warn('Failed to remove messages channel', e);
      }
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Demo-mode fallback: when running without Supabase/migrations applied,
      // append message locally so the UI remains interactive.
      if (import.meta.env.VITE_USE_DEMO_VENDORS === 'true') {
        const demoMsg: Message = {
          id: `local-${Date.now()}`,
          conversation_id: selectedConversation.id,
          sender_id: currentUserId || 'demo-user',
          content: newMessage.trim(),
          is_read: true,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, demoMsg]);

        // Update conversations list last_message_at locally
        setConversations((prev) => prev.map((c) => c.id === selectedConversation.id ? { ...c, last_message_at: demoMsg.created_at } : c));

        setNewMessage('');
        toast.success('Message sent (demo)');

        // Simulate vendor typing and auto-reply in demo mode
        setIsTyping(true);
        const cannedReplies = [
          'Thanks — I can help with that. When would you like the service?',
          "Sure — I usually charge ₦5,000 for this. Interested?",
          'Can you share more details about your request so I can prepare?',
        ];
        const reply = cannedReplies[Math.floor(Math.random() * cannedReplies.length)];
        const vendorId = selectedConversation?.other_user?.id || (selectedConversation?.vendor_id as string) || 'demo-vendor-1';

        setTimeout(() => {
          const vendorMsg: Message = {
            id: `local-reply-${Date.now()}`,
            conversation_id: selectedConversation.id,
            sender_id: vendorId,
            content: reply,
            is_read: false,
            created_at: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, vendorMsg]);
          setConversations((prev) => prev.map((c) => c.id === selectedConversation.id ? { ...c, last_message_at: vendorMsg.created_at } : c));
          setIsTyping(false);

          // scroll to bottom after reply
          setTimeout(() => {
            if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
          }, 50);
        }, 1500);
      } else {
        // Optimistic UI: add a pending message locally so the UI feels instant
        const tempId = `pending-${Date.now()}`;
        const pendingMsg: Message = {
          id: tempId,
          conversation_id: selectedConversation.id,
          sender_id: currentUserId,
          content: newMessage.trim(),
          is_read: true,
          created_at: new Date().toISOString(),
          status: 'pending',
        };

        setMessages((prev) => [...prev, pendingMsg]);
        setPendingMap((m) => ({ ...m, [tempId]: pendingMsg }));
        setNewMessage('');

        try {
          setIsSending(true);
          const { data, error } = await supabase
            .from('messages' as any)
            .insert({
              conversation_id: selectedConversation.id,
              sender_id: currentUserId,
              content: pendingMsg.content,
            })
            .select('*');

          if (error) throw error;

          // Supabase returns an array of inserted rows; take the first
          const inserted = Array.isArray(data) ? data[0] : data;

          // Replace pending message with server message
          setMessages((prev) => prev.map((m) => (m.id === tempId ? ({ ...(inserted as any), status: 'sent' } as Message) : m)));
          setPendingMap((m) => {
            const copy = { ...m };
            delete copy[tempId];
            return copy;
          });
          toast.success('Message sent');
        } catch (err) {
          console.error('Error sending message:', err);
          // mark pending as failed so user can retry
          setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)));
          toast.error('Failed to send message — tap to retry');
        } finally {
          setIsSending(false);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const retrySend = async (pendingId: string) => {
    const pending = pendingMap[pendingId] || messages.find((m) => m.id === pendingId);
    if (!pending || !selectedConversation) return;

    // optimistic set back to pending
    setMessages((prev) => prev.map((m) => (m.id === pendingId ? { ...m, status: 'pending' } : m)));
    setPendingMap((m) => ({ ...m, [pendingId]: pending }));

    try {
      setIsSending(true);
      const { data, error } = await supabase
        .from('messages' as any)
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: currentUserId,
          content: pending.content,
        })
        .select('*');

      if (error) throw error;

      const inserted = Array.isArray(data) ? data[0] : data;

      setMessages((prev) => prev.map((m) => (m.id === pendingId ? ({ ...(inserted as any), status: 'sent' } as Message) : m)));
      setPendingMap((m) => {
        const copy = { ...m };
        delete copy[pendingId];
        return copy;
      });
      toast.success('Message sent');
    } catch (err) {
      console.error('Retry failed:', err);
      setMessages((prev) => prev.map((m) => (m.id === pendingId ? { ...m, status: 'failed' } : m)));
      toast.error('Retry failed');
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-220px)]">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-4 hover:bg-muted/50 transition-colors border-b text-left ${
                        selectedConversation?.id === conv.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {conv.other_user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold truncate">
                              {conv.other_user?.full_name || 'Unknown User'}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conv.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.other_user?.phone || 'No phone'}
                          </p>
                        </div>
                        {conv.unread_count > 0 && (
                          <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conv.unread_count}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedConversation.other_user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedConversation.other_user?.full_name || 'Unknown User'}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.other_user?.phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100vh-280px)]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div ref={messagesRef} className="h-full overflow-auto" role="log" aria-live="polite">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {groupMessagesByDay(messages).map((group) => (
                          <div key={group.day}>
                            <div className="text-center text-xs text-muted-foreground my-3">{group.label}</div>
                            <div className="space-y-4">
                              {group.items.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${
                                    message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                                  }`}
                                >
                                  <div
                                    className={`max-w-[70%] rounded-lg p-3 ${
                                      message.sender_id === currentUserId
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className={`text-xs ${
                                        message.sender_id === currentUserId
                                          ? 'text-primary-foreground/70'
                                          : 'text-muted-foreground'
                                      }`}>
                                        {formatTime(message.created_at)}
                                      </p>

                                      {/* Read indicator for sent messages */}
                                      {message.sender_id === currentUserId && message.is_read && (
                                        <span className="text-xs text-primary-foreground/60">✓</span>
                                      )}

                                      {message.status === 'pending' && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                          </svg>
                                          Sending...
                                        </span>
                                      )}

                                      {message.status === 'failed' && (
                                        <button
                                          onClick={() => retrySend(message.id)}
                                          className="text-xs text-red-600 underline"
                                          aria-label="Retry sending message"
                                        >
                                          Retry
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="max-w-[70%] rounded-lg p-3 bg-muted text-sm">Vendor is typing…</div>
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                      <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        onKeyPress={(e: any) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1"
                        disabled={isSending}
                        aria-label="Message input"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim() || isSending} aria-label="Send message">
                        {isSending ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
