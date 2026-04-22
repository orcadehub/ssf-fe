import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button, TextField, Typography, Box, InputAdornment } from '@mui/material';
import { Building2, Eye, EyeOff, User, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading('Authenticating...');

    const res = await login(username, password);
    
    setIsSubmitting(false);
    toast.dismiss(loadingToast);

    if (!res.success) {
      toast.error(res.message, { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
    } else {
      toast.success('Successfully logged in!', { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      '& fieldset': { borderColor: '#e2e8f0' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 relative overflow-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-300/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-300/20 blur-[100px] pointer-events-none" />

      <Box className="relative w-full max-w-md p-10 rounded-[30px] border border-white/50 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-600/30">
            <Building2 className="w-8 h-8" strokeWidth={2} />
          </div>
          <Typography variant="h5" className="font-extrabold text-slate-800 tracking-tight font-sans mb-1">
            Satya Sai Finance
          </Typography>
          <Typography variant="body2" className="text-slate-500 font-medium tracking-wide">
            Sign in to continue to portal
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User size={20} className="text-slate-400" />
                </InputAdornment>
              ),
            }}
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={20} className="text-slate-400" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <div 
                    onClick={handleTogglePassword} 
                    className="text-blue-600 hover:text-blue-800 font-bold text-sm cursor-pointer select-none px-2 tracking-wide"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </div>
                </InputAdornment>
              ),
            }}
            sx={textFieldStyles}
          />
          <Box className="pt-2">
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              className={`py-3.5 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-xl text-base transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40`}
              sx={{ textTransform: 'none', borderRadius: '12px', boxShadow: 'none' }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  Logging in...
                </span>
              ) : (
                'Sign In to Portal'
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
