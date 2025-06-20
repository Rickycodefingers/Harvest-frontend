
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Camera, TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { format, parseISO, startOfDay, isWithinInterval, subDays } from 'date-fns';

interface ConfirmedInvoice {
  id: number;
  vendor: string;
  date: string;
  totalAmount: number;
  confirmedAt: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    status: 'normal' | 'credited' | 'returned';
  }>;
}

const Dashboard = () => {
  const [invoices, setInvoices] = useState<ConfirmedInvoice[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmedInvoices = JSON.parse(localStorage.getItem('confirmedInvoices') || '[]');
    setInvoices(confirmedInvoices);
  }, []);

  const getDailyData = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const dailyTotals: { [key: string]: number } = {};
    
    // Initialize all days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dailyTotals[date] = 0;
    }
    
    // Filter invoices within selected period and sum by date
    const cutoffDate = subDays(new Date(), days);
    const filteredInvoices = invoices.filter(invoice => 
      isWithinInterval(parseISO(invoice.confirmedAt), { start: cutoffDate, end: new Date() })
    );
    
    filteredInvoices.forEach(invoice => {
      const date = format(parseISO(invoice.confirmedAt), 'yyyy-MM-dd');
      if (dailyTotals.hasOwnProperty(date)) {
        dailyTotals[date] += invoice.totalAmount;
      }
    });
    
    return Object.entries(dailyTotals).map(([date, amount]) => ({
      date: format(parseISO(date), 'MMM dd'),
      amount: amount,
      fullDate: date
    }));
  };

  const getTopVendors = () => {
    const vendorTotals: { [key: string]: number } = {};
    
    invoices.forEach(invoice => {
      vendorTotals[invoice.vendor] = (vendorTotals[invoice.vendor] || 0) + invoice.totalAmount;
    });
    
    return Object.entries(vendorTotals)
      .map(([vendor, total]) => ({ vendor, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const getTotalStats = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const cutoffDate = subDays(new Date(), days);
    const periodInvoices = invoices.filter(invoice => 
      isWithinInterval(parseISO(invoice.confirmedAt), { start: cutoffDate, end: new Date() })
    );
    
    const totalAmount = periodInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalInvoices = periodInvoices.length;
    const averageInvoice = totalInvoices > 0 ? totalAmount / totalInvoices : 0;
    
    return { totalAmount, totalInvoices, averageInvoice };
  };

  const dailyData = getDailyData();
  const topVendors = getTopVendors();
  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-gray-800 border-b border-gray-700 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Food Cost Dashboard</h1>
            <p className="text-gray-300">Track your kitchen expenses</p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              className={selectedPeriod === period 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalAmount.toFixed(2)}</div>
              <p className="text-xs text-gray-400">
                Last {selectedPeriod === '7d' ? '7' : selectedPeriod === '30d' ? '30' : '90'} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Invoices</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalInvoices}</div>
              <p className="text-xs text-gray-400">
                Processed invoices
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Average Invoice</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.averageInvoice.toFixed(2)}</div>
              <p className="text-xs text-gray-400">
                Per invoice
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Spending Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Daily Food Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Vendors */}
        {topVendors.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topVendors.map((vendor, index) => (
                  <div key={vendor.vendor} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-white font-medium">{vendor.vendor}</span>
                    </div>
                    <span className="text-green-400 font-semibold">${vendor.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Invoices Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No invoices yet</p>
                <p className="text-gray-500 text-sm">Start by scanning your first invoice</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Vendor</TableHead>
                    <TableHead className="text-gray-300">Items</TableHead>
                    <TableHead className="text-right text-gray-300">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices
                    .sort((a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime())
                    .slice(0, 10)
                    .map((invoice) => (
                    <TableRow key={invoice.id} className="border-gray-700">
                      <TableCell className="text-gray-300">
                        {format(parseISO(invoice.confirmedAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-white font-medium">{invoice.vendor}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {invoice.items.slice(0, 2).map((item) => (
                            <Badge key={item.id} variant="outline" className="text-xs border-gray-600 text-gray-300">
                              {item.name}
                            </Badge>
                          ))}
                          {invoice.items.length > 2 && (
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                              +{invoice.items.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-400 font-semibold">
                          ${invoice.totalAmount.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
