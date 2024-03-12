import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthContext } from "src/contexts/auth-context";
import LoadingScreen from "src/components/loading-screen/LoadingScreen";

const GuestGuard = ({ children }) => {
  const router = useRouter();
  const { state } = useAuthContext();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    // Check if user is logged in
    const isLoggedIn = state?.isAuthenticated;

    // If user is already logged in, redirect them away from the login page
    if (isLoggedIn) {
      router
        .replace({
          pathname: "/customers",
          query: router.asPath !== "/" ? { continueUrl: router.asPath } : undefined,
        })
        .catch(console.error);
    } else {
      router
        .replace({
          pathname: "/auth/login",
          query: router.asPath !== "/" ? { continueUrl: router.asPath } : undefined,
        })
        .catch(console.error);
    }
  }, [state?.isAuthenticated, state.isInitialized]);

  if (!state.isInitialized) {
    return <LoadingScreen />;
  }
  return <>{children}</>;
};

export default GuestGuard;
