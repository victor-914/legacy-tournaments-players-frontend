"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Wifi, WifiOff } from "lucide-react";
import styled from "styled-components";
import { playerNavigation } from "@/constants/navigation";
import { useLiveEvents } from "@/hooks/useLiveEvents";
import { useNotificationStore } from "@/store/notificationStore";
import { useSocketStore } from "@/store/socketStore";

export function PlayerShell({ children }: { children: React.ReactNode }) {
  useLiveEvents();
  const pathname = usePathname();
  const connected = useSocketStore((state) => state.connected);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <Mark>HG</Mark>
          <span>Hammer Games</span>
        </Brand>
        <Nav>
          {playerNavigation.slice(0, 7).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} data-active={active}>
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
            <Kicker>Season 1 / Cycle 7</Kicker>
            <h1>Player Arena</h1>
          </div>
          <TopActions>
            <SocketState $connected={connected}>
              {connected ? <Wifi size={17} /> : <WifiOff size={17} />}
              <span>{connected ? "Live" : "Offline"}</span>
            </SocketState>
            <NotificationButton aria-label="Notifications">
              <Bell size={18} />
              {unreadCount > 0 ? <b>{unreadCount}</b> : null}
            </NotificationButton>
          </TopActions>
        </Topbar>
        <Content>{children}</Content>
      </Main>
      <MobileNav>
        {playerNavigation.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} data-active={active} aria-label={item.label}>
              <Icon size={21} />
            </Link>
          );
        })}
      </MobileNav>
    </Shell>
  );
}

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
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const SocketState = styled.div<{ $connected: boolean }>`
  display: none;
  align-items: center;
  gap: 0.4rem;
  color: ${({ $connected, theme }) => ($connected ? theme.colors.success : theme.colors.textDim)};
  font-size: 0.82rem;
  font-weight: 900;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

const NotificationButton = styled.button`
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
  grid-template-columns: repeat(5, 1fr);
  gap: 0.35rem;
  padding: 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: rgba(22, 22, 22, 0.86);
  backdrop-filter: blur(18px);

  a {
    min-height: 2.75rem;
    display: grid;
    place-items: center;
    border-radius: 7px;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  a[data-active="true"] {
    color: #0b0b0b;
    background: ${({ theme }) => theme.colors.gold};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;
