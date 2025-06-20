
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Edit, Minus, Plus } from 'lucide-react';

interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'normal' | 'credited' | 'returned';
}

interface Invoice {
  vendor: string;
  date: string;
  items: InvoiceItem[];
}

const Confirmation = () => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedInvoice = localStorage.getItem('currentInvoice');
    if (storedInvoice) {
      setInvoice(JSON.parse(storedInvoice));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const updateItemStatus = (itemId: number, status: 'normal' | 'credited' | 'returned') => {
    if (!invoice) return;
    
    const updatedItems = invoice.items.map(item =>
      item.id === itemId ? { ...item, status } : item
    );
    
    setInvoice({ ...invoice, items: updatedItems });
  };

  const updateItemQuantity = (itemId: number, change: number) => {
    if (!invoice) return;
    
    const updatedItems = invoice.items.map(item =>
      item.id === itemId 
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    );
    
    setInvoice({ ...invoice, items: updatedItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'credited': return 'bg-blue-600 text-blue-100';
      case 'returned': return 'bg-red-600 text-red-100';
      default: return 'bg-green-600 text-green-100';
    }
  };

  const getTotalAmount = () => {
    if (!invoice) return 0;
    return invoice.items.reduce((total, item) => {
      if (item.status === 'credited') return total - (item.quantity * item.price);
      if (item.status === 'returned') return total;
      return total + (item.quantity * item.price);
    }, 0);
  };

  const confirmInvoice = () => {
    if (!invoice) return;
    
    const existingInvoices = JSON.parse(localStorage.getItem('confirmedInvoices') || '[]');
    const confirmedInvoice = {
      ...invoice,
      id: Date.now(),
      totalAmount: getTotalAmount(),
      confirmedAt: new Date().toISOString()
    };
    
    existingInvoices.push(confirmedInvoice);
    localStorage.setItem('confirmedInvoices', JSON.stringify(existingInvoices));
    localStorage.removeItem('currentInvoice');
    
    navigate('/dashboard');
  };

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-gray-800 border-b border-gray-700 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Confirm Invoice</h1>
            <p className="text-gray-300">Review and edit line items</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{invoice.vendor}</CardTitle>
            <p className="text-gray-300">{invoice.date}</p>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {invoice.items.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-gray-300 text-sm">
                      {item.quantity} {item.unit} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Button
                    onClick={() => updateItemQuantity(item.id, -1)}
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-white font-medium px-3">
                    {item.quantity}
                  </span>
                  <Button
                    onClick={() => updateItemQuantity(item.id, 1)}
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateItemStatus(item.id, 'normal')}
                    size="sm"
                    variant={item.status === 'normal' ? 'default' : 'outline'}
                    className={item.status === 'normal' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    }
                  >
                    Normal
                  </Button>
                  <Button
                    onClick={() => updateItemStatus(item.id, 'credited')}
                    size="sm"
                    variant={item.status === 'credited' ? 'default' : 'outline'}
                    className={item.status === 'credited' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    }
                  >
                    Credited
                  </Button>
                  <Button
                    onClick={() => updateItemStatus(item.id, 'returned')}
                    size="sm"
                    variant={item.status === 'returned' ? 'default' : 'outline'}
                    className={item.status === 'returned' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    }
                  >
                    Returned
                  </Button>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-right text-white font-semibold">
                    ${(item.quantity * item.price).toFixed(2)}
                    {item.status === 'credited' && (
                      <span className="text-blue-400 ml-2">(Credited)</span>
                    )}
                    {item.status === 'returned' && (
                      <span className="text-red-400 ml-2">(Returned)</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-white">Total Amount:</span>
              <span className="text-green-400">${getTotalAmount().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={confirmInvoice}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-medium"
        >
          <Check className="w-5 h-5 mr-2" />
          Confirm Invoice
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
