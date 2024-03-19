import React, { createContext, useEffect, useState, useContext } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Home from "./components/Home";
import BottomNavigationBar from "./components/BottomBar";
import PoopEntryForm from "./components/PoopEntryForm";
import PoopEntries from "./components/PoopEntries";
import LoginPage from "./components/Login";
import UserPage from "./components/UserPage";
import { CircularProgress, Box } from "@mui/material";

// Create AuthContext inline
const AuthContext = createContext<{ currentUser: User | null }>({
  currentUser: null,
});

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState("/");
  const [loading, setLoading] = useState(true); // Add loading state
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // Set loading to false once user data is fetched
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location]);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "90vh",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : currentUser ? (
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add-poop" element={<PoopEntryForm />} />
              <Route path="/see-poops" element={<PoopEntries />} />
              <Route path="/user" element={<UserPage />} />
            </Routes>
            <BottomNavigationBar currentRoute={currentRoute} />
          </>
        ) : (
          <LoginPage />
        )}
      </Box>
    </AuthContext.Provider>
  );
}

export default App;

// Create a hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
