import { useState } from 'react';
import Modal from '../components/Modal';

const IngestButton = () => {
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = async () => {
    setIsLoading(true);
    setOutput('');

    try {
      const response = await fetch('/api/ingest');
      const data = await response.json();

      if (response.ok) {
        setOutput(data.output);
      } else {
        setOutput(`Error: ${data.output}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button onClick={handleButtonClick} disabled={isLoading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        {isLoading ? 'Running Ingestion...' : 'Run Ingestion'}
      </button>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2">Ingestion Output</h2>
            <pre className="overflow-auto max-h-70 bg-black text-white rounded bg-grey">{output}</pre>
            <button onClick={closeModal} className="rounded-t-lg mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default IngestButton;
