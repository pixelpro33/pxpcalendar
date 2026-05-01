export type AppSection = "calendar" | "dashboard" | "settings";

type Props = {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
};

const ITEMS: Array<{
  id: AppSection;
  label: string;
  icon: string;
}> = [
  {
    id: "calendar",
    label: "Calendar",
    icon: "📅",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
  },
];

export default function AppNavigation({
  activeSection,
  setActiveSection,
}: Props) {
  return (
    <nav className="pxp-app-nav" aria-label="App navigation">
      {ITEMS.map((item) => {
        const active = activeSection === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`pxp-app-nav-button ${active ? "is-active" : ""}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="pxp-app-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
