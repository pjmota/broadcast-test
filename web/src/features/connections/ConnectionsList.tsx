import { 
  Box, 
  Container, 
  Paper, 
} from '@mui/material';

import { useConnectionsLogic } from '../../hooks/useConnectionsLogic';
import ConnectionsHeader from '../../components/connections/ConnectionsHeader';
import ConnectionsListItems from '../../components/connections/ConnectionsListItems';
import ConnectionDialog from '../../components/connections/ConnectionDialog';

export default function ConnectionsList() {
  const {
    connections,
    loading,
    openDialog,
    currentConnection,
    nameInput,
    submitting,
    
    setNameInput,
    
    handleSelectConnection,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleDelete
  } = useConnectionsLogic();

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 3, bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <ConnectionsHeader 
            onNewConnection={() => handleOpenDialog()}
          />

          <ConnectionsListItems 
            connections={connections}
            loading={loading}
            onSelect={handleSelectConnection}
            onEdit={handleOpenDialog}
            onDelete={handleDelete}
          />
        </Paper>
      </Container>

      <ConnectionDialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        connection={currentConnection}
        name={nameInput}
        onNameChange={setNameInput}
        submitting={submitting}
      />
    </Box>
  );
}
