"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Tournaments", href: "/#tournaments" }
];

export function PublicNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Bar>
      <Inner>
        <Brand href="/" onClick={() => setIsOpen(false)}>
          <LogoMark>
            <Image src="/legacy_logo.jpeg" alt="Legacy Esports" width={40} height={40} />
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
          $open={isOpen}
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

const RAISED = "-6px -6px 16px rgba(255, 255, 255, 0.035), 6px 6px 18px rgba(0, 0, 0, 0.7)";
const RAISED_SOFT = "-3px -3px 9px rgba(255, 255, 255, 0.03), 3px 3px 10px rgba(0, 0, 0, 0.6)";
const PRESSED = "inset -4px -4px 10px rgba(255, 255, 255, 0.035), inset 4px 4px 12px rgba(0, 0, 0, 0.72)";

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7), inset 0 -1px 0 rgba(255, 255, 255, 0.04);
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
  text-shadow: -1px -1px 1px rgba(255, 255, 255, 0.08), 2px 2px 4px rgba(0, 0, 0, 0.75);
`;

const LogoMark = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  flex: none;
  padding: 3px;
  overflow: hidden;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: ${RAISED}, 0 0 18px rgba(212, 175, 55, 0.22);

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const DesktopLinks = styled.nav`
  display: none;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: ${PRESSED};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  padding: 0.5rem 1.05rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.textMuted)};
  box-shadow: ${({ $active }) => ($active ? PRESSED : RAISED_SOFT)};
  transition: box-shadow ${({ theme }) => theme.animations.normal},
    color ${({ theme }) => theme.animations.fast}, transform ${({ theme }) => theme.animations.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    box-shadow: ${RAISED};
  }

  &:active {
    transform: translateY(1px);
    box-shadow: ${PRESSED};
  }
`;

const DesktopActions = styled.div`
  display: none;
  align-items: center;
  gap: 0.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }

  button {
    border-color: transparent;
    border-radius: 14px;
    box-shadow: ${RAISED};
  }

  button:hover {
    box-shadow: ${RAISED}, 0 0 22px rgba(212, 175, 55, 0.18);
  }

  button:active {
    box-shadow: ${PRESSED};
  }
`;

const MenuToggle = styled.button<{ $open: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  border: none;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme, $open }) => ($open ? theme.colors.gold : theme.colors.text)};
  box-shadow: ${({ $open }) => ($open ? PRESSED : RAISED)};
  transition: box-shadow ${({ theme }) => theme.animations.normal},
    color ${({ theme }) => theme.animations.fast};
  cursor: pointer;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const MobilePanel = styled(motion.div)`
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: inset 0 6px 14px rgba(0, 0, 0, 0.6), 0 14px 30px rgba(0, 0, 0, 0.6);

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const MobileLinks = styled.div`
  display: grid;
  gap: 0.6rem;
  padding: 1rem 1.25rem 0.5rem;

  a {
    padding: 0.75rem 1rem;
    border-radius: 14px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textMuted};
    background: ${({ theme }) => theme.colors.background};
    box-shadow: ${RAISED_SOFT};
    transition: box-shadow ${({ theme }) => theme.animations.normal},
      color ${({ theme }) => theme.animations.fast};
  }

  a:active {
    color: ${({ theme }) => theme.colors.gold};
    box-shadow: ${PRESSED};
  }
`;

const MobileActions = styled.div`
  display: grid;
  gap: 0.6rem;
  padding: 1rem 1.25rem 1.5rem;

  button {
    border-color: transparent;
    border-radius: 14px;
    box-shadow: ${RAISED};
  }

  button:active {
    box-shadow: ${PRESSED};
  }
`;
