# Part A: Two core features I'd add to Coy

Coy's promise is simple: *find out if your crush likes you back, and if they don't, nobody ever knows.* The flow I went through (phone OTP login → add a crush → email verification → invite link → extra slots) is fast and sharp. Both suggestions below build on that promise rather than adding generic dating-app features.

---

## 1. Verified Circles (college / workplace, via the email you already verify)

**What it is**
After email verification, Coy reads the domain (`@iitd.ac.in`, `@company.com`) and places you in a private **Circle** for that college or workplace. Inside a Circle you can:
- Add crushes by picking from verified members of that Circle (name + photo they chose to share), not only by phone number.
- See a single aggregate, privacy-safe signal, e.g. *"128 people from your college are on Coy"*, with no names attached.
- Optionally use a Circle-scoped **Discover** (the tab built in Part B) that only shows verified peers.

**Why Coy needs it**
- **Trust and safety.** Today a crush is identified by phone number, and anyone can type anyone's number. A verified domain makes impersonation and prank crushes much harder, and it gives the email-verification step a clear purpose for the user.
- **Match density, the growth loop.** Crushes mostly happen inside a campus or office. A Circle concentrates users where mutual matches are most likely, so a new user's first session ends with "I can actually find people here" instead of an empty list. That drives invites (the invite link becomes "get your college on Coy").
- **Fits the product.** It reuses existing infrastructure (email verification, invite links) and keeps the privacy model intact: membership is visible, crushes are not.

## 2. A safe space after the match: in-app icebreaker + unmatch / block / report

**What it is**
When a match happens, instead of jumping straight to WhatsApp or a phone number, both people get a short **in-app thread**:
- A one-tap **icebreaker** (pick from prompts, or write one line) so the first move is low-pressure.
- **Reveal-on-consent**: phone or WhatsApp is shared only when *both* tap "Share my number".
- **Unmatch, block and report** that are always one tap away, with blocking also removing that person from Discover and from future crush matching.

**Why Coy needs it**
- **The moment after the match is the most awkward and riskiest part.** Coy solves the fear of rejection beautifully, then hands the most nervous moment (the first message) to another app. Owning that moment improves the experience and keeps engagement inside Coy.
- **Privacy is the brand.** Handing over a phone number immediately on match leaks personal contact info even if one side changes their mind. Consent-based reveal extends "nobody ever knows" to "nobody gets your number unless you want them to".
- **Safety and retention.** Block/report is table stakes for any product that connects people (and important for app-store review). Data from icebreakers and unmatches is also a strong signal for improving matching quality.

---

*Both features are scoped to fit Coy's existing primitives (verified email, invite links, matches) and strengthen its one core promise: privacy until it's mutual.*
