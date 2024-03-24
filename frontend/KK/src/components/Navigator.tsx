import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  location: string;
};

const Navigator = ({ location }: Props) => {
  const navigate = useNavigate();

  // Navigate to the specified location
  React.useEffect(() => {
    navigate(location);
  }, [navigate, location]);

  // Return null because this component doesn't render anything
  return null;
};

export default Navigator;
