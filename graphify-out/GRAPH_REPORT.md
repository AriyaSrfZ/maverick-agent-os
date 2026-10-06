# Graph Report - CV  (2026-10-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 862 nodes · 1675 edges · 56 communities (42 shown, 14 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 59 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- linkedin-skills/lib/backend_selector.py
- .claude/skills/linkedin-humanizer/scripts/test_detectors.py
- PixfaroClient
- CommentShape
- json
- PubloraClient
- ApifyClient
- linkedin-skills/scripts/selftest.py
- linkedin-skills/scripts/check_config.py
- test_pixfaro_client.py
- run_evals.py
- ref_playwright
- sys
- SkillConventions
- pathlib
- test_instruction_integrity.py
- linkedin-skills/scripts/check_frontmatter.py
- linkedin-skills/scripts/schedule_post.py
- SkillContracts
- ref_fs
- client_with_spy
- test_detector_tool.py
- PersonalTemplates
- CommentLimits
- .client
- SpreadVerdict
- ChildPostShape
- subprocess
- DeleteGuard
- Report
- MediaShape
- PostGroupShape
- check_markdown_references.py
- test_client_behaviour.py
- BackendDispatch
- .test_the_run_summary_row_is_dropped
- DemoMode
- UserModelWiring
- UnpublishLimits
- EnvironmentVariableNames
- PlatformLimits
- CrossReferences
- batch_connect_batch2.js
- batch_connect_proptech.js
- open_linkedin_session.js
- batch_connect_dubai.js
- connect_profile.js
- execute_update.js
- inspect_profile.js
- post_comment_erhard.js
- post_on_anzaar.js
- reliable_post_erhard.js
- reliable_post_siapno.js
- submit_erhard_reply.js
- unpublish_services.js

