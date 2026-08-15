import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import Icon from "@/components/ui/Icons";
import Dropdown from "@/components/ui/Dropdown";
import Drawer from "@/components/ui/Drawer";
import PageTransition from "./PageTransition";
import useAuth from "@/hooks/useAuth";

const USER_NAV = [
  { to: ROUTES.HOME, label: "Home", icon: "home" },
  { to: ROUTES.ACCOUNT, label: "Overview", icon: "dashboard" },
  { to: ROUTES.PROFILE, label: "Profile", icon: "user" },
  { to: ROUTES.BOOKINGS, label: "My Bookings", icon: "calendar" },
  { to: ROUTES.ACCOUNT_WISHLIST, label: "Wishlist", icon: "star" },
  { to: ROUTES.NOTIFICATIONS, label: "Notifications", icon: "bell" },
];

const ADMIN_NAV = [
  { to: ROUTES.HOME, label: "Home", icon: "home" },
  { to: ROUTES.ADMIN_DASHBOARD, label: "Dashboard", icon: "dashboard" },
  { to: ROUTES.ADMIN_HOTELS, label: "Hotels", icon: "mapPin" },
  { to: ROUTES.ADMIN_ROOMS, label: "Rooms", icon: "info" },
  { to: ROUTES.ADMIN_BOOKINGS, label: "Bookings", icon: "calendar" },
  { to: ROUTES.ADMIN_USERS, label: "Users", icon: "user" },
  { to: ROUTES.ADMIN_OFFERS, label: "Offers", icon: "star" },
  { to: ROUTES.ADMIN_AMENITIES, label: "Amenities", icon: "info" },
  { to: ROUTES.ADMIN_ANALYTICS, label: "Analytics", icon: "dashboard" },
];

const navItemClass = ({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-[#D4AF37]/10 text-[#E7C977] shadow-[inset_3px_0_0_0_#D4AF37]" : "text-[#A8A8A8] hover:bg-white/[0.03] hover:text-[#F8F6F0]"}`;

const SidebarContent = ({ nav, onNavigate }) => (
  <nav className="flex flex-col gap-1" aria-label="Dashboard">
    {nav.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={navItemClass}
      >
        <Icon
          name={item.icon}
          size={18}
          className="shrink-0 transition-colors group-hover:text-[#E7C977]"
        />
        {item.label}
      </NavLink>
    ))}
  </nav>
);

function AvatarChip({ user }) {
  const avatarUrl = user?.avatar?.url || "";
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || "Account"}
        className="h-9 w-9 rounded-full border border-[#D4AF37]/50 object-cover"
      />
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37] text-sm font-semibold text-[#0B0B0B]">
      {user?.name?.[0]?.toUpperCase() || "U"}
    </span>
  );
}

/**
 * App dashboard shell: collapsible sidebar + top bar + routed content. Roles
 * determine which nav items appear. On mobile the sidebar becomes a drawer.
 * Styled as a black-on-black private-bank interface with fine gold details.
 */
const DashboardLayout = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = isAdmin ? ADMIN_NAV : USER_NAV;

  const handleLogout = async () => {
    // `logout` clears Redux auth + the token cache (`logout.fulfilled` →
    // `resetAuth`-style cleanup). Navigate unconditionally in `finally` with
    // `replace` so a slow/failed network call can never block the redirect and
    // browser-back cannot reveal the still-mounted dashboard.
    try {
      await logout();
    } finally {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  const brand = (
    <Link to={ROUTES.HOME} className="flex items-baseline gap-1">
      <span className="font-serif text-lg font-semibold text-[#F8F6F0]">Aurelia</span>
      <span className="font-serif text-lg font-semibold text-[#D4AF37]">Stay</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-brand-50 text-ink">
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-[#D4AF37]/15 bg-[#080808]/95 backdrop-blur-xl transition-[width] duration-300 lg:flex ${collapsed ? "w-16" : "w-64"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#D4AF37]/15 px-4">
          {!collapsed && brand}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-full p-1.5 text-[#A8A8A8] transition-colors hover:bg-white/[0.03] hover:text-[#E7C977] focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60"
          >
            <Icon name="chevronRight" size={18} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        <div className="overflow-y-auto px-3 py-4">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  title={item.label}
                  className={({ isActive }) => `group rounded-lg p-2.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 ${isActive ? "bg-[#D4AF37]/10 text-[#E7C977]" : "text-[#A8A8A8] hover:bg-white/[0.03] hover:text-[#F8F6F0]"}`}
                >
                  <Icon name={item.icon} size={18} className="shrink-0 transition-colors group-hover:text-[#E7C977]" />
                </NavLink>
              ))}
            </div>
          ) : (
            <SidebarContent nav={nav} />
          )}
        </div>
        {/* <div className="mt-auto border-t lg:flex flex-col  border-[#D4AF37]/15 p-4">
          {!collapsed && (
            <p className="font-serif text-sm text-[#A8A8A8]">AureliaStay</p>
          )}
          <p className={`text-xs  uppercase tracking-[0.35em] text-[#D4AF37]/70 ${collapsed ? "mx-auto mt-2 text-center" : "mt-1"}`}>
            Black &amp; Gold
          </p>
        </div> */}
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center z-50 justify-between border-b border-[#D4AF37]/15 bg-black px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-full p-2 text-[#F8F6F0] transition-colors hover:text-[#E7C977] focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 lg:hidden"
            >
              <Icon name="menu" size={24} />
            </button>
            <span className="lg:hidden">{brand}</span>
          </div>

          {isAuthenticated && (
            <Dropdown
              dark
              trigger={
                <span className="block rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60">
                  <AvatarChip user={user} />
                </span>
              }
            >
              {({ close }) => (
                <>
                  <div className="mb-1.5 flex items-center gap-3 border-b border-[#D4AF37]/15 px-3 py-2.5">
                    <AvatarChip user={user} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#F5F1E8]">{user?.name || "Member"}</p>
                      <p className="truncate text-[8.5px] text-[#B8B2A5]">{user?.email || ""}</p>
                    </div>
                  </div>
                  <Dropdown.Item
                    icon={<Icon name="user" size={16} />}
                    onClick={() => {
                      close();
                      navigate(isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.PROFILE);
                    }}
                  >
                    {isAdmin ? "Admin Dashboard" : "My Profile"}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    icon={<Icon name="logout" size={16} />}
                    onClick={() => {
                      close();
                      handleLogout();
                    }}
                  >
                    Logout
                  </Dropdown.Item>
                </>
              )}
            </Dropdown>
          )}
        </header>

        <main className="relative flex-1 p-4 sm:p-6 lg:p-8">
          <div className="relative">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>

      {/* Mobile sidebar drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Menu"
        width="max-w-xs"
        side="left"
        panelClassName="border-r border-[#D4AF37]/15 bg-[#080808] text-[#F8F6F0]"
        backdropClassName="bg-black/70 backdrop-blur-sm"
        headerClassName="border-[#D4AF37]/15"
        titleClassName="text-[#F8F6F0]"
        closeClassName="text-[#A8A8A8] hover:bg-white/[0.03] hover:text-[#E7C977]"
      >
        <div className="mb-4">{brand}</div>
        <SidebarContent nav={nav} onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </div>
  );
};

export default DashboardLayout;