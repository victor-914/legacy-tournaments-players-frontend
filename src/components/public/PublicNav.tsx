"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Tournaments", href: "/#tournaments" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

export function PublicNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Bar>
      <Inner>
        <Brand href="/" onClick={() => setIsOpen(false)}>
          <LogoMark>
            <img src="/legacy_logo.jpeg" alt="Legacy Esports" width={40} height={40} />
          </LogoMark>
          <span>Legacy Esports</span>
        </Brand>

        <DesktopLinks>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} $active={pathname === link.href}>
              {link.label}
            </NavLink>
          ))}
        </DesktopLinks>

        <DesktopActions>
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary">Join Tournaments</Button>
          </Link>
        </DesktopActions>

        <MenuToggle
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </MenuToggle>
      </Inner>

      <AnimatePresence>
        {isOpen ? (
          <MobilePanel
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
          >
            <MobileLinks>
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </MobileLinks>
            <MobileActions>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" fullWidth>
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button variant="primary" fullWidth>
                  Join Tournaments
                </Button>
              </Link>
            </MobileActions>
          </MobilePanel>
        ) : null}
      </AnimatePresence>
    </Bar>
  );
}

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(11, 11, 11, 0.74);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(18px);
`;

const Inner = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.5rem;
  padding: 0.9rem 1.25rem;
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 1rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
`;

const LogoMark = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  flex: none;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.glowGold};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DesktopLinks = styled.nav`
  display: none;
  align-items: center;
  gap: 1.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.textMuted)};
  transition: color ${({ theme }) => theme.animations.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DesktopActions = styled.div`
  display: none;
  align-items: center;
  gap: 0.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }
`;

const MenuToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceGlass};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const MobilePanel = styled(motion.div)`
  overflow: hidden;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(11, 11, 11, 0.92);
  backdrop-filter: blur(18px);

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const MobileLinks = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 1rem 1.25rem 0.5rem;

  a {
    padding: 0.65rem 0.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textMuted};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const MobileActions = styled.div`
  display: grid;
  gap: 0.6rem;
  padding: 1rem 1.25rem 1.5rem;
`;
