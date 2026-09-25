# aevral-demo

A tiny, deliberately synthetic web service used to show what [Aevral](https://aevral.com) does on a pull request.

Aevral is a GitHub App that reviews each pull request for **access-control security**: authorization bypass, IDOR, missing ownership checks, tenant isolation, and business-logic flaws. It posts an advisory Check plus inline comments pinned to the exact added lines, at most two findings per review, and never blocks a merge. On a public repository, a clean review posts one short note instead of staying silent.

## What this repo is

`ledgerline` is a made-up multi-tenant B2B SaaS (workspaces, invoices, documents, comments). None of it is real: there are no users, no data, no product, no secrets. The baseline on `main` scopes every read to the caller's workspace and checks roles and ownership.

Each open pull request makes one small, plausible change. Five of them quietly widen who can access what; one is clean. Open the pull requests to see Aevral's review on each one. Every example is illustrative ("the kind of change"), not a real incident, and none of this code comes from a real product.

## The pull requests

| Branch | The change | The flaw Aevral should find |
|--------|------------|-----------------------------|
| `pr/backup-job-export` | Lets a nightly backup job call the admin export | Authorization bypass: a client-supplied header skips the admin check |
| `pr/invoice-pdf` | Adds an invoice PDF download endpoint | IDOR: any signed-in user can fetch any invoice by id |
| `pr/partial-refunds` | Lets admins refund part of an invoice | Business logic: the amount is not capped, so a refund can exceed what was paid |
| `pr/delete-comments` | Lets people delete comments | Missing ownership check: anyone in the workspace can delete anyone's comment |
| `pr/doc-search` | Adds full-text search over documents | Tenant isolation leak: results include other workspaces' documents |
| `pr/paginate-invoices` | Paginates the invoice list | None. Clean change, expect "no confirmed findings" |

The pull requests stay open on purpose. They are demo fixtures, not work in progress.

## Try it on your own repository

Install the [Aevral GitHub App](https://github.com/apps/aevral). Reviews start on the next pull request. Public repositories are free.

## Not a real project

Do not use this code. It is a demo. It has no license to use, no support, and no relationship to any real system or person. Maintainers: see [VERIFY.md](VERIFY.md) for the check that the demo still works.
