import React from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TranslateIcon from "@mui/icons-material/Translate";
import PinDropIcon from "@mui/icons-material/PinDrop";

type Props = {
  currentRoute: string;
  currentLang: string;
  setCurrentLang: React.Dispatch<React.SetStateAction<string>>;
  onlineProfiles: number;
};

const BottomBar = ({
  currentRoute,
  currentLang,
  setCurrentLang,
  onlineProfiles,
}: Props) => {
  return (
    <>
      <BottomNavigation
        value={currentRoute}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99,
          backgroundColor: "rgba(23, 23, 23, 0.8)",
        }}
      >
        <BottomNavigationAction
          value="/"
          icon={<HomeIcon />}
          component={Link}
          to="/"
        />
        <BottomNavigationAction
          value="/map"
          icon={<PinDropIcon />}
          component={Link}
          to="/map"
        />
        <BottomNavigationAction
          value="/add-poop"
          icon={<AddCircleOutlineIcon />}
          component={Link}
          to="/add-poop"
        />
        <BottomNavigationAction
          value="/user"
          icon={
            <Badge badgeContent={onlineProfiles} color="secondary">
              <AccountCircleIcon />
            </Badge>
          }
          component={Link}
          to="/user"
        />
        <BottomNavigationAction
          icon={<TranslateIcon />}
          showLabel
          label={currentLang}
          component={Box}
          onClick={() => setCurrentLang(currentLang === "en" ? "fr" : "en")}
        />
      </BottomNavigation>
    </>
  );
};

export default BottomBar;
