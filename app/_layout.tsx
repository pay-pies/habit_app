import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect} from "react";
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from "react-native-paper"
import { GestureHandlerRootView } from "react-native-gesture-handler"

function RouteGuard({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const {user, isLoadingUser} = useAuth();  
  const segments = useSegments();

  useEffect(() => {
    if (isLoadingUser) return;
    const inAuthGroup = segments?.[0] === "auth";
    console.log("before if else")
    console.log("User:", user);
    console.log("In Auth Group:", inAuthGroup);
    if (!user && !inAuthGroup && !isLoadingUser) {
      console.log("No user found. Redirecting to /auth");
      router.replace("/auth");
      // Use window.location.href for client-side navigation
    } else if (user && inAuthGroup && !isLoadingUser) {
      console.log("User found. Redirecting to /");
      router.replace("/");
    }
    console.log("after if else")
  }, [user, segments, isLoadingUser, router]);
  

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <PaperProvider>
          <SafeAreaProvider>
            <RouteGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="add-habit" options={{headerShown: false}}/>
                <Stack.Screen name="streaks" options={{headerShown: false}}/>
                <Stack.Screen name="index" options={{headerShown: false}}/>
                <Stack.Screen name="auth/index" options={{ headerShown: false }} />
              </Stack>
            </RouteGuard>
          </SafeAreaProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// import { Stack, Redirect } from "expo-router";
// import { useEffect, useState } from "react";

// // This hook would check your actual authentication status
// // (e.g., from Appwrite)
// const useAuthStatus = () => {
//     const [isAuth, setIsAuth] = useState(false);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         // Here you would check for a user session or token
//         // For now, this simulates a check that takes 1 second
//         const timer = setTimeout(() => {
//             // Once the check is complete, set the state
//             setIsAuth(false); // Change to 'true' to see your app tabs
//             setIsLoading(false);
//         }, 1000);

//         return () => clearTimeout(timer);
//     }, []);

//     return { isAuth, isLoading };
// };

// export default function RootLayout() {
//     const { isAuth, isLoading } = useAuthStatus();

//     if (isLoading) {
//         // You can return a loading screen or spinner here
//         return null;
//     }

//     if (!isAuth) {
//         // If not authenticated, redirect to the auth page
//         return <Redirect href="/auth" />;
//     }

//     // If authenticated, render the main app tabs
//     return (
//         <Stack>
//             <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         </Stack>
//     );
// }
