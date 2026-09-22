import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/lib/authStore';
import { supabase } from '../../src/lib/supabase';
import { mobileApiClient } from '../../src/lib/api';

export default function MobileProfileScreen() {
  const router = useRouter();
  const { user, profile, reset } = useAuthStore();

  const { data: eloRatings, isLoading } = useQuery<any[]>({
    queryKey: ['mobile-user-ratings', user?.id],
    queryFn: () => mobileApiClient<any[]>(`/ratings/user/${user?.id}`).catch(() => []),
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    reset();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Player Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'AG'}
          </Text>
        </View>
        <Text style={styles.username}>@{profile?.username || 'Player'}</Text>
        <Text style={styles.userRole}>ROLE: {profile?.role || 'PLAYER'}</Text>

        <View style={styles.reputationBadge}>
          <Text style={styles.reputationLabel}>REPUTATION</Text>
          <Text style={styles.reputationScore}>{profile?.reputation_score ?? 100}</Text>
        </View>
      </View>

      {/* Elo Ratings List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competitive Elo Ratings</Text>
        {isLoading ? (
          <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 16 }} />
        ) : !eloRatings || eloRatings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No ranked matches played yet.</Text>
            <Text style={styles.emptySubText}>Play a match to establish your universal rating.</Text>
          </View>
        ) : (
          <View style={styles.ratingsList}>
            {eloRatings.map((r) => (
              <View key={r.id || r.game_type} style={styles.ratingRow}>
                <View>
                  <Text style={styles.gameType}>{r.game_type?.replace('_', ' ')}</Text>
                  <Text style={styles.stats}>
                    {r.matches_played ?? 0} matches • {r.wins ?? 0}W - {r.losses ?? 0}L
                  </Text>
                </View>
                <View style={styles.ratingBox}>
                  <Text style={styles.ratingValue}>{r.rating ?? 1200}</Text>
                  <Text style={styles.ratingTier}>{r.tier || 'PROVISIONAL'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Account Actions */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
  profileHeader: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  username: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  userRole: {
    color: '#9CA3AF',
    fontSize: 11,
    letterSpacing: 1,
  },
  reputationBadge: {
    backgroundColor: '#1C1A2E',
    borderColor: '#302652',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  reputationLabel: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '700',
  },
  reputationScore: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 12,
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
  ratingsList: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2A',
  },
  gameType: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  stats: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  ratingValue: {
    color: '#8B5CF6',
    fontWeight: '800',
    fontSize: 16,
  },
  ratingTier: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
  },
  signOutButton: {
    backgroundColor: '#261418',
    borderColor: '#591C27',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 14,
  },
});
