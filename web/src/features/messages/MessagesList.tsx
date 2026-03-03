import { 
  Box, 
} from '@mui/material';

import MessagesSidebar from '../../components/messages/MessagesSidebar';
import ChatArea from '../../components/messages/ChatArea';
import NoConnectionState from '../../components/common/NoConnectionState';
import { useMessagesLogic } from '../../hooks/useMessagesLogic';

export default function MessagesList() {
  const {
    currentConnection,
    selectConnection,
    filteredConversations,
    currentConversation,
    contacts,
    loading,
    currentTab,
    availableConnections,
    loadingConnections,
    selectedMessage,
    selectedConversationId,
    isCreating,
    isEditing,
    contentInput,
    selectedContacts,
    scheduledDate,
    searchTerm,
    
    setSearchTerm,
    setSelectedMessage,
    setContentInput,
    setSelectedContacts,
    setScheduledDate,
    setIsCreating,
    
    handleTabChange,
    handleCreateNew,
    handleEditMessage,
    handleSelectConversation,
    handleSelectMessageForEdit,
    handleSubmit,
    getContactNames,
    submitting
  } = useMessagesLogic();

  if (!currentConnection) {
    return (
      <NoConnectionState 
        loading={loadingConnections}
        connections={availableConnections}
        onSelect={selectConnection}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', bgcolor: '#f0f2f5' }}>
      {/* Sidebar - Lista de Mensagens */}
      <MessagesSidebar
        conversations={filteredConversations}
        contacts={contacts}
        loading={loading}
        selectedConversationId={selectedConversationId}
        currentTab={currentTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onTabChange={handleTabChange}
        onSelectConversation={handleSelectConversation}
        onCreateNew={handleCreateNew}
        getContactNames={getContactNames}
      />

      {/* Área Principal - Chat / Detalhes */}
      <ChatArea
        isCreating={isCreating}
        isEditing={isEditing}
        selectedMessage={selectedMessage}
        currentConversation={currentConversation}
        contacts={contacts}
        contentInput={contentInput}
        selectedContacts={selectedContacts}
        scheduledDate={scheduledDate}
        submitting={submitting}
        currentTab={currentTab}
        onContentChange={setContentInput}
        onContactsChange={setSelectedContacts}
        onDateChange={setScheduledDate}
        onSubmit={handleSubmit}
        onEditMessage={handleEditMessage}
        onSelectMessageForEdit={handleSelectMessageForEdit}
        getContactNames={getContactNames}
      />
    </Box>
  );
}
