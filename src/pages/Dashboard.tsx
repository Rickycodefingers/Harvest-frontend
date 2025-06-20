
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

interface Invoice {
  id: number;
  vendor: string;
  date: string;
  total: number;
  confirmedAt: string;
  items: any[];
}

const Dashboard = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    setInvoices(savedInvoices);
  }, []);

  const getDailyData = () => {
    const dailyTotals: { [key: string]: number } = {};
    
    invoices.forEach(invoice => {
      const date = invoice.date;
      dailyTotals[date] = (dailyTotals[date] || 0) + invoice.total;
    });

    return Object.entries(dailyTotals)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, total]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: total,
        fullDate: date
      }));
  };

  const getVendorData = () => {
    const vendorTotals: { [key: string]: number } = {};
    
    invoices.forEach(invoice => {
      vendorTotals[invoice.vendor] = (vendorTotals[invoice.vendor] || 0) + invoice.total;
    });

    return Object.entries(vendorTotals)
      .map(([vendor, total]) => ({ vendor, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const getTotalSpent = () => {
    return invoices.reduce((total, invoice) => total + invoice.total, 0);
  };

  const getAverageInvoice = () => {
    return invoices.length > 0 ? getTotalSpent() / invoices.length : 0;
  };

  const dailyData = getDailyData();
  const vendorData = getVendorData();
  const colors = ['#EA580C', '#F97316', '#FB923C', '#FED7AA', '#FFF7ED'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Cost Dashboard</h1>
          <p className="text-gray-600">Track your daily food expenses</p>
        </div>
        <Button
          onClick={() => navigate('/')}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${getTotalSpent().toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Invoice</p>
                  <p className="text-2xl font-bold text-gray-900">${getAverageInvoice().toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Spending Chart */}
        {dailyData.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Daily Food Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#EA580C"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendor Breakdown */}
        {vendorData.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Top Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorData.map((vendor, index) => (
                  <div key={vendor.vendor} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="font-medium text-gray-900">{vendor.vendor}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${vendor.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Invoices Table */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No invoices yet</p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Scan Your First Invoice
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.slice().reverse().slice(0, 10).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.vendor}</p>
                      <p className="text-sm text-gray-600">{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${invoice.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{invoice.items.length} items</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
