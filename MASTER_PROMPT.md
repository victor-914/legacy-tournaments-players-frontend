# Legacy Games Tournament Ecosystem

Build a scalable esports tournament ecosystem for Hammer Games.

Hammer Games is a competitive gaming platform built around:
- Seasons
- Weekly Cycles
- Group Stages
- Tournament Qualification
- XP Progression
- Grand Finale Qualification
- Live Leaderboards
- Match Verification
- Dispute Resolution

The platform is focused on:
- competitive integrity
- live tournament engagement
- qualification pressure
- progression systems
- real-time standings

---

# Core Competitive Structure

## Seasons
A season is a long-running competitive period.

Example:
- Season 1
- Season 2

Each season contains:
- multiple weekly cycles
- group stage tournaments
- qualification systems
- final championship qualification

At season end:
- top players qualify for the Grand Finale

---

# Cycles

Cycles are weekly competitive loops.

Example:
- Cycle 1
- Cycle 2
- Cycle 3

Each cycle contains:
- weekly group stages
- scheduled matches
- live standings
- qualification pressure

Cycle rankings contribute to:
- season rankings
- championship qualification

---

# Group Stages

Players are grouped weekly into balanced groups.

Each group contains:
- standings
- scheduled opponents
- qualification slots

Players can:
- see standings
- see qualification line
- see live updates
- see match activity

Example:
TOP 2 QUALIFY

---

# Match Submission System

Players play matches externally.

After matches:
both players independently submit:
- their score
- opponent score
- screenshot proof

If submissions match:
- auto approve match
- calculate XP
- update standings
- update leaderboards

If submissions mismatch:
- automatically create dispute

---

# XP System

Players NEVER manually submit XP.

XP is calculated automatically from:
- wins
- participation
- streaks
- placements
- qualifications

XP is used for:
- progression
- levels
- global ranking

---

# Group Points System

Separate from XP.

Group points determine:
- group standings
- qualification

Example:
- Win = 3 points
- Loss = 0 points

---

# Qualification System

Players can have qualification states:
- qualified
- near_qualification
- at_risk
- eliminated

Qualification pressure is a core UX feature.

---

# Grand Finale

At season end:
top players qualify for the Grand Finale.

Grand Finale leaderboard should display:
- top qualified players
- rankings
- season performance
- qualification status

---

# Real-Time Features

The platform must feel alive.

Use real-time updates for:
- standings
- match verification
- qualification updates
- leaderboard updates
- tournament activity

---

# Core Systems

Build:
- authentication
- seasons
- cycles
- groups
- tournaments
- matches
- standings
- leaderboards
- disputes
- qualification system
- player profiles

---

# Architecture Goals

The platform must be:
- scalable
- modular
- event-driven
- queue-based
- production-ready

Use:
- TypeScript
- Next.js
- Express
- MongoDB
- Redis
- BullMQ
- Socket.IO

---

# Frontend UX Goals

The UI should feel:
- competitive
- premium
- fast
- addictive
- esports-focused

Focus heavily on:
- leaderboard visibility
- qualification pressure
- progression
- live activity
- group standings

Avoid:
- generic admin dashboard feel
- corporate SaaS aesthetics
- cluttered layouts

---

# Brand Identity

Brand Colors:
- Black: #0B0B0B
- Gold: #D4AF37
- White: #FFFFFF

Design Style:
- futuristic esports UI
- glassmorphism
- glowing effects
- modern competitive atmosphere