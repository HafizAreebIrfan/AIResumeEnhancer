import "./app.css";
import AIResumeEnhancer from "./components/airesumeenhancer";
import Home from "./components/home";
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  return (
    <>
      <Home />
      <AIResumeEnhancer/>
      <SpeedInsights/>
    </>
  );
}
