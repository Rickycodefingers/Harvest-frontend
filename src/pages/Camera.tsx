
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Scanner</h1>
        <p className="text-gray-600">Capture your invoice to get started</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!image ? (
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CameraIcon className="w-12 h-12 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Take Invoice Photo
              </h2>
              <p className="text-gray-600 mb-6">
                Position the invoice clearly in your camera frame
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
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl text-lg font-medium"
                disabled={isCapturing}
              >
                {isCapturing ? 'Processing...' : 'Open Camera'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <img
                src={image}
                alt="Captured invoice"
                className="w-full h-auto rounded-xl mb-4"
              />
              <div className="flex gap-3">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={proceedToConfirmation}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
