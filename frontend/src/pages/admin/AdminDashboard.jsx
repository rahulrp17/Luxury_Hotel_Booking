import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Icon from "@/components/ui/Icons";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import { analyticsService, bookingService, userService } from "@/services";
import { ROUTES } from "@/constants/routes";
import { formatCurrency, formatNumber, formatDate, initials } from "@/utils/formatters";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const ANALYTICS_STALE = 5 * 60 * 1000;
const TABLES_STALE = 30 * 1000;

// Gold → deep bronze ordinal ramp for the status donut (validated on the dark
// surface against the dataviz method: monotone lightness, ≥2:1 at the light end).
const DONUT_COLORS = ["#F1D477", "#D4AF37", "#A8861F", "#6A5314", "#E7C977"];
const GOLD = "#D4AF37";
const GRID = "rgba(248,246,240,0.08)";
const AXIS = "#A8A8A8";

const ChartTooltip = ({ active, payload, label, format = (v) => v, nameFor }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-[#D4AF37]/40 bg-[#0B0B0B]/95 px-4 py-3 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      {label != null && (
        <p className="mb-1 text-xs uppercase tracking-widest text-[#A8A8A8]">{label}</p>
      )}
      {payload.map((entry, index) => (
        <p key={index} className="flex items-center gap-2 text-[#F8F6F0]">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color || entry.payload?.fill || GOLD }} />
          <span className="font-medium">{nameFor ? nameFor(entry) : format(entry.value)}</span>
        </p>
      ))}
    </div>
  );
};

