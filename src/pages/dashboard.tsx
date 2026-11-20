import { Link, useNavigate } from 'react-router';
import { ArrowRight, Car, Users, CalendarCheck, UserCheck, Clock, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { RecentBookingsTable } from '@/components/dashboard/recent-bookings-table';
import { useAdminStats } from '@/hooks/use-admin-stats';
import { useAwaitingVerification } from '@/hooks/use-payments';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: awaitingPayments } = useAwaitingVerification();
  const awaitingCount = Array.isArray(awaitingPayments) ? awaitingPayments.length : 0;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      <PageHeader
        title="Overview"
        subtitle="Platform-wide snapshot of vehicles, bookings and owners."
      />

      {/* KPI grid — 8 cards, 2 cols on mobile, 4 on desktop */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div variants={item}>
          <StatCard label="Total vehicles" value={stats?.vehicles.total ?? '—'} hint={`${stats?.vehicles.pending ?? 0} pending review`} icon={Car} href="/vehicles" isLoading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Pending vehicles" value={stats?.vehicles.pending ?? '—'} hint="Awaiting approval" icon={Clock} accent="yellow" href="/vehicles?status=PENDING_REVIEW" isLoading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Approved vehicles" value={stats?.vehicles.approved ?? '—'} hint="Live on platform" icon={CheckCircle2} accent="default" href="/vehicles?status=APPROVED" isLoading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Owner applications" value={stats?.owners.total ?? '—'} hint={`${stats?.owners.pending ?? 0} pending`} icon={Users} accent="blue" href="/owners" isLoading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Total bookings" value={stats?.bookings.total ?? '—'} hint={`${stats?.bookings.active ?? 0} active now`} icon={CalendarCheck} href="/bookings" isLoading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Active rentals" value={stats?.bookings.active ?? '—'} hint="Currently ongoing" icon={Zap} accent="default" href="/bookings?status=ACTIVE" isLoading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Completed" value={stats?.bookings.completed ?? '—'} hint="All time" icon={CheckCircle2} accent="default" href="/bookings?status=COMPLETED" isLoading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Customers" value={stats?.customers.total ?? '—'} hint="Registered accounts" icon={UserCheck} accent="blue" isLoading={isLoading} />
        </motion.div>
      </motion.div>

      {/* Two-column layout: recent bookings + needs attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent bookings — takes 2/3 */}
        <Card className="lg:col-span-2 bg-[var(--color-card-background)] border-[#FFFFFF1A]">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-base font-semibold text-foreground">Recent bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-[var(--color-gray-text)] hover:text-foreground">
              <Link to="/bookings">View all <ArrowRight className="size-3.5 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            <RecentBookingsTable bookings={stats?.recentBookings ?? []} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Needs attention sidebar — 1/3 */}
        <div className="flex flex-col gap-4">

          {/* Pending vehicles */}
          <Card className="bg-[var(--color-card-background)] border-[#FFFFFF1A]">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold text-foreground">Pending vehicles</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-[var(--color-gray-text)] hover:text-foreground">
                <Link to="/vehicles?status=PENDING_REVIEW">View all <ArrowRight className="size-3.5 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {!isLoading && (stats?.vehicles.pending ?? 0) === 0 && (
                <p className="text-sm text-[var(--color-gray-text)]">No vehicles pending review.</p>
              )}
              {(stats?.vehicles.pending ?? 0) > 0 && (
                <button
                  onClick={() => navigate('/vehicles?status=PENDING_REVIEW')}
                  className="flex items-center justify-between gap-3 p-3 rounded-md bg-white/5 hover:bg-white/10 transition text-left w-full"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{stats?.vehicles.pending} vehicle{stats?.vehicles.pending !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-[var(--color-gray-text)]">Awaiting your approval</p>
                  </div>
                  <StatusBadge status="PENDING_REVIEW" />
                </button>
              )}
            </CardContent>
          </Card>

          {/* Pending owner applications */}
          <Card className="bg-[var(--color-card-background)] border-[#FFFFFF1A]">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold text-foreground">Owner applications</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-[var(--color-gray-text)] hover:text-foreground">
                <Link to="/owners?status=PENDING">View all <ArrowRight className="size-3.5 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {!isLoading && (stats?.owners.pending ?? 0) === 0 && (
                <p className="text-sm text-[var(--color-gray-text)]">No pending applications.</p>
              )}
              {(stats?.owners.pending ?? 0) > 0 && (
                <button
                  onClick={() => navigate('/owners?status=PENDING')}
                  className="flex items-center justify-between gap-3 p-3 rounded-md bg-white/5 hover:bg-white/10 transition text-left w-full"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{stats?.owners.pending} application{stats?.owners.pending !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-[var(--color-gray-text)]">Awaiting your review</p>
                  </div>
                  <StatusBadge status="PENDING" />
                </button>
              )}
            </CardContent>
          </Card>

          {/* Awaiting verification payments — only shown when count > 0 (auto-hides in automatic mode) */}
          {awaitingCount > 0 && (
            <Card className="bg-[var(--color-card-background)] border-[#FFFFFF1A]">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold text-foreground">Awaiting verification</CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-[var(--color-gray-text)] hover:text-foreground">
                  <Link to="/payments?tab=awaiting">View all <ArrowRight className="size-3.5 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0">
                <button
                  onClick={() => navigate('/payments?tab=awaiting')}
                  className="flex items-center justify-between gap-3 p-3 rounded-md bg-white/5 hover:bg-white/10 transition text-left w-full"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {awaitingCount} receipt{awaitingCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-[var(--color-gray-text)]">Manual payments pending review</p>
                  </div>
                  <StatusBadge status="AWAITING_VERIFICATION" />
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
