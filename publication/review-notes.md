# Review preparation status

This package is a draft. It has not been uploaded to the submission portal,
submitted for review or published in the plugin directory.

## Completed implementation validation

The English implementation passed all seventeen synthetic-data regression
checks, TypeScript validation and the production build. The existing private
deployment remains connected and retains its original App and plugin identity.
Source code and GitHub Issue forms are public. The export was checked for
personal account data, secrets and temporary image paths. Referenced PNG assets
are included in the package.

## Directory review cases

The setup and observable expectations for each case are in `plugin.json`.
Implementation tests do not count as running these prompts in a reviewer
installation.

| Case | Status | Required setup |
| --- | --- | --- |
| Read-only security audit | Not run | Connected dedicated NextDNS test profile |
| Bounded log analysis | Not run | Synthetic DNS activity in the test profile |
| Official query totals | Not run | Query history in the test profile |
| Targeted denylist deletion | Not run | Writes enabled and the specified synthetic list entries |
| Nested setting preview | Not run | The specified starting boolean values |
| Unsupported profile creation | Not run | The independent reviewer installation |
| Unsupported DNS-log deletion | Not run | The independent reviewer installation |
| Unsupported router software installation | Not run | The independent reviewer installation |

## Next preparation step

Use a dedicated NextDNS test profile, containing only synthetic data, with a
working ChatGPT development installation. The existing connection screen lets
each signed-in user enter their own key; keys must never be placed in chat,
GitHub Issues, the ZIP or a recording. Prepare the fixtures described in the
review cases. Do not replace or record the publisher's production profile.

Rehearse the prompts in `demo-recording.txt`, then capture real interactions
with a screen recorder. No video-capture tool is available in this session.
Check playback and secrets before hosting the recording at a reviewer-accessible
destination. Only a verified recording URL completes the demo field.

Final terms of use remain a draft in `docs/terms.md`. The verified developer
identity, legal/policy attestations, reviewer access, canonical App ownership
route, domain verification and portal scans have not been completed or
verified. Reviewer credentials belong only in secure portal fields.
