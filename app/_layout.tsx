import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect} from "react";
import { AuthProvider, useAuth } from '../lib/auth-context';

function RouteGuard({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const {user, isLoadingUser} = useAuth();  
  const segments = useSegments();

  useEffect(() => {
    if (isLoadingUser) return;
    const inAuthGroup = segments[0] === "auth";

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
    <AuthProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </AuthProvider>
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
