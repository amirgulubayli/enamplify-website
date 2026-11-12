# Portfolio content and asset notes

The owner supplied the twelve project relationships and broad delivery categories on 15 October 2026. They subsequently confirmed the identities of Karma Wolf, The Concordia Forum and the UK Dealsphere business. The page is an unlisted selection of project experience, not a claim that every feature was independently delivered by Enamplify.

## Copy grounding

- Clinical trials: existing `content/cases.json` clinical-trial-operations entry. Keep the identity, systems architecture, patient data and confidential implementation details out of the portfolio. No compliance certification or clinical outcome claims.
- Unitas: existing UNITAS portal, Media and Jobs source and local setup documentation, plus the official organisation website for company context. Describes platform scope, not verified live provider activity.
- Concordia: owner-confirmed event systemisation brief. Bullets describe that scope; they do not assert a particular booking system, CRM integration, scale or measured outcome.
- ImamConnect: owner-provided marketplace automation scope and the existing platform repository. No transaction-volume, revenue or deployment claims.
- Waterspring: existing WaterspringIRM README and implemented application context. Avoid investor names, portfolio data, production acceptance claims and connector coverage promises.
- Pearl Lemon: owner-provided custom SaaS buildout scope; official site for organisation context. No unsupported ranking such as London's largest agency, or invented product features.
- HalalBooking: owner-requested team attribution; existing accommodation capacity research and evidence-review project documentation. No unsupported hours-saved figures or claim of sole credit.
- Karma Wolf: owner-provided agency systems scope; official site for sector context. No reuse of the agency's client campaign performance as an Enamplify result.
- Dealsphere: owner-confirmed UK business and M&A platform tooling scope. No inference that the French Collaboration Capital product or the US MCA CRM is the same project.
- Optimax: owner-provided software studio relationship and official website for company context. No claim to have delivered the studio's full product catalogue or served its banking clients directly.
- LamaTrader: existing product definition and public product description. Describes capabilities without ownership language, investment returns or a claim of brokerage status.
- Grademy: current public product description and existing tutor context. No learning outcome guarantees, universal course coverage promise or ownership language.

Company assets are recorded in `portfolio-assets.json`. All displayed logos are served locally, with proportional containment. The anonymous clinical entry uses a text treatment rather than an invented logo. English and Azerbaijani copy live together in `content/portfolio.json`; Azerbaijani copy has not received separate native editorial review.

## Discovery and publication

Both `/portfolio/` and `/az/portfolio/` have `index: false`, which generates `noindex,follow` and excludes them from sitemap and llms.txt. No public page, navigation item or feed links to either route. The page is publicly accessible to anyone with its URL once deployed; there is no authentication boundary.

This change was prepared and tested locally. No production deployment is part of this change.
