"use client";

import { useEffect, useState } from "react";

export type AppSection = "calendar" | "dashboard" | "settings";

type Props = {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  variant?: "desktop" | "mobile";
};

const ITEMS: Array<{
  id: AppSection;
  label: string;
  icon: string;
}> = [
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function AppNavigation({
  activeSection,
  setActiveSection,
  variant = "desktop",
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSelect(section: AppSection) {
    setActiveSection(section);
    setMobileOpen(false);
  }

  if (variant === "mobile") {
    return (
      <>
        <button
          type="button"
          className="pxp-mobile-menu-button"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>

        {mobileOpen && (
          <div
            className="pxp-mobile-menu-overlay"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="pxp-mobile-menu-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pxp-mobile-menu-head">
                <div>
                  <div className="pxp-mobile-menu-kicker">Navigation</div>
                  <div className="pxp-mobile-menu-title">Meniu</div>
                </div>

                <button
                  type="button"
                  className="pxp-mobile-menu-close"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="pxp-mobile-menu-list">
                {ITEMS.map((item) => {
                  const active = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`pxp-mobile-menu-item ${
                        active ? "is-active" : ""
                      }`}
                      onClick={() => handleSelect(item.id)}
                    >
                      <span className="pxp-mobile-menu-item-icon">
                        {item.icon}
                      </span>

                      <span className="pxp-mobile-menu-item-text">
                        {item.label}
                      </span>

                      {active && (
                        <span className="pxp-mobile-menu-item-badge">Open</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <nav className="pxp-app-nav" aria-label="App navigation">
      {ITEMS.map((item) => {
        const active = activeSection === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`pxp-app-nav-button ${active ? "is-active" : ""}`}
            onClick={() => handleSelect(item.id)}
          >
            <span className="pxp-app-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
