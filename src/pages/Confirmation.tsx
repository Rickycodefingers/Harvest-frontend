
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'normal' | 'credited' | 'returned';
}

interface InvoiceData {
  vendor: string;
  date: string;
  items: InvoiceItem[];
}

const Confirmation = () => {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedInvoice = localStorage.getItem('currentInvoice');
    if (savedInvoice) {
      setInvoice(JSON.parse(savedInvoice));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    if (!invoice) return;
    
    const updatedItems = invoice.items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    
    setInvoice({ ...invoice, items: updatedItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'credited': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getTotalAmount = () => {
    if (!invoice) return 0;
    return invoice.items
      .filter(item => item.status === 'normal')
      .reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const confirmInvoice = () => {
    if (!invoice) return;
    
    // Save to invoices history
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const invoiceWithTotal = {
      ...invoice,
      total: getTotalAmount(),
      id: Date.now(),
      confirmedAt: new Date().toISOString()
    };
    
    existingInvoices.push(invoiceWithTotal);
    localStorage.setItem('invoices', JSON.stringify(existingInvoices));
    localStorage.removeItem('currentInvoice');
    
    navigate('/dashboard');
  };

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="bg-white shadow-sm p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Confirm Invoice</h1>
          <p className="text-sm text-gray-600">{invoice.vendor} • {invoice.date}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {invoice.items.map((item) => (
          <Card key={item.id} className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="font-medium text-gray-900 border-0 p-0 h-auto text-base bg-transparent focus-visible:ring-0"
                  />
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Unit</label>
                  <Input
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={item.status === 'normal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateItem(item.id, 'status', 'normal')}
                  className="flex-1 text-xs"
                >
                  Normal
                </Button>
                <Button
                  variant={item.status === 'credited' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateItem(item.id, 'status', 'credited')}
                  className="flex-1 text-xs"
                >
                  Credited
                </Button>
                <Button
                  variant={item.status === 'returned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateItem(item.id, 'status', 'returned')}
                  className="flex-1 text-xs"
                >
                  Returned
                </Button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-green-600">${getTotalAmount().toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Excludes credited and returned items
            </p>
          </CardContent>
        </Card>

        <Button
          onClick={confirmInvoice}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-medium mt-6"
        >
          Confirm Invoice
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
