import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0249dcfb09854be5a7947a2a3cc013de',
  appName: 'نظام إدارة المتجر',
  webDir: 'dist',
  server: {
    url: 'https://0249dcfb-0985-4be5-a794-7a2a3cc013de.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#3b82f6',
    },
  },
};

export default config;
