import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/common/Seo";
import Button from "@/components/common/Button";
import Icon from "@/components/ui/Icons";
import Pagination from "@/components/ui/Pagination";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import { userService } from "@/services";
import { notify } from "@/services";
import { initials } from "@/utils/formatters";
import { formatDate } from "@/utils/formatters";
import { USER_ROLES } from "@/constants/enums";
import { fadeInUp, staggerContainer } from "@/theme/animations";

const PAGE_SIZE = 10;

const UserAvatar = ({ user }) => {
  const [broken, setBroken] = useState(false);
  const showImg = user.avatar?.url && !broken;

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 font-serif text-sm font-semibold text-[#E7C977]">
      {showImg ? (
        <img src={user.avatar.url} alt={user.name} onError={() => setBroken(true)} className="h-full w-full rounded-full object-cover" />
      ) : (
        initials(user.name)
      )}
    </span>
  );
};

/**
 * User management: search + paginated table + ban/unban toggle.
 */
const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const query = useQuery({
    queryKey: ["admin", "users", page, search],
    queryFn: () => userService.adminGetAll({ page, limit: PAGE_SIZE, search: search || undefined }),
    staleTime: 60 * 1000,
  });
  const users = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  }, [queryClient]);

  const toggleMutation = useMutation({
    mutationFn: (id) => userService.adminToggle(id),
    onSuccess: () => {
      notify.success("User status updated.");
      invalidate();
    },
    onError: (err) => notify.errorFrom(err, "Couldn't update that user."),
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  const runSearch = () => setSearch(searchInput.trim());

  const loading = query.isLoading && users.length === 0;

  return (
    <>
      <Seo title="Manage users" description="Manage AureliaStay customers." />

      <div className="lux-canvas">
        <div className="lux-inner">
          <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="mx-auto max-w-7xl">
            <motion.div variants={fadeInUp} className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F1D477]">Members</p>
                <h1 className="mt-1 font-serif text-3xl font-medium leading-tight text-[#F5F1E8] sm:text-4xl">Users</h1>
                <p className="mt-1 text-sm text-[#B8B2A5]">Guest accounts across the platform.</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <input
                  className="lux-input-solid mb-0 w-full sm:w-60"
                  placeholder="Search name, email, phone…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  aria-label="Search users"
                />
                <Button variant="ghost" onClick={runSearch} disabled={!searchInput.trim()}>
                  <Icon name="search" size={16} /> Search
                </Button>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-6 overflow-hidden rounded-2xl border border-[#D4AF37]/18 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
              {loading ? (
                <div className="p-5"><SkeletonLoader.Card tone="dark" /></div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="font-serif text-xl text-[#F5F1E8]">No users found</p>
                  <p className="mt-1 text-sm text-[#B8B2A5]">{search ? "No accounts match your search." : "Accounts will appear here as guests join."}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] mx- text-sm">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/15 bg-white/[0.02]">
                        <th className="lux-table-th pl-2">User</th>
                        <th className="lux-table-th">Email</th>
                        <th className="lux-table-th">Phone</th>
                        <th className="lux-table-th">Role</th>
                        <th className="lux-table-th">Status</th>
                        <th className="lux-table-th">Joined</th>
                        <th className="lux-table-th text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {users.map((user) => (
                        <tr key={user._id} className="transition-colors hover:bg-white/[0.03]">
                          <td className="lux-table-td">
                            <div className="flex items-center pl-1 gap-3">
                              <UserAvatar user={user} />
                              <p className="truncate font-medium text-[#F5F1E8]">{user.name}</p>
                            </div>
                          </td>
                          <td className="lux-table-td-sub">{user.email || "—"}</td>
                          <td className="lux-table-td-sub">{user.phone || "—"}</td>
                          <td className="lux-table-td">
                            <span className="inline-flex rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#E7C977]">
                              {user.role}
                            </span>
                          </td>
                          <td className="lux-table-td">
                            {user.isActive ? (
                              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-300">
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="lux-table-td-sub">{formatDate(user.createdAt)}</td>
                          <td className="lux-table-td">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => toggleMutation.mutate(user._id)}
                                disabled={user.role === USER_ROLES.ADMIN}
                                className="lux-icon-btn"
                                aria-label={user.isActive ? `Suspend ${user.name}` : `Reactivate ${user.name}`}
                              >
                                <Icon name={user.isActive ? "close" : "check"} size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pagination?.totalPages > 1 && (
                <div className="flex justify-center border-t border-[#D4AF37]/15 p-4">
                  <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} tone="dark" />
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;