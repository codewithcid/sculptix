import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './ui/Button';
import { Text } from './ui/Text';

interface Props {
  children: React.ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Root error boundary. Catches render-time crashes anywhere below it and shows
 * a friendly recovery screen instead of a blank white screen — important for
 * public test builds. Hook a crash reporter into `componentDidCatch` later.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Replace with a crash reporter (e.g. self-hosted) when desired.
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView contentContainerClassName="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-6xl">😵‍💫</Text>
          <Text variant="title" className="text-center">
            Something went wrong
          </Text>
          <Text variant="caption" className="text-center">
            The app hit an unexpected error. You can try again — your data is safe.
          </Text>
          {__DEV__ ? (
            <View className="w-full rounded-2xl border border-border bg-surface p-3">
              <Text className="text-xs text-danger" numberOfLines={6}>
                {error.message}
              </Text>
            </View>
          ) : null}
          <View className="mt-2 w-full max-w-xs">
            <Button title="Try again" onPress={this.reset} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
