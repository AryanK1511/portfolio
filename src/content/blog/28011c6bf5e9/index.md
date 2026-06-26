---
title: "MLH Fellowship: Reflections at the Halfway Point (Weeks 1–6)"
description: "How six weeks of open-source, mentorship, and setbacks have shaped my path as an SWE Fellow"
date: 2025-07-01
image: ./img/01.jpeg
---
Time really does fly! With Week 6 wrapped up and Week 7 underway, I’m officially halfway through my journey as an SWE Fellow in the MLH Fellowship. When I started back in May, July felt far off, but here we are.

The MLH Fellowship is a 12-week program where students contribute to open-source projects. For me, that project has been [Apache Airflow](https://github.com/apache/airflow), with sponsorship from [RBC (Royal Bank of Canada)](https://www.rbcroyalbank.com/personal.html). These past six weeks have been full of learning, building, and collaborating. In this post, I’m taking a step back to reflect on everything I’ve experienced so far.

### What I’ve Been Working On

Since joining, I’ve really immersed myself in the Airflow ecosystem, learning how it works under the hood, navigating a huge codebase, and connecting with an amazing community of maintainers and contributors.

#### Issues Tackled

In total, I’ve picked up **9 issues** in the Airflow repo so far:

-   **Closed:** 4
-   **In Progress:** 3
-   **Closed as Not Planned:** 2 (admittedly, it stings a bit to see these closed after investing time digging through the code, but it’s all part of the open-source process)

Here are the links to the issues I have worked on:

**Completed:**

-   [Add Deadline Alert to DAG Response](https://github.com/apache/airflow/issues/50991)
-   [Typos in contributing-docs/11_documentation_building.rst](https://github.com/apache/airflow/issues/51739)
-   [SnowflakeSqlApiOperator fails with JSONDecode at times](https://github.com/apache/airflow/issues/52079)
-   [GlueJobHook.get_job_state doesn’t handle exceptions when fetching status](https://github.com/apache/airflow/issues/52152)

**In Progress:**

-   [Airflow not writing logs to Elasticsearch](https://github.com/apache/airflow/issues/51456)
-   [Add deadline order_by in list_dagruns](https://github.com/apache/airflow/issues/51758)
-   [Incorrect timezone display in task log view](https://github.com/apache/airflow/issues/52056)

**Closed as Not Planned:**

-   [Add Debug Logging in HTTP Provider](https://github.com/apache/airflow/issues/48735)
-   [Make pause DAG its own role separate from edit DAG](https://github.com/apache/airflow/issues/22317)

#### Pull Requests

On the PR front, I’ve raised a total of **5 PRs**:

-   **Merged:** 4
-   **Closed:** 1 (because the related issue was closed as not planned)

Here are links to my Pull Requests:

**Merged:**

-   [Fix typos in contributing-docs/11_documentation_building.rst](https://github.com/apache/airflow/pull/51740)
-   [AIP-86: Add deadline to DagResponse](https://github.com/apache/airflow/pull/51698)
-   [Add tests to test whether Snowflake SQL API handles invalid JSON](https://github.com/apache/airflow/pull/52118)
-   [Handle exceptions when fetching status in GlueJobHook](https://github.com/apache/airflow/pull/52262)

**Closed:**

-   [Providers/HTTP: Add Debug logging for improved troubleshooting in the HTTP Provider Hook](https://github.com/apache/airflow/pull/51352)

### Reflection

While working on open source has taught me a ton, I have to admit , it can get pretty lonely sometimes. When you get stuck and there’s nobody immediately around to help, it’s easy to feel like giving up on an issue. Luckily, in our case, we had mentors assigned to us who are actual Apache Airflow maintainers. Having someone to fall back on and ask questions really made a difference and kept me going whenever I hit a roadblock.

I think one thing that worked in my favor was spending a huge amount of time at the beginning just learning about the product and how to use it. I created sample DAGs, ran Airflow both as a developer and a user, and really tried to understand its capabilities. I remember binging YouTube videos from Airflow conferences where contributors talked about the architecture and how to get started, which helped a lot. I even took a Udemy course just to nail down the basics. All of this took longer than I expected, and honestly, it was pretty demoralizing when my first PR didn’t get merged, since we realized that feature wasn’t really needed. I’d worked on it for a week, only for it never to see the light of day.

Since then, I’ve faced similar situations, twice, in fact! I’ve learned that’s just the nature of open source. You might raise an issue or work on a feature thinking it’s valuable, but the project’s priorities might not align, or the change is too complicated for what’s needed, and it gets closed as “not planned.” Early on, I remember getting stuck on two issues at once and feeling really discouraged, by the end of week 4, I still had zero closed PRs or issues. But I kept pushing, and now, at the end of week 6, I have four under my belt.

Honestly, I’m not that proud of the specific changes I’ve made so far, because they haven’t been the highest-impact contributions. In fact, just today, another issue I’d invested a lot into, learning the whole auth manager flow and mechanism, was closed as “not planned.” That one was supposed to be my biggest contribution yet, and I was hoping to show it off in our upcoming midterm presentation with Airflow maintainers and RBC stakeholders.

But looking back, I realize all the time I spent learning and struggling in the first half was actually preparing me for what’s next. I’m now ready to tackle bigger, more challenging issues in the second half of the fellowship.

### My goal for the rest of the program

My goal is to take on more responsibility, dig even deeper into the Airflow codebase, and make a real impact in the community.

The MLH Fellowship has been a lot of fun, and I’ve met some amazing people along the way. I’m looking forward to seeing how much I can grow in these next two months, and I hope to make some truly meaningful contributions soon.
