import { createContext, useEffect, useState, useContext } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Home from "./components/Home";
import BottomNavigationBar from "./components/BottomBar";
import PoopEntryForm from "./components/PoopEntryForm";
import LoginPage from "./components/Login";
import ProfilePage from "./components/ProfilePage";
import CreateProfilePage from "./components/CreateProfilePage"; // Import the CreateProfilePage component
import { CircularProgress, Box } from "@mui/material";
import { initReactI18next } from "react-i18next";
import i18n from "i18next";

// Import translation files synchronously
import enTranslations from "./i18n/en/translations.json";
import frTranslations from "./i18n/fr/translations.json";
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { Profile } from "./types/Profile";
import { firestore } from "./firebase";
import { useQuery } from "react-query";
import Navigator from "./components/Navigator";
import PoopingWithFriends from "./components/PoopingWIthFriends";
import MapPage from "./components/Map";
import useOnlineUsers from "./queries/useOnlineUsers";

// Create AuthContext inline
const AuthContext = createContext<{ currentUser: User | null }>({
  currentUser: null,
});

function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>("/");
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [currentLang, setCurrentLang] = useState<string>("fr");
  const location = useLocation();
  const [error, setError] = useState<boolean>(false);

  const { onlineUsers, isLoading: isLoadingOnlineUsers } = useOnlineUsers();

  useEffect(() => {
    const handleNetworkChange = () => {
      setError(!navigator.onLine); // Update error state based on network status
    };

    // Listen for changes in network status
    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    // Initial check for network status
    setError(!navigator.onLine);

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);

  const { isLoading, data: profile } = useQuery<Profile | null | undefined>(
    ["profiles", currentUser?.uid],
    async () => {
      if (currentUser) {
        try {
          const userPoopsQuery = query(
            collection(firestore, "profiles"),
            where("id", "==", currentUser?.uid)
          );
          const querySnapshot = await getDocs(userPoopsQuery).catch(() => {
            setError(true);
            return null;
          });
          const entries: Profile[] = [];
          querySnapshot?.forEach((doc) => {
            entries.push({ id: doc.id, ...doc.data() } as Profile);
          });
          // Check if user has a profile, if not, navigate to create profile page
          if (entries.length === 0) {
            navigate("/create-profile");
            setLoading(false);
            return null;
          } else {
            navigate(location.pathname);
            setLoading(false);
            return entries[0];
          }
        } catch (error) {
          setError(true);
          console.error("Error fetching profile:", error);
          setLoading(false); // Set loading to false if there's an error
          return null;
        }
      }
    },
    {
      staleTime: Infinity,
    }
  );
  useEffect(() => {
    // Handle setting user as offline when the window/tab is closed
    const handleWindowClose = () => {
      if (currentUser) {
        const userRef = doc(firestore, "profiles", currentUser.uid);
        setDoc(userRef, { online: false }, { merge: true }); // Set user as offline
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab gains focus, set user as online
        if (currentUser) {
          const userRef = doc(firestore, "profiles", currentUser.uid);
          setDoc(
            userRef,
            { online: true, lastConnection: Timestamp.now().toMillis() },
            { merge: true }
          );
        }
      } else if (document.visibilityState === "hidden") {
        // Tab loses focus, set user as offline
        if (currentUser) {
          const userRef = doc(firestore, "profiles", currentUser.uid);
          setDoc(userRef, { online: false }, { merge: true });
        }
      }
    };
    window.addEventListener("beforeunload", handleWindowClose);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [currentUser]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        setCurrentUser(user);
        // try {
        //   const profileRef = doc(collection(firestore, "profiles"), user.uid);
        //   await updateDoc(profileRef, {
        //     online: true,
        //     lastConnection: Timestamp.now().toMillis(),
        //   }).catch(() => setError(true));
        //   setLoading(false);
        // } catch (error) {
        //   console.error("Error updating last connection:", error);
        //   setLoading(false);
        // }
        setLoading(false);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      // if (currentUser) {
      //   const userRef = doc(firestore, "profiles", currentUser.uid);
      //   setDoc(userRef, { online: false }, { merge: true }); // Set user as offline
      // }
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location]);

  // Initialize i18n with translation resources
  useEffect(() => {
    i18n
      .use(initReactI18next) // passes i18n down to react-i18next
      .init({
        resources: {
          en: {
            translation: enTranslations,
          },
          fr: {
            translation: frTranslations,
          },
        },
        lng: currentLang,
        fallbackLng: "en",
        interpolation: {
          escapeValue: false,
        },
      });
  }, [currentLang]);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "90vh",
        }}
      >
        {error ? (
          <div>Merde!</div>
        ) : (
          <>
            {loading || isLoading || isLoadingOnlineUsers ? (
              <CircularProgress />
            ) : currentUser ? (
              <>
                {/* Check if the user has a profile, if not redirect to create profile page */}
                {profile ? (
                  <>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route
                        path="/create-profile"
                        element={<Navigator location={"/"} />}
                      />
                      <Route path="/add-poop" element={<PoopEntryForm />} />
                      <Route path="/map" element={<MapPage />} />
                      <Route
                        path="/pooping-with-friends"
                        element={<PoopingWithFriends />}
                      />
                      <Route path="/user" element={<ProfilePage />} />
                    </Routes>
                    <BottomNavigationBar
                      currentRoute={currentRoute}
                      currentLang={currentLang}
                      setCurrentLang={setCurrentLang}
                      onlineProfiles={onlineUsers.length}
                    />
                  </>
                ) : (
                  <CreateProfilePage />
                )}
              </>
            ) : (
              <LoginPage />
            )}
          </>
        )}
      </Box>
    </AuthContext.Provider>
  );
}

export default App;

// Create a hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
