"use client";

import { motion } from "framer-motion";
import styled from "styled-components";
import { SectionTitle } from "@/components/ui/PagePrimitives";
import { galleryItems } from "@/constants/aboutContent";

export function GallerySection() {
  return (
    <Wrap>
      <Inner>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle>
            <div>
              <h2>Photo Gallery</h2>
              <p>Moments from our tournaments, LAN events, and community meetups.</p>
            </div>
          </SectionTitle>
        </motion.div>

        <Masonry>
          {galleryItems.map((item, index) => (
            <Tile
              key={item.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <img src={item.image} alt={item.title} loading="lazy" />
              <Caption>
                <strong>{item.title}</strong>
                <span>{item.caption}</span>
              </Caption>
            </Tile>
          ))}
        </Masonry>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 1.5rem 1.25rem 3rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem 1.5rem 4rem;
  }
`;

const Inner = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
`;

const Masonry = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15.5rem, 1fr));
  gap: 1rem;
`;

const Tile = styled(motion.figure)`
  position: relative;
  margin: 0;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  aspect-ratio: 4 / 3;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${({ theme }) => theme.animations.slow};
  }

  &:hover img {
    transform: scale(1.04);
  }
`;

const Caption = styled.figcaption`
  position: absolute;
  inset: auto 0 0 0;
  padding: 0.9rem 1rem 0.8rem;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.82), transparent);
  display: grid;
  gap: 0.15rem;

  strong {
    font-size: 0.92rem;
    color: ${({ theme }) => theme.colors.text};
  }

  span {
    font-size: 0.76rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
