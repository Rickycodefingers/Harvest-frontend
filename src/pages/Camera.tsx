
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera as CameraIcon, RotateCcw } from 'lucide-react';

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

  const proceedToConfirmation = () => {
    // In a real app, this would process the image with OCR
    const mockInvoiceData = {
      vendor: "Fresh Foods Supplier",
      date: new Date().toISOString().split('T')[0],
      items: [
        { id: 1, name: "Organic Tomatoes", quantity: 5, unit: "kg", price: 12.50, status: "normal" },
        { id: 2, name: "Premium Olive Oil", quantity: 2, unit: "bottles", price: 28.00, status: "normal" },
        { id: 3, name: "Fresh Basil", quantity: 3, unit: "bunches", price: 8.75, status: "normal" },
        { id: 4, name: "Mozzarella Cheese", quantity: 1, unit: "kg", price: 15.20, status: "normal" }
      ]
    };
    
    localStorage.setItem('currentInvoice', JSON.stringify(mockInvoiceData));
    navigate('/confirm');
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
                  className="w-full bg-black hover:purple-600 text-white py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
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
