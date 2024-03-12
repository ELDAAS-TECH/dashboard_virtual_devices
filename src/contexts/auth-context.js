// auth-context.js

import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { set } from "nprogress";

const HANDLERS = {
  INITIALIZE: "INITIALIZE",
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
};

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      isLoading: false,
      user: action?.payload?.user,
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isInitialized: true,
      isAuthenticated: true,
      user,
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [user, setUser] = useState(null);

  const initialize = async () => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) {
      throw new Error("No idToken found in localStorage");
    }
    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/users/getUsers`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      };

      if (idToken) {
        const response = await axios.request(config);
        const user = response.data;

        setUser(user);
        dispatch({
          type: HANDLERS.SIGN_IN,

          payload: {
            user,
            isAuthenticated: true,
          },
        });
      } else {
        dispatch({
          type: HANDLERS.INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      if (error?.response?.data?.message === "The incoming token has expired") {
        refreshTokenApi();
      }
      console.error("Error fetching user information:", error);
      // Handle error fetching user information if needed
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  //to refresh the ID Token If it is expired
  const refreshTokenApi = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://gbfgs2m6df.execute-api.us-west-1.amazonaws.com/dev/api/v1/public/refreshTokens`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          refreshToken: refreshToken,
        },
      };

      if (refreshToken) {
        const response = await axios.request(config);
        const idToken = response.data?.tokens?.idToken;
        localStorage.setItem("idToken", idToken);
        if (idToken) {
          initialize();
        }
      }
    } catch (error) {
      console.error("Error fetching user information:", error);
      // Handle error fetching user information if needed
    }
  };
  const skip = () => {
    try {
      window.sessionStorage.setItem("authenticated", "true");
    } catch (err) {
      console.error(err);
    }

    const user = {
      id: "5e86809283e28b96d2d38537",
      avatar: "/assets/avatars/avatar-anika-visser.png",
      name: "Anika Visser",
      email: "anika.visser@devias.io",
    };

    dispatch({
      type: HANDLERS.SIGN_IN,
      payload: user,
    });
  };

  const signIn = async (email, password) => {
    console.log("Signing in...");
    try {
      const response = await axios.post(
        "https://gbfgs2m6df.execute-api.us-west-1.amazonaws.com/dev/api/v1/public/signin",
        {
          email,
          password,
        }
      );

      // Assuming your API response structure has a 'success' property
      if (response.data.success) {
        // You may need to adapt this based on the actual structure of your API response
        const user = response.data.data.AuthenticationResult;
        const idToken = response.data.data.AuthenticationResult.IdToken;
        const refreshToken = response.data.data.AuthenticationResult.RefreshToken;
        setUser(user);

        // Store the idToken in local storage
        localStorage.setItem("idToken", idToken);
        localStorage.setItem("refreshToken", refreshToken);
        dispatch({
          type: HANDLERS.SIGN_IN,
          payload: user,
        });

        window.sessionStorage.setItem("authenticated", "true");
        return response;
      } else {
        // Handle unsuccessful login
        console.error("Authentication failed:", response.data.error);
        throw new Error("Authentication failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("An error occurred while processing the request:", error);
      throw new Error("An error occurred while processing your request.");
    }
  };

  const signUp = async (email, name, password) => {
    // Implementation for sign-up can be added here if needed
    throw new Error("Sign up is not implemented");
  };

  const signOut = () => {
    console.log("logout--");
    localStorage.removeItem("idToken");
    window.sessionStorage.remove("authenticated");
    dispatch({
      type: HANDLERS.SIGN_OUT,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        user,
        skip,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
