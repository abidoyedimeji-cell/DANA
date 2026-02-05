import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/config/theme';
import { logger } from 'shared';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('🚫 UNCAUGHT ERROR', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    // Future home for Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  private handleReset = () => {
    // Reset error state - app will re-render normally
    // In production, you might want to use expo-updates or React Native's DevSettings
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            DANA encountered an unexpected error. Don't worry, your data is safe.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Restart App</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorDetails: {
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 20,
    maxWidth: '100%',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.destructive,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
  },
  buttonText: {
    color: theme.colors.primaryForeground,
    fontWeight: '600',
    fontSize: 16,
  },
});
