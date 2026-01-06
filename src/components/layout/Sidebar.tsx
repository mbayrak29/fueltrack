import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  Fuel, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  Plus,
  List
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'EV Stations', href: '/ev-stations', icon: Zap },
  { name: 'Add EV Station', href: '/ev-stations/add', icon: Plus },
  { name: 'EV Network Demo', href: '/ev-network-demo', icon: Zap },
  { name: 'Fuel Stations', href: '/fuel-stations', icon: Fuel },
  { name: 'Add Fuel Station', href: '/fuel-stations/add', icon: Plus },
  { name: 'Route Cost Planner', href: '/route-cost-planner', icon: BarChart3 },
  { name: 'Compare Prices', href: '/compare', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-ev">
            <Zap className="h-4 w-4 text-ev-foreground" />
          </div>
          <span className="font-display font-semibold text-sidebar-foreground text-lg">
            FuelTrack
          </span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
