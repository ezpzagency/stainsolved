import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Initialize analytics in production
if (process.env.NODE_ENV === 'production') {
  // Initialize Plausible Analytics (privacy-first)
  const initPlausible = () => {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = window.location.hostname;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  };
  
  // Initialize GA4 (kept for compatibility with existing analytics)
  const initGA = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-MEASUREMENT-ID'}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-MEASUREMENT-ID', {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  };

  initPlausible();
  initGA();
}

// Add a global function to check if the user agent is from an AI
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    isAITraffic: () => boolean;
  }
}

// Utility to detect AI user agents
window.isAITraffic = () => {
  const aiSignatures = [
    'gpt', 'chatgpt', 'openai', 'bing', 'perplexity', 'claude', 'anthropic', 
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandex'
  ];
  
  const userAgent = navigator.userAgent.toLowerCase();
  return aiSignatures.some(sig => userAgent.includes(sig));
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
