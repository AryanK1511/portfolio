---
title: "Diary of an MLH SWE Fellow — Week 10 and 11"
description: "Prepping for the Final Week"
date: 2025-08-04
image: ./img/01.png
---
### Introduction

This blog builds on my previous post, where I shared that I was tackling my most complex issue yet. Although it started as a UI-related task, it required several backend prerequisites that hadn’t been implemented. As a result, I ended up opening five additional pull requests to introduce the necessary API changes.

Before I dive into the technical details, I want to talk about our recent pod merge standup. All our pod members joined, and we played Skribbl together, it was a blast! We also have our end-of-program demo coming up next week (Week 12).

I decided to combine my updates for Weeks 10 and 11 into one post, since I spent most of both weeks working on the same issue. I’m now basically done with the fellowship, there might be one more PR, but my main work is complete.

### Adding API Support for Filtering DAGs by Bundle Name and Version

Issue Link: [https://github.com/apache/airflow/issues/53739](https://github.com/apache/airflow/issues/53739)

To address this, I first had to learn how to create DAG bundles so I could test the existing functionality. This was tricky, because as developers, we typically run Airflow using Breeze, and the documentation doesn’t always translate directly to that setup. You really need a solid understanding of Breeze to get this working.

After about two hours of troubleshooting, I managed to create two DAG bundles. Once that was done, I figured out how to create DAG bundle versions, and finally reached the point where I could test the API routes.

I implemented the required functionality in both the UI and public API routes. For anyone unfamiliar: in Airflow, there are two folders for API routes. The public routes are backward compatible and used by external consumers, while the UI routes are for the Airflow UI and don’t guarantee backward compatibility. I made changes to both, wrote tests, ran pre-commit hooks (which generated spec files and other outputs), and pushed my changes.

Here’s the link to my PR: [https://github.com/apache/airflow/pull/54004](https://github.com/apache/airflow/pull/54004)

I received some feedback asking me to add one more test. That turned out to be quite challenging, since the test itself was pretty complex. After some struggling, I finally figured it out and requested another review.

With my PR submitted, I polished up my demo slides for the final presentation and reviewed them with our pod leader. Our final demo is on Tuesday, and I’m really looking forward to it.
