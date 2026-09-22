import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApiClient } from '../../src/lib/api';

export default function MobileMatchesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [wager, setWager] = useState('100');
  const [gameType, setGameType] = useState('HIGH_SCORE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: openMatches, isLoading, refetch, isRefetching } = useQuery<any[]>({
    queryKey: ['mobile-open-matches'],
    queryFn: () => mobileApiClient<any[]>('/matches/active').catch(() => []),
  });

  const createMatchMutation = useMutation({
    mutationFn: () =>
      mobileApiClient<{ id: string }>('/matches/create', {
        method: 'POST',
        body: JSON.stringify({
          gameProfileId: '11111111-1111-1111-1111-111111111111', // default high score
          wagerAmount: parseInt(wager, 10) || 0,
        }),
      }),
    onSuccess: (data) => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['mobile-open-matches'] });
      router.push(`/match/${data.id}` as any);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create challenge');
    },
  });

  const joinByCodeMutation = useMutation({
    mutationFn: () =>
      mobileApiClient<{ matchId: string }>(`/matches/room/${roomCode.trim().toUpperCase()}/join`, {
        method: 'POST',
      }),
    onSuccess: (data) => {
      setRoomCode('');
      router.push(`/match/${data.matchId}` as any);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Invalid room code');
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} tintColor="#8B5CF6" />
      }
    >
      {/* Join via Room Code Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Join by Room Code</Text>
        <Text style={styles.cardDesc}>Enter a 6-character room code from a friend.</Text>
        <View style={styles.codeRow}>
          <TextInput
            style={styles.codeInput}
            placeholder="e.g. X7K9PQ"
            placeholderTextColor="#6B7280"
            autoCapitalize="characters"
            maxLength={6}
            value={roomCode}
            onChangeText={setRoomCode}
          />
          <TouchableOpacity
            style={[styles.codeButton, (!roomCode.trim() || joinByCodeMutation.isPending) && styles.disabled]}
            disabled={!roomCode.trim() || joinByCodeMutation.isPending}
            onPress={() => joinByCodeMutation.mutate()}
          >
            {joinByCodeMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.codeButtonText}>Join</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Challenge Banner */}
      {!isCreating ? (
        <TouchableOpacity
          style={styles.createBanner}
          onPress={() => setIsCreating(true)}
        >
          <Text style={styles.createBannerText}>+ Create New 1v1 Challenge</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Match Challenge</Text>

          {errorMsg && (
            <Text style={styles.errorText}>{errorMsg}</Text>
          )}

          <Text style={styles.inputLabel}>Game Engine Archetype</Text>
          <View style={styles.typeSelector}>
            {['HIGH_SCORE', 'LOW_TIME', 'BINARY_RESULT'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeOption, gameType === t && styles.typeOptionActive]}
                onPress={() => setGameType(t)}
              >
                <Text style={[styles.typeOptionText, gameType === t && styles.typeOptionTextActive]}>
                  {t.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Wager Amount (POINTS)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={wager}
            onChangeText={setWager}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsCreating(false);
                setErrorMsg(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, createMatchMutation.isPending && styles.disabled]}
              disabled={createMatchMutation.isPending}
              onPress={() => createMatchMutation.mutate()}
            >
              {createMatchMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Launch Match</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Live Match List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Open Match Lobbies</Text>
        {isLoading ? (
          <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 20 }} />
        ) : !openMatches || openMatches.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No open public matches right now.</Text>
            <Text style={styles.emptySubText}>Create a challenge to invite a player!</Text>
          </View>
        ) : (
          openMatches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchItem}
              onPress={() => router.push(`/match/${match.id}` as any)}
            >
              <View>
                <Text style={styles.matchTitle}>Room #{match.room_code || match.id.substring(0, 6)}</Text>
                <Text style={styles.matchStatus}>{match.status}</Text>
              </View>
              <View style={styles.matchRight}>
                <Text style={styles.wagerValue}>{match.wager_amount} PTS</Text>
                <Text style={styles.actionPrompt}>Tap to Enter →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
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
  card: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#1A1A2B',
    borderColor: '#2D2D44',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 2,
  },
  codeButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  createBanner: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  createBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#1A1A2B',
    borderColor: '#2D2D44',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  typeOptionActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#231B3D',
  },
  typeOptionText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  typeOptionTextActive: {
    color: '#8B5CF6',
  },
  input: {
    backgroundColor: '#1A1A2B',
    borderColor: '#2D2D44',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: '#1F1F2E',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
  },
  section: {
    gap: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: '#D1D5DB',
    fontSize: 13,
  },
  emptySubText: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
  },
  matchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  matchTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  matchStatus: {
    color: '#10B981',
    fontSize: 11,
    marginTop: 2,
  },
  matchRight: {
    alignItems: 'flex-end',
  },
  wagerValue: {
    color: '#8B5CF6',
    fontWeight: '800',
    fontSize: 14,
  },
  actionPrompt: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
});
