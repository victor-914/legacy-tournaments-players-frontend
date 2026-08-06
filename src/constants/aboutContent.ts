export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  image: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: "season-one-finale",
    title: "Season One Grand Finale",
    caption: "Main stage · 24 teams · sold-out venue",
    image: "/images/gallery/season-one-finale.svg"
  },
  {
    id: "lan-qualifiers",
    title: "LAN Qualifiers",
    caption: "Regional bracket · 128 players on-site",
    image: "/images/gallery/lan-qualifiers.svg"
  },
  {
    id: "community-meetup",
    title: "Community Meetup",
    caption: "Fan zone with open practice booths",
    image: "/images/gallery/community-meetup.svg"
  },
  {
    id: "cycle-five-playoffs",
    title: "Cycle 5 Playoffs",
    caption: "Weekly bracket · top 8 showdown",
    image: "/images/gallery/cycle-five-playoffs.svg"
  },
  {
    id: "charity-cup",
    title: "Legacy Charity Cup",
    caption: "Community fundraiser tournament",
    image: "/images/gallery/charity-cup.svg"
  },
  {
    id: "studio-broadcast",
    title: "Studio Broadcast Night",
    caption: "Live cast with desk analysis",
    image: "/images/gallery/studio-broadcast.svg"
  }
];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "founder",
    name: "Amara Reyes",
    role: "Founder & CEO",
    bio: "Started Legacy Esports as a single weekend bracket in 2021; now oversees league operations and partnerships.",
    avatar: "/images/team/founder.svg"
  },
  {
    id: "head-of-esports",
    name: "Marcus Kwan",
    role: "Head of Esports",
    bio: "Designs the cycle and group-stage format, and signs off on every ruleset change before a season goes live.",
    avatar: "/images/team/head-of-esports.svg"
  },
  {
    id: "tournament-director",
    name: "Jonas Varga",
    role: "Tournament Director",
    bio: "Runs match scheduling and dispute review, keeping weekly cycles on time across every group.",
    avatar: "/images/team/tournament-director.svg"
  },
  {
    id: "lead-caster",
    name: "Talia Suarez",
    role: "Lead Caster",
    bio: "Calls grand finale matches and hosts the studio broadcast nights for the community.",
    avatar: "/images/team/lead-caster.svg"
  },
  {
    id: "community-manager",
    name: "Nadia Lindqvist",
    role: "Community Manager",
    bio: "Runs the Discord, community meetups, and the Legacy Charity Cup fundraiser series.",
    avatar: "/images/team/community-manager.svg"
  },
  {
    id: "head-coach",
    name: "Ravi Bhatt",
    role: "Head Coach",
    bio: "Reviews qualification submissions and mentors players moving from group stage into the grand finale.",
    avatar: "/images/team/head-coach.svg"
  }
];

export const storyStats = [
  { label: "Seasons Run", value: "6" },
  { label: "Players Hosted", value: "3,400+" },
  { label: "Live Events", value: "40+" },
  { label: "Prize Pool Paid", value: "$25,000+" }
];
