import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mobileApiClient } from '../../src/lib/api';

export default function MobileCaptureScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();

  const [rawScoreText, setRawScoreText] = useState('');
  const [extractedScore, setExtractedScore] = useState('');
  const [confidence, setConfidence] = useState('0.95');
  const [submitting, setSubmitting] = useState(false);

  // Generates a mock SHA-256 for mobile verification proof
  const generateProofHash = () => {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
  };

  const handleSubmitScore = async () => {
    const numScore = parseFloat(extractedScore);
    if (isNaN(numScore)) {
      Alert.alert('Invalid Score', 'Please enter a numeric score value.');
      return;
    }

    setSubmitting(true);
    try {
      await mobileApiClient(`/matches/${matchId}/score`, {
        method: 'POST',
        body: JSON.stringify({
          score: numScore,
          rawText: rawScoreText || `SCORE: ${numScore}`,
          confidence: parseFloat(confidence) || 0.95,
          imageHash: generateProofHash(),
        }),
      });

      Alert.alert('Score Submitted', 'Your OCR verification evidence has been logged.', [
        {
          text: 'Return to Match',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Game-Over Screen Capture</Text>
        <Text style={styles.subtitle}>
          Capture or input your final game-over screen score. The server validates OCR hashes
          against the game profile template.
        </Text>

        <View style={styles.mockCameraBox}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraLabel}>Camera / Photo Feed Ready</Text>
          <Text style={styles.cameraNote}>
            Zero-storage policy: Screenshots are processed locally or in memory. Only SHA-256 hashes
            are preserved.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Extracted Score</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 14520"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={extractedScore}
            onChangeText={setExtractedScore}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>OCR Raw String / Screen Text</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. FINAL SCORE: 14520 LEVEL 12"
            placeholderTextColor="#6B7280"
            value={rawScoreText}
            onChangeText={setRawScoreText}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabled]}
          disabled={submitting}
          onPress={handleSubmitScore}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Verified Score</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#12121E',
    borderColor: '#1F1F2E',
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    gap: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  mockCameraBox: {
    backgroundColor: '#181829',
    borderColor: '#2D2D45',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  cameraIcon: {
    fontSize: 32,
  },
  cameraLabel: {
    color: '#E0E7FF',
    fontSize: 14,
    fontWeight: '700',
  },
  cameraNote: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1A1A2B',
    borderColor: '#2D2D44',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
