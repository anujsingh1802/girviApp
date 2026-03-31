import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignatureModal = ({ isOpen, onClose, onSave }) => {
  const sigPad = useRef(null);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);

  if (!isOpen) return null;

  const clear = () => {
    sigPad.current.clear();
    setIsCanvasEmpty(true);
  };

  const handleSave = () => {
    if (sigPad.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }
    // Using toDataURL avoids issues with trim-canvas interop in some build pipelines.
    const dataURL = sigPad.current.toDataURL('image/png');
    onSave(dataURL);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] md:h-auto">
        <div className="bg-primary p-4 md:p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
             <span className="icon text-2xl">draw</span>
             <h3 className="text-xl font-bold font-heading">Digital Signature</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <span className="icon">close</span>
          </button>
        </div>

        <div className="p-4 md:p-8 flex-1 flex flex-col gap-4">
          <p className="text-textMuted text-sm md:text-base flex items-center gap-2 italic">
            <span className="icon text-primary text-lg">info</span>
            Please sign inside the box below. For best results on mobile, rotate your device.
          </p>
          
          <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-borderBase relative overflow-hidden min-h-[300px]">
            <SignatureCanvas 
              ref={sigPad}
              penColor="#0C2D57" // Using a premium dark blue/navy
              canvasProps={{
                className: "signature-canvas w-full h-full cursor-crosshair",
                style: { width: '100%', height: '100%' }
              }}
              onBegin={() => setIsCanvasEmpty(false)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <button 
              onClick={clear}
              className="flex-1 py-4 px-6 rounded-xl border-2 border-borderBase font-bold text-textMain hover:bg-gray-100 transition-all flex items-center justify-center gap-2 order-2 md:order-1"
            >
              <span className="icon">delete_sweep</span>
              Clear Pad
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] py-4 px-6 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 order-1 md:order-2"
            >
              <span className="icon">save</span>
              Confirm Signature
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .signature-canvas {
          touch-action: none;
        }
      `}</style>
    </div>
  );
};

export default SignatureModal;
