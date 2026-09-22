import React from 'react';
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

export default function MobileWalletScreen() {
  const queryClient = useQueryClient();

  const { data: walletData, isLoading, refetch, isRefetching } = useQuery<{
    balance: number;
    currency: string;
    transactions: any[];
  }>({
    queryKey: ['mobile-wallet'],
    queryFn: async () => {
      const [balanceRes, ledgerRes] = await Promise.all([
        mobileApiClient<{ balance: number; currency: string }>('/wallet/balance').catch(() => ({
          balance: 1000,
          currency: 'POINTS',
        })),
        mobileApiClient<any[]>('/wallet/ledger').catch(() => []),
      ]);
      return {
        balance: balanceRes.balance,
        currency: balanceRes.currency,
        transactions: ledgerRes,
      };
    },
  });

  const topUpMutation = useMutation({
    mutationFn: () =>
      mobileApiClient('/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount: 500 }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-wallet'] });
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
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.currencyBadge}>DEMO POINTS FAUCET</Text>
          <Text style={styles.disclaimerBadge}>NO REAL MONEY</Text>
        </View>

        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>
          {walletData?.balance?.toLocaleString() ?? 0}{' '}
          <Text style={styles.balanceCurrency}>{walletData?.currency || 'PTS'}</Text>
        </Text>

        <TouchableOpacity
          style={[styles.topupButton, topUpMutation.isPending && styles.disabled]}
          disabled={topUpMutation.isPending}
          onPress={() => topUpMutation.mutate()}
        >
          {topUpMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.topupButtonText}>+ Claim Free Demo Points (+500 PTS)</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Notice box */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeTitle}>⚖️ Compliance & Skill-Based Rules</Text>
        <Text style={styles.noticeDesc}>
          Points hold no real cash value and cannot be redeemed for fiat currency. Wagers are escrowed
          during active matches and resolved instantly upon OCR score verification.
        </Text>
      </View>

      {/* Transaction History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Ledger History</Text>
        {isLoading ? (
          <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 20 }} />
        ) : !walletData?.transactions || walletData.transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No transactions recorded yet.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {walletData.transactions.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txType}>{tx.type || tx.entry_type}</Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.created_at).toLocaleDateString()}{' '}
                    {new Date(tx.created_at).toLocaleTimeString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    tx.amount > 0 ? styles.txCredit : styles.txDebit,
                  ]}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} PTS
                </Text>
              </View>
            ))}
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
    gap: 16,
  },
  balanceCard: {
    backgroundColor: '#12121E',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyBadge: {
    backgroundColor: '#241743',
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  disclaimerBadge: {
    backgroundColor: '#1F1F2E',
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  balanceLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  balanceCurrency: {
    color: '#8B5CF6',
    fontSize: 20,
    fontWeight: '700',
  },
  topupButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  topupButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  noticeBox: {
    backgroundColor: '#161626',
    borderColor: '#26263B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  noticeTitle: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '700',
  },
  noticeDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  historySection: {
    gap: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2A',
  },
  txType: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  txDate: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txCredit: {
    color: '#10B981',
  },
  txDebit: {
    color: '#EF4444',
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
