---
title: "What a Hackathon Workshop Taught Us About Async Database Architecture in FastAPI"
description: "How we diagnosed and fixed connection pool exhaustion in a production FastAPI + SQLAlchemy stack."
date: 2026-05-02
image: ./img/01.png
---
First, a quick win: as of writing this, [Rezzy](https://rezzy.dev) just hit 1,000 users. 🎉

Now let me tell you about the time we almost tanked the whole thing in front of a room full of developers.

We recently shipped a feature that’s essentially Cursor for resumes. You chat with an AI agent, ask it to rewrite sections, and it understands you. It pulls from your profile, remembers context across sessions, and writes changes back in real time.

This feature talks to our Postgres database a lot. Every message gets stored, profile data gets fetched, updates get written back. It worked perfectly in local testing and staging. We shipped it.

Then we sponsored a hackathon.

### The Incident

We sponsored a hackathon and ran a hands-on workshop where we gave attendees free access to the product and walked them through it live. The whole point was to get a room full of developers actually using Rezzy in real time.

And that’s exactly what they did.

Mid-workshop, everything stopped working. Every button. Every API call. Pure timeouts across the board.

We were fairly confident it was connection pool exhaustion but we had no time to investigate properly mid-workshop. So we did the only thing you can do in that moment: redeployed the backend, restarted our Cloud Run service, and watched everything come back online.

Until it broke again three hours later.

We kept redeploying as a band-aid until we actually sat down and fixed the root cause. This post is that story.

### Connection Pools: A Quick Primer

Before getting into what went wrong, let me make sure we’re on the same page about how connection pools work because the rest of this post depends on it.

Opening a raw TCP connection to Postgres is expensive. You don’t want to do it fresh on every API request. So SQLAlchemy maintains a pool of pre-opened connections that your app borrows and returns.

Two numbers control pool capacity:

-   `**pool_size**` is the number of connections kept open and idle, ready to use at any time.
-   `**max_overflow**` is how many extra connections can be opened on top of that during a burst of traffic.

Together they define the maximum number of simultaneous Postgres connections your app can have per instance. Once you hit that ceiling, new requests have to wait. If nothing returns a connection before `pool_timeout` fires, the request fails.

A connection is either:

-   **Checked in** meaning it’s idle in the pool and available.
-   **Checked out** meaning it’s actively being used by a request.

The pool starts empty and warms up lazily as requests come in. That’s the model. When it works well you barely think about it. When it breaks, everything breaks at once.

### What Was Actually Wrong

The logs confirmed pool exhaustion. But the real question was why connections weren’t being returned. That came down to four compounding problems.

### Problem 1: Sync Database Access Inside an Async App

Our backend is FastAPI, which is fully async. But the database layer wasn’t. We were using a synchronous SQLAlchemy engine with sync `Session` objects inside async request handlers.

\# Sync engine in an async app  
return create_engine(self.database_url)  
  
\# Sync session dependency  
def get_db() -> Generator\[Session, None, None\]:  
    yield from postgres_client.get_session()

When a sync database call runs inside an async framework it blocks the entire event loop while it waits on I/O. No other coroutines can run. Requests pile up. Connections stay checked out longer than they should. Under concurrent load this compounds really fast.

### Problem 2: Blocking I/O in a High-Frequency Middleware Path

We had rate-limiting middleware that ran on every single inbound API request. Inside that middleware there was a synchronous database lookup.

\# Sync DB call inside async middleware  
with Session(self._engine) as session:  
    row = session.get(Subscription, uid)

Middleware is a multiplier. Inefficiencies here hit every request, not just specific endpoints. A blocking DB call in middleware under concurrent traffic is a really reliable way to starve your event loop.

### Problem 3 (The biggest culprit): Long-Lived Sessions Across AI Workflows

The AI agent feature was holding a single database session open for the entire duration of an AI workflow. That workflow includes model inference, tool calls, and streaming responses which can easily run 10 to 30 seconds end to end.

The thing is you don’t need a database connection for any of that. You need it for the roughly 50ms you’re actually reading or writing data. Holding a checked-out connection while waiting on a model response is pure waste and under concurrent usage that waste adds up quickly.

### Problem 4: Multiple Engines, Multiple Pools

Different parts of the app were each instantiating their own SQLAlchemy engines independently.

This is a subtle but important mistake. Every SQLAlchemy engine owns its own connection pool. If your workers and your API handlers each have separate engines, you can blow past Postgres’s connection limit even when each individual pool looks healthy in isolation. You end up with more total connections than you intended and no single place to observe or control them.

### Reproducing It Locally

Before fixing anything, I needed to be able to reproduce the exhaustion reliably in a local environment. There’s no point guessing at a fix if you can’t verify it actually works.

To simulate the load I used `[hey](https://github.com/rakyll/hey)`, a straightforward HTTP load testing tool.

brew install hey  
  
\# Warm up, 20 concurrent requests each holding a connection for 20 seconds  
hey -n 20 -c 20 -t 60 "http://localhost:8000/your-slow-endpoint?seconds=20"  
  
\# Reproduce exhaustion, enough concurrent load to exceed pool_timeout  
hey -n 30 -c 30 -t 90 "http://localhost:8000/your-slow-endpoint?seconds=60"

The `-n` flag is total requests, `-c` is concurrent workers, and `-t` is client-side timeout. The goal with the second command is to have enough concurrent sessions holding connections long enough that the waiting requests hit `pool_timeout`. That's exactly the production failure mode we were seeing.

With a reliable way to reproduce the error on demand I could now validate fixes instead of shipping and hoping.

### The Fix

The fix was not “increase the pool size.” That would have been a band-aid. The real problem was how the app was using the pool. Holding connections too long, blocking the event loop with sync I/O, and scattering pool ownership across the codebase. Here’s what we actually changed.

### Fix 1: Go Fully Async, End to End

We replaced the sync engine with an async one using `create_async_engine`, switched to `AsyncSession`, and converted the FastAPI dependency from a sync generator to an async one.

\# Before  
def get_db() -> Generator\[Session, None, None\]:  
    yield from postgres_client.get_session()  
  
\# After  
async def get_db() -> AsyncGenerator\[AsyncSession, None\]:  
    async for session in postgres_client.get_session():  
        yield session

This sounds like a small change but it cascades through the entire codebase. Every repository method, service call, and controller now has to `await` its database operations. It's a lot of mechanical work but it's non-negotiable if you want your async framework to actually behave like one.

The payoff is that instead of blocking the event loop during database I/O, the app now yields control while the query is in flight. Other requests can make progress and connections come back to the pool faster.

### Fix 2: Fix the Middleware Hot Path

\# Before, sync DB call inside async middleware  
with Session(self._engine) as session:  
    row = session.get(Subscription, uid)  
  
\# After, non-blocking  
async with self._session_factory() as session:  
    row = await session.get(Subscription, uid)

This was the highest leverage fix per line of code. Because this middleware ran on every API request, unblocking it here had a bigger impact than fixing it anywhere else in the stack.

### Fix 3: Scope Sessions Tightly in AI Workflows

For the AI agent we stopped injecting a long-lived session and instead passed in the session factory so the service opens a connection only when it actually needs one.

@asynccontextmanager  
async def _db_context(self) -> AsyncGenerator\[SomeService, None\]:  
    async with self.session_factory() as db:  
        yield SomeService(db, SomeRepository(db))

Now a connection is checked out for the duration of a database operation, not for the duration of a model call or streaming response. This is the right mental model for AI-adjacent workflows. Borrow a connection, do the DB work, return it immediately, then go do the slow AI stuff.

### Fix 4: One Engine, One Pool

We consolidated all database access across API handlers, middleware, and background workers to use a single shared client instance and its session factory. No more independent engines scattered across the codebase.

One pool, one place to configure it, one place to observe it.

### Fix 5: Make Pool Behavior Explicit

We moved pool configuration out of SQLAlchemy’s implicit defaults and into explicit environment-backed settings. Things like pool size, overflow capacity, timeout behavior, and whether connections should be health-checked before use are now deliberate decisions we can tune without touching code.

The specific values are something you should calibrate for your own workload and infrastructure. The point is that pool behavior should be something you consciously decide, not something a library quietly decides for you.

### Key Takeaways

If you’re building async backends with AI workflows, here’s what to carry forward.

**Async all the way through or not at all.** One blocking database call in a hot path negates the benefits of an async framework. This is easy to miss in FastAPI because it will happily accept sync dependencies and route handlers without complaining. It won’t tell you you’re doing it wrong.

**Middleware is a multiplier.** Code running on every request has outsized impact on performance. Any blocking I/O there will surface under load before you feel it anywhere else in the stack.

**AI workflows and long-lived DB sessions don’t mix.** If your code is waiting on a model response, a tool call, or a streaming output, it should not be holding a database connection. Open it for the data operation, close it immediately, then go do the slow AI work.

**One engine, one pool.** If different parts of your app each create their own SQLAlchemy engine you have multiple pools with no unified view of connection usage. Centralize it.

**Make your pool observable and tunable.** If you can’t see how many connections are checked in versus checked out at any given moment you’re flying blind. And if your pool settings are implicit library defaults you have no leverage when things go wrong in production.
