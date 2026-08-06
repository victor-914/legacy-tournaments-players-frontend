"use client";

import Link from "next/link";
import { Instagram, Twitch, Twitter, Youtube } from "lucide-react";
import styled from "styled-components";

const SITE_LINKS = [
  { label: "Home", href: "/" },
  { label: "Tournaments", href: "/#tournaments" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

const ACCOUNT_LINKS = [
  { label: "Login", href: "/login" },
  { label: "Create Account", href: "/register" },
  { label: "Public Leaderboard", href: "/leaderboard" }
];

const SOCIALS = [
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "Twitch", href: "https://twitch.tv", icon: Twitch },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram }
];

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <Wrap>
      <Inner>
        <Columns>
          <BrandCol>
            <BrandRow>
              <LogoMark>
                <img src="/legacy_logo.jpeg" alt="Legacy Esports" width={36} height={36} />
              </LogoMark>
              <span>Legacy Esports</span>
            </BrandRow>
            <p>Competitive tournaments, weekly cycles, and a fair path from qualifier to grand finale.</p>
            <SocialRow>
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon size={17} />
                </a>
              ))}
            </SocialRow>
          </BrandCol>

          <LinkCol>
            <h3>Site</h3>
            {SITE_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </LinkCol>

          <LinkCol>
            <h3>Account</h3>
            {ACCOUNT_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </LinkCol>
        </Columns>

        <Bottom>&copy; {year} Legacy Esports. All rights reserved.</Bottom>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const Inner = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 3rem 1.25rem 2rem;
`;

const Columns = styled.div`
  display: grid;
  gap: 2.25rem;
  padding-bottom: 2rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1.4fr 1fr 1fr;
  }
`;

const BrandCol = styled.div`
  display: grid;
  gap: 0.85rem;
  max-width: 24rem;

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
  }
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
`;

const LogoMark = styled.div`
  width: 2.2rem;
  height: 2.2rem;
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

const SocialRow = styled.div`
  display: flex;
  gap: 0.6rem;

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surfaceGlass};
    color: ${({ theme }) => theme.colors.textMuted};
    transition: ${({ theme }) => theme.animations.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.gold};
      border-color: ${({ theme }) => theme.colors.borderStrong};
    }
  }
`;

const LinkCol = styled.div`
  display: grid;
  gap: 0.65rem;
  align-content: start;

  h3 {
    margin: 0 0 0.15rem;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textDim};
  }

  a {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textMuted};

    &:hover {
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

const Bottom = styled.div`
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textDim};
`;
