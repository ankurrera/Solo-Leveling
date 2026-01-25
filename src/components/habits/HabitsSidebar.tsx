import { useState } from "react";
import { Home, Target, Trophy, CheckCircle2, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const HabitsSidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("habits");

  const menuItems = [
    { id: "awakening", label: "Awakening", icon: Home, path: "/" },
    { id: "habits", label: "Habits", icon: Target, path: "/habits" },
    { id: "habit-goals", label: "Habit Goals", icon: Trophy, path: "/habits#goals" },
    { id: "completed", label: "Completed", icon: CheckCircle2, path: "/habits#completed" },
    { id: "gates", label: "Gates", icon: Shield, path: "/gates" },
  ];

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50">
      <div className="system-panel p-4 rounded-[16px] space-y-2 min-w-[180px]">
        {menuItems.map((item) => {
          const isActive = item.id === activeItem || location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveItem(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                isActive
                  ? "bg-primary/20 border border-primary/50 text-primary"
                  : "hover:bg-card/50 text-muted-foreground hover:text-foreground border border-transparent"
              }`}
              style={{
                boxShadow: isActive ? "0 0 15px rgba(139, 92, 246, 0.3)" : "none",
              }}
            >
              <Icon
                className={`w-5 h-5 transition-all ${
                  isActive ? "text-primary" : "group-hover:text-foreground"
                }`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HabitsSidebar;
