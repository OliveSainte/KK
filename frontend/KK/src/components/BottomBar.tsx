import React from "react";
import { Link } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ViewListIcon from "@mui/icons-material/ViewList";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

type Props = {
  currentRoute: string;
};

const BottomBar = ({ currentRoute }: Props) => {
  return (
    <BottomNavigation
      value={currentRoute}
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
    >
      <BottomNavigationAction
        label="feed"
        value="/"
        icon={<HomeIcon />}
        component={Link}
        to="/"
      />
      <BottomNavigationAction
        label="pooped?"
        value="/add-poop"
        icon={<AddCircleOutlineIcon />}
        component={Link}
        to="/add-poop"
      />
      <BottomNavigationAction
        label="poops"
        value="/see-poops"
        icon={<ViewListIcon />}
        component={Link}
        to="/see-poops"
      />
      <BottomNavigationAction
        label="user"
        value="/user"
        icon={<AccountCircleIcon />}
        component={Link}
        to="/user"
      />
    </BottomNavigation>
  );
};

export default BottomBar;
