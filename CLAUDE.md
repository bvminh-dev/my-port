@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zapier-inspired workflow automation platform focused on syncing tickets between Jira and Azure DevOps. The application uses Next.js fullstack with Domain-Driven Design (DDD) architecture.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Architecture

### DDD Layer Structure

```
├── domain/           # Core business logic (entities, value objects, domain services)
│   ├── entities/     # Business entities with identity
│   ├── value-objects/# Immutable value objects
│   ├── services/     # Domain services
│   └── repositories/ # Repository interfaces
├── application/      # Application services (use cases, orchestration)
│   ├── services/     # Application services
│   └── dto/          # Data transfer objects
├── infrastructure/   # External concerns (API clients, DB, implementations)
│   ├── api/          # External API clients (Jira, ADO)
│   ├── persistence/  # Database implementations (MongoDB)
│   └── messaging/    # Message brokers, webhooks
├── presentation/     # UI layer (Next.js pages, components)
│   ├── components/   # React components
│   └── app/          # Next.js app directory
└── lib/              # Utilities
```

### Key Domain Concepts

- **SyncJob**: Represents a synchronization configuration between Jira and ADO
- **TicketMapping**: Tracks the relationship between Jira and ADO tickets
- **SyncDirection**: Bidirectional (Jira→ADO, ADO→Jira, or both)
- **FieldMapping**: Defines how fields map between platforms

### External Integrations

- **Jira API**: REST API v3 for ticket CRUD
- **Azure DevOps API**: REST API for Work Items
- **MongoDB**: Persistence layer for sync jobs and ticket mappings

## Design System

The UI follows the Zapier-inspired design system defined in `DESIGN.md`:

- **Colors**: Warm cream canvas (`#fffefb`), coffee ink (`#201515`), orange primary (`#ff4f00`)
- **Typography**: Degular Display for hero, Inter for everything else
- **Border Radius**: 12px (`rounded.md`) for buttons and cards
- **Component Library**: Located in `presentation/components/ui/`

## UI Development Rules (MANDATORY)

All UI components MUST follow these rules:

1. **Responsive Design**: All pages MUST be mobile-first and responsive. Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) to ensure proper display on all devices.

2. **API Notifications**: ALL API calls MUST show toast notifications:
   - Success notifications use `showToast(message, 'success')`
   - Error notifications use `showToast(message, 'error')`
   - Notification messages MUST come from backend response (`data.message` or `data.error`)
   - Use the `useToast()` hook from `@/presentation/components/ui`

3. **Button Interactions**: ALL buttons MUST have `cursor-pointer` on hover (automatically included in Button component)

4. **Color Contrast (CRITICAL)**: ALL components MUST ensure proper text/background contrast:
   - NEVER use dark background with dark text
   - NEVER use light background with light text
   - For CRITICAL UI components (buttons, badges, toasts), use inline styles for colors:

   ```typescript
   // ✅ CORRECT - Inline styles guarantee colors are applied
   <button style={{ backgroundColor: '#201515', color: '#fffefb' }}>

   // ❌ RISKY - Tailwind classes may fail in some builds
   <button className="bg-ink text-on-primary">

   // ⚠️ ACCEPTABLE - For non-critical elements only
   <div className="bg-[#201515] text-[#fffefb]">
   ```

   - The Button component uses inline styles for all variants - always use it
   - Always test button variants: primary (orange), secondary (dark), tertiary (light)
   - Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text

## State Management

- React Server Components by default
- Client state via React hooks and Context API where needed
- Server Actions for mutations

## API Response Format

All API endpoints MUST return responses in this format:

**Success Response:**

```json
{
  "success": true,
  "message": "Human readable success message",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Human readable error message"
}
```

## API Routes

Next.js App Router route handlers in `app/api/`:

- `POST /api/sync/jobs` - Create sync job
- `GET /api/sync/jobs` - List sync jobs
- `POST /api/sync/jobs/[id]/run` - Trigger manual sync
- `GET /api/webhooks/jira` - Jira webhook handler
- `GET /api/webhooks/ado` - Azure DevOps webhook handler

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017

# Jira
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token

# Azure DevOps
ADO_ORG_URL=https://dev.azure.com/your-org
ADO_PROJECT=your-project
ADO_PAT=your-personal-access-token

# App
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Conventions

- Use TypeScript strict mode
- Prefer server components over client components
- Use Zod for runtime validation
- Repository pattern for data access (MongoDB)
- Domain events for cross-domain communication

### MongoDB Entity Mapping (CRITICAL)

When using MongoDB, documents have `_id` field but domain entities use `id`. ALWAYS handle this mapping in entity `fromJSON` methods:

```typescript
// ✅ CORRECT - Handle both _id and id
static fromJSON(data: any): SyncJob {
  return new SyncJob({
    ...data,
    id: data.id || data._id?.toString(), // Map MongoDB _id to entity id
  })
}

// ❌ WRONG - Will cause undefined IDs
static fromJSON(data: any): SyncJob {
  return new SyncJob(data) // data._id won't be mapped to id
}
```

This is critical for:

1. Dynamic routes `/jobs/[id]` - without proper mapping, ID becomes undefined
2. API calls that reference entities by ID
3. Navigation links that depend on entity IDs

### Next.js 15 Dynamic Routes (CRITICAL)

In Next.js 15, the `params` prop in dynamic routes is now a **Promise** and MUST be unwrapped using `React.use()`:

```typescript
// ✅ CORRECT - Unwrap params Promise
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  // Use resolvedParams.id
}

// ❌ WRONG - Directly accessing params.id
export default function Page({ params }: { params: { id: string } }) {
  // params.id will cause runtime error
}
```

This applies to:

- All dynamic route pages: `app/[param]/page.tsx`, `app/[id]/page.tsx`
- All dynamic API routes: `app/api/[param]/route.ts`
- Nested dynamic routes: `app/[category]/[id]/page.tsx`

**For API routes**, use `await params`:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // Use id
}
```

### Use a modern SaaS design system inspired by Linear + Vercel.

Rules:

- Large spacing
- Minimal borders
- Rounded-xl cards
- Subtle shadows
- Smooth hover animations
- Dark mode optimized
- Typography hierarchy like Linear
- Sticky sidebar
- Compact professional tables
- Clean status badges
- Modern loading skeletons
- Elegant empty states
- No Bootstrap look
- No generic admin template feel
