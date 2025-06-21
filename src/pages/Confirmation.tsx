import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react';

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
      case 'credited': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'returned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
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
    <div className="min-h-screen gradient-bg-light">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Confirm Invoice</h1>
              <p className="text-slate-600">Review and edit line items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-900 text-xl">{invoice.vendor}</CardTitle>
            <p className="text-slate-600">{invoice.date}</p>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {invoice.items.map((item) => (
            <Card key={item.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{item.name}</h3>
                    <p className="text-slate-600 mt-1">
                      {item.quantity} {item.unit} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(item.status)} border font-medium`}>
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Button
                    onClick={() => updateItemQuantity(item.id, -1)}
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-slate-900 font-semibold px-4 py-1 bg-slate-50 rounded-md min-w-[3rem] text-center">
                    {item.quantity}
                  </span>
                  <Button
                    onClick={() => updateItemQuantity(item.id, 1)}
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => updateItemStatus(item.id, 'normal')}
                    size="sm"
                    variant={item.status === 'normal' ? 'default' : 'outline'}
                    className={item.status === 'normal' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
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
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
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
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }
                  >
                    Returned
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Line Total:</span>
                    <div className="text-right">
                      <p className="text-slate-900 font-semibold text-lg">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                      {item.status === 'credited' && (
                        <span className="text-blue-600 text-sm">(Credited)</span>
                      )}
                      {item.status === 'returned' && (
                        <span className="text-red-600 text-sm">(Returned)</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-slate-900">Total Amount:</span>
              <span className="text-2xl font-bold text-violet-600">${getTotalAmount().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={confirmInvoice}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Check className="w-5 h-5 mr-2" />
          Confirm Invoice
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
