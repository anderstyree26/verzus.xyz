import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApiClient } from '../../src/lib/api';
import { getSocket } from '../../src/lib/socket';

export default function MatchArenaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: match, isLoading, error } = useQuery<any>({
    queryKey: ['mobile-match', id],
    queryFn: () => mobileApiClient<any>(`/matches/${id}`),
    enabled: !!id,
    refetchInterval: 3000,
  });

  // Listen to socket match events
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    socket.emit('match:join', { matchId: id });

    const handleScore = () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-match', id] });
    };

    const handleState = () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-match', id] });
    };

    socket.on('match:score', handleScore);
    socket.on('match:state', handleState);

    return () => {
      socket.off('match:score', handleScore);
      socket.off('match:state', handleState);
      socket.emit('match:leave', { matchId: id });
    };
  }, [id, queryClient]);

  const readyMutation = useMutation({
    mutationFn: () =>
      mobileApiClient(`/matches/${id}/ready`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-match', id] });
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    );
  }

  if (error || !match) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Match not found or error loading match.</Text>
      </View>
    );
  }

  const p1 = match.match_participants?.[0];
  const p2 = match.match_participants?.[1];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Match Status */}
      <View style={styles.statusCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.statusBadge}>{match.status}</Text>
          <Text style={styles.roomCodeBadge}>
            ROOM: {match.room_code || match.id.substring(0, 6)}
          </Text>
        </View>

        <Text style={styles.wagerTitle}>
          POT: {(match.wager_amount * 2)?.toLocaleString()} PTS
        </Text>
        <Text style={styles.wagerSubtitle}>{match.wager_amount} PTS each player</Text>
      </View>

      {/* Opponents Split Arena */}
      <View style={styles.arenaSplit}>
        {/* Player 1 */}
        <View style={styles.playerColumn}>
          <Text style={styles.playerRole}>PLAYER 1</Text>
          <Text style={styles.playerName}>
            @{p1?.profile?.username || 'Waiting...'}
          </Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{p1?.final_score ?? 0}</Text>
          </View>
        </View>

        <View style={styles.vsBox}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Player 2 */}
        <View style={styles.playerColumn}>
          <Text style={styles.playerRole}>PLAYER 2</Text>
          <Text style={styles.playerName}>
            @{p2?.profile?.username || 'Open Slot'}
          </Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{p2?.final_score ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Ready / Play Actions */}
      {match.status === 'PENDING' && (
        <TouchableOpacity
          style={[styles.primaryAction, readyMutation.isPending && styles.disabled]}
          disabled={readyMutation.isPending}
          onPress={() => readyMutation.mutate()}
        >
          <Text style={styles.actionText}>
            {readyMutation.isPending ? 'Marking Ready...' : 'I Am Ready 🎮'}
          </Text>
        </TouchableOpacity>
      )}

      {match.status === 'IN_PROGRESS' && (
        <TouchableOpacity
          style={styles.captureAction}
          onPress={() => router.push({ pathname: '/match/capture', params: { matchId: id } })}
        >
          <Text style={styles.captureIcon}>📸</Text>
          <Text style={styles.actionText}>Capture Game-Over Screen (OCR)</Text>
        </TouchableOpacity>
      )}

      {match.status === 'COMPLETED' && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>🏆 Match Concluded</Text>
          <Text style={styles.resultWinner}>
            Winner: {match.winner_id ? `@${match.winner_id.substring(0, 8)}` : 'Tie / Push'}
          </Text>
        </View>
      )}

      {match.status === 'DISPUTED' && (
        <View style={styles.disputeBox}>
          <Text style={styles.disputeTitle}>⚠️ Under HITL Review</Text>
          <Text style={styles.disputeDesc}>
            OCR verification confidence fell below threshold or players submitted conflicting scores.
            Human reviewers are auditing evidence hashes.
          </Text>
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
  center: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: '#10B98120',
    color: '#10B981',
    fontWeight: '800',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roomCodeBadge: {
    backgroundColor: '#8B5CF620',
    color: '#8B5CF6',
    fontWeight: '800',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  wagerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  wagerSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  arenaSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  playerColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  playerRole: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  scoreBox: {
    backgroundColor: '#1A1A2B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  scoreLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
  },
  scoreValue: {
    color: '#8B5CF6',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  vsBox: {
    paddingHorizontal: 12,
  },
  vsText: {
    color: '#4B5563',
    fontWeight: '900',
    fontSize: 16,
  },
  primaryAction: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  captureAction: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  captureIcon: {
    fontSize: 18,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.6,
  },
  resultBox: {
    backgroundColor: '#1C251C',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  resultTitle: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '800',
  },
  resultWinner: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disputeBox: {
    backgroundColor: '#2A1F14',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  disputeTitle: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '700',
  },
  disputeDesc: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
});
