# Engineering Rules

Follow these rules strictly throughout the project.

---

# Core Stack

Frontend:
- Next.js App Router
- TypeScript
- Styled Components
- Zustand
- React Query
- Framer Motion

Backend:
- Node.js
- Express
- TypeScript
- MongoDB
- Redis
- BullMQ
- Socket.IO

---

# TypeScript Rules

Always:
- use strict TypeScript
- avoid any
- define explicit types
- use interfaces and DTOs
- use enums for statuses

Never:
- disable TypeScript checks
- use implicit any
- mix types loosely

---

# Architecture Rules

Use:
- modular architecture
- feature-based structure
- service-based architecture
- repository pattern
- event-driven patterns

Never:
- place business logic in controllers
- directly access database in controllers
- tightly couple modules

---

# Backend Structure

Every backend module must contain:

- controller
- service
- repository
- model
- routes
- validators
- dto
- events
- types

Example:

src/modules/match/
- match.controller.ts
- match.service.ts
- match.repository.ts
- match.model.ts
- match.routes.ts
- match.validator.ts
- match.dto.ts

---

# Frontend Structure

Use feature-based architecture.

Example:

src/features/dashboard/
src/features/tournaments/
src/features/matches/

Each feature should contain:
- components
- hooks
- services
- types
- styles

---

# Validation Rules

Frontend:
- React Hook Form
- Zod validation

Backend:
- Zod or Joi validation

Never trust client input.

Always validate:
- body
- params
- query
- uploads

---

# API Rules

All APIs must return:

{
  success: boolean,
  message: string,
  data?: any
}

Use:
- proper HTTP status codes
- centralized error handling
- async wrapper middleware

---

# Authentication Rules

Use:
- JWT access tokens
- refresh tokens
- role guards

Roles:
- player
- admin
- moderator

Never:
- expose sensitive user data
- store plain passwords

Always:
- hash passwords with bcrypt

---

# Queue Rules

Use BullMQ for:
- XP processing
- leaderboard recalculation
- qualification recalculation
- notifications
- dispute processing
- cycle resets

Never:
- perform heavy calculations in request cycle

---

# Redis Rules

Use Redis for:
- caching
- live standings
- leaderboards
- pub/sub
- socket scaling

Never:
- use Redis as permanent storage

---

# Database Rules

MongoDB:
- use indexes
- use pagination
- use aggregation pipelines where needed
- use timestamps on all models

Always:
- optimize leaderboard queries
- optimize standings queries

---

# Match Rules

Players submit:
- score
- opponent score
- screenshot

System:
- compares submissions
- auto verifies if matched
- creates dispute if mismatched

Players NEVER submit XP manually.

---

# XP Rules

XP is automatically calculated from:
- wins
- participation
- streaks
- qualification

XP affects:
- levels
- progression
- global leaderboard

---

# Group Points Rules

Group points determine:
- weekly standings
- qualification

XP and group points are separate systems.

---

# Real-Time Rules

Use Socket.IO for:
- standings updates
- leaderboard updates
- match verification
- qualification updates

UI must update instantly.

---

# Frontend UI Rules

Design:
- mobile-first
- esports-focused
- responsive
- animated
- premium

Use:
- glassmorphism
- glow effects
- smooth transitions
- strong hierarchy

Avoid:
- clutter
- excessive text
- generic dashboard templates

---

# Styled Components Rules

Use:
- ThemeProvider
- reusable theme tokens
- centralized colors
- reusable animations

Never:
- hardcode colors repeatedly
- duplicate styles

---

# Component Rules

Components must be:
- reusable
- typed
- isolated
- composable

Avoid:
- giant monolithic components

---

# State Management Rules

Use Zustand for:
- auth state
- player session
- socket state
- notifications

Use React Query for:
- API data
- mutations
- caching
- optimistic updates

---

# File Upload Rules

Support:
- screenshot uploads only

Validate:
- image type
- file size

Never trust uploads.

---

# Security Rules

Always use:
- helmet
- CORS
- rate limiting
- request validation
- role guards

Never:
- expose internal errors
- trust user-generated data

---

# Animation Rules

Use Framer Motion.

Animations should:
- feel smooth
- feel premium
- enhance UX

Avoid:
- excessive flashy effects
- laggy transitions

---

# MVP Scope Rules

Build ONLY:
- auth
- seasons
- cycles
- groups
- standings
- tournaments
- match submission
- disputes
- leaderboards
- qualification

Skip:
- payments
- sponsorships
- streaming
- AI moderation
- social systems
- blockchain

---

# Code Quality Rules

Use:
- clean architecture
- SOLID principles
- reusable abstractions
- centralized constants

Always:
- keep files organized
- separate concerns
- write readable code

Never:
- duplicate logic
- create giant files
- tightly couple modules