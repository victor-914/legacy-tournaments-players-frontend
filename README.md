# Hammer Games Player Frontend MVP

Production-oriented Next.js App Router frontend for the Hammer Games player experience.

## Stack

- Next.js 15 App Router
- TypeScript
- Styled Components
- Framer Motion
- TanStack Query
- Axios
- Socket.IO Client
- Zustand
- React Hook Form
- Zod

## Run

```bash
npm install
npm run dev
```

## Environment

Registration screenshot uploads use a server-side Next API route that writes to S3. Configure these variables in `.env.local` or your deployment environment:

```bash
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
AWS_SESSION_TOKEN=
AWS_S3_PUBLIC_BASE_URL=
```

`AWS_SESSION_TOKEN` is only required for temporary AWS credentials. `AWS_S3_PUBLIC_BASE_URL` is optional and can point at a CDN or custom public bucket domain.

The current MVP uses typed mock services so the player UI can run before the backend is connected.
