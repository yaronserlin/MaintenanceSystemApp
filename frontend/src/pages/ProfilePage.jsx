// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import faultService from '../services/faultsService';

export default function ProfilePage() {
  const { userId } = useAuth();
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFaults() {
      try {
        const all = await faultService.getAll();
        // support populated operator or raw ID
        const mine = all.filter(f => {
          const op = f.operator && (f.operator._id || f.operator);
          return op === userId;
        });
        setFaults(mine);
      } catch (err) {
        console.error(err);
        setError('Failed to load your faults');
      } finally {
        setLoading(false);
      }
    }
    loadFaults();
  }, [userId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Reported Faults
      </Typography>
      {faults.length === 0 ? (
        <Typography>No faults reported yet.</Typography>
      ) : (
        faults.map(fault => (
          <Card key={fault._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{fault.code || 'Fault'}</Typography>
              <Typography>{fault.description}</Typography>
              <Typography variant="caption" display="block">
                Status: {fault.status}
              </Typography>
              <Typography variant="caption" display="block">
                Reported: {new Date(fault.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}