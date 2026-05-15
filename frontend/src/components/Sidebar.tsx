import { LayoutDashboard, Settings, Settings2, ChartBar } from "lucide-react";

import { useNavigate } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();

  const items = [
    {
      label: "Principal",
      icon: LayoutDashboard,
      onClick: () => navigate("/"),
    },
    {
      label: "Gestión",
      icon: Settings2,
      onClick: () => navigate("/gestion"),
    },
    {
      label: "Informes",
      icon: ChartBar,
      onClick: () => navigate("/informes"),
    },
    {
      label: "Admin",
      icon: Settings,
      onClick: () => navigate("/admin"),
    },
  ];
  return (
    <div
      className="
        rounded-2xl
        bg-white
        p-3 lg:p-4
        shadow-sm
        border
        border-zinc-200
      "
    >
      <nav className="flex flex-col items-center lg:items-stretch gap-1 lg:gap-3 w-full">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={item.onClick}
              title={item.label}
              className="
                flex items-center gap-3 lg:justify-start justify-center
                rounded-xl
                p-3 lg:px-4 lg:py-3
                transition
                hover:bg-zinc-100
                cursor-pointer w-full
              "
            >
              <Icon size={18} className="shrink-0" />
              <span className="font-medium hidden lg:inline whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}