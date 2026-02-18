import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, FormControl, Typography, Alert, Radio, RadioGroup } from '@mui/material';
import Swal from 'sweetalert2';
import { viewFlows } from '../api/gupshupApi';
import { getFlowScreenName } from '../api/templatesGSApi';

const FlowSelector = ({ onClose, urlTemplatesGS, appId, authCode, onFlowSelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState('');
  const [screenName, setScreenName] = useState(null);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [screenError, setScreenError] = useState(null);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await viewFlows(appId, authCode);
      setFlows(data);
    } catch (err) {
      setError('Error al cargar los flows');
    } finally {
      setLoading(false);
    }
  };

  const handleFlowChange = (event) => {
    const flowId = event.target.value;
    setSelectedFlow(flowId);
    setScreenName(null);
    setScreenError(null);

    setLoadingScreen(true);
    getFlowScreenName(urlTemplatesGS, appId, authCode, flowId)
      .then(name => setScreenName(name))
      .catch(() => setScreenError('Error al obtener la pantalla del flow'))
      .finally(() => setLoadingScreen(false));
  };

  const handleAccept = () => {
    if (selectedFlow && screenName) {
      const selectedFlowData = flows.find(f => f.id === selectedFlow);
      onFlowSelect({
        ...selectedFlowData,
        screenName,
      });
      onClose();
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Selecciona un flow válido antes de continuar.',
        confirmButtonColor: '#00c3ff'
      });
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Seleccionar Flow</DialogTitle>
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && flows.length > 0 && (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={selectedFlow} onChange={handleFlowChange}>
              {flows.map((flow) => (
                <FormControlLabel
                  key={flow.id}
                  value={flow.id}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography><strong>{flow.name}</strong></Typography>
                      <Typography variant="body2" color="text.secondary">
                        Flow ID: {flow.id}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {selectedFlow && loadingScreen && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Obteniendo pantalla inicial...
            </Typography>
          </Box>
        )}

        {selectedFlow && !loadingScreen && screenName && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Pantalla inicial: <strong>{screenName}</strong>
          </Alert>
        )}

        {!loading && !error && flows.length === 0 && (
          <Alert severity="info">No hay flows disponibles</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          disabled={!selectedFlow || loadingScreen || !screenName}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowSelector;