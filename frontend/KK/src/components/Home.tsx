import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Home: React.FC = () => {
  return (
    <div>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2">
              Welcome to the Poop Tracker
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              Keep track of your poops here!
            </Typography>
          </CardContent>
        </Card>
    </div>
  );
};

export default Home;
