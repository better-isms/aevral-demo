# Verifying the demo

For maintainers. Run this after the Aevral App is installed on this repository, and any time you want to prove the demo still works.

## 1. Trigger the first reviews

The pull requests were opened before the App was installed on this repository, so they have no review yet. Aevral reviews on `opened`, `reopened`, and `synchronize`. Close and reopen each one:

```sh
for n in $(gh pr list -R better-isms/aevral-demo --state open --json number -q '.[].number'); do
  gh pr close  "$n" -R better-isms/aevral-demo
  gh pr reopen "$n" -R better-isms/aevral-demo
done
```

Wait a few minutes, then check each pull request:

```sh
for n in $(gh pr list -R better-isms/aevral-demo --state open --json number -q '.[].number'); do
  echo "== PR $n"
  gh api "repos/better-isms/aevral-demo/pulls/$n/reviews" -q '.[] | select(.user.login=="aevral[bot]") | "review \(.id) \(.state)"'
  gh api "repos/better-isms/aevral-demo/pulls/$n/comments" -q '.[] | select(.user.login=="aevral[bot]") | "inline \(.path):\(.line)"'
  gh pr checks "$n" -R better-isms/aevral-demo | grep -i aevral
done
```

Expected: the five flawed pull requests each get an Aevral Check plus at least one inline comment on the flawed line. The clean pull request (`pr/paginate-invoices`) gets an Aevral Check plus exactly one review whose body is the clean sentence ("no confirmed authorization or business-logic findings in the reviewed changes").

## 2. Prove the clean note is updated in place, not duplicated

This is the public-repository "one clean comment" behavior. On the clean pull request:

```sh
PR=$(gh pr list -R better-isms/aevral-demo --head pr/paginate-invoices --json number -q '.[0].number')
review_ids() {
  gh api "repos/better-isms/aevral-demo/pulls/$PR/reviews" \
    -q '[.[] | select(.user.login=="aevral[bot]") | .id] | map(tostring) | join(",")'
}
BEFORE=$(review_ids); echo "before: $BEFORE"

git fetch origin pr/paginate-invoices
git switch pr/paginate-invoices
git commit --allow-empty -m "demo: re-run review"
git push origin pr/paginate-invoices

# wait for the new Aevral Check on the new head commit to complete, then:
AFTER=$(review_ids); echo "after: $AFTER"
```

Pass: `BEFORE` and `AFTER` are the same single review id (one id, no comma), and the new head commit has its own completed Aevral Check. Fail: a second `aevral[bot]` review id appears, or no review at all.

Leave the empty commit in place; it changes nothing.
