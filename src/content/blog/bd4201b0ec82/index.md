---
title: "Setting Up Production Logging in a FastAPI Microservice"
description: "A practical walkthrough of why colorful console logs break in production, and how to replace them with structured, contextual logging using…"
date: 2026-04-18
image: ./img/01.png
---
### The Inspiration

I run a company called [**Rezzy**](https://www.rezzy.dev/), where we help engineers land interviews by building industry-standard resumes and cover letters using AI trained on real recruiters and hiring managers. Our stack is varied, but every backend microservice is written in Python with FastAPI.

When I first set everything up, I had a nice little logging setup going — the default `uvicorn` logger paired with `colorama` for pretty, colorful output. It looked great in the terminal, and it worked.

Thanks for reading! Subscribe for free to receive new posts and support my work.

That setup was fine in development. But we’ve grown a lot since then. Our user base is doubling every month, and more users means more bugs. Bug reports have been rolling in lately, and that is where my logging setup started to fall apart.

Our services run on GCP, so I’ve been using the log viewer that comes with it to dig through logs. The problem was that my logging was not built for that kind of environment. It worked for small scripts and dev APIs, but for production troubleshooting, it was nowhere near enough.

### Everything That Was Broken

-   **There was no structure.** I had optimized for “pretty,” not parseable. Since nothing was emitted as JSON, the log parsers in third-party visualizers and search tools could not make sense of any of it. That alone was a dealbreaker.
-   **There was no request context.** When multiple users hit the app at the same time, I had no way to trace a single request across all the logs it produced. Everything just smeared together.
-   **There was no user-level tracking.** Since I never attached a `user_id` to log entries, I had no idea which logs belonged to which user. Debugging a specific bug report was basically guesswork.
-   **ANSI color codes were always on.** My custom `UvicornLikeFormatter` unconditionally wrapped every field in `Fore.*` / `Style.RESET_ALL`. In production, logs end up in Cloud Run, CloudWatch, Datadog, or Loki looking like this: x1b\[92m2026-…\\x1b\[0m | \\x1b\[94mINFO\\x1b\[0m | ..  
    That breaks parsers, breaks search, and looks awful in log UIs. Colors should only turn on when `sys.stderr.isatty()` is true, or when `PYTHON_ENV != "PROD"`.
-   **Every module imported the same root logger.** That meant `record.name` was always `root`. I had lost the ability to filter or route by module. The convention is to call `logging.getLogger(__name__)` per module, or use a helper like `get_logger(name)`.
-   **Third-party loggers were either silent or spammy.** I set `disable_existing_loggers: False` and overrode uvicorn, which is fine, but I only configured the root logger and uvicorn itself. Everything else - SQLAlchemy, httpx, boto/botocore, OpenAI, Anthropic, LangChain, LangGraph, Stripe, Redis - was left to its defaults. A real production config pins the noisy ones (`sqlalchemy.engine`, `botocore`, `httpx`, `urllib3`, `langchain`, `openai._base_client`) to `WARNING`.

### Building a Proper Logging Setup

Alright, intro’s done. Let’s get into the actual tutorial on how to build production-grade logging for a FastAPI app.

#### Step 1: The Logging Config File

Create a single logging config file that gets shared across the entire application. Call it whatever you want — I use `src/common/logger.py`.

The first thing to know is that we’re using a library called **structlog**. It’s the backbone of this whole setup. It gives you structured logs (as dicts), a clean processor pipeline, and plays nicely with the standard library’s logging module.

#### Step 2: Quiet the Noisy Libraries

Before anything else, set per-library log levels. You don’t want to see every library’s internal chatter — it drowns out your own logs. If you let them all emit at `INFO`, your production output becomes 95% noise and 5% signal.

This map turns them down:

_LIBRARY_LEVELS = {  
    "sqlalchemy.engine": "WARNING",  
    "botocore": "WARNING",  
    "httpx": "WARNING",  
    "urllib3": "WARNING",  
    "langchain": "WARNING",  
    "openai._base_client": "WARNING",  
    \# ...add others as needed  
}

Each library gets a level that matches how useful its output actually is.

#### Step 3: The `setup_logging` Function

This is called once, on app startup.

First thing we do is force `stdout` to flush after every newline instead of buffering in chunks:

try:  
    sys.stdout.reconfigure(line_buffering=True)  
except AttributeError:  
    \# reconfigure doesn't exist on all stream types — fall back to default buffering  
    pass

This matters because when the app runs inside Docker, logs sit in memory until the buffer fills up, and then everything gets flushed at once. That is terrible for debugging — you’ll miss logs right up until the moment of a crash. The `try/except` exists because `reconfigure` isn’t available on every stream type, and if it fails we just accept the default buffering.

Next, pull the environment and log level from your settings:

env = settings.PYTHON_ENV  
level = settings.LOG_LEVEL

#### Step 4: The Shared Processors

Now we get to the most important part — the **shared processors**.

A processor is a function that takes a log event (a dict) and returns a modified dict. They run in order, like a pipeline, for every log that flows through the system. Here is what each one does:

-   `merge_contextvars` - Merges anything bound via `structlog.contextvars.bind_contextvars(...)`. This is how per-request data (like `user_id` and `request_id`) gets attached automatically to every log inside that request. The middleware (coming up later) is what actually binds these values.
-   `add_log_level` - Pretty self-explanatory: attaches the log level (`info`, `warning`, `error`, etc.) to the event dict.
-   `TimeStamper(fmt="iso", utc=True)` - Adds a UTC timestamp. Always use UTC. If you log in local time, cross-service debugging becomes a nightmare the moment your services run in different regions.
-   `StackInfoRenderer` - If you pass `stack_info=True` to a log call, this renders the stack trace. Occasionally useful when you want context without an exception.
-   `format_exc_info` - If a log call includes exception info (e.g., `logger.exception(...)` or `exc_info=True`), this turns the traceback into a readable string. Without it, exceptions just… don’t show up in your logs. In production you might prefer `dict_tracebacks` for structured tracebacks, but `format_exc_info` works fine for both pretty and JSON output.
-   `CallsiteParameterAdder` - Attaches the source location (module, function, line number) to every log. So when you see an entry, you know exactly where in the code it came from. This is the equivalent of the `%(module)s:%(funcName)s:%(lineno)d` you had in the old stdlib formatter.

Then we pick the renderer based on environment:

if env == "PROD":  
    renderer = structlog.processors.JSONRenderer()  
else:  
    renderer = structlog.dev.ConsoleRenderer(colors=True)

Production gets JSON so parsers can index it properly. Development gets colorful, human-readable output.

#### Step 5: Configure structlog

structlog.configure(  
    processors=shared_processors + \[  
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter,  
    \],  
    wrapper_class=structlog.make_filtering_bound_logger(level),  
    logger_factory=structlog.stdlib.LoggerFactory(),  
    cache_logger_on_first_use=True,  
)

A quick walk-through of what each argument does:

-   We hand structlog all the shared processors, plus `wrap_for_formatter` — which is the glue that lets structlog and the stdlib logging module collaborate.
-   `wrapper_class=make_filtering_bound_logger(level)` means the logger filters out events below the configured level *before* running any processors. Faster, and keeps your pipeline clean.
-   `logger_factory=LoggerFactory()` makes structlog loggers use stdlib loggers underneath. This is the key to unifying everything: stdlib logs (from uvicorn, SQLAlchemy, etc.) and structlog logs (from your code) both flow through the same pipeline.
-   `cache_logger_on_first_use=True` is a small performance win. Once `get_logger("foo")` is called, the configured logger is cached.

### Step 6: The stdlib Side of the Pipeline

Now we wire up the standard library side:

handler = logging.StreamHandler(sys.stdout)  
handler.setFormatter(  
    structlog.stdlib.ProcessorFormatter(  
        processor=renderer,  
        foreign_pre_chain=shared_processors,  
    )  
)

Two key pieces here:

-   `StreamHandler(sys.stdout)` - Writes to stdout, not stderr. Stdout is the right default for container environments.
-   `ProcessorFormatter` - A special formatter that bridges stdlib logging into structlog’s processor system.

Inside the formatter:

-   `processor=renderer` is the final renderer (JSON in prod, Console in dev).
-   `foreign_pre_chain=shared_processors` is the important bit. Log events that originate from stdlib loggers - uvicorn, SQLAlchemy, Stripe - are “foreign” because they didn’t come through structlog. This argument runs them through the same processor pipeline before rendering.

The result: whether a log comes from `structlog.get_logger(__name__).info(...)` in your code, *or* from uvicorn’s stdlib logger, it ends up formatted identically. One unified output format. This unification is the whole reason the structlog setup is slightly more involved - but it’s worth it.

### Step 7: Wire Up the Root Logger

root = logging.getLogger()  
root.handlers.clear()  
root.addHandler(handler)  
root.setLevel(level)

What each line does:

-   `logging.getLogger()` with no args returns the root logger - the parent of every other stdlib logger.
-   `root.handlers.clear()` removes any handlers added elsewhere (by uvicorn’s default setup, `basicConfig`, whatever). This prevents duplicate log lines, which is critical because uvicorn adds its own handlers if you let it.
-   `root.addHandler(handler)` routes all logs through our unified handler.
-   `root.setLevel(level)` filters at the root at our configured level.

By default, child loggers in Python propagate events up to the root. So once the root is configured, every library’s logger automatically uses our handler. That’s why we don’t have to configure each library individually — they inherit.

### Step 8: Per-Library Level Overrides

for name, lib_level in _LIBRARY_LEVELS.items():  
    lib_logger = logging.getLogger(name)  
    lib_logger.setLevel(lib_level)  
    lib_logger.propagate = True

For each entry in the map: grab the logger, set its level (so it filters its own noise *at the source*, before it ever reaches the root), and make sure `propagate = True` so events that pass the filter still bubble up.

Why set both? Two reasons:

-   `setLevel(WARNING)` means the library won’t even *emit* `INFO`/`DEBUG` events. They’re discarded at the source, which is more efficient.
-   `propagate = True` (the default, but set explicitly here for safety) means whatever does pass the filter flows up to the root handler for formatting.

The explicit `propagate = True` is slightly defensive. Some libraries set `propagate = False` on their own loggers to avoid double-logging, which would quietly break our setup. Forcing it to `True` guarantees every library’s output goes through our handler.

### Step 9: The Factory Function

def get_logger(name: str) -> structlog.stdlib.BoundLogger:  
    return structlog.get_logger(name)

A thin wrapper so your app code imports `get_logger` from this module instead of calling `structlog.get_logger` directly. A few reasons this is worth it:

-   **Consistent entry point.** One place to change logging behavior app-wide.
-   **Typed return value.** IDEs and type checkers know exactly what you’re getting back.
-   **Less coupling to structlog.** If you ever want to swap the underlying library, you change one file.

Usage is pretty simple:

from src.common.logger import get_logger

logger = get_logger(__name__)

logger.info("order_created", order_id=123, total=49.99)

### Wrapping Up

That’s the setup. The short version of what changed:

-   Logs are now structured JSON in production, readable color output in development.
-   Every log carries request context and user identity automatically.
-   Noisy third-party libraries are pinned to `WARNING`, so they stop burying real signal.
-   stdlib loggers and structlog loggers emit through a single unified pipeline.
-   Tracebacks, timestamps, and call sites are attached to every entry.

It’s more code than my original pretty-logger setup, but the payoff is huge. Bug reports that used to take me an hour to track down now take a few minutes, because I can filter Cloud Logging by `user_id`, pull every log from the problem request, and actually see what happened.

If you’re running a FastAPI app in production and still relying on uvicorn defaults, I’d strongly encourage you to make the switch.

Catch you in the next one.
