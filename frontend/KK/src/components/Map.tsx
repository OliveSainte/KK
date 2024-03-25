import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { firestore } from "../firebase";
import { PoopEntry } from "../types/PoopEntry";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import PoopEntryCard from "./PoopEntryCard";
import L from "leaflet";
import "../styles/styles..css";
import { brown } from "../../public/colors";
import { useAuth } from "../App";

const MapPage = () => {
  const { currentUser } = useAuth();

  const [homePoops, setHomePoops] = useState<number>(0);
  const [awayPoops, setAwayPoops] = useState<number>(0);
  const [positions, setPositions] = useState<PoopEntry[]>([]);
  const [initialPosition, setInitialPosition] = useState<
    [number, number] | null
  >(null);

  const { isLoading, data: poopEntries } = useQuery<PoopEntry[], Error>(
    ["poopEntries"],
    async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(firestore, "poopEntries"),
            orderBy("dateTime", "desc"),
            limit(30)
          )
        );

        const entries: PoopEntry[] = [];

        querySnapshot.forEach((doc) => {
          entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
        });

        return entries;
      } catch (error) {
        console.error("Error fetching poop entries:", error);
        throw new Error("Failed to fetch poop entries");
      }
    },
    {
      staleTime: 60000,
    }
  );

  useEffect(() => {
    if (!poopEntries || poopEntries.length < 1 || isLoading) return;

    const pos: PoopEntry[] = [];

    let homeCount = 0;
    let awayCount = 0;

    poopEntries.forEach((entry) => {
      if (entry.geoPoint !== undefined) {
        pos.push(entry);

        if (entry.location === "home") {
          homeCount++;
        } else {
          awayCount++;
        }
      }
    });

    if (pos.length < 1) return;
    const userPoopEntries = poopEntries.filter(
      (entry) => entry.createdById === currentUser?.uid
    );
    const initial =
      userPoopEntries.length > 0 ? userPoopEntries[0] : poopEntries[0];

    // Sort the user's poop entries by timestamp in descending order
    const latLngArray: [number, number] = [
      initial.geoPoint?.latitude ?? 0,
      initial.geoPoint?.longitude ?? 0,
    ];

    // Convert to Leaflet coordinates
    const initialLeafletPosition = L.latLng(latLngArray[0], latLngArray[1]);
    setInitialPosition([
      initialLeafletPosition.lat,
      initialLeafletPosition.lng,
    ]);

    setPositions(pos);
    setHomePoops(homeCount);
    setAwayPoops(awayCount);
  }, [poopEntries, isLoading, currentUser?.uid]);

  if (positions.length < 1 || initialPosition === null)
    return (
      <Typography variant="h6" textAlign="center">
        Looks like you have not pooped with your location on!
      </Typography>
    );

  if (isLoading) return <CircularProgress />;

  const icon = (entry: PoopEntry) => {
    return L.icon({
      iconUrl: entry.userProfilePic,
      iconSize: [32, 32],
    });
  };

  return (
    <div style={{ height: "97.7vh", width: "100%" }}>
      <MapContainer
        zoomControl={false} // Add this line to remove zoom buttons
        center={initialPosition}
        zoom={17} // Adjust initial zoom level as needed
        style={{
          height: "100%",
          width: "100%",
          zIndex: 1,
        }}
      >
        <div className="map-title">
          KKs
          <Stack direction="column">
            <Chip
              variant="outlined"
              style={{
                borderColor: brown,
              }}
              label={`${homePoops} home vs ${awayPoops} away`}
            />
          </Stack>
        </div>

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {positions.map((position, index) => (
          <Marker
            key={index}
            icon={icon(position)}
            position={[
              position.geoPoint?.latitude ?? 0,
              position.geoPoint?.longitude ?? 0,
            ]}
          >
            <Popup className="dark-popup">
              <PoopEntryCard entry={position} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;
