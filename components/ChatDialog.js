import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function ChatDialog({ open, onClose, onSendMessage, chatMessages = [] }) {
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e?.preventDefault(); // Prevenir el comportamiento por defecto si viene de un evento
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      // Asegurarse de que el diálogo permanezca montado
      keepMounted
    >
      <DialogTitle>Chat sobre PDF</DialogTitle>
      <DialogContent>
        <div 
          style={{ 
            maxHeight: '300px', 
            overflowY: 'auto', 
            marginBottom: '10px',
            padding: '10px'
          }}
        >
          {chatMessages && chatMessages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', color: '#2196f3' }}>
                Pregunta: {msg.question}
              </div>
              <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
                Respuesta: {msg.answer}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage}>
          <TextField
            autoFocus
            margin="dense"
            label="Escribe tu pregunta"
            type="text"
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
        <Button onClick={handleSendMessage} color="primary">
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
} 