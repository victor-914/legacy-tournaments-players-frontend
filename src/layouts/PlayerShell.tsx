"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Wifi, WifiOff } from "lucide-react";
import styled from "styled-components";
import { playerNavigation } from "@/constants/navigation";
import { useLiveEvents } from "@/hooks/useLiveEvents";
import { authService } from "@/services/authService";
import { playerService } from "@/services/playerService";
import { socketClient } from "@/socket/socketClient";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useSocketStore } from "@/store/socketStore";
import type { PlayerMeCycle, PlayerMeSeason } from "@/types/domain";
import { isApprovedPlayer } from "@/utils/approval";

export function PlayerShell({ children }: { children: React.ReactNode }) {
  useLiveEvents();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const clearSession = useAuthStore((state) => state.clearSession);
  const connected = useSocketStore((state) => state.connected);
  const notifications = useNotificationStore((state) => state.notifications);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const playerQuery = useQuery({ queryKey: ["players-me"], queryFn: playerService.getMe });
  const approved = isApprovedPlayer(playerQuery.data);
  const seasonCycleLabel = getSeasonCycleLabel(playerQuery.isLoading, playerQuery.data?.season, playerQuery.data?.cycle);
  const activeNavItem = getActiveNavItem(pathname);
  const currentScreenLabel = activeNavItem?.label === "Dashboard" ? "Home" : activeNavItem?.label ?? "Player Arena";

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Local logout must complete even when the backend logout route is unavailable.
    } finally {
      clearSession();
      socketClient.disconnect();
      queryClient.clear();
      router.replace("/login");
    }
  }

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <Mark>LG</Mark>
          <span>Legacy Gaming</span>
        </Brand>
        <Nav>
          {playerNavigation.slice(0, 7).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const blocked = !approved && blockedTournamentRoutes.has(item.href);
            return (
              <Link
                key={item.href}
                href={blocked ? "/dashboard" : item.href}
                data-active={active}
                data-disabled={blocked}
                title={blocked ? "Your account is waiting for admin approval. Tournament actions will be available after approval." : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </Nav>
      </Sidebar>
      <Main>
        <Topbar>
          <div>
            <Kicker>{seasonCycleLabel}</Kicker>
            <h1>{currentScreenLabel}</h1>
          </div>
          <TopActions>
            <SocketState $connected={connected} aria-label={connected ? "Socket connected" : "Socket disconnected"} title={connected ? "Socket connected" : "Socket disconnected"}>
              {connected ? <Wifi size={17} /> : <WifiOff size={17} />}
              <span>{connected ? "Live" : "Offline"}</span>
            </SocketState>
            <NotificationButton
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell size={18} />
              {unreadCount > 0 ? <b>{unreadCount}</b> : null}
            </NotificationButton>
            {notificationsOpen ? (
              <NotificationPanel>
                <NotificationHeader>
                  <strong>Notifications</strong>
                  {unreadCount > 0 ? (
                    <button type="button" onClick={markAllRead}>
                      Mark read
                    </button>
                  ) : null}
                </NotificationHeader>
                {notifications.length > 0 ? (
                  <NotificationList>
                    {notifications.slice(0, 5).map((notification) => (
                      <li key={notification.id} data-read={notification.read}>
                        <span>{notification.message}</span>
                        <small>{formatNotificationTime(notification.createdAt)}</small>
                      </li>
                    ))}
                  </NotificationList>
                ) : (
                  <EmptyNotifications>No notifications yet</EmptyNotifications>
                )}
              </NotificationPanel>
            ) : null}
            <IconButton type="button" onClick={() => void logout()} aria-label="Log out" title="Log out">
              <LogOut size={18} />
            </IconButton>
          </TopActions>
        </Topbar>
        <Content>{children}</Content>
      </Main>
      <MobileNav>
        {playerNavigation.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const blocked = !approved && blockedTournamentRoutes.has(item.href);
          return (
            <Link
              key={item.href}
              href={blocked ? "/dashboard" : item.href}
              data-active={active}
              data-disabled={blocked}
              aria-label={item.label}
              title={blocked ? "Pending approval" : undefined}
            >
              <Icon size={21} />
              <span>{item.label === "Dashboard" ? "Home" : item.label}</span>
            </Link>
          );
        })}
        <button type="button" onClick={() => void logout()} aria-label="Log out">
          <LogOut size={21} />
        </button>
      </MobileNav>
    </Shell>
  );
}

