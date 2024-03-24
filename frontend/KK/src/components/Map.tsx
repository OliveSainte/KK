import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { firestore } from "../firebase";
import { useAuth } from "../App";
import { PoopEntry } from "../types/PoopEntry";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Card } from "@mui/material";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import PoopEntryCard from "./PoopEntryCard";
import L from "leaflet";

const MapPage = () => {
  const { currentUser } = useAuth();
  const [positions, setPositions] = useState<PoopEntry[]>([]);
  const [initialPosition, setInitialPosition] = useState<
    [number, number] | null
  >(null);

  const { isLoading, data: userPoopEntries } = useQuery<PoopEntry[], Error>(
    ["userPoopEntries", currentUser?.uid],
    async () => {
      if (!currentUser) throw new Error("User not authenticated.");
      const userPoopsQuery = query(
        collection(firestore, "poopEntries"),
        orderBy("dateTime", "desc"),
        where("createdById", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(userPoopsQuery);
      const entries: PoopEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as PoopEntry);
      });
      return entries;
    },
    {
      staleTime: 120000,
    }
  );

  useEffect(() => {
    if (!userPoopEntries || userPoopEntries.length < 1 || isLoading) return;

    const pos: PoopEntry[] = [];

    userPoopEntries.forEach((entry) => {
      if (entry.geoPoint !== undefined) {
        pos?.push(entry);
      }
    });

    if (pos.length < 1) return;
    const latLngArray: [number, number] = [
      pos[0].geoPoint?.latitude ?? 0,
      pos[0].geoPoint?.longitude ?? 0,
    ];

    // Convert to Leaflet coordinates
    const initialLeafletPosition = L.latLng(latLngArray[0], latLngArray[1]);
    setInitialPosition([
      initialLeafletPosition.lat,
      initialLeafletPosition.lng,
    ]);

    setPositions(pos);
  }, [userPoopEntries, isLoading]);

  if (isLoading) return <p>Loading...</p>;
  if (positions.length < 1 || initialPosition === null)
    return <Card>You have not pooped with your location on!</Card>;

  const icon = L.icon({
    iconUrl: positions[0].userProfilePic,
    iconSize: [32, 32],
  });

  return (
    <MapContainer
      center={initialPosition}
      zoom={17}
      style={{ height: "80vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {positions.map((position, index) => (
        <Marker
          key={index}
          icon={icon}
          position={[
            position.geoPoint?.latitude ?? 0,
            position.geoPoint?.longitude ?? 0,
          ]}
        >
          <Popup>
            <PoopEntryCard entry={position} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapPage;