const ChartCard = ({ motionProps, title, sub, children, height = "h-64" }) => (
  <motion.div variants={motionProps} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="font-serif text-lg font-medium text-[#F8F6F0]">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-[#A8A8A8]">{sub}</p>}
      </div>
    </div>
    <div className={`mt-5 ${height}`}>{children}</div>
  </motion.div>
);

const KpiCard = ({ icon, label, value, sub }) => (
  <motion.div
    variants={fadeInUp}
    className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-5 backdrop-blur-xl transition-colors hover:border-[#D4AF37]/40"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-widest text-[#A8A8A8]">{label}</span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#E7C977]">
        <Icon name={icon} size={18} />
      </span>
    </div>
    <p className="mt-2 font-serif text-3xl font-medium leading-none text-[#F8F6F0]">{value}</p>
    {sub && <p className="mt-1.5 text-xs text-[#A8A8A8]">{sub}</p>}
  </motion.div>
);

const DonutCard = ({ title, data, total, colors }) => (
  <motion.div variants={fadeInUp} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl">
    <h2 className="font-serif text-lg font-medium text-[#F8F6F0]">{title}</h2>
    <div className="relative mt-5 h-64">
      {total > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={3}
              stroke="none"
              animationDuration={700}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={<ChartTooltip format={(v) => formatNumber(v)} />}
              cursor={{ fill: "rgba(212,175,55,0.06)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-[#A8A8A8]">No bookings recorded.</p>
        </div>
      )}
      {total > 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-serif text-4xl font-medium text-[#F8F6F0]">{formatNumber(total)}</p>
          <p className="text-xs uppercase tracking-widest text-[#A8A8A8]">Total bookings</p>
        </div>
      )}
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2">
      {data.map((entry, index) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs text-[#A8A8A8]">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colors[index % colors.length] }} />
          <span className="truncate">{entry.name}</span>
          <span className="ml-1 shrink-0 font-bold text-[#E7C977]">{formatNumber(entry.value)}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

/**
 * Admin BI dashboard: real KPIs + Recharts (area/bar/donut), gold-on-black
 * luxury. All metrics come from the existing analytics + admin list endpoints.
 */
const AdminDashboard = () => {
  const authUser = useAppSelector(selectUser);

  const overview = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: analyticsService.overview,
    staleTime: ANALYTICS_STALE,
  });
  const bookingSummary = useQuery({
    queryKey: ["analytics", "booking-summary"],
    queryFn: analyticsService.bookingSummary,
    staleTime: ANALYTICS_STALE,
  });
  const revenue = useQuery({
    queryKey: ["analytics", "revenue"],
    queryFn: analyticsService.revenue,
    staleTime: ANALYTICS_STALE,
  });
  const topHotels = useQuery({
    queryKey: ["analytics", "top-hotels"],
    queryFn: analyticsService.topHotels,
    staleTime: ANALYTICS_STALE,
  });
  const recentBookings = useQuery({
    queryKey: ["admin", "recent-bookings"],
    queryFn: () => bookingService.adminGetRecent({ page: 1, limit: 5 }),
    staleTime: TABLES_STALE,
  });
  const recentUsers = useQuery({
    queryKey: ["admin", "recent-users"],
    queryFn: () => userService.adminGetRecent({ page: 1, limit: 5 }),
    staleTime: TABLES_STALE,
  });

  const stats = overview.data?.data;
  const summary = bookingSummary.data?.data;
  const revenueData = useMemo(
    () =>
      (revenue.data?.data || []).map((d) => ({
        label: d._id,
        revenue: d.revenue || 0,
        bookings: d.bookingsCount || 0,
      })),
    [revenue.data]
  );

  const hotelRevenueData = useMemo(
    () => (topHotels.data?.data || []).map((h) => ({ name: h.hotelName, revenue: h.revenue || 0 })),
    [topHotels.data]
  );

  const donutData = useMemo(() => {
    const counts = summary?.statusCounts || {};
    const base = [
      { name: "Confirmed", value: (counts.CONFIRMED || 0) + (counts.CHECKED_IN || 0) },
      { name: "Checked out", value: counts.CHECKED_OUT || 0 },
      { name: "Completed", value: counts.COMPLETED || 0 },
      { name: "Pending", value: counts.PENDING || 0 },
      { name: "Cancelled", value: (counts.CANCELLED || 0) + (counts.REFUNDED || 0) },
    ];
    return base.filter((d) => d.value > 0);
  }, [summary]);

  const bookingsList = recentBookings.data?.data || [];
  const usersList = recentUsers.data?.data || [];

  return (
    <>
      <Seo title="Admin dashboard" description="AureliaStay administration and analytics." />

      <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="-m-4 min-h-[calc(100vh-4rem)] bg-[#050505] px-4 py-8 sm:-m-6 sm:px-6 sm:py-10 lg:-m-8 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
        {/* Greeting */}
        <motion.div variants={fadeInUp} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Management console</p>
            <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F8F6F0] sm:text-4xl">
              {(() => {
                const hour = new Date().getHours();
                const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
                const name = authUser?.name?.split(" ")[0];
                return `Good ${part}, ${name || "Admin"}`;
              })()}
            </h1>
            <p className="mt-1 text-sm text-[#A8A8A8]">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <p className="hidden text-xs uppercase tracking-widest text-[#A8A8A8] sm:block">Platform performance</p>
        </motion.div>

        {/* Analytics error state — never masquerade a failed fetch as ₹0 / 0% */}
        {(overview.isError || bookingSummary.isError || revenue.isError || topHotels.isError) && (
          <motion.div variants={fadeInUp} className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <Icon name="info" size={16} className="mt-0.5 shrink-0 text-red-400" />
            <span>Some analytics could not be loaded from the server. Check the backend logs and retry — the figures below are not showing zero because data is missing.</span>
          </motion.div>
        )}

        {/* KPI cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard icon="check" label="Total revenue" value={stats ? formatCurrency(stats.totalRevenue) : "—"} sub={stats ? "Net of refunds" : overview.isError ? "Unavailable" : "Loading…"} />
          <KpiCard icon="calendar" label="Total bookings" value={summary ? formatNumber(summary.totalBookings) : "—"} sub={summary ? `${summary.pendingBookings} awaiting payment` : bookingSummary.isError ? "Unavailable" : "Loading…"} />
          <KpiCard icon="user" label="Total users" value={stats ? formatNumber(stats.totalUsers) : "—"} sub={stats ? "Registered guests" : overview.isError ? "Unavailable" : "Loading…"} />
          <KpiCard icon="mapPin" label="Total hotels" value={stats ? formatNumber(stats.totalHotels) : "—"} sub={stats ? "Active properties" : overview.isError ? "Unavailable" : "Loading…"} />
          <KpiCard icon="activity" label="Occupancy rate" value={summary ? `${summary.occupancyRate}%` : "—"} sub={summary ? "Next 7 days · real inventory" : bookingSummary.isError ? "Unavailable" : "Loading…"} />
          <KpiCard icon="clock" label="Pending bookings" value={summary ? formatNumber(summary.pendingBookings) : "—"} sub={summary && summary.pendingBookings > 0 ? "Needs attention" : summary ? "All cleared" : "Loading…"} />
        </div>

        {/* Revenue + Bookings charts */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard
            motionProps={fadeInUp}
            title="Revenue overview"
            sub="Last 30 days · net of refunds (IST)"
            height="h-64"
          >
            {revenue.isLoading ? (
              <SkeletonLoader.Block className="h-full w-full" />
            ) : revenue.isError ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-red-300">Revenue could not be loaded.</p></div>
            ) : revenueData.length === 0 ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-[#A8A8A8]">No revenue recorded in this period.</p></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GOLD} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={28} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatNumber(v)} width={46} />
                  <Tooltip content={<ChartTooltip format={(v) => formatCurrency(v)} />} cursor={{ stroke: GOLD, strokeDasharray: "3 3", strokeOpacity: 0.4 }} />
                  <Area type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} fill="url(#revenueGold)" animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            motionProps={fadeInUp}
            title="Bookings overview"
            sub="New bookings per day · last 30 days"
            height="h-64"
          >
            {revenue.isLoading ? (
              <SkeletonLoader.Block className="h-full w-full" />
            ) : revenue.isError ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-red-300">Bookings could not be loaded.</p></div>
            ) : revenueData.length === 0 ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-[#A8A8A8]">No bookings recorded in this period.</p></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={28} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatNumber(v)} width={40} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip format={(v) => formatNumber(v)} />} cursor={{ fill: "rgba(212,175,55,0.06)" }} />
                  <Bar dataKey="bookings" fill={GOLD} radius={[3, 3, 0, 0]} maxBarSize={18} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Donut + Revenue by hotel */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DonutCard title="Booking status" data={donutData} total={summary?.totalBookings || 0} colors={DONUT_COLORS} />

          <ChartCard
            motionProps={fadeInUp}
            title="Revenue by hotel"
            sub="Top performing properties · all time"
            height="h-64"
          >
            {topHotels.isLoading ? (
              <SkeletonLoader.Block className="h-full w-full" />
            ) : hotelRevenueData.length === 0 ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-[#A8A8A8]">No revenue data yet.</p></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hotelRevenueData} layout="vertical" margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatNumber(v)} />
                  <YAxis type="category" dataKey="name" tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} width={132} />
                  <Tooltip content={<ChartTooltip format={(v) => formatCurrency(v)} />} cursor={{ fill: "rgba(212,175,55,0.06)" }} />
                  <Bar dataKey="revenue" fill={GOLD} radius={[0, 3, 3, 0]} barSize={16} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Recent bookings + recent users */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <motion.div variants={fadeInUp} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-lg font-medium text-[#F8F6F0]">Recent bookings</h2>
              <Link to={ROUTES.ADMIN_BOOKINGS} className="text-xs font-medium text-[#D4AF37] transition-colors hover:text-[#F1D477]">View all</Link>
            </div>
            {recentBookings.isLoading ? (
              <div className="mt-4 space-y-3"><SkeletonLoader.Block className="h-12 w-full" /><SkeletonLoader.Block className="h-12 w-full" /></div>
            ) : recentBookings.isError ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 py-8 text-center">
                <Icon name="info" size={24} className="mx-auto text-red-400" />
                <p className="mt-2 text-sm text-red-300">Unable to load recent bookings.</p>
              </div>
            ) : bookingsList.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-[#D4AF37]/25 py-8 text-center">
                <Icon name="calendar" size={24} className="mx-auto text-[#A8A8A8]" />
                <p className="mt-2 text-sm text-[#A8A8A8]">No bookings yet.</p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/12 text-left text-[#A8A8A8]">
                      <th className="py-2 pr-3 font-medium">Guest</th>
                      <th className="py-2 pr-3 font-medium">Hotel</th>
                      <th className="py-2 pr-3 font-medium">ID</th>
                      <th className="py-2 pr-3 font-medium">Status</th>
                      <th className="py-2 pr-3 text-right font-medium">Amount</th>
                      <th className="py-2 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/8">
                    {bookingsList.map((b) => (
                      <tr key={b._id} className="transition-colors hover:bg-white/[0.03]">
                        <td className="py-2.5 pr-3 font-medium text-[#F8F6F0]">{b.user?.name || "Guest"}</td>
                        <td className="py-2.5 pr-3 text-[#A8A8A8]">{b.hotel?.name || "—"}</td>
                        <td className="py-2.5 pr-3 text-[#E7C977]">{b.bookingId}</td>
                        <td className="py-2.5 pr-3"><StatusBadge status={b.status} /></td>
                        <td className="py-2.5 pr-3 text-right font-medium text-[#F8F6F0]">{formatCurrency(b.pricing?.totalAmount)}</td>
                        <td className="py-2.5 text-right text-[#A8A8A8]">{formatDate(b.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeInUp} className="rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-lg font-medium text-[#F8F6F0]">Recent users</h2>
              <Link to={ROUTES.ADMIN_USERS} className="text-xs font-medium text-[#D4AF37] transition-colors hover:text-[#F1D477]">View all</Link>
            </div>
            {recentUsers.isLoading ? (
              <div className="mt-4 space-y-3"><SkeletonLoader.Block className="h-12 w-full" /><SkeletonLoader.Block className="h-12 w-full" /></div>
            ) : recentUsers.isError ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 py-8 text-center">
                <Icon name="info" size={24} className="mx-auto text-red-400" />
                <p className="mt-2 text-sm text-red-300">Unable to load recent users.</p>
              </div>
            ) : usersList.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-[#D4AF37]/25 py-8 text-center">
                <Icon name="user" size={24} className="mx-auto text-[#A8A8A8]" />
                <p className="mt-2 text-sm text-[#A8A8A8]">No registered users yet.</p>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-[#D4AF37]/8">
                {usersList.map((u) => (
                  <li key={u._id} className="flex items-center gap-3 py-2.5">
                    {u.avatar?.url ? (
                      <img src={u.avatar.url} alt={u.name || "User"} className="h-10 w-10 shrink-0 rounded-full border border-[#D4AF37]/40 object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 font-serif text-sm font-semibold text-[#E7C977]">
                        {initials(u.name)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-[#F8F6F0]">{u.name || "User"}</span>
                      <span className="block truncate text-xs text-[#A8A8A8]">{u.email}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-xs text-[#A8A8A8]">{formatDate(u.createdAt)}</span>
                      <span className={`mt-0.5 flex items-center justify-end gap-1.5 text-xs ${u.isActive ? "text-[#F1D477]" : "text-[#A8A8A8]"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-[#D4AF37]" : "bg-[#6D6D6D]"}`} />
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
        </div>
      </motion.div>
    </>
  );
};

export default AdminDashboard;