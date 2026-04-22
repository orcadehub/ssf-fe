import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Paper, Typography, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Modal, 
  TextField, IconButton, Chip, Tabs, Tab, InputAdornment
} from '@mui/material';
import { LogOut, WalletCards, ShieldCheck, Search, Filter, History, User } from 'lucide-react';
import toast from 'react-hot-toast';

const WorkerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [collectionsHistory, setCollectionsHistory] = useState([]);
  
  const [openModal, setOpenModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    if (tab === 0) fetchCustomers();
    if (tab === 1) fetchHistory();
  }, [tab]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('https://ssf-be.vercel.app/api/worker/my-collections');
      setCollectionsHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('https://ssf-be.vercel.app/api/worker/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCollect = async (e) => {
    e.preventDefault();
    const loading = toast.loading('Recording collection...');
    try {
      await axios.post('https://ssf-be.vercel.app/api/worker/collect', {
        customer_id: selectedCustomer.id,
        amount,
        password
      });
      toast.success('Collection recorded successfully!', { id: loading });
      setOpenModal(false);
      setAmount('');
      setPassword('');
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording collection', { id: loading });
    }
  };

  const openCollectionModal = (customer) => {
    setSelectedCustomer(customer);
    setOpenModal(true);
    setAmount('');
    setPassword('');
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setAmount('');
      return;
    }
    const maxAllowed = parseFloat(selectedCustomer?.outstanding || 0);
    const num = parseFloat(val);
    
    if (num > maxAllowed) {
      setAmount(maxAllowed.toString());
    } else {
      setAmount(val);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toString().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || c.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <Box className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border-b border-slate-100 px-4 md:px-8 py-4 flex flex-wrap justify-between items-center sticky top-0 z-40 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
            <ShieldCheck className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <Typography variant="h6" className="font-extrabold text-slate-800 tracking-tight leading-tight md:text-2xl">Collection Console</Typography>
            <Typography variant="caption" className="text-slate-500 font-medium md:text-sm">Logged in as <span className="text-emerald-600">{user?.username}</span></Typography>
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

      <main className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        <Paper className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 bg-white overflow-hidden">
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
            <Tabs 
              value={tab} 
              onChange={(e, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', py: 2.5, minWidth: 'auto', px: 3 } }}
            >
              <Tab icon={<User size={18} />} iconPosition="start" label="Customers Portfolio" />
              <Tab icon={<History size={18} />} iconPosition="start" label="My Log History" />
            </Tabs>
          </Box>

          <Box className="p-4 md:p-8">
            {tab === 0 && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-6 flex flex-col gap-6">
                  <div>
                    <Typography variant="h6" className="font-bold text-slate-800">Pending Collections Portfolio</Typography>
                    <Typography variant="body2" className="text-slate-500">Log payments mapped against assigned accounts</Typography>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Search ID or Name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={18} className="text-slate-400" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ minWidth: {xs: '100%', md: '300px'}, bgcolor: 'white', borderRadius: '8px' }}
                    />

                    <div className="flex flex-wrap gap-2 items-center">
                      <Filter size={16} className="text-slate-400 mr-1" />
                      {['All', 'Satya', 'Dharma', 'Shanti', 'Prema'].map(type => (
                        <Chip 
                          key={type}
                          label={type}
                          onClick={() => setFilterType(type)}
                          variant={filterType === type ? 'filled' : 'outlined'}
                          className={`font-medium cursor-pointer ${filterType === type ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <TableContainer className="rounded-xl border border-slate-100">
                  <Table>
                    <TableHead className="bg-slate-50">
                      <TableRow>
                        <TableCell className="font-bold text-slate-600">Contract ID</TableCell>
                        <TableCell className="font-bold text-slate-600">Customer Name</TableCell>
                        <TableCell className="font-bold text-slate-600">Category</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right">Total Due</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right">Paid</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right text-red-600">Outstanding</TableCell>
                        <TableCell className="font-bold text-slate-600 text-center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCustomers.map((c) => (
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
                          <TableCell className="text-right text-slate-600 font-medium bg-slate-50/50">₹{parseFloat(c.total_due).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-bold">₹{parseFloat(c.total_paid).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold text-red-600">₹{parseFloat(c.outstanding).toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="contained" 
                              size="small"
                              className="bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-emerald-500/20 shadow-md font-semibold px-4"
                              startIcon={<WalletCards size={14} />}
                              onClick={() => openCollectionModal(c)}
                              disabled={parseFloat(c.outstanding) <= 0}
                              sx={{ textTransform: 'none' }}
                            >
                              Collect
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-slate-400">No customers found matching filter criteria</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}

            {tab === 1 && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-6">
                  <Typography variant="h6" className="font-bold text-slate-800">My Collection Log</Typography>
                  <Typography variant="body2" className="text-slate-500">Historical verified transactions initiated by you</Typography>
                </div>
                <TableContainer className="rounded-xl border border-slate-100">
                  <Table>
                    <TableHead className="bg-slate-50">
                      <TableRow>
                        <TableCell className="font-bold text-slate-600">Receipt ID</TableCell>
                        <TableCell className="font-bold text-slate-600">Customer Contract</TableCell>
                        <TableCell className="font-bold text-slate-600">Collection Date</TableCell>
                        <TableCell className="font-bold text-slate-600 text-right text-emerald-700">Amount Collected</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {collectionsHistory.map((h) => (
                        <TableRow key={h.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-medium text-slate-400 text-xs">{h.id}</TableCell>
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
                      {collectionsHistory.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-slate-400">No collection history logged yet.</TableCell>
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

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm focus:outline-none">
          <Paper className="p-8 rounded-2xl shadow-2xl border border-slate-100">
            <Typography variant="h6" className="mb-2 font-extrabold text-slate-800 flex items-center gap-2">
              <WalletCards className="text-emerald-600" /> Log Payment
            </Typography>
            <Typography variant="body2" className="text-slate-500 mb-6 border-b pb-4">
              Contract <span className="font-bold text-indigo-600">{selectedCustomer?.id}</span> — {selectedCustomer?.name}
            </Typography>
            <form onSubmit={handleCollect} className="space-y-5">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center">
                <span className="text-red-800 text-sm font-semibold">Outstanding Balance:</span>
                <span className="font-bold text-red-600 text-lg tracking-tight">₹{parseFloat(selectedCustomer?.outstanding || 0).toLocaleString()}</span>
              </div>
              <TextField
                fullWidth label="Amount Collected (₹)" type="number" variant="outlined"
                inputProps={{ min: "1", max: selectedCustomer?.outstanding, step: "1" }}
                value={amount}
                onChange={handleAmountChange}
                required
                helperText={`Cannot exceed ${parseFloat(selectedCustomer?.outstanding || 0).toLocaleString()}`}
              />
              <TextField
                fullWidth label="Confirm Your Password" type="password" variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                helperText="Required to securely verify your identity"
              />
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button onClick={() => setOpenModal(false)} className="text-slate-500" sx={{ textTransform: 'none' }}>Cancel</Button>
                <Button type="submit" variant="contained" className="bg-emerald-600 rounded-xl px-5" sx={{ textTransform: 'none' }}>Confirm Collection</Button>
              </div>
            </form>
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

export default WorkerDashboard;
