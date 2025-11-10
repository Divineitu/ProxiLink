import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Bell, Users, ArrowRight } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: MapPin,
      title: "Discover services nearby",
      description: "Find service providers, jobs, and opportunities in your area in real-time"
    },
    {
      icon: Bell,
      title: "Get instant alerts",
      description: "Receive notifications when providers or opportunities are close to you"
    },
    {
      icon: Users,
      title: "Book and connect in real-time",
      description: "Connect instantly with service providers and community events"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/role-selection");
    }
  };

  const handleSkip = () => {
    navigate("/role-selection");
  };

  const Icon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8 flex justify-center animate-scale-in">
            <div className="w-32 h-32 bg-gradient-hero rounded-3xl flex items-center justify-center shadow-strong">
              <Icon className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 animate-fade-in">
            {slides[currentSlide].title}
          </h2>
          <p className="text-muted-foreground text-lg mb-12 animate-fade-in">
            {slides[currentSlide].description}
          </p>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mb-12">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSkip}
          className="flex-1"
        >
          Skip
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          className="flex-1"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
