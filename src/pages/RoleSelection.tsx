import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Heart } from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: "user",
      title: "I'm looking for a service",
      description: "Find nearby services, jobs, and opportunities",
      icon: Users,
      color: "bg-primary"
    },
    {
      id: "vendor",
      title: "I offer a service",
      description: "Provide services and connect with customers",
      icon: Briefcase,
      color: "bg-secondary"
    },
    {
      id: "ngo",
      title: "I represent an NGO",
      description: "Organize events and community programs",
      icon: Heart,
      color: "bg-accent"
    }
  ];

  const handleRoleSelect = (role: string) => {
    navigate(`/signup?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Who are you?</h1>
          <p className="text-muted-foreground text-lg">Choose your role to get started</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className="cursor-pointer hover:shadow-strong transition-all hover:-translate-y-1"
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader>
                  <div className={`w-16 h-16 ${role.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-primary font-medium">Select →</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/login")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Already have an account? <span className="text-primary font-medium">Sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
