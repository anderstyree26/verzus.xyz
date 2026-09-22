import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApiClient } from '../../src/lib/api';

export default function MobileTournamentsScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');

  const { data: tournaments, isLoading, refetch, isRefetching } = useQuery<any[]>({
    queryKey: ['mobile-tournaments'],
    queryFn: () => mobileApiClient<any[]>('/tournaments').catch(() => []),
  });

  const joinMutation = useMutation({
    mutationFn: (tournamentId: string) =>
      mobileApiClient(`/tournaments/${tournamentId}/register`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-tournaments'] });
    },
  });

  const filtered = (tournaments || []).filter((t) => {
    if (filter === 'ALL') return true;
    return t.game_type === filter;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} tintColor="#8B5CF6" />
      }
    >
      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        {['ALL', 'HIGH_SCORE', 'LOW_TIME', 'SURVIVAL', 'HEAD_TO_HEAD'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
              {f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tournaments List */}
      {isLoading ? (
        <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 32 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No tournaments found in this category.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((t) => (
            <View key={t.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{t.name}</Text>
                  <Text style={styles.subtitle}>
                    {t.game_type} • {t.current_participants ?? 0}/{t.max_participants} Players
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{t.status}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View>
                  <Text style={styles.metaLabel}>PRIZE POOL</Text>
                  <Text style={styles.metaValueHighlight}>
                    {t.prize_pool?.toLocaleString() ?? 0} PTS
                  </Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>ENTRY FEE</Text>
                  <Text style={styles.metaValue}>
                    {t.entry_fee ? `${t.entry_fee} PTS` : 'FREE'}
                  </Text>
                </View>
              </View>

              {t.status === 'REGISTRATION_OPEN' && (
                <TouchableOpacity
                  style={[styles.joinButton, joinMutation.isPending && styles.disabled]}
                  disabled={joinMutation.isPending}
                  onPress={() => joinMutation.mutate(t.id)}
                >
                  <Text style={styles.joinButtonText}>
                    {joinMutation.isPending ? 'Registering...' : 'Register for Tournament'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  pills: {
    gap: 8,
    paddingBottom: 4,
  },
  pill: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  pillText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2B',
    borderRadius: 8,
    padding: 12,
  },
  metaLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
  },
  metaValueHighlight: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  emptyCard: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
  },
});
