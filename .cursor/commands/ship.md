# Ship

Review the staged and unstaged changes in this repository using `git diff` and `git diff --cached`. Stage all changes with `git add -A`, then generate a single commit message following the Conventional Commits format:

- Use one of these prefixes: feat, fix, chore, docs, test, refactor, style, perf, ci, build
- Subject line shape: `prefix(scope): description` — use the prefix word, followed by an optional scope in parentheses, then a colon and a space (for example `feat(auth): add login endpoint` or `fix(api): handle null response`).
- The scope should reflect the area of the codebase affected (for example a module, component, or file name like `auth`, `api`, `ui`, `db`). If the change is broad or doesn't map cleanly to one area, omit the scope and use `prefix: description`.
- Keep the subject line under 72 characters, lowercase after the prefix
- Be specific about what changed, not vague like "update files"
- No period at the end of the subject line
- The commit message must be a single subject line only. Do **not** add a body, footers, or attribution lines (for example do not add "Made-with:", tool names, paths to this file, or similar).

Run `git commit` from the repository root with that message, then push to the current branch using `git push origin HEAD`.

Do not ask for confirmation. Just run the full sequence: stage, commit, push.