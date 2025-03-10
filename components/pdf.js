import React, { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/pdf.module.css';
import ChatDialog from './ChatDialog';

export default function PDFComponent(props) {
  const { pdf, onChange, onDelete, onChat } = props;
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

  const handleChatOpen = () => {
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
  };

  const handleSendMessage = async (message) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pdfs/qa-pdf/${pdf.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: message }),
      });

      if (res.ok) {
        const answer = await res.json();
        setChatMessages(prevMessages => [...prevMessages, { question: message, answer }]);
      } else {
        setChatMessages(prevMessages => [...prevMessages, 
          { question: message, answer: "Error al obtener la respuesta." }
        ]);
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setChatMessages(prevMessages => [...prevMessages, 
        { question: message, answer: "Error al enviar el mensaje." }
      ]);
    }
  };

  return (
    <div className={styles.pdfRow}>
      <input
        className={styles.pdfCheckbox}
        name="selected"
        type="checkbox"
        checked={pdf.selected}
        onChange={(e) => onChange(e, pdf.id)}
      />
      <input
        className={styles.pdfInput}
        autoComplete="off"
        name="name"
        type="text"
        value={pdf.name}
        onChange={(e) => onChange(e, pdf.id)}
      />
      <a
        href={pdf.file}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.viewPdfLink}
      >
        <Image src="/document-view.svg" width="22" height="22" alt="view" />
      </a>
      <button
        className={styles.actionBtn}
        onClick={() => onDelete(pdf.id)}
      >
        <Image src="/delete-outline.svg" width="24" height="24" alt="delete" />
      </button>
      <button
        className={styles.actionBtn}
        onClick={handleChatOpen}
        title="Chat sobre PDF"
      >
        <Image 
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEwklEQVR4nO1YW0h0VRT+NMUL+BKCjiIqDhSCMD31kCle8sWCiCSlIu8hghqiFt7tITVBkKCHLqiopCQo3t5K8aHiLwq8hNqDmpfQF53REcqZFWuz93Caf+7OHA38YON4zj57rW/vtb691wYe8QhdkQzgUwA7AK4B2ACQbDb5bA/AVwCewwPCmwCONc762o4AvH2fjr8A4E/lUGRkJOXl5dHg4CCtr6/T3t4eXV1dica/+Rm/4z7cV0PkUI6lK+pViERFRVFtbS2dnJyQrzg/P6e2tjaKjY1VJOwA2vRy/ms1e0VFRXR6ekqBgkkXFhZqV+PLUDvfy4bCwsKoq6uLbDYb3RW3t7fU2dkpxpQkPgmV828pI319fRRs8JhycjicXg+28+EAzGygurqaQoWqqipnpbJJ+f0DwCiAzEAJfM4DJicnk8ViCRkBHjspKckX+X3DH+cjAPzDH09MTFCoMT4+LhxNT0+n3d1db/Jr8oVAM39gMBiCkrS+JHViYqJwcnV11Zv8coh94I3AE+7c0NBAeqG+vl442Nra6qv88vHELS650/Lysm4ElpaWhGM5OTn+yO/H7giIHXd7e1s3AltbW8IpDiU/5ZfPZU9BdDCbzaQX2BbkMcVP+TVLyX+awM3NDemFi4sLvwg4ye9nLgkcHR2R3iFkMBj8ll8Afzuvgk3vJF5cXPSaxJ7kF0CDlsAVP2xpaSG9UFdX51FGvckvgJ+0BH7jh6mpqYJlqME2EhIShCNra2sByS+ACy0BrnPFi6mpKQo1xsbGhC2j0Uh2uz2g3JFh78DLigCfT7hEDKV8cuIGOllmKb+yORAG4Hf1oqamhkKFiooKYSM7O9vv2WdYrVaXBBgVqhLjv0NDQ0F3vqenR4wdFxdHGxsbAY1xeHjolgDr6s/ac3lvb29As+Qqadvb28WYERERtLKycmf5hVMOKGTK6shBori4WCxboODNMT8/3+H86Ogo3QXNzc3KNwvc4DUAt1oSMzMzfhvim4zGxkaKjo4WY/AxgAuXu65kSkqK8usXeMC7qkKLiYkRRYbC7OwsjYyMiELk+PhYrA6r1s7OjtD0/v5+ys3NFbPN34eHh1NZWdmdrmYUJicntfHfDy841Rb4l5eXVFpa6vO1IhMoKSmhzc1NCgYsFgulpaVpbbzkyfmPuBOXdQcHBzQ/P08ZGRlenY6Pj6fy8nIR59pVCwYqKyu1tral9LtEjjrcZWVlkclk8nnWubFUBhsDAwOqoFF2yj3N/n9UyEXj9xMAfgTwF4Ab5z4dHR1BOVPZ7Xbq7u52tv/EVUGjhSfnf3Vz8ZQpZc3Rt6CgQCR5oLi+vhYS7mLynvfkvDsCnNC1AJ7x8F2Js/yygjU1NQWkQNPT084+3Pp6Hfk9AKu86uNQeRVApC8fAnjPmYRSJJZWlliWWpZcll6r1SpWiSV5eHiY5ubmHATOzs4ce4iU9HegE14BcO5P4kPTeM9Qlwsa5eEI0BVJAL4JlITRaKSFhQXa398XYSiff4h7wIsAvlW7ur/NZDIJKZf/26TE3wuelfnxhZTBUym/N1KKf5D55k3CuXZ/0MhU9bmH9uARAeB9dRb7PxJQiJRH+wkp6Szt3znePuIRCAr+BbTjIlTpH3NmAAAAAElFTkSuQmCC" 
          alt="chat" 
          width="24" 
          height="24"
        />
      </button>
      <ChatDialog 
        open={chatOpen} 
        onClose={handleChatClose} 
        onSendMessage={handleSendMessage}
        chatMessages={chatMessages} 
      />
    </div>
  );
}
