import styles from '../styles/pdf-list.module.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import PDFComponent from './pdf';
import ChatDialog from './ChatDialog';

export default function PdfList() {
  const [pdfs, setPdfs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState();
  const didFetchRef = useRef(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentPdfId, setCurrentPdfId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (!didFetchRef.current) {
      didFetchRef.current = true;
      fetchPdfs();
    }
  }, []);

  async function fetchPdfs(selected) {
    let path = '/pdfs';
    if (selected !== undefined) {
      path = `/pdfs?selected=${selected}`;
    }
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + path);
    const json = await res.json();
    setPdfs(json);
  }

  const debouncedUpdatePdf = useCallback(debounce((pdf, fieldChanged) => {
    updatePdf(pdf, fieldChanged);
  }, 500), []);

  function handlePdfChange(e, id) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    const copy = [...pdfs];
    const idx = pdfs.findIndex((pdf) => pdf.id === id);
    const changedPdf = { ...pdfs[idx], [name]: value };
    copy[idx] = changedPdf;
    debouncedUpdatePdf(changedPdf, name);
    setPdfs(copy);
  }

/*   async function updatePdf(pdf, fieldChanged) {
    const data = { [fieldChanged]: pdf[fieldChanged] };

    await fetch(process.env.NEXT_PUBLIC_API_URL + `/pdfs/${pdf.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  } */

/* Our Honor Student Robert Merchant finds out that the following 
version of the previous function works better:

This bug fix applies to all projects that use a select checkbox 
to select or unselect an item from a list of items on the frontend 
(PDFs, etc). There is a problem with the "updatePDF( )" function 
that gets called when a user selects (or unselects) a checkbox, 
for example a PDF file. The update fails, because the PUT operation 
is expecting ALL of the PDF item fields/columns to be replaced 
(name, file, selected), not just the "selected" column.

If you have replaced the old function with the new function, 
you will need to restart the frontend.*/

  async function updatePdf(pdf, fieldChanged) {
    const body_data = JSON.stringify(pdf);
    const url = process.env.NEXT_PUBLIC_API_URL + `/pdfs/${pdf.id}`;
 
    await fetch(url, {
        method: 'PUT',
        body: body_data,
        headers: { 'Content-Type': 'application/json' }
    });
  }


  async function handleDeletePdf(id) {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/pdfs/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const copy = pdfs.filter((pdf) => pdf.id !== id);
      setPdfs(copy);
    }
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length) {
      setSelectedFile(files[0]);
      
      // Crear un FormData y subir el archivo directamente aquí
      const formData = new FormData();
      formData.append("file", files[0]);

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/pdfs/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newPdf = await response.json();
        setPdfs([...pdfs, newPdf]);
      } else {
        alert("Error loading file.");
      }
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Please select file to load.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/pdfs/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const newPdf = await response.json();
      setPdfs([...pdfs, newPdf]);
    } else {
      alert("Error loading file.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  function handleFilterChange(value) {
    setFilter(value);
    fetchPdfs(value);
  }

  const handleChatOpen = (id) => {
    setCurrentPdfId(id);
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
    setChatMessages([]);
  };

  const handleSendMessage = async (message) => {
    if (currentPdfId && message) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pdfs/qa-pdf/${currentPdfId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: message }),
        });

        if (res.ok) {
          const answer = await res.json();
          setChatMessages((prevMessages) => [...prevMessages, { question: message, answer }]);
        } else {
          setChatMessages((prevMessages) => [...prevMessages, { question: message, answer: "Error al obtener la respuesta." }]);
        }
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        setChatMessages((prevMessages) => [...prevMessages, { question: message, answer: "Error al enviar el mensaje." }]);
      }
    }
  };

  useEffect(() => {
    if (chatOpen && chatMessages.length > 0) {
      // Forzar una actualización del componente si es necesario
      setChatMessages([...chatMessages]);
    }
  }, [chatMessages, chatOpen]);

  return (
    <div className={styles.container}>
      <div 
        className={styles.mainInputContainer} 
        onDrop={handleDrop} 
        onDragOver={(e) => e.preventDefault()}
      >
        <form onSubmit={handleUpload}>
          <input 
            className={styles.mainInput} 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
          />
          <button className={styles.loadBtn} type="submit">
            Cargar PDF
          </button>
        </form>
        <p>Arrastra y suelta tu archivo PDF aquí</p>
      </div>
      {!pdfs.length && <div>No hay archivos PDF</div>}
      {pdfs.map((pdf) => (
        <div key={pdf.id} className={styles.pdfItem}>
          <PDFComponent 
            pdf={pdf} 
            onDelete={handleDeletePdf} 
            onChange={handlePdfChange}
            onChat={handleChatOpen}
          />
        </div>
      ))}
      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${filter === undefined && styles.filterActive}`} onClick={() => handleFilterChange()}>Ver Todos</button>
        <button className={`${styles.filterBtn} ${filter === true && styles.filterActive}`} onClick={() => handleFilterChange(true)}>Ver Seleccionados</button>
        <button className={`${styles.filterBtn} ${filter === false && styles.filterActive}`} onClick={() => handleFilterChange(false)}>Ver No Seleccionados</button>
      </div>
      {chatOpen && (
        <ChatDialog
          open={chatOpen}
          onClose={handleChatClose}
          onSendMessage={handleSendMessage}
          chatMessages={chatMessages}
        />
      )}
    </div>
  );
}
