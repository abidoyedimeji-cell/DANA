import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { theme } from '@/config/theme';
import { supabase } from '@/lib/supabase';
import { logger } from 'shared';

interface TermsGuardProps {
  visible: boolean;
  userId: string;
  onAccepted: () => void;
}

export const TermsGuard: React.FC<TermsGuardProps> = ({ visible, userId, onAccepted }) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!agreed) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          terms_accepted_at: new Date().toISOString(),
          privacy_policy_version: '1.0',
        })
        .eq('id', userId);

      if (error) {
        logger.error('Failed to save terms acceptance', error);
        // Still allow access but log the error
      } else {
        logger.info('Terms accepted', { userId, version: '1.0' });
      }
      onAccepted();
    } catch (error) {
      logger.error('Error accepting terms', error);
      // Allow access even if save fails (graceful degradation)
      onAccepted();
    } finally {
      setLoading(false);
    }
  };

  const openTerms = () => {
    Linking.openURL('https://dana.io/terms').catch((err) => {
      logger.error('Failed to open terms URL', err);
    });
  };

  const openPrivacy = () => {
    Linking.openURL('https://dana.io/privacy').catch((err) => {
      logger.error('Failed to open privacy URL', err);
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>The DANA Code</Text>
          <Text style={styles.body}>
            To maintain a high-trust environment for both professional networking and dating, we
            require all members to agree to our terms.
          </Text>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
            <View style={[styles.checkbox, agreed && styles.checked]}>
              {agreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.label}>
              I agree to the{' '}
              <Text style={styles.link} onPress={openTerms}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.link} onPress={openPrivacy}>
                Privacy Policy
              </Text>
              .
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !agreed && styles.disabled]}
            onPress={handleAccept}
            disabled={!agreed || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
            ) : (
              <Text style={styles.buttonText}>Accept & Enter</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 25,
  },
  modal: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.foreground,
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: theme.colors.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checked: {
    backgroundColor: theme.colors.primary,
  },
  checkMark: {
    color: theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.foreground,
    lineHeight: 18,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.primaryForeground,
    fontWeight: '700',
    fontSize: 16,
  },
});