function getActiveNavItem(pathname: string) {
  return playerNavigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

function getSeasonCycleLabel(isLoading: boolean, season?: PlayerMeSeason | null, cycle?: PlayerMeCycle | null) {
  if (isLoading) {
    return "Loading season";
  }

  if (!season) {
    return "No active season";
  }

  const seasonLabel = season.name || season.code || "Active season";
  if (!cycle) {
    return `${seasonLabel} / No active cycle`;
  }

  const cycleNumber = cycle.number ?? cycle.cycleNumber;
  const cycleLabel = cycle.name || (cycleNumber !== undefined ? `Cycle ${cycleNumber}` : "Active cycle");
  return `${seasonLabel} / ${cycleLabel}`;
}

function formatNotificationTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

const blockedTournamentRoutes = new Set<string>([
  "/find-match",
  "/live-match",
  "/tournaments",
  "/group-stage"
]);

const Shell = styled.div`
  min-height: 100vh;
  display: grid;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 17rem 1fr;
  }
`;

const Sidebar = styled.aside`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.25rem;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    background: rgba(11, 11, 11, 0.72);
    backdrop-filter: blur(18px);
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 900;
`;

const Mark = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #0b0b0b;
  background: ${({ theme }) => theme.colors.gold};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
`;

const Nav = styled.nav`
  display: grid;
  gap: 0.35rem;

  a {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 2.75rem;
    padding: 0 0.8rem;
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.textMuted};
    border: 1px solid transparent;
  }

  a[data-active="true"] {
    color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.goldSoft};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  a[data-disabled="true"] {
    opacity: 0.5;
  }
`;

const Main = styled.main`
  min-width: 0;
`;

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.5rem;
  padding: 0.9rem 1rem;
  background: rgba(11, 11, 11, 0.74);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(18px);

  h1 {
    margin: 0;
    font-size: 1.05rem;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0.9rem 1.5rem;
  }
`;

const Kicker = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const TopActions = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const SocketState = styled.div<{ $connected: boolean }>`
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  color: ${({ $connected, theme }) => ($connected ? theme.colors.success : theme.colors.textDim)};
  font-size: 0.82rem;
  font-weight: 900;

  span {
    display: none;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: auto;
    height: 2.5rem;
    padding: 0 0.8rem;

    span {
      display: inline;
    }
  }
`;

const IconButton = styled.button`
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceGlass};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  b {
    position: absolute;
    top: -0.35rem;
    right: -0.25rem;
    min-width: 1.15rem;
    height: 1.15rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.error};
    font-size: 0.68rem;
  }
`;

const NotificationButton = styled(IconButton)``;

const NotificationPanel = styled.div`
  position: absolute;
  top: calc(100% + 0.7rem);
  right: 3.15rem;
  width: min(20rem, calc(100vw - 2rem));
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: rgba(22, 22, 22, 0.96);
  box-shadow: ${({ theme }) => theme.shadows.panel};
  backdrop-filter: blur(18px);
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.6rem;

  strong {
    font-size: 0.88rem;
  }

  button {
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.gold};
    font: inherit;
    font-size: 0.75rem;
    font-weight: 900;
    cursor: pointer;
  }
`;

const NotificationList = styled.ul`
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    gap: 0.25rem;
    padding: 0.65rem;
    border-radius: 7px;
    background: ${({ theme }) => theme.colors.surfaceGlass};
    color: ${({ theme }) => theme.colors.text};
  }

  li[data-read="false"] {
    border-left: 3px solid ${({ theme }) => theme.colors.gold};
  }

  span {
    font-size: 0.82rem;
    line-height: 1.35;
  }

  small {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.7rem;
  }
`;

const EmptyNotifications = styled.p`
  margin: 0;
  padding: 0.9rem 0.65rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.82rem;
`;

const Content = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 1rem 1rem 5.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1.5rem 1.5rem 6rem;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding-bottom: 2rem;
  }
`;

const MobileNav = styled.nav`
  position: fixed;
  z-index: 30;
  left: 0.8rem;
  right: 0.8rem;
  bottom: 0.75rem;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.35rem;
  padding: 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: rgba(22, 22, 22, 0.86);
  backdrop-filter: blur(18px);

  a,
  button {
    min-height: 2.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    border-radius: 7px;
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
  }

  a span {
    display: none;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.7rem;
    font-weight: 900;
  }

  a[data-active="true"] {
    grid-column: span 2;
    color: #0b0b0b;
    background: ${({ theme }) => theme.colors.gold};
  }

  a[data-disabled="true"] {
    opacity: 0.5;
  }

  a[data-active="true"] span {
    display: inline;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;
