import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useAuthContext } from "src/contexts/auth-context";
import { usePathname } from "next/navigation";
import LoadingScreen from "src/components/loading-screen/LoadingScreen";

export const AuthGuard = (props) => {
  const { children } = props;

  const router = useRouter();
  const { state } = useAuthContext();
  const ignore = useRef(false);
  const [requestedLocation, setRequestedLocation] = useState(null);

  const pathname = usePathname();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (ignore.current) {
      return;
    }

    ignore.current = true;

    if (!state?.isAuthenticated) {
      if (pathname !== requestedLocation) {
        setRequestedLocation(pathname);
      }
      router
        .replace({
          pathname: "/auth/login",
          query: router.asPath !== "/" ? { continueUrl: router.asPath } : undefined,
        })
        .catch(console.error);
    }
    if (requestedLocation && pathname !== requestedLocation) {
      setRequestedLocation(null);
      router
        .replace({
          pathname: requestedLocation,
          query: router.asPath !== "/" ? { continueUrl: router.asPath } : undefined,
        })
        .catch(console.error);
    }
  }, [state?.isAuthenticated, router.isReady, state?.isInitialized]);
  if (!state?.isInitialized) {
    return <LoadingScreen />;
  }
  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
};
