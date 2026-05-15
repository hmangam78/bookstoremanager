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
      label: "Admin",
      icon: Settings,
      onClick: () => navigate("/admin"),
    },
    {
      label: "Informes",
      icon: ChartBar,
      onClick: () => navigate("/informes"),
    },
  ];
  return (
    <div
      className="
        rounded-2xl
        bg-white
        p-4
        shadow-sm
        border
        border-zinc-200
      "
    >
      <nav className="flex flex-col gap-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className="
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                text-left
                transition
                hover:bg-zinc-100
              cursor-pointer
              "
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}