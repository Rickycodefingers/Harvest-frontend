import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera as CameraIcon, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const Camera = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setIsCapturing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const proceedToConfirmation = async () => {
    if (!image) {
      toast.error('No image captured');
      return;
    }

    setIsCapturing(true);
    
    try {
      // Convert the captured image to base64
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const base64Image = canvas.toDataURL('image/jpeg');
        
        // Call the backend API
        const response = await fetch('https://gpt-invoice-parser-1.onrender.com/api/invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process invoice');
        }

        const invoiceData = await response.json();
        
        // Store the processed invoice data
        localStorage.setItem('currentInvoice', JSON.stringify(invoiceData));
        navigate('/confirmation');
      };
      
      img.src = image;
      
    } catch (error) {
      console.error('Error processing invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process invoice');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg-light">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Invoice Scanner</h1>
          <p className="text-slate-600 mt-2">Capture your invoice to get started</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {!image ? (
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CameraIcon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                  Take Invoice Photo
                </h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Position the invoice clearly in your camera frame for best results
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                  id="camera-input"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-black hover:bg-white hover:text-black border border-black hover:border-black text-white py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                  disabled={isCapturing}
                >
                  {isCapturing ? 'Processing...' : 'Open Camera'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <img
                  src={image}
                  alt="Captured invoice"
                  className="w-full h-auto rounded-xl mb-6 shadow-md"
                />
                <div className="flex gap-4">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 py-4 rounded-xl font-semibold transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    onClick={proceedToConfirmation}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                    disabled={isCapturing}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;
