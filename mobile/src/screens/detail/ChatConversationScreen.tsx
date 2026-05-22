import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PageHeader from '../../components/PageHeader';
import {supabase} from '../../lib/supabase';
import {Message} from '../../types';

interface Props {
  route: {params: {conversationId: string; otherUserName: string}};
  navigation: any;
}

export default function ChatConversationScreen({route, navigation}: Props) {
  const {conversationId, otherUserName} = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const currentUserId = useRef<string>('');
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (user) currentUserId.current = user.id;

      const {data} = await supabase
        .from('messages')
        .select('*, profiles(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', {ascending: true});

      setMessages(data ?? []);

      // Mark all as read
      if (user) {
        await supabase
          .from('messages')
          .update({is_read: true})
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async payload => {
          const newMsg = payload.new as Message;
          // Fetch sender profile
          const {data: profile} = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMsg.sender_id)
            .single();
          const enriched = {...newMsg, profiles: profile ?? undefined};
          setMessages(prev => [...prev, enriched]);

          // Mark as read if not own message
          if (
            newMsg.sender_id !== currentUserId.current
          ) {
            await supabase
              .from('messages')
              .update({is_read: true})
              .eq('id', newMsg.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages, conversationId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userId = currentUserId.current;
    if (!userId) return;

    setSending(true);
    setInput('');

    const {error} = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: text,
      is_read: false,
    });

    if (!error) {
      // Update conversation last message
      await supabase
        .from('conversations')
        .update({last_message: text, last_message_at: new Date().toISOString()})
        .eq('id', conversationId);
    }
    setSending(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('da-DK', {hour: '2-digit', minute: '2-digit'});
  };

  const renderMessage = ({item}: {item: Message}) => {
    const isOwn = item.sender_id === currentUserId.current;
    return (
      <View style={[styles.messageRow, isOwn ? styles.messageRowOwn : styles.messageRowOther]}>
        <View
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
          ]}>
          <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
            {item.content}
          </Text>
          <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <PageHeader title={otherUserName} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#1d4ed8" size="large" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({animated: true})
            }
            onLayout={() => flatListRef.current?.scrollToEnd({animated: false})}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Ingen beskeder endnu. Sig hej! 👋
                </Text>
              </View>
            }
          />
        )}

        {/* Input row */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Skriv en besked..."
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
            activeOpacity={0.8}>
            {sending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.sendBtnText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  flex: {flex: 1},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: 12,
    paddingBottom: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
  },
  messageRow: {
    marginBottom: 8,
    flexDirection: 'row',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOwn: {
    backgroundColor: '#1d4ed8',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  bubbleTextOwn: {
    color: '#ffffff',
  },
  bubbleTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
  bubbleTimeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
