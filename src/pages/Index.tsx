import { Button } from "@/components/ui/button";
import { MapPin, Users, Briefcase, Heart, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Connect to <span className="text-primary-glow">Opportunities</span> Around You
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-95 leading-relaxed">
              ProxiLink brings together youth, businesses, and communities across Africa
              through real-time proximity-based connections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link to="/signup">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Who We Serve</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for the dynamic African ecosystem
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card rounded-xl p-8 shadow-soft border border-border hover:shadow-strong transition-all">
            <div className="w-14 h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">For Youth</h3>
            <p className="text-muted-foreground mb-6">
              Discover jobs, gigs, learning opportunities, and community events happening near you in real-time
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm">Real-time job alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm">Learning opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm">Community events</span>
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-soft border border-border hover:shadow-strong transition-all">
            <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center mb-6">
              <Briefcase className="h-7 w-7 text-secondary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">For MSMEs & Vendors</h3>
            <p className="text-muted-foreground mb-6">
              Broadcast your services and products to nearby customers at low cost with instant visibility
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm">Service broadcasting</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm">Analytics dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm">Customer reviews</span>
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-soft border border-border hover:shadow-strong transition-all">
            <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center mb-6">
              <Heart className="h-7 w-7 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">For NGOs</h3>
            <p className="text-muted-foreground mb-6">
              Alert communities about events, health drives, and awareness campaigns with targeted reach
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm">Event broadcasting</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm">Community engagement</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm">Impact tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How ProxiLink Works</h2>
            <p className="text-muted-foreground text-lg">Simple, fast, and effective</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">1</div>
              <h3 className="font-bold mb-2 text-lg">Register</h3>
              <p className="text-muted-foreground text-sm">Choose your role: Youth, Vendor, or NGO</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">2</div>
              <h3 className="font-bold mb-2 text-lg">Enable Location</h3>
              <p className="text-muted-foreground text-sm">Share your location for proximity-based matching</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">3</div>
              <h3 className="font-bold mb-2 text-lg">Discover & Connect</h3>
              <p className="text-muted-foreground text-sm">Find opportunities or broadcast services nearby</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">4</div>
              <h3 className="font-bold mb-2 text-lg">Grow Together</h3>
              <p className="text-muted-foreground text-sm">Build connections and opportunities in your community</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="bg-gradient-hero rounded-2xl p-12 md:p-16 text-center text-primary-foreground shadow-strong">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Connect?</h2>
          <p className="text-lg md:text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            Join thousands of youth, businesses, and organizations building a connected Africa
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg">
            <Link to="/signup">
              Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 ProxiLink. Empowering African communities through proximity.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
