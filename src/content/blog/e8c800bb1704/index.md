---
title: "Diary of an MLH SWE Fellow — Week 05"
description: "Finally gaining some momentum"
date: 2025-06-22
image: ./img/01.png
---
### Introduction

For those of you who’ve been following this blog series, you probably remember that last week I was a bit worried, I was heading into Week 5 without a single PR merged into the Airflow project, even though I finally felt like I had enough knowledge to start contributing.

This blog is about my first couple of mini PRs. They weren’t huge from a code perspective, but they gave me the momentum and confidence I needed to aim for bigger contributions. I managed to close two issues and get two pull requests (PRs) merged into Apache Airflow!

Here’s a quick rundown of each one and what I learned along the way.

### Contributing to the Deadline Feature (AIP-86)

-   **Issue:** [#50991](https://github.com/apache/airflow/issues/50991)
-   **PR:** [#51698](https://github.com/apache/airflow/pull/51698)
-   **Related AIP:** [AIP-86: Deadlines for DAGs](https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=323488182)

This first issue was part of a bigger initiative called AIP-86. (AIP stands for Airflow Improvement Proposal; these are formal documents for proposing major changes or features in Airflow.) AIP-86 aims to add a **“Deadline”** feature for DAGs (Directed Acyclic Graphs, which are basically the workflows in Airflow).

Previously, Airflow had something called SLA (Service Level Agreement), but it was confusing and eventually removed in Airflow 3.0. The new Deadline feature will let users define a time limit for a DAG to finish. If the workflow doesn’t finish before the deadline, you can trigger a specific function or callback. You can even set multiple deadlines for a single DAG.

The issue I worked on was a sub-task of this bigger feature. One of the main maintainers had already implemented most of the new logic, but some tests were still failing. They asked me to look into it and get the tests passing. I found that the problem was in the CLI (Command Line Interface) code, just a small one-file change. After fixing it, the tests passed, and my PR got merged!

### Fixing a Documentation Typo

-   **Issue:** [#51739](https://github.com/apache/airflow/issues/51739)
-   **PR:** [#51740](https://github.com/apache/airflow/pull/51740)

The second issue was simple, a typo I spotted in one of the Airflow documentation pages. I opened an issue and submitted a quick PR to fix it, and it got merged the same day.

### Wrapping up

I feel like I have some momentum now and am very excited to pick up bigger issues in the coming weeks.
