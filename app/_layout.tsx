import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect} from "react";
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme, PaperProvider } from "react-native-paper"
import { GestureHandlerRootView } from "react-native-gesture-handler"

function RouteGuard({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const {user, isLoadingUser} = useAuth();  
  const segments = useSegments();
  
  useEffect(() => {
    const inAuthGroup = segments?.[0] === "auth";
    if (!user && !inAuthGroup && !isLoadingUser) {
      router.replace("/auth");
    } else if (user && inAuthGroup && !isLoadingUser) {
      router.replace("/");
    }
  }, [user, segments, isLoadingUser, router]);
  

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <PaperProvider theme={MD3LightTheme}>
          <SafeAreaProvider>
            <RouteGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="add-habit" options={{headerShown: true}}/>
                <Stack.Screen name="streaks" options={{headerShown: true}}/>
                <Stack.Screen name="index" options={{headerShown: true}}/>
                <Stack.Screen name="auth/index" options={{headerShown: true, title: "Log in"}} />
              </Stack>
            </RouteGuard>
          </SafeAreaProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
