---
title: "Diary of an MLH SWE Fellow — Week 06"
description: "Two more PRs Merged"
date: 2025-06-28
image: ./img/01.png
---
### Introduction

I mentioned in my last blog that I was finally gaining momentum, and contributing to Airflow is starting to feel genuinely fun. This week, I picked up two more issues, raised PRs for both, and successfully got them merged. That brings my total to **4 merged PRs** in the MLH Fellowship so far, which is great news because MLH typically expects at least 3–4 merged pull requests by the end of the program. So now, let’s talk about the issues!

### Issue 1: Snowflake JSON Decode Error

Link: [https://github.com/apache/airflow/issues/52079](https://github.com/apache/airflow/issues/52079)

The first issue I tackled was relatively straightforward. Some providers in Airflow, like the Snowflake SQL API, fetch JSON responses from APIs. However, when the APIs fail, users were encountering unhandled JSON decode errors, and there was no retry mechanism in place.

This issue requested better error handling and a retry mechanism using the `tenacity` library. I dove into the problem, only to realize that someone else had already indirectly fixed it in a different PR: [#51463](https://github.com/apache/airflow/pull/51463).

Since their fix wasn’t directly tied to this issue, there was no test coverage verifying that it resolved the problem. So I wrote a couple of test cases to validate the behavior and raised my own PR which was eventually merged and officially closed the issue.

Link to my PR: [https://github.com/apache/airflow/pull/52118](https://github.com/apache/airflow/pull/52118)

### Issue 2: AWS Glue Retry and Error Handling

Link: [https://github.com/apache/airflow/issues/52152](https://github.com/apache/airflow/issues/52152)

After that, one of the maintainers asked me if I’d be interested in working on a similar issue, this time involving the AWS Glue provider. I agreed and took it on. Even though it was pretty straightforward but it was the most complex issue I’ve worked on so far since before this my PRs didn’t have a lot of code changes.

This issue required actual logic changes, so I used what I learned from the previous issue and added retry mechanisms, proper error handling, and test coverage to ensure everything worked as expected.

Thanks to the experience I’ve gained, the development workflow felt much smoother this time. I’ve gotten used to:

-   Spinning up the dev environment using Breeze
-   Making code changes
-   Running relevant tests with `pytest`
-   Running the pre-commit hooks
-   Committing and pushing changes and eventually raising a PR following best practices.

Link to my PR: [https://github.com/apache/airflow/pull/52262](https://github.com/apache/airflow/pull/52262)

### Conclusion

I didn’t mention it in this blog, but I did pick up another issue and spent some time working on it. Unfortunately, I hit a roadblock, so I’ll save the details for a future post once I figure out a solution. That said, I’m planning to take on more challenging issues moving forward. We’re officially halfway through the fellowship, and I’m excited to see what I can accomplish in the second half!
