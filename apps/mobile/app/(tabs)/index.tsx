import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/lib/authStore';
import { mobileApiClient } from '../../src/lib/api';

interface DashboardData {
  wallet: { balance: number; currency: string };
  activeMatches: Array<{
    id: string;
    game_profile_id: string;
    status: string;
    wager_amount: number;
  }>;
  featuredTournaments: Array<{
    id: string;
    name: string;
    game_type: string;
    prize_pool: number;
    current_participants: number;
    max_participants: number;
  }>;
}

export default function MobileDashboard() {
  const router = useRouter();
  const { user, profile } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery<DashboardData>({
    queryKey: ['mobile-dashboard'],
    queryFn: async () => {
      const [walletRes, matchesRes, tournamentsRes] = await Promise.all([
        mobileApiClient<{ balance: number; currency: string }>('/wallet/balance').catch(() => ({
          balance: 1000,
          currency: 'POINTS',
        })),
        mobileApiClient<any[]>('/matches/active').catch(() => []),
        mobileApiClient<any[]>('/tournaments').catch(() => []),
      ]);

      return {
        wallet: walletRes,
        activeMatches: matchesRes,
        featuredTournaments: tournamentsRes.slice(0, 3),
      };
    },
    enabled: !!user,
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} tintColor="#8B5CF6" />
      }
    >
      {/* Player Header Banner */}
      <View style={styles.userBanner}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>@{profile?.username || 'Gamer'}</Text>
        </View>
        <TouchableOpacity
          style={styles.walletBadge}
          onPress={() => router.push('/(tabs)/wallet')}
        >
          <Text style={styles.walletBadgeLabel}>DEMO WALLET</Text>
          <Text style={styles.walletBadgeValue}>
            {data?.wallet?.balance?.toLocaleString() ?? 1000} PTS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Grid */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCardPrimary}
          onPress={() => router.push('/(tabs)/matches')}
        >
          <Text style={styles.actionIcon}>⚔️</Text>
          <Text style={styles.actionTitlePrimary}>Find a Match</Text>
          <Text style={styles.actionDescPrimary}>Queue 1v1 or accept challenges</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCardSecondary}
          onPress={() => router.push('/(tabs)/tournaments')}
        >
          <Text style={styles.actionIcon}>🏆</Text>
          <Text style={styles.actionTitleSecondary}>Tournaments</Text>
          <Text style={styles.actionDescSecondary}>Compete in single elimination brackets</Text>
        </TouchableOpacity>
      </View>

      {/* Active Matches Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Matches</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/matches')}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        {data?.activeMatches && data.activeMatches.length > 0 ? (
          data.activeMatches.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.matchCard}
              onPress={() => router.push(`/match/${m.id}` as any)}
            >
              <View>
                <Text style={styles.matchId}>Match #{m.id.substring(0, 8)}</Text>
                <Text style={styles.matchStatus}>Status: {m.status}</Text>
              </View>
              <View style={styles.matchWager}>
                <Text style={styles.matchWagerValue}>{m.wager_amount} PTS</Text>
                <Text style={styles.matchWagerLabel}>Wager</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No matches currently active.</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/matches')}
            >
              <Text style={styles.emptyButtonText}>Start Quick Match</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Featured Tournaments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Tournaments</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/tournaments')}>
            <Text style={styles.sectionLink}>Browse</Text>
          </TouchableOpacity>
        </View>

        {data?.featuredTournaments && data.featuredTournaments.length > 0 ? (
          data.featuredTournaments.map((t) => (
            <View key={t.id} style={styles.tourneyCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tourneyName}>{t.name}</Text>
                <Text style={styles.tourneyType}>{t.game_type}</Text>
                <Text style={styles.tourneySlots}>
                  {t.current_participants} / {t.max_participants} Players
                </Text>
              </View>
              <View style={styles.tourneyPrizeBox}>
                <Text style={styles.tourneyPrizeLabel}>PRIZE POOL</Text>
                <Text style={styles.tourneyPrizeValue}>{t.prize_pool} PTS</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No upcoming tournaments scheduled.</Text>
          </View>
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
    gap: 20,
  },
  userBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  greeting: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  walletBadge: {
    backgroundColor: '#1C1635',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  walletBadgeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A78BFA',
  },
  walletBadgeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCardPrimary: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitlePrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionDescPrimary: {
    fontSize: 11,
    color: '#E0E7FF',
    marginTop: 2,
  },
  actionCardSecondary: {
    flex: 1,
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
  },
  actionTitleSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionDescSecondary: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionLink: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  matchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  matchId: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  matchStatus: {
    color: '#10B981',
    fontSize: 12,
    marginTop: 2,
  },
  matchWager: {
    alignItems: 'flex-end',
  },
  matchWagerValue: {
    color: '#8B5CF6',
    fontWeight: '700',
    fontSize: 14,
  },
  matchWagerLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  tourneyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  tourneyName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  tourneyType: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tourneySlots: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  tourneyPrizeBox: {
    backgroundColor: '#1A1828',
    borderColor: '#302652',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
  },
  tourneyPrizeLabel: {
    fontSize: 8,
    color: '#A78BFA',
    fontWeight: '700',
  },
  tourneyPrizeValue: {
    fontSize: 13,
    fontWeight: '800',
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
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 8,
  },
  emptyButton: {
    backgroundColor: '#1F1F2E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
