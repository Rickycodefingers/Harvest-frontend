import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Camera, TrendingUp, DollarSign, ShoppingCart, Calendar, LogOut } from 'lucide-react';
import { format, parseISO, startOfDay, isWithinInterval, subDays } from 'date-fns';
import { toast } from 'sonner';

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
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Food Cost Dashboard</h1>
              <p className="text-slate-600 mt-2">Track your kitchen expenses and optimize costs</p>
              {user?.email && (
                <p className="text-sm text-slate-500 mt-1">Welcome back, {user.email}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl border-0"
              >
                <Camera className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Period Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              /*className={selectedPeriod === period 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-0' 
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }*/
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Spent</CardTitle>
              <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">${stats.totalAmount.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-1">
                Last {selectedPeriod === '7d' ? '7' : selectedPeriod === '30d' ? '30' : '90'} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Invoices</CardTitle>
              <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalInvoices}</div>
              <p className="text-xs text-slate-500 mt-1">
                Processed invoices
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Average Invoice</CardTitle>
              <div className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">${stats.averageInvoice.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-1">
                Per invoice
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Spending Chart */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 text-xl">Daily Food Costs</CardTitle>
            <p className="text-slate-600 text-sm">Track your spending patterns over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#1e293b',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="url(#colorGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Vendors */}
        {topVendors.length > 0 && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 text-xl">Top Vendors</CardTitle>
              <p className="text-slate-600 text-sm">Your most frequently used suppliers</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVendors.map((vendor, index) => (
                  <div key={vendor.vendor} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <span className="text-slate-900 font-medium">{vendor.vendor}</span>
                    </div>
                    <span className="text-indigo-600 font-semibold text-lg">${vendor.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Invoices Table */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 text-xl">Recent Invoices</CardTitle>
            <p className="text-slate-600 text-sm">Latest invoice activity</p>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-medium mb-2">No invoices yet</h3>
                <p className="text-slate-500 text-sm">Start by scanning your first invoice</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-600 font-medium">Date</TableHead>
                    <TableHead className="text-slate-600 font-medium">Vendor</TableHead>
                    <TableHead className="text-slate-600 font-medium">Items</TableHead>
                    <TableHead className="text-right text-slate-600 font-medium">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices
                    .sort((a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime())
                    .slice(0, 10)
                    .map((invoice) => (
                    <TableRow key={invoice.id} className="border-slate-200 hover:bg-slate-50">
                      <TableCell className="text-slate-600">
                        {format(parseISO(invoice.confirmedAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-slate-900 font-medium">{invoice.vendor}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {invoice.items.slice(0, 2).map((item) => (
                            <Badge key={item.id} variant="outline" className="text-xs border-slate-300 text-slate-600 bg-slate-50">
                              {item.name}
                            </Badge>
                          ))}
                          {invoice.items.length > 2 && (
                            <Badge variant="outline" className="text-xs border-slate-300 text-slate-600 bg-slate-50">
                              +{invoice.items.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-indigo-600 font-semibold">
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
