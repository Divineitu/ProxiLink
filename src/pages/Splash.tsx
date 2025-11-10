import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center animate-fade-in">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-strong">
            <MapPin className="h-14 w-14 text-primary" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-3">ProxiLink</h1>
        <p className="text-white/90 text-lg">Find services around you</p>
      </div>
    </div>
  );
};

export default Splash;
