import { createTheme } from '@mui/material/styles';

/**
 * Returns a customized Material-UI theme for the Maintenance System.
 * Clean, neutral, high-contrast industrial aesthetic with minimal color noise.
 * Semantic colors (red, amber, green) are reserved exclusively for critical operational status.
 *
 * @param {'light' | 'dark'} mode
 */
export const getAppTheme = (mode = 'light') => {
    const isDark = mode === 'dark';

    return createTheme({
        palette: {
            mode,
            primary: {
                main: isDark ? '#f1f5f9' : '#0f172a',
                light: isDark ? '#ffffff' : '#334155',
                dark: isDark ? '#cbd5e1' : '#020617',
                contrastText: isDark ? '#0f172a' : '#ffffff',
            },
            secondary: {
                main: isDark ? '#94a3b8' : '#475569',
                light: isDark ? '#cbd5e1' : '#64748b',
                dark: isDark ? '#64748b' : '#334155',
                contrastText: isDark ? '#0f172a' : '#ffffff',
            },
            success: {
                main: isDark ? '#22c55e' : '#16a34a',
                light: isDark ? '#4ade80' : '#22c55e',
                dark: isDark ? '#15803d' : '#14532d',
                contrastText: '#ffffff',
            },
            warning: {
                main: isDark ? '#f59e0b' : '#d97706',
                light: isDark ? '#fbbf24' : '#f59e0b',
                dark: isDark ? '#b45309' : '#92400e',
                contrastText: '#ffffff',
            },
            error: {
                main: isDark ? '#f43f5e' : '#e11d48',
                light: isDark ? '#fb7185' : '#f43f5e',
                dark: isDark ? '#be123c' : '#9f1239',
                contrastText: '#ffffff',
            },
            info: {
                main: isDark ? '#38bdf8' : '#0284c7',
                light: isDark ? '#7dd3fc' : '#38bdf8',
                dark: isDark ? '#0369a1' : '#075985',
                contrastText: '#ffffff',
            },
            background: {
                default: isDark ? '#0b0f19' : '#f8fafc',
                paper: isDark ? '#111827' : '#ffffff',
                subtle: isDark ? '#1e293b' : '#f1f5f9',
            },
            text: {
                primary: isDark ? '#f8fafc' : '#0f172a',
                secondary: isDark ? '#94a3b8' : '#64748b',
            },
            divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h4: {
                fontWeight: 700,
                letterSpacing: '-0.02em',
            },
            h5: {
                fontWeight: 600,
                letterSpacing: '-0.01em',
            },
            h6: {
                fontWeight: 600,
            },
            subtitle1: {
                fontWeight: 500,
            },
            subtitle2: {
                fontWeight: 500,
            },
            button: {
                textTransform: 'none',
                fontWeight: 600,
            },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition: 'background-color 0.2s ease, color 0.2s ease',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                        boxShadow: isDark ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                    },
                },
            },
            MuiCard: {
                defaultProps: {
                    variant: 'outlined',
                },
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                        backgroundColor: isDark ? '#111827' : '#ffffff',
                        boxShadow: 'none',
                        transition: 'border-color 0.15s ease',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 6,
                        padding: '7px 16px',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    },
                    containedPrimary: {
                        backgroundColor: isDark ? '#f1f5f9' : '#0f172a',
                        color: isDark ? '#0f172a' : '#ffffff',
                        '&:hover': {
                            backgroundColor: isDark ? '#e2e8f0' : '#1e293b',
                        },
                    },
                    containedSecondary: {
                        backgroundColor: isDark ? '#334155' : '#475569',
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: isDark ? '#475569' : '#334155',
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 6,
                        fontWeight: 500,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 12,
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    head: {
                        fontWeight: 600,
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    },
                },
            },
        },
    });
};
