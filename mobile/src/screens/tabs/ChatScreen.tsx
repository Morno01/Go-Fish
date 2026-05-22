import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {supabase} from '../../lib/supabase';
import {Conversation} from '../../types';
import {Avatar} from '../../components/ui';
import {timeAgo} from '../../lib/utils';

interface Props {
  navigation: any;
}

export default function ChatScreen({navigation}: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return;

      const {data} = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', {ascending: false, nullsFirst: false});

      if (!data) {
        setConversations([]);
        return;
      }

      // Enrich with other user profile
      const enriched = await Promise.all(
        data.map(async (conv: any) => {
          const otherId =
            conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
          const {data: profile} = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .single();

          // Count unread
          const {count} = await supabase
            .from('messages')
            .select('*', {count: 'exact', head: true})
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...conv,
            other_user: profile ?? undefined,
            unread_count: count ?? 0,
          };
        }),
      );
      setConversations(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Beskeder</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#1d4ed8" size="large" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1d4ed8"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Ingen samtaler endnu</Text>
              <Text style={styles.emptySubtitle}>
                Match med nogen for at starte en chat!
              </Text>
            </View>
          }
          renderItem={({item}) => {
            const name =
              item.other_user?.full_name ?? item.other_user?.username ?? 'Ukendt';
            const hasUnread = (item.unread_count ?? 0) > 0;
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('ChatConversation', {
                    conversationId: item.id,
                    otherUserName: name,
                  })
                }
                activeOpacity={0.8}>
                <Avatar name={name} size={52} />
                <View style={styles.rowInfo}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.rowName, hasUnread && styles.rowNameBold]}>
                      {name}
                    </Text>
                    {item.last_message_at ? (
                      <Text style={styles.rowTime}>{timeAgo(item.last_message_at)}</Text>
                    ) : null}
                  </View>
                  <View style={styles.rowBottom}>
                    <Text
                      style={[styles.rowPreview, hasUnread && styles.rowPreviewBold]}
                      numberOfLines={1}>
                      {item.last_message ?? 'Ingen beskeder endnu'}
                    </Text>
                    {hasUnread && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread_count}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  rowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rowName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  rowNameBold: {
    fontWeight: '700',
  },
  rowTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowPreview: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
    marginRight: 8,
  },
  rowPreviewBold: {
    color: '#374151',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
