import { useEffect, useState } from "react";
import { PoopEntry } from "../types/PoopEntry";
import { Chip, CircularProgress, Stack } from "@mui/material";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import PoopEntryCard from "./PoopEntryCard";
import L from "leaflet";
import "../styles/styles..css";
import { brown } from "../../public/colors";
import { useAuth } from "../App";
import usePoopEntries from "../queries/usePoopEntries";

const MapPage = () => {
  const { currentUser } = useAuth();

  const [homePoops, setHomePoops] = useState<number>(0);
  const [awayPoops, setAwayPoops] = useState<number>(0);
  const [positions, setPositions] = useState<PoopEntry[]>([]);
  const [initialPosition, setInitialPosition] = useState<
    [number, number] | null
  >(null);

  const { isLoading, poopEntries } = usePoopEntries();

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
    return <CircularProgress />;

  if (isLoading) return <CircularProgress />;

  const icon = (entry: PoopEntry) => {
    return L.icon({
      iconUrl: entry.userProfilePic,
      iconRetinaUrl: entry.userProfilePic,
      iconSize: [30, 30],
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