## God Nodes (most connected - your core abstractions)
1. `PixfaroClient` - 20 edges
2. `PixfaroClient` - 19 edges
3. `PubloraClient` - 17 edges
4. `PubloraClient` - 16 edges
5. `PixfaroError` - 15 edges
6. `PixfaroError` - 15 edges
7. `ApifyClient` - 15 edges
8. `client_with_spy()` - 15 edges
9. `ApifyClient` - 14 edges
10. `load_env()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `phase_live()` --calls--> `PixfaroClient`  [INFERRED]
  .agents/skills/linkedin-marketing/.codex-marketplace/linkedin-skills/scripts/selftest.py → .agents/skills/linkedin-marketing/.codex-marketplace/linkedin-skills/lib/pixfaro_client.py
- `brand_logo()` --uses--> `PixfaroError`  [INFERRED]
  .agents/skills/linkedin-marketing/.codex-marketplace/linkedin-skills/lib/backend_selector.py → .agents/skills/linkedin-marketing/.codex-marketplace/linkedin-skills/lib/pixfaro_client.py
- `brand_logo()` --uses--> `PixfaroError`  [INFERRED]
  .agents/skills/linkedin-marketing/lib/backend_selector.py → .agents/skills/linkedin-marketing/lib/pixfaro_client.py
- `phase_live()` --calls--> `PubloraClient`  [INFERRED]
  .agents/skills/linkedin-marketing/.codex-marketplace/linkedin-skills/scripts/selftest.py → .agents/skills/linkedin-marketing/.codex-marketplace/linkedin-skills/lib/publora_client.py
- `phase_live()` --calls--> `ApifyClient`  [INFERRED]
  .agents/skills/linkedin-marketing/.codex-marketplace/linkedin-skills/scripts/selftest.py → .agents/skills/linkedin-marketing/.codex-marketplace/linkedin-skills/lib/apify_client.py

## Import Cycles
- None detected.

## Communities (56 total, 14 thin omitted)

### Community 0 - "linkedin-skills/lib/backend_selector.py"
Cohesion: 0.05
Nodes (91): render_approval_card(), active_backend(), available_models(), available_templates(), brand_logo(), card(), fetch_post(), _half_configured() (+83 more)

### Community 1 - ".claude/skills/linkedin-humanizer/scripts/test_detectors.py"
Cohesion: 0.08
Nodes (50): detect_copyleaks(), detect_gptzero(), detect_manual(), detect_originality(), detect_sapling(), detect_zerogpt(), DetectorResult, main() (+42 more)

### Community 2 - "PixfaroClient"
Cohesion: 0.10
Nodes (23): PixfaroClient, PixfaroError, Any, Response, RuntimeError, _retry(), decorator(), PixfaroClient (+15 more)

### Community 3 - "CommentShape"
Cohesion: 0.04
Nodes (24): CommentShape, CommentUrnForms, EngagerShape, load(), PostShape, ProfileCommentShape, Read by engager-analytics, which segments by ICP fit., The skill documents `type` as "commenters" | "likers". The client stamps it per… (+16 more)

### Community 4 - "json"
Cohesion: 0.09
Nodes (37): env_candidates(), find_unloaded_token_file(), load_env(), loaded_env_paths(), Path, build_parent_comment_urn(), parse_linkedin_url(), ParsedLinkedInUrl (+29 more)

### Community 5 - "PubloraClient"
Cohesion: 0.09
Nodes (22): PubloraClient, PubloraError, Any, Response, RuntimeError, _retry(), decorator(), PubloraClient (+14 more)

### Community 6 - "ApifyClient"
Cohesion: 0.10
Nodes (17): ApifyClient, ApifyError, Any, RuntimeError, _retry(), decorator(), ApifyClient, ApifyError (+9 more)

### Community 7 - "linkedin-skills/scripts/selftest.py"
Cohesion: 0.09
Nodes (30): main(), Phase, phase_accounts(), phase_coverage(), phase_install(), phase_live(), phase_tests(), probe() (+22 more)

### Community 8 - "linkedin-skills/scripts/check_config.py"
Cohesion: 0.12
Nodes (26): check_apify(), check_backends(), check_environment(), check_pixfaro(), check_publora(), main(), run(), mask() (+18 more)

### Community 9 - "test_pixfaro_client.py"
Cohesion: 0.10
Nodes (16): EditValidation, GenerateCache, GenerateValidation, make_client(), Offline tests for Pixfaro client behavior. These tests protect the client-side…, Transient HTTP failures should be retried; client errors should not., Create a Pixfaro client using a temporary test environment variable., Invalid generation requests must fail before touching the network. (+8 more)

### Community 10 - "run_evals.py"
Cohesion: 0.11
Nodes (20): ask(), case_engagers_no_fabrication(), case_hook_formula(), case_humanizer_audit_flags_blockers(), case_humanizer_keeps_facts(), case_reply_no_invention(), case_reply_parent(), grade() (+12 more)

### Community 11 - "ref_playwright"
Cohesion: 0.12
Nodes (9): { chromium }, { chromium }, { chromium }, ref_playwright, { chromium }, { chromium }, { chromium }, { chromium } (+1 more)

### Community 12 - "sys"
Cohesion: 0.21
Nodes (11): collect_payloads(), fetch_schema(), main(), collect_payloads(), fetch_schema(), main(), Check that every key we send an Apify actor exists in that actor's schema.…, Every (method, actor, payload) the client would send. (+3 more)

### Community 13 - "SkillConventions"
Cohesion: 0.18
Nodes (7): frontmatter(), The rules CLAUDE.md calls mandatory, checked rather than trusted., Two different jobs wear the same "Not for" phrasing, and both matter: steering…, A sentinel aimed at a renamed skill is worse than none: it sends the agent…, Not every skill has a twin, but twelve skills in one bundle mostly do. If this…, Anything reading the Apify layer handles text strangers wrote. The data-is-not-…, SkillConventions

### Community 14 - "pathlib"
Cohesion: 0.17
Nodes (11): The fields we read back from Publora must be the ones it actually returns. The…, The fields the skills actually read must be present in real responses. Fixtures…, documented_calls(), documents(), Path, Every `lib.*` call a SKILL.md tells the agent to make must actually exist. A…, (document, function name, [keyword arguments]) for every documented call., inspect (+3 more)

### Community 15 - "test_instruction_integrity.py"
Cohesion: 0.16
Nodes (7): HookFormulas, markdown(), Path, The instructions are the product; this checks the parts of them a machine can.…, A skill may only promise a read the library can actually perform. Issue #55 was…, `references/hook-formulas.md` is cited by number from several skills., ReadLayerPromises

### Community 16 - "linkedin-skills/scripts/check_frontmatter.py"
Cohesion: 0.23
Nodes (11): declared_skill_count(), documents(), main(), Path, declared_skill_count(), documents(), main(), Path (+3 more)

### Community 17 - "linkedin-skills/scripts/schedule_post.py"
Cohesion: 0.30
Nodes (10): main(), datetime, selftest(), slot(), main(), datetime, CLI: schedule an approved LinkedIn post via Publora at 10:00 local time. Usage:…, Today's 10:00 slot in `now`'s timezone, or now+5min if that has passed. (+2 more)

### Community 18 - "SkillContracts"
Cohesion: 0.24
Nodes (4): `.claude/skills/<name>` is how Claude Code finds a plain clone. A missing…, Guards the regex itself: a rewrite that matches nothing would pass every other…, The check above is only worth having if a wrong name trips it., SkillContracts

### Community 19 - "ref_fs"
Cohesion: 0.18
Nodes (8): { chromium }, fs, { chromium }, fs, leaders, ref_fs, { chromium }, fs

### Community 20 - "client_with_spy"
Cohesion: 0.29
Nodes (5): client_with_spy(), EngagerBudget, An ApifyClient whose actor runs are recorded instead of made., `type` is required and defaults to likers, so omitting it returned likers only…, max_items is the total across audiences, so asking for both costs the same as…

### Community 21 - "test_detector_tool.py"
Cohesion: 0.20
Nodes (8): ApiDetectorsAreNotCalled, load_tool(), The one runnable tool inside the skills, which had no tests at all.…, Guards the boundary: nothing in this file may reach a paid endpoint., The tool lives outside any package, so it is loaded by path. It has to be…, contextlib, importlib_util, io

### Community 22 - "PersonalTemplates"
Cohesion: 0.20
Nodes (5): PersonalTemplates, The Voice Profile and Story Bank ship blank and must stay blank in git. Filled,…, It must skip them by name and put the blank ones back from the index, rather…, A filled template is not a credential, so it needs its own rule., The file itself has to say that git carries it: a user filling it in is not…

### Community 23 - "CommentLimits"
Cohesion: 0.22
Nodes (4): CommentLimits, The schema caps `limit` at 100. Asking for more used to be sent verbatim, which…, The actor defaults to "most recent", whose newest comments carry no reply…, `scrape_replies` is not an input of that actor and never was. It stays in the…

### Community 24 - ".client"
Cohesion: 0.33
Nodes (4): PlatformIdResolution, The second Publora secret, derived rather than demanded. A key with no platform…, Picking one would publish to the wrong account. Ask instead., A prefix match, not a substring one: `mylinkedin-` is not LinkedIn.

### Community 25 - "SpreadVerdict"
Cohesion: 0.22
Nodes (5): The scale the whole tool exists to deliver., A gap or an overlap here would make a spread land in the wrong band, which is…, The label alone invites over-reading. The sentence beside it is what stops a…, The tool's entire premise is that detectors are not evidence, and the tightest…, SpreadVerdict

### Community 26 - "ChildPostShape"
Cohesion: 0.22
Nodes (4): ChildPostShape, One child per platform. This is where the published id lives., `lib.repost` needs a share urn, and CLAUDE.md forbids hand-converting an…, It is present but null, so the post URL has to be built from the share urn.…

### Community 27 - "subprocess"
Cohesion: 0.36
Nodes (6): main(), tracked_files(), main(), Fail if a credential, or a file that holds one, is tracked by git. `.gitignore`…, tracked_files(), subprocess

### Community 28 - "DeleteGuard"
Cohesion: 0.25
Nodes (3): DeleteGuard, Publora's endpoint applies no status guard, so the client applies one. Deleting…, Dropping the record of a live post is sometimes what you mean. It just must not…

### Community 30 - "MediaShape"
Cohesion: 0.25
Nodes (4): MediaShape, The Pixfaro handover: a hosted URL goes in, Publora fetches it, and the post…, It downloads server-side rather than hot-linking, so a Pixfaro URL expiring…, `status` and `failureReason` are the fields to report on, so a future broken…

### Community 31 - "PostGroupShape"
Cohesion: 0.25
Nodes (5): PostGroupShape, What `get_post` answers, and what a caller may rely on., Not nested under a `postGroup` key, whatever the dashboard shows., `delete_post` refuses these. A typo there would silently disarm it., create_post normalises dicts to these strings; the response confirms the shape…

### Community 32 - "check_markdown_references.py"
Cohesion: 0.43
Nodes (6): documents(), main(), Path, Check Markdown references declared by skill documents. Every backticked path…, Root SKILL.md, shared root references, and everything under skills/., resolves()

### Community 33 - "test_client_behaviour.py"
Cohesion: 0.29
Nodes (4): ProfileCommentLimits, What the clients do before anything leaves the machine. `check_actor_inputs.py`…, The actor takes `usernames`, plural. The singular form was ignored., ambiguous_python_import_412eae4086ab

### Community 34 - "BackendDispatch"
Cohesion: 0.29
Nodes (3): BackendDispatch, Which layer answers, given what is configured. No key means manual, and manual…, A key with no platform id looks exactly like no Publora at all, which is why…

### Community 35 - ".test_the_run_summary_row_is_dropped"
Cohesion: 0.29
Nodes (3): spy(), Rows come out of an LRU cache. Stamping `type` onto them in place would poison…, The actor appends {"summary": {...}} to the dataset, and returns it alone when…

### Community 36 - "DemoMode"
Cohesion: 0.29
Nodes (3): DemoMode, Canned scores, so the tool is usable and testable with no keys., Derived from a hash on purpose: a demo that shifted between runs would look…

### Community 37 - "UserModelWiring"
Cohesion: 0.38
Nodes (3): The Story Bank is only worth filling if the skills that promise to use it do.…, Skills the interviewer names as drawing on the bank., UserModelWiring

### Community 38 - "UnpublishLimits"
Cohesion: 0.33
Nodes (3): `unpublish` cancels what has not gone out. It cannot take back what has. The…, No id means no call: there is nothing safe to infer from a blank., UnpublishLimits

### Community 40 - "PlatformLimits"
Cohesion: 0.33
Nodes (3): PlatformLimits, What the skills tell the agent about LinkedIn, against what Publora reports. A…, linkedin-post-writer offers multi-image grids; the ceiling is 10.

### Community 42 - "batch_connect_batch2.js"
Cohesion: 0.50
Nodes (3): { chromium }, fs, targets

### Community 43 - "batch_connect_proptech.js"
Cohesion: 0.50
Nodes (3): { chromium }, fs, proptechTargets

### Community 44 - "open_linkedin_session.js"
Cohesion: 0.50
Nodes (3): { chromium }, path, ref_path

## Knowledge Gaps
- **36 isolated node(s):** `{ chromium }`, `{ chromium }`, `{ chromium }`, `{ chromium }`, `{ chromium }` (+31 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 246 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PubloraClient` connect `PubloraClient` to `linkedin-skills/lib/backend_selector.py`, `json`, `linkedin-skills/scripts/selftest.py`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `PubloraClient` connect `PubloraClient` to `linkedin-skills/lib/backend_selector.py`, `json`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `ApifyClient` connect `ApifyClient` to `linkedin-skills/lib/backend_selector.py`, `json`, `linkedin-skills/scripts/selftest.py`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `{ chromium }`, `{ chromium }`, `{ chromium }` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `linkedin-skills/lib/backend_selector.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05277262420119563 - nodes in this community are weakly interconnected._
- **Should `.claude/skills/linkedin-humanizer/scripts/test_detectors.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07581453634085213 - nodes in this community are weakly interconnected._
- **Should `PixfaroClient` be split into smaller, more focused modules?**
  _Cohesion score 0.09774436090225563 - nodes in this community are weakly interconnected._