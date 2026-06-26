---
title: "Diary of an MLH SWE Fellow — Week 04"
description: "A week of blockers, burnout, and bouncing back during the MLH Fellowship"
date: 2025-06-10
image: ./img/01.png
---
### Introduction

Open source can be brutal at times.

I’m not sure if you read my last blog, but the gist of it is: I spent an entire week working on an issue that we ultimately decided notto pursue, and my PR never got merged.

With Week 4 kicking off and the fellowship expecting at least one PR to be merged by now, I needed to pivot fast. I picked up two new issues:

-   [Improve the documentation version selector](https://github.com/apache/airflow/issues/51455)
-   [Investigate why Airflow isn’t writing logs to Elasticsearch](https://github.com/apache/airflow/issues/51456)

Unfortunately, both turned into blockers.

### The Problems

The first issue hit a wall because my local development environment wouldn’t cooperate. The second issue turned out to be a user-side problem, and although I managed to reproduce it, I couldn’t find a fix after 8–9 hours of debugging.

To make things worse, I missed a standup meeting due to a schedule conflict, and seeing other fellows already with merged PRs just added to the pressure. I reached out on Slack, both in the Airflow community and our fellowship channel with the maintainers but could not really get a lot of help.

Still, I’m not giving up. My goal for this fellowship is to learn deeply and be the best fellow in my pod (since I am super competitive), even if the pace is slower than I’d like right now. I wrote this post to be transparent, open source isn’t always smooth sailing. There are times when you get stuck, don’t get answers, and feel like an imposter.

### The Solution

For the first issue, I got a reply from one of the Airflow maintainers in a Slack channel. After some back and forth, I realized it wasn’t something I should take on right now , it required a lot of domain-specific knowledge, especially around how NPM and Hugo package managers work. The issue was related to the documentation website, and even setting up the dev environment was proving to be quite difficult. After discussing it with my mentors, I decided to unassign myself from the issue.

As for the second one, well, it’s still open for now, and I haven’t found a fix yet.

### Wrapping up

It was a tough week, and I still don’t have any closed issues or merged PRs. However, on the bright side, the time I’ve spent working with Airflow has made me much more familiar with its components and how things work under the hood. I’m starting to feel more comfortable with the project, and I’m confident that I’ll be able to start making tangible contributions soon.
