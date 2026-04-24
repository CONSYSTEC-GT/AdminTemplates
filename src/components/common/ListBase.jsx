// components/ListBase.jsx
import React, { useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Chip,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Fade,
    LinearProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import PhoneIcon from '@mui/icons-material/Phone';
import ReplyIcon from '@mui/icons-material/Reply';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import FechaModificacion from '../../utils/FechaModificacion';

const ListBase = ({
    templates = [],
    handleEdit,
    handleDeleteClick,
    showReasonAlert,
    parseTemplateContent,
    getStatusColor,
    getStatusDotColor,
    getStatusTextColor
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleClickMenu = (event, template) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedTemplate(template);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedTemplate(null);
    };

    const getButtonsFromTemplate = (template) => {
        try {
            const containerMeta = JSON.parse(template.gupshup.containerMeta);
            return containerMeta.buttons || [];
        } catch {
            return [];
        }
    };

    const getButtonIcon = (type) => {
        const icons = {
            QUICK_REPLY: <ReplyIcon fontSize="small" />,
            URL: <LinkIcon fontSize="small" />,
            PHONE_NUMBER: <PhoneIcon fontSize="small" />,
            CATALOG: <ProductionQuantityLimitsIcon fontSize="small" />,
            FLOW: <AccountTreeIcon fontSize="small" />
        };
        return icons[type] || null;
    };

    if (!templates.length) {
        return (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Typography>No hay plantillas para mostrar</Typography>
            </Box>
        );
    }

    return (
        <>
            <TableContainer
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                    <Table stickyHeader size="medium">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Categoría</TableCell>
                                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Tipo</TableCell>
                                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Botones</TableCell>
                                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Modificado</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, minWidth: 80 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {templates.map((template, index) => (
                                <motion.tr
                                    key={template.gupshup.id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ textDecoration: 'none' }}
                                    sx={{
                                        '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                                        transition: 'background-color 0.2s ease'
                                    }}
                                >
                                    {/* Nombre */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={500}
                                                sx={{
                                                    maxWidth: 180,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {template.gupshup.elementName}
                                            </Typography>
                                            {template.gupshup.reason && (
                                                <Tooltip title="Ver razón de rechazo">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            showReasonAlert(template.gupshup.reason);
                                                        }}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>

                                    {/* Estado */}
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={template.gupshup.status}
                                            sx={{
                                                bgcolor: getStatusColor(template.gupshup.status),
                                                color: getStatusTextColor(template.gupshup.status),
                                                fontWeight: 500,
                                                '& .MuiChip-label': { px: 1 },
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                            icon={
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: '50%',
                                                        backgroundColor: getStatusDotColor(template.gupshup.status)
                                                    }}
                                                />
                                            }
                                        />
                                    </TableCell>

                                    {/* Categoría */}
                                    <TableCell>
                                        <Typography variant="body2">{template.gupshup.category}</Typography>
                                    </TableCell>

                                    {/* Tipo */}
                                    <TableCell>
                                        <Typography variant="body2">{template.gupshup.templateType}</Typography>
                                    </TableCell>

                                    {/* Botones */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {getButtonsFromTemplate(template).slice(0, 3).map((btn, i) => (
                                                <Chip
                                                    key={i}
                                                    size="small"
                                                    label={btn.text}
                                                    variant="outlined"
                                                    sx={{ fontSize: 11, height: 24 }}
                                                    icon={getButtonIcon(btn.type)}
                                                />
                                            ))}
                                            {getButtonsFromTemplate(template).length > 3 && (
                                                <Chip
                                                    size="small"
                                                    label={`+${getButtonsFromTemplate(template).length - 3}`}
                                                    variant="outlined"
                                                    sx={{ fontSize: 11, height: 24 }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>

                                    {/* Fecha de modificación */}
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            <FechaModificacion timestamp={template.gupshup.modifiedOn} />
                                        </Typography>
                                    </TableCell>

                                    {/* Acciones */}
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleClickMenu(e, template)}
                                            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </TableContainer>

            {/* Menú contextual */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                TransitionComponent={Fade}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem
                    onClick={() => { handleEdit(selectedTemplate); handleCloseMenu(); }}
                    sx={{ gap: 1 }}
                >
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Editar</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => { handleDeleteClick(selectedTemplate); handleCloseMenu(); }}
                    sx={{ gap: 1, color: 'error.main' }}
                >
                    <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Eliminar</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

export default ListBase;