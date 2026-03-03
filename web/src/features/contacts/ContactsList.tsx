import { 
  Box, 
  Container, 
  Paper, 
} from '@mui/material';

import { useContactsLogic } from '../../hooks/useContactsLogic';
import NoConnectionState from '../../components/common/NoConnectionState';
import ContactsHeader from '../../components/contacts/ContactsHeader';
import ContactsListItems from '../../components/contacts/ContactsListItems';
import ContactDialog from '../../components/contacts/ContactDialog';

export default function ContactsList() {
  const {
    currentConnection,
    selectConnection,
    
    loading,
    openDialog,
    currentContact,
    availableConnections,
    loadingConnections,
    
    nameInput,
    phoneInput,
    submitting,
    searchTerm,
    filteredContacts,
    
    setSearchTerm,
    setNameInput,
    setPhoneInput,
    
    handleNavigateToMessage,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleDelete
  } = useContactsLogic();

  if (!currentConnection) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <NoConnectionState 
          loading={loadingConnections}
          connections={availableConnections}
          onSelect={selectConnection}
          moduleName="contatos"
        />
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 3, bgcolor: 'background.default' }}>
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <ContactsHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onNewContact={() => handleOpenDialog()}
          />

          <ContactsListItems 
            contacts={filteredContacts}
            loading={loading}
            searchTerm={searchTerm}
            onEdit={handleOpenDialog}
            onDelete={handleDelete}
            onMessage={handleNavigateToMessage}
          />
        </Paper>
      </Container>

      <ContactDialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        contact={currentContact}
        name={nameInput}
        phone={phoneInput}
        onNameChange={setNameInput}
        onPhoneChange={setPhoneInput}
        submitting={submitting}
      />
    </Box>
  );
}
