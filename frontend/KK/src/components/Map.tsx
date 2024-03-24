import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { firestore } from "../firebase";
import { PoopEntry } from "../types/PoopEntry";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Chip, CircularProgress, Stack } from "@mui/material";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import PoopEntryCard from "./PoopEntryCard";
import L from "leaflet";
import "../styles/styles..css";
import { brown } from "../../public/colors";

const MapPage = () => {
  const [poopsThisMonth, setPoopsThisMonth] = useState<number>(0);
  const [poopsThisYear, setPoopsThisYear] = useState<number>(0);
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
            orderBy("dateTime", "desc")
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

    let monthTotal = 0;
    let yearTotal = 0;
    let homeCount = 0;
    let awayCount = 0;

    poopEntries.forEach((entry) => {
      if (entry.geoPoint !== undefined) {
        pos.push(entry);
        const entryDate = new Date(entry.dateTime.toDate());
        const currentDate = new Date();
        if (
          entryDate.getMonth() === currentDate.getMonth() &&
          entryDate.getFullYear() === currentDate.getFullYear()
        ) {
          monthTotal++;
        }
        if (entryDate.getFullYear() === currentDate.getFullYear()) {
          yearTotal++;
        }
        if (entry.location === "home") {
          homeCount++;
        } else {
          awayCount++;
        }
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
    setPoopsThisMonth(monthTotal);
    setPoopsThisYear(yearTotal);
    setHomePoops(homeCount);
    setAwayPoops(awayCount);
  }, [poopEntries, isLoading]);

  if (positions.length < 1 || initialPosition === null || isLoading)
    return <CircularProgress />;

  const icon = (entry: PoopEntry) => {
    return L.icon({
      iconUrl: entry.userProfilePic,
      iconSize: [32, 32],
    });
  };

  return (
    <div style={{ height: "85vh", width: "100%" }}>
      <MapContainer
        zoomControl={false} // Add this line to remove zoom buttons
        center={initialPosition}
        zoom={17}
        style={{ height: "75vh", width: "100%", marginTop: "-1.5rem" }}
      >
        <div className="map-title">Drop offs</div>

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
      <Stack
        direction="row"
        justifyContent="center"
        marginTop="0.5rem"
        spacing={1}
      >
        <Chip
          variant="outlined"
          style={{
            borderColor: brown,
          }}
          label={`${poopsThisMonth} this month`}
        />
        <Chip
          variant="outlined"
          style={{
            borderColor: brown,
          }}
          label={`${poopsThisYear} this year`}
        />
        <Chip
          variant="outlined"
          style={{
            borderColor: brown,
          }}
          label={`${homePoops} home vs ${awayPoops} away`}
        />
      </Stack>
    </div>
  );
};

export default MapPage;
