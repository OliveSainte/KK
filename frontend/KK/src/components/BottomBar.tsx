import React from "react";
import { Link } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ViewListIcon from "@mui/icons-material/ViewList";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TranslateIcon from "@mui/icons-material/Translate";

type Props = {
  currentRoute: string;
  currentLang: string;
  setCurrentLang: React.Dispatch<React.SetStateAction<string>>;
};

const BottomBar = ({ currentRoute, currentLang, setCurrentLang }: Props) => {
  return (
    <>
      {/* Main content container */}
      <div style={{ paddingBottom: "56px" }}>
        {/* Add 56px padding to the bottom to accommodate the BottomNavigation bar */}
        {/* Adjust the value as needed based on the BottomNavigation height */}
        {/* Content goes here */}
      </div>
      {/* BottomNavigation bar */}
      <BottomNavigation
        value={currentRoute}
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigationAction
          value="/"
          icon={<HomeIcon />}
          component={Link}
          to="/"
        />
        <BottomNavigationAction
          value="/add-poop"
          icon={<AddCircleOutlineIcon />}
          component={Link}
          to="/add-poop"
        />
        <BottomNavigationAction
          value="/see-poops"
          icon={<ViewListIcon />}
          component={Link}
          to="/see-poops"
        />
        <BottomNavigationAction
          value="/user"
          icon={<AccountCircleIcon />}
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
