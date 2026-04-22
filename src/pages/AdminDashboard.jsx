import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Paper, Typography, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Modal, 
  TextField, IconButton, Tabs, Tab, MenuItem, Chip
} from '@mui/material';
import { LogOut, Plus, Users, Wallet, Shield, History, BarChart3, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  
  // Data
  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [collections, setCollections] = useState([]);

  // Report Filters
  const [reportWorker, setReportWorker] = useState('All');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  
  // Modals
  const [openWorkerModal, setOpenWorkerModal] = useState(false);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  
  // Forms
  const [workerForm, setWorkerForm] = useState({ username: '', password: '' });
  const [customerForm, setCustomerForm] = useState({ 
    name: '', type: 'Satya', amount_given: '', interest_amount: '',
    mobile: '', email: '', address: '', adhar: '', pan: ''
  });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      if (tab === 0) {
        const res = await axios.get('http://localhost:5001/api/admin/workers');
        setWorkers(res.data);
      } else if (tab === 1) {
        const res = await axios.get('http://localhost:5001/api/admin/customers');
        setCustomers(res.data);
      } else if (tab === 2) {
        const res = await axios.get('http://localhost:5001/api/worker/collections');
        setCollections(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    const loading = toast.loading('Creating worker...');
    try {
      await axios.post('http://localhost:5001/api/admin/workers', workerForm);
      toast.success('Worker created successfully', { id: loading });
      setOpenWorkerModal(false);
      setWorkerForm({ username: '', password: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating worker', { id: loading });
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const loading = toast.loading('Creating customer...');
    try {
      await axios.post('http://localhost:5001/api/admin/customers', customerForm);
      toast.success('Customer created successfully', { id: loading });
      setOpenCustomerModal(false);
      setCustomerForm({ 
        name: '', type: 'Satya', amount_given: '', interest_amount: '',
        mobile: '', email: '', address: '', adhar: '', pan: ''
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating customer', { id: loading });
    }
  };

  // Report Computations
  const getFilteredReports = () => {
    let filtered = collections;
    
    if (reportWorker !== 'All') {
      filtered = filtered.filter(c => c.worker_id === reportWorker);
    }
    if (reportStartDate) {
      filtered = filtered.filter(c => new Date(c.collection_date) >= new Date(reportStartDate + 'T00:00:00'));
    }
    if (reportEndDate) {
      filtered = filtered.filter(c => new Date(c.collection_date) <= new Date(reportEndDate + 'T23:59:59'));
    }
    return filtered;
  };

  const getTodayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return collections
      .filter(c => c.collection_date.startsWith(today))
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);
  };

  const reportData = getFilteredReports();
  const totalReportAmount = reportData.reduce((sum, c) => sum + parseFloat(c.amount), 0);

  return (
    <Box className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border-b border-slate-100 px-4 md:px-8 py-4 flex flex-wrap justify-between items-center sticky top-0 z-40 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
            <Shield className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <Typography variant="h6" className="font-extrabold text-slate-800 tracking-tight leading-tight md:text-2xl">Admin Portal</Typography>
            <Typography variant="caption" className="text-slate-500 font-medium md:text-sm">Logged in as <span className="text-blue-600">{user?.username}</span></Typography>
          </div>
        </div>
        <Button 
          onClick={logout} 
          variant="outlined" 
          color="error" 
          startIcon={<LogOut size={16} />}
          className="rounded-xl font-semibold border-red-200 hover:bg-red-50 text-xs md:text-sm"
          sx={{ textTransform: 'none' }}
        >
          Sign Out
        </Button>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <Paper className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden bg-white">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
            <Tabs 
              value={tab} 
              onChange={(e, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', py: 2.5, minWidth: 'auto', px: 3 } }}
            >
              <Tab icon={<Users size={18} />} iconPosition="start" label="Workers" />
              <Tab icon={<Wallet size={18} />} iconPosition="start" label="Customers" />
              <Tab icon={<History size={18} />} iconPosition="start" label="Audit Log" />
              <Tab icon={<BarChart3 size={18} />} iconPosition="start" label="Reports" />
            </Tabs>
          </Box>

          <Box className="p-4 md:p-8">
            {tab === 0 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <Typography variant="h6" className="font-bold text-slate-800">Active Workers</Typography>
                    <Typography variant="body2" className="text-slate-500">Manage all your field collection staff</Typography>
                  </div>
                  <Button 
                    variant="contained" 
                    startIcon={<Plus size={18} />}
                    onClick={() => setOpenWorkerModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5 shadow-blue-600/20 shadow-lg"
                    sx={{ textTransform: 'none' }}
                  >
                    Add New Worker
                  </Button>
                </div>
                <TableContainer className="rounded-xl border border-slate-100">
                  <Table>
                    <TableHead className="bg-slate-50">
                      <TableRow>
                        <TableCell className="font-bold text-slate-600">Username</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right">Created At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workers.map((w) => (
                        <TableRow key={w.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-medium text-slate-700">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                {w.username.charAt(0)}
                              </div>
                              {w.username}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-slate-500">
                            {new Date(w.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                        </TableRow>
                      ))}
                      {workers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-12 text-slate-400">No collection workers provisioned yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}

            {tab === 1 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <Typography variant="h6" className="font-bold text-slate-800">Customer Portfolio</Typography>
                    <Typography variant="body2" className="text-slate-500">Overview of all active customer contracts and balances</Typography>
                  </div>
                  <Button 
                    variant="contained" 
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-5 shadow-indigo-600/20 shadow-lg"
                    startIcon={<Plus size={18} />}
                    onClick={() => setOpenCustomerModal(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Add Customer
                  </Button>
                </div>
                <TableContainer className="rounded-xl border border-slate-100">
                  <Table>
                    <TableHead className="bg-slate-50">
                      <TableRow>
                        <TableCell className="font-bold text-slate-600">Contract ID</TableCell>
                        <TableCell className="font-bold text-slate-600">Customer Name</TableCell>
                        <TableCell className="font-bold text-slate-600">Category</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right">Principal</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right">Interest</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right text-indigo-700 border-l border-slate-200">Total Due</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right">Paid</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right text-red-600">Outstanding</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customers.map((c) => (
                        <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-bold text-indigo-600">{c.id}</TableCell>
                          <TableCell className="font-medium text-slate-800">{c.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={c.type} 
                              size="small" 
                              className={`font-bold ${
                                c.type === 'Satya' ? 'bg-amber-100 text-amber-700' : 
                                c.type === 'Dharma' ? 'bg-emerald-100 text-emerald-700' :
                                c.type === 'Shanti' ? 'bg-blue-100 text-blue-700' :
                                'bg-purple-100 text-purple-700'
                              }`} 
                            />
                          </TableCell>
                          <TableCell className="text-right text-slate-600 font-medium">₹{parseFloat(c.amount_given).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-slate-600 font-medium">₹{parseFloat(c.interest_amount).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold text-indigo-800 border-l border-slate-50 bg-indigo-50/30">₹{parseFloat(c.total_due).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-bold">₹{parseFloat(c.total_paid).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold text-red-600">₹{parseFloat(c.outstanding).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {customers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-slate-400">No active customer portfolios.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}

            {tab === 2 && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-6">
                  <Typography variant="h6" className="font-bold text-slate-800">Global Collections Audit</Typography>
                  <Typography variant="body2" className="text-slate-500">Live feed of all secured transactions across field agents</Typography>
                </div>
                <TableContainer className="rounded-xl border border-slate-100">
                  <Table>
                    <TableHead className="bg-slate-50">
                      <TableRow>
                        <TableCell className="font-bold text-slate-600">Trace ID</TableCell>
                        <TableCell className="font-bold text-slate-600">Field Worker</TableCell>
                        <TableCell className="font-bold text-slate-600">Customer Contract</TableCell>
                        <TableCell className="font-bold text-slate-600">Timestamp</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right text-emerald-700">Funds Secured</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {collections.map((h) => (
                        <TableRow key={h.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-medium text-slate-400 text-xs">{h.id}</TableCell>
                          <TableCell className="font-medium text-slate-800">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold uppercase">{h.worker_name.charAt(0)}</div>
                              {h.worker_name}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-800">
                            <div>{h.customer_name}</div>
                            <div className="text-xs text-indigo-600 font-bold">{h.customer_id} • {h.customer_type}</div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {new Date(h.collection_date).toLocaleString('en-US', { day:'numeric', month:'short', year:'numeric', hour:'numeric', minute:'numeric' })}
                          </TableCell>
                          <TableCell className="text-right font-extrabold text-emerald-600">
                            + ₹{parseFloat(h.amount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {collections.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-slate-400">No collection operations have been recorded yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}

            {tab === 3 && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8">
                  <Typography variant="h6" className="font-bold text-slate-800">Financial Reports & Analytics</Typography>
                  <Typography variant="body2" className="text-slate-500">Filter and aggregate field collections across staff and timelines.</Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                    <Typography variant="body2" className="font-medium text-blue-100 mb-1">Total Collections Today</Typography>
                    <Typography variant="h4" className="font-extrabold tracking-tight">₹{getTodayTotal().toLocaleString()}</Typography>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                    <Typography variant="body2" className="font-medium text-emerald-100 mb-1">Filtered Report Total</Typography>
                    <Typography variant="h4" className="font-extrabold tracking-tight">₹{totalReportAmount.toLocaleString()}</Typography>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-lg shadow-slate-900/20">
                    <Typography variant="body2" className="font-medium text-slate-300 mb-1">Matched Transactions</Typography>
                    <Typography variant="h4" className="font-extrabold tracking-tight">{reportData.length}</Typography>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl mb-6">
                  <Typography variant="subtitle2" className="font-bold tracking-widest text-slate-500 uppercase mb-4 flex items-center gap-2"><Filter size={16} /> Filter Parameters</Typography>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextField
                      select fullWidth label="Worker / Field Staff" variant="outlined" size="small"
                      value={reportWorker}
                      onChange={(e) => setReportWorker(e.target.value)}
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="All" className="font-bold underline">All Workers</MenuItem>
                      {workers.map((w) => (
                        <MenuItem key={w.id} value={w.id}>{w.username}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth label="From Date" type="date" variant="outlined" size="small"
                      InputLabelProps={{ shrink: true }}
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      sx={{ bgcolor: 'white' }}
                    />
                    <TextField
                      fullWidth label="To Date" type="date" variant="outlined" size="small"
                      InputLabelProps={{ shrink: true }}
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      sx={{ bgcolor: 'white' }}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="text" color="error" size="small" 
                      onClick={() => { setReportWorker('All'); setReportStartDate(''); setReportEndDate(''); }}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>

                <Typography variant="subtitle1" className="font-bold text-slate-700 mb-4">Export Result Data</Typography>
                <TableContainer className="rounded-xl border border-slate-100">
                  <Table>
                    <TableHead className="bg-slate-50">
                      <TableRow>
                        <TableCell className="font-bold text-slate-600">Trace ID</TableCell>
                        <TableCell className="font-bold text-slate-600">Worker</TableCell>
                        <TableCell className="font-bold text-slate-600">Customer</TableCell>
                        <TableCell className="font-bold text-slate-600">Date</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium text-slate-400 text-xs">{h.id}</TableCell>
                          <TableCell className="font-semibold text-slate-700">{h.worker_name}</TableCell>
                          <TableCell className="text-slate-600">{h.customer_name} ({h.customer_id})</TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {new Date(h.collection_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right font-bold text-emerald-600">₹{parseFloat(h.amount).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {reportData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-400">No data matches these filters.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}
          </Box>
        </Paper>
      </main>

      {/* Add Worker Modal */}
      <Modal open={openWorkerModal} onClose={() => setOpenWorkerModal(false)}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm">
          <Paper className="p-8 rounded-2xl shadow-2xl border border-slate-100 focus:outline-none">
            <Typography variant="h6" className="mb-6 font-extrabold text-slate-800">Provision Worker</Typography>
            <form onSubmit={handleCreateWorker} className="flex flex-col gap-5">
              <TextField
                fullWidth label="System Username" required variant="outlined"
                value={workerForm.username}
                onChange={(e) => setWorkerForm({...workerForm, username: e.target.value})}
              />
              <TextField
                fullWidth label="Secure Password" type="password" required variant="outlined"
                value={workerForm.password}
                onChange={(e) => setWorkerForm({...workerForm, password: e.target.value})}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button onClick={() => setOpenWorkerModal(false)} className="text-slate-500" sx={{ textTransform: 'none' }}>Cancel</Button>
                <Button type="submit" variant="contained" className="bg-blue-600 rounded-xl" sx={{ textTransform: 'none' }}>Create Account</Button>
              </div>
            </form>
          </Paper>
        </Box>
      </Modal>

      {/* Add Customer Modal */}
      <Modal open={openCustomerModal} onClose={() => setOpenCustomerModal(false)}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
          <Paper className="p-8 rounded-2xl shadow-2xl border border-slate-100 focus:outline-none">
            <Typography variant="h6" className="mb-6 font-extrabold text-slate-800">New Customer Contract</Typography>
            <form onSubmit={handleCreateCustomer} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  fullWidth label="Full Legal Name" required variant="outlined"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                />
                <TextField
                  select fullWidth label="Tier / Category" required variant="outlined"
                  value={customerForm.type}
                  onChange={(e) => setCustomerForm({...customerForm, type: e.target.value})}
                >
                  {['Satya', 'Dharma', 'Shanti', 'Prema'].map((option) => (
                    <MenuItem key={option} value={option}>
                      <span className="font-medium text-slate-700">{option}</span>
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  fullWidth label="Mobile Number" required variant="outlined"
                  value={customerForm.mobile}
                  onChange={(e) => setCustomerForm({...customerForm, mobile: e.target.value})}
                />
                <TextField
                  fullWidth label="Email Address" type="email" variant="outlined"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  fullWidth label="Aadhaar Number" required variant="outlined"
                  value={customerForm.adhar}
                  onChange={(e) => setCustomerForm({...customerForm, adhar: e.target.value})}
                />
                <TextField
                  fullWidth label="PAN Number" required variant="outlined"
                  value={customerForm.pan}
                  onChange={(e) => setCustomerForm({...customerForm, pan: e.target.value})}
                />
              </div>

              <TextField
                fullWidth label="Residential Address" required variant="outlined" multiline rows={3}
                value={customerForm.address}
                onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  fullWidth label="Principal (₹)" type="number" required variant="outlined"
                  value={customerForm.amount_given}
                  onChange={(e) => setCustomerForm({...customerForm, amount_given: e.target.value})}
                />
                <TextField
                  fullWidth label="Interest (₹)" type="number" required variant="outlined"
                  value={customerForm.interest_amount}
                  onChange={(e) => setCustomerForm({...customerForm, interest_amount: e.target.value})}
                />
              </div>
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                <div className="text-slate-500 text-sm font-medium">
                  Total Due: <span className="font-bold text-indigo-700 pl-1">₹
                  {((parseFloat(customerForm.amount_given) || 0) + (parseFloat(customerForm.interest_amount) || 0)).toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setOpenCustomerModal(false)} className="text-slate-500" sx={{ textTransform: 'none' }}>Cancel</Button>
                  <Button type="submit" variant="contained" className="bg-indigo-600 rounded-xl" sx={{ textTransform: 'none' }}>Issue Contract</Button>
                </div>
              </div>
            </form>
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
