import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#6200ea' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          gupshup
        </Typography>
        <Button color="inherit">WhatsApp</Button>
        <Button color="inherit">My Bots</Button>
        <Button color="inherit">My Wallet</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
