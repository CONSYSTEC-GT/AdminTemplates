import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Templates" {...a11yProps(0)} />
          {/* Agrega más pestañas aquí si es necesario */}
        </Tabs>
        {/* Logo a la derecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <img src="src\assets\LOGO.png" alt="Logo" style={{ height: '60px' }} />
          {/* O puedes usar Typography para texto */}
          {/* <Typography variant="h6" sx={{ ml: 1 }}>Tu Logo</Typography> */}
        </Box>
      </Box>
      {/* Contenido de las pestañas */}
      <CustomTabPanel value={value} index={0}>
        {/* Contenido para la pestaña "Templates" */}
        
      </CustomTabPanel>
    </Box>
  );
}
