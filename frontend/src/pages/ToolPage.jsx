// src/pages/ToolPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    CardActions,
    IconButton,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import toolsService from '../services/toolsService';

/**
 * ToolPage displays a single tool and its faults; clicking a fault opens a dialog with details.
 */
export default function ToolPage() {
    const { id } = useParams();
    const [tool, setTool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFault, setSelectedFault] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        toolsService
            .getById(id)
            .then((data) => setTool(data))
            .catch((err) => {
                console.error(err);
                setError('Failed to load tool data');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleFaultClick = (fault) => {
        setSelectedFault(fault);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setSelectedFault(null);
    };

    const handleEditClick = (fault) => {
        // TODO: open edit dialog or navigate to edit page
        console.log('Edit fault', fault._id);
    };

    const handleDeleteClick = (fault) => {
        // TODO: confirm and delete fault via service
        console.log('Delete fault', fault._id);
    };

    if (loading) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!tool) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography>No tool found.</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>{tool.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Serial: {tool.serialNumber || tool.localSerialNumber}
            </Typography>
            <Typography paragraph>{tool.description}</Typography>

            <Typography variant="h5" gutterBottom>Faults</Typography>
            {tool.faults.length === 0
                ? <Typography>No faults recorded for this tool.</Typography>
                : (
                    <Grid container spacing={2}>
                        {tool.faults.map((fault) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fault._id}>
                                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <CardActionArea onClick={() => handleFaultClick(fault)} sx={{ flexGrow: 1 }}>
                                        <CardContent>
                                            <Typography variant="h6">{fault.code || 'Fault'}</Typography>
                                            <Typography variant="body2" gutterBottom>{fault.description}</Typography>
                                            <Typography variant="caption" display="block">Status: {fault.status}</Typography>
                                            <Typography variant="caption" display="block">
                                                Reported: {new Date(fault.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                    <CardActions>
                                        <IconButton
                                            aria-label="edit fault"
                                            onClick={() => handleEditClick(fault)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            aria-label="delete fault"
                                            onClick={() => handleDeleteClick(fault)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

            {/* Fault Details Dialog */}
            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Fault Details</DialogTitle>
                <DialogContent dividers>
                    {selectedFault && (
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Code"
                                    secondary={selectedFault.code || 'N/A'}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Description"
                                    secondary={selectedFault.description}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Operator"
                                    secondary={selectedFault.operator?._id || selectedFault.operator}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Status"
                                    secondary={selectedFault.status}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Reported At"
                                    secondary={new Date(selectedFault.createdAt).toLocaleString()}
                                />
                            </ListItem>
                            {selectedFault.status === 'closed' && (
                                <ListItem>
                                    <ListItemText
                                        primary="Closed At"
                                        secondary={selectedFault.closedAt
                                            ? new Date(selectedFault.closedAt).toLocaleString()
                                            : 'N/A'}
                                    />
                                </ListItem>
                            )}
                            {selectedFault.photos?.length > 0 && (
                                <ListItem>
                                    <ListItemText
                                        primary="Photos"
                                        secondary={selectedFault.photos.join(', ')}
                                    />
                                </ListItem>
                            )}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

// // src/pages/ToolPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import {
//     Container,
//     Typography,
//     Grid,
//     Card,
//     CardContent,
//     CardActionArea,
//     CircularProgress,
//     Alert,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     List,
//     ListItem,
//     ListItemText,
//     Button,
// } from '@mui/material';
// import toolsService from '../services/toolsService';
// import ErrorComponent from '../components/ErrorComponent/ErrorComponent';
// import LoadingComponent from '../components/LoadingComponent/LoadingComponent';

// /**
//  * ToolPage displays a single tool and its faults; clicking a fault opens a dialog with details.
//  */
// export default function ToolPage() {
//     const { id } = useParams();
//     const [tool, setTool] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [selectedFault, setSelectedFault] = useState(null);
//     const [dialogOpen, setDialogOpen] = useState(false);

//     useEffect(() => {
//         toolsService
//             .getById(id)
//             .then((data) => setTool(data))
//             .catch((err) => {
//                 console.error(err);
//                 setError('Failed to load tool data');
//             })
//             .finally(() => setLoading(false));
//     }, [id]);

//     const handleFaultClick = (fault) => {
//         setSelectedFault(fault);
//         setDialogOpen(true);
//     };

//     const handleClose = () => {
//         setDialogOpen(false);
//         setSelectedFault(null);
//     };

//     if (loading) {
//         return (
//             <LoadingComponent />
//         );
//     }

//     if (error) {
//         return (
//             <ErrorComponent message={error} onRetry={() => window.location.reload()} />
//         );
//     }

//     if (!tool) {
//         return (
//             <Container sx={{ mt: 4 }}>
//                 <Typography>No tool found.</Typography>
//             </Container>
//         );
//     }

//     return (
//         <Container sx={{ mt: 4 }}>
//             <Typography variant="h4" gutterBottom>{tool.name}</Typography>
//             <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//                 Serial: {tool.serialNumber || tool.localSerialNumber}
//             </Typography>
//             <Typography variant="subtitle1" color="text.secondary" component={'p'}>{tool.description}</Typography>

//             <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>Faults</Typography>
//             {tool.faults.length === 0
//                 ? <Typography>No faults recorded for this tool.</Typography>
//                 : (
//                     <Grid container spacing={2}>
//                         {tool.faults.map((fault) => (
//                             <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fault._id}>
//                                 <Card sx={{ height: '100%' }}>
//                                     <CardActionArea onClick={() => handleFaultClick(fault)}>
//                                         <CardContent>
//                                             <Typography variant="h6">{fault.code || 'Fault'}</Typography>
//                                             <Typography variant="body2" gutterBottom>{fault.description}</Typography>
//                                             <Typography variant="caption" display="block">Status: {fault.status}</Typography>
//                                             <Typography variant="caption" display="block">
//                                                 Reported: {new Date(fault.createdAt).toLocaleDateString()}
//                                             </Typography>
//                                         </CardContent>
//                                     </CardActionArea>
//                                 </Card>
//                             </Grid>
//                         ))}
//                     </Grid>
//                 )}

//             {/* Fault Details Dialog */}
//             <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
//                 <DialogTitle>Fault Details</DialogTitle>
//                 <DialogContent dividers>
//                     {selectedFault && (
//                         <List>
//                             <ListItem>
//                                 <ListItemText
//                                     primary="Code"
//                                     secondary={selectedFault.code || 'N/A'}
//                                 />
//                             </ListItem>
//                             <ListItem>
//                                 <ListItemText
//                                     primary="Description"
//                                     secondary={selectedFault.description}
//                                 />
//                             </ListItem>
//                             <ListItem>
//                                 <ListItemText
//                                     primary="Operator"
//                                     secondary={selectedFault.operator?._id || selectedFault.operator}
//                                 />
//                             </ListItem>
//                             <ListItem>
//                                 <ListItemText
//                                     primary="Status"
//                                     secondary={selectedFault.status}
//                                 />
//                             </ListItem>
//                             <ListItem>
//                                 <ListItemText
//                                     primary="Reported At"
//                                     secondary={new Date(selectedFault.createdAt).toLocaleString()}
//                                 />
//                             </ListItem>
//                             {selectedFault.status === 'closed' && (
//                                 <ListItem>
//                                     <ListItemText
//                                         primary="Closed At"
//                                         secondary={selectedFault.closedAt
//                                             ? new Date(selectedFault.closedAt).toLocaleString()
//                                             : 'N/A'}
//                                     />
//                                 </ListItem>
//                             )}
//                             {selectedFault.photos?.length > 0 && (
//                                 <ListItem>
//                                     <ListItemText
//                                         primary="Photos"
//                                         secondary={selectedFault.photos.join(', ')}
//                                     />
//                                 </ListItem>
//                             )}
//                         </List>
//                     )}
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleClose}>Close</Button>
//                 </DialogActions>
//             </Dialog>
//         </Container>
//     );
// }

// // src/pages/ToolPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import {
//     Container,
//     Typography,
//     Grid,
//     Card,
//     CardContent,
//     CircularProgress,
//     Alert,
// } from '@mui/material';
// import toolsService from '../services/toolsService';

// /**
//  * ToolPage displays details for a single tool and its associated faults.
//  */
// export default function ToolPage() {
//     const { id } = useParams();
//     const [tool, setTool] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         toolsService
//             .getById(id)
//             .then((data) => {
//                 setTool(data);
//             })
//             .catch((err) => {
//                 console.error(err);
//                 setError('Failed to load tool data');
//             })
//             .finally(() => setLoading(false));
//     }, [id]);

//     if (loading) {
//         return (
//             <Container sx={{ mt: 4, textAlign: 'center' }}>
//                 <CircularProgress />
//             </Container>
//         );
//     }

//     if (error) {
//         return (
//             <Container sx={{ mt: 4 }}>
//                 <Alert severity="error">{error}</Alert>
//             </Container>
//         );
//     }

//     if (!tool) {
//         return (
//             <Container sx={{ mt: 4 }}>
//                 <Typography>No tool found.</Typography>
//             </Container>
//         );
//     }

//     return (
//         <Container sx={{ mt: 4 }}>
//             <Typography variant="h4" gutterBottom>
//                 {tool.name}
//             </Typography>
//             <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//                 Serial: {tool.serialNumber || tool.localSerialNumber}
//             </Typography>
//             <Typography component="p">{tool.description}</Typography>

//             <Typography variant="h5" gutterBottom>
//                 Faults
//             </Typography>
//             {tool.faults.length === 0 ? (
//                 <Typography>No faults recorded for this tool.</Typography>
//             ) : (
//                 <Grid container spacing={2}>
//                     {tool.faults.map((fault) => (
//                         <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fault._id}>
//                             <Card sx={{ height: '100%' }}>
//                                 <CardContent>
//                                     <Typography variant="h6">
//                                         {fault.code || 'Fault'}
//                                     </Typography>
//                                     <Typography variant="body2" gutterBottom>
//                                         {fault.description}
//                                     </Typography>
//                                     <Typography variant="caption" display="block">
//                                         Status: {fault.status}
//                                     </Typography>
//                                     <Typography variant="caption" display="block">
//                                         Reported: {new Date(fault.createdAt).toLocaleDateString('en-GB')}
//                                     </Typography>
//                                     {fault.photos?.length > 0 && (
//                                         <Typography variant="caption" display="block">
//                                             Photos: {fault.photos.length}
//                                         </Typography>
//                                     )}
//                                 </CardContent>
//                             </Card>
//                         </Grid>
//                     ))}
//                 </Grid>
//             )}
//         </Container>
//     );
// }




// // src/pages/ToolPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import {
//     Container,
//     Typography,
//     Box,
//     Tabs,
//     Tab,
//     CircularProgress,
//     Grid
// } from '@mui/material';
// import apiClient from '../services/apiClient';
// import FaultCard from '../components/FaultCard/FaultCard';

// // Utility for rendering tab panels
// function TabPanel({ children, value, index }) {
//     return (
//         <div
//             role="tabpanel"
//             hidden={value !== index}
//             id={`tool-tabpanel-${index}`}
//             aria-labelledby={`tool-tab-${index}`}
//         >
//             {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
//         </div>
//     );
// }

// export default function ToolPage() {
//     const { toolId } = useParams();
//     const [tab, setTab] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [faults, setFaults] = useState([]);
//     const [history, setHistory] = useState([]);
//     const [maintenanceBook, setMaintenanceBook] = useState([]);
//     const [parts, setParts] = useState([]);
//     const [tool, setTool] = useState(null);

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const [
//                     // faultsRes,
//                     // historyRes, 
//                     // maintenanceRes, 
//                     // partsRes, 
//                     toolRes] = await Promise.all([
//                         // apiClient.get(`/faults/${toolId}`),
//                         // apiClient.get(`/tools/${toolId}/history`),
//                         // apiClient.get(`/tools/${toolId}/maintenance-book`),
//                         // apiClient.get(`/tools/${toolId}/parts`),
//                         apiClient.get(`/tools/${toolId}`) // Fetch tool details
//                     ]);
//                 // setFaults(faultsRes.data.faults || faultsRes.data);
//                 // setHistory(historyRes.data.history || historyRes.data);
//                 // setMaintenanceBook(maintenanceRes.data.entries || maintenanceRes.data);
//                 // setParts(partsRes.data.parts || partsRes.data);
//                 setTool(toolRes.data.tool || toolRes.data);
//                 setFaults(toolRes.data.faults || []);
//             } catch (err) {
//                 console.error('Error fetching tool data:', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [toolId]);

//     const handleTabChange = (event, newValue) => {
//         setTab(newValue);
//     };

//     if (loading) {
//         return (
//             <Container sx={{ mt: 4, textAlign: 'center' }}>
//                 <CircularProgress />
//             </Container>
//         );
//     }

//     return (
//         <Container sx={{ mt: 4 }}>
//             <Typography variant="h4" gutterBottom>
//                 Name: {tool.name}
//             </Typography>
//             <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//                 {tool.description ? `Description: ${tool.description}` : 'No description available.'}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" gutterBottom>
//                 {tool.serialNumber ? `Serial Number: ${tool.serialNumber}` : 'No serial number available.'}
//             </Typography>

//             <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//                 <Tabs value={tab} onChange={handleTabChange} aria-label="Tool page tabs">
//                     <Tab label="Fault List" id="tool-tab-0" />
//                     <Tab label="Maintenance History" id="tool-tab-1" />
//                     <Tab label="Maintenance Book" id="tool-tab-2" />
//                     <Tab label="Parts Book" id="tool-tab-3" />
//                 </Tabs>
//             </Box>

//             {/* Fault List */}
//             <TabPanel value={tab} index={0}>
//                 {faults.length === 0 ? (
//                     <Typography>No faults for this tool.</Typography>
//                 ) : (
//                     <Grid container spacing={2}>
//                         {faults.map(fault => (
//                             <Grid key={fault._id}>
//                                 <FaultCard fault={{ ...fault, toolId }} />
//                             </Grid>
//                         ))}
//                     </Grid>
//                 )}
//             </TabPanel>

//             {/* Maintenance History */}
//             <TabPanel value={tab} index={1}>
//                 {/* TODO: Replace with MaintenanceHistory component */}
//                 {history.length === 0 ? (
//                     <Typography>No maintenance history entries yet.</Typography>
//                 ) : (
//                     history.map(entry => (
//                         <Box key={entry.id} sx={{ mb: 2 }}>
//                             <Typography variant="subtitle1">{entry.description}</Typography>
//                             <Typography variant="caption" color="text.secondary">
//                                 {new Date(entry.date).toLocaleDateString()}
//                             </Typography>
//                         </Box>
//                     ))
//                 )}
//             </TabPanel>

//             {/* Maintenance Book */}
//             <TabPanel value={tab} index={2}>
//                 {/* TODO: Replace with MaintenanceBook component */}
//                 {maintenanceBook.length === 0 ? (
//                     <Typography>No maintenance book entries yet.</Typography>
//                 ) : (
//                     maintenanceBook.map(entry => (
//                         <Box key={entry.id} sx={{ mb: 2 }}>
//                             <Typography variant="subtitle1">{entry.note}</Typography>
//                             <Typography variant="caption" color="text.secondary">
//                                 {new Date(entry.date).toLocaleDateString()}
//                             </Typography>
//                         </Box>
//                     ))
//                 )}
//             </TabPanel>

//             {/* Parts Book */}
//             <TabPanel value={tab} index={3}>
//                 {/* TODO: Replace with PartsBook component */}
//                 {parts.length === 0 ? (
//                     <Typography>No parts recorded yet.</Typography>
//                 ) : (
//                     parts.map(part => (
//                         <Box key={part.id} sx={{ mb: 2 }}>
//                             <Typography variant="subtitle1">{part.name} (Qty: {part.quantity})</Typography>
//                             <Typography variant="caption" color="text.secondary">
//                                 Purchased: {new Date(part.purchasedAt).toLocaleDateString()}
//                             </Typography>
//                         </Box>
//                     ))
//                 )}
//             </TabPanel>
//         </Container>
//     );
// }
