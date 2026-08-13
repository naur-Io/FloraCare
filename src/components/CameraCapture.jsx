import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (traseira) ou 'user' (frontal)
  const [capturedImage, setCapturedImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    setErrorMsg('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      setErrorMsg('Não foi possível acessar a câmera. Verifique as permissões do seu navegador.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '520px', background: '#0f271b', color: '#fff' }}>
        <div className="modal-header" style={{ background: '#0f271b', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
          <span style={{ fontWeight: '700', color: '#fff' }}>Tirar Foto da Planta</span>
          <button className="modal-close" onClick={onClose} style={{ color: '#fff' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px', textAlign: 'center' }}>
          {errorMsg ? (
            <div style={{ padding: '30px 10px', color: '#fca5a5' }}>
              <p>{errorMsg}</p>
              <button className="btn btn-secondary" onClick={onClose} style={{ marginTop: '16px' }}>
                Voltar
              </button>
            </div>
          ) : capturedImage ? (
            <div>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '380px', marginBottom: '16px' }}>
                <img src={capturedImage} alt="Foto capturada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={retakePhoto}>
                  <RefreshCw size={16} />
                  <span>Tirar Outra</span>
                </button>
                <button className="btn btn-primary" onClick={confirmPhoto}>
                  <Check size={16} />
                  <span>Usar Esta Foto</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', maxHeight: '380px', marginBottom: '16px' }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <button 
                  onClick={toggleCamera}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Alternar Câmera"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={takePhoto}
                  style={{ padding: '14px 28px', fontSize: '1rem' }}
                >
                  <Camera size={20} />
                  <span>Capturar Foto</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
