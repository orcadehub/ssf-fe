import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const words = ['Satya', 'Dharma', 'Shanti', 'Prema'];

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Call onComplete after 3 seconds
    const timer2 = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <Box 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 overflow-hidden transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative flex items-center justify-center w-[400px] h-[400px]">
        {/* Center Text */}
        <div className="z-10 flex flex-col items-center justify-center text-white scale-125">
          <Typography variant="h4" className="font-bold tracking-widest text-[#facc15] font-serif shadow-sm">SATYA</Typography>
          <Typography variant="h4" className="font-bold tracking-widest text-white font-serif shadow-sm mb-1">SAI</Typography>
          <Typography variant="h6" className="font-medium tracking-[0.3em] text-blue-300">FINANCE</Typography>
        </div>

        {/* Orbiting Words along a curved circular path */}
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
          <svg viewBox="0 0 400 400" className="w-full h-full absolute inset-0 text-[#facc15] font-black text-3xl tracking-[0.2em] font-serif drop-shadow-md uppercase">
            <defs>
              <path
                id="orbitPath"
                d="M 200, 200 m -140, 0 a 140,140 0 1,1 280,0 a 140,140 0 1,1 -280,0" 
              />
            </defs>
            <text>
              {words.map((word, index) => (
                <textPath
                  key={word}
                  href="#orbitPath"
                  startOffset={`${(index * 25) + 12.5}%`}
                  textAnchor="middle"
                  fill="currentColor"
                >
                  {word}
                </textPath>
              ))}
            </text>
          </svg>
        </div>
        
        {/* Background Decorative Rings */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-gray-600 animate-[spin_12s_linear_infinite]" />
        <div className="absolute w-[340px] h-[340px] rounded-full border border-gray-700/50 animate-[spin_15s_linear_infinite_reverse]" />
      </div>
    </Box>
  );
};

export default SplashScreen;
