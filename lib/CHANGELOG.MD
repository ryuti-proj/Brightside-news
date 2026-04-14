# BrightSide News – Changelog

---

## [2026-04-08] – Phase 1: Feed Stabilisation (Pi-Ready Foundation)

### Updated Files

* lib/news-api.ts

### Changes

* Introduced a **3-layer filtering system** to stabilise the feed:

  * **Strict filter** → prioritises high-quality positive stories
  * **Relaxed fallback** → prevents low article volume
  * **Final fallback** → ensures minimum number of stories

* Implemented **hard exclusion rules** to remove:

  * War / violence content
  * Legal / crime-related news
  * Investor / financial PR spam
  * Politics-heavy content

* Added **scoring system** for smarter filtering:

  * `positivityScore`
  * `exclusionScore`
  * `humanInterestScore`

* Introduced **ASCII content filter** to remove low-quality / non-English noise

* Improved **API fallback logic**:

  * GNews → Currents → NewsAPI
  * Ensures feed continuity even when APIs fail or hit limits

* Reduced GNews fetch size to improve relevance and reduce noise

* Added **console logging** for debugging feed health:

  * Total articles fetched
  * Articles after filtering stages
  * Fallback usage visibility

* Implemented **guaranteed minimum output logic**

  * Prevents “0 articles” scenario

---

### Status

* Feed is now **stable and reliable**
* Filtering is **balanced (quality vs volume)**
* System is ready for **user layer integration (Phase 2)**

---

### Notes

* This is the **baseline version for all future development**
* Do not remove fallback logic unless replaced with equivalent safeguards
* Future improvements should refine scoring, not break feed stability

---

## Next Phase

➡ Phase 2: Pi Auth + User System

* Real user accounts
* Session handling
* Foundation for comments, likes, and monetisation

#Protected admin API routes with authenticated session checks, made the admin session persistent by default, and updated admin user detail and inventory routes to resolve users by internal id, Pi user id, or username.

#Fixed the admin authentication flow by simplifying cookie-based session handling, verifying the session immediately after login, adding a Remember me option, and updating the admin page to rely on the live session instead of the broken mixed auth setup.
