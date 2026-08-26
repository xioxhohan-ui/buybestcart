# BEST BUY CART — ULTIMATE MASTER BUILD PROMPT FOR MANUS AI

## 0. MASTER INSTRUCTION — READ THIS FIRST

You are Manus AI acting as a **senior full-stack software architect, senior frontend engineer, backend engineer, database architect, UI/UX designer, SEO engineer, DevOps engineer, security engineer, Amazon Associates integration specialist, analytics engineer, QA engineer, and technical project manager**.

Your task is to design and build a **complete, production-ready, scalable Amazon Affiliate Product Discovery, Comparison, Review, Ranking, and Deals platform** named:

# BEST BUY CART

This is NOT a normal e-commerce store.

This website does **not** sell products directly.

This website does **not** process payments.

This website does **not** own inventory.

This website does **not** provide checkout.

This website does **not** create an internal shopping cart.

The purpose of the website is to help visitors:

- discover products
- search for products
- compare products
- read reviews
- read buying guides
- discover deals
- discover highly ranked products
- understand product specifications
- find products suitable for their needs
- click through to Amazon
- complete their purchase on Amazon

The website earns revenue through Amazon Associates affiliate links.

The primary website name is:

**Best Buy Cart**

The master administration panel must be available at:

**`/shohan`**

The site name must be editable from the administration panel.

The project must be built as a **real production application**, not a static mockup.

Do not create fake buttons that do nothing.

Do not create fake analytics that pretend to contain real data.

Do not create fake Amazon API functionality.

Do not create fake checkout functionality.

Do not invent Amazon product information when live API information is unavailable.

When an external API is unavailable, implement a proper fallback state and clearly distinguish manually entered information from API-sourced information.

---

# 1. PRIMARY BUSINESS MODEL

Best Buy Cart is an:

- Amazon affiliate marketplace
- product discovery platform
- product comparison website
- product review platform
- deals website
- buying guide website
- product ranking platform
- SEO content platform
- affiliate monetization platform

The platform should be capable of covering virtually every legitimate product category available through Amazon.

Examples include:

- Electronics
- Computers
- Laptops
- Monitors
- Smartphones
- Tablets
- Cameras
- Headphones
- Earbuds
- Gaming
- Gaming PCs
- Gaming accessories
- TVs
- Smart home
- Home appliances
- Kitchen
- Furniture
- Home improvement
- Tools
- Automotive
- Sports
- Fitness
- Outdoor
- Travel
- Clothing
- Shoes
- Watches
- Beauty
- Personal care
- Baby products
- Pet products
- Office products
- Books
- Musical instruments
- Toys
- Hobbies
- Garden
- Industrial products
- And other Amazon-supported categories.

The architecture must not be hardcoded around one category.

The system must support thousands or millions of products if hosting and Amazon API limits allow it.

---

# 2. IMPORTANT BUSINESS RULES

Implement these rules throughout the entire application.

## 2.1 No internal commerce

There must be:

- NO internal checkout
- NO payment gateway
- NO internal order system
- NO inventory management pretending that Best Buy Cart owns inventory
- NO shipping system
- NO internal product fulfillment
- NO internal shopping cart

The only transaction destination is Amazon.

Every primary product CTA should eventually lead to an Amazon marketplace URL containing the appropriate affiliate tracking information.

---

# 3. AMAZON AFFILIATE MODEL

The system must support Amazon Associates.

Support multiple Amazon marketplaces.

Initial marketplace support:

- United States — amazon.com
- United Kingdom — amazon.co.uk
- Canada — amazon.ca
- Germany — amazon.de
- France — amazon.fr
- Italy — amazon.it
- Spain — amazon.es
- Netherlands — amazon.nl
- Sweden — amazon.se
- Poland — amazon.pl
- Australia — amazon.com.au

Architect the system so additional marketplaces can be added later without changing the database architecture.

Each marketplace must support:

- marketplace domain
- country
- currency
- locale
- language
- Amazon partner tag
- affiliate tracking ID
- API region
- enabled/disabled state
- redirect strategy
- OneLink configuration if applicable

Never hardcode one affiliate tag throughout the application.

Affiliate configuration must be managed from `/shohan`.

---

# 4. REGION DETECTION

Build an intelligent regional routing system.

When a visitor enters the website:

1. Detect their approximate country where technically and legally appropriate.
2. Determine their preferred Amazon marketplace.
3. Generate the appropriate Amazon destination.
4. Apply the correct affiliate tracking configuration.
5. Allow the visitor to manually override the detected marketplace.

Example:

US visitor:

→ Amazon US

UK visitor:

→ Amazon UK

Germany visitor:

→ Amazon DE

France visitor:

→ Amazon FR

Canada visitor:

→ Amazon CA

Australia visitor:

→ Amazon AU

If a marketplace is unsupported:

→ configurable fallback marketplace.

Never force visitors into a marketplace without allowing a manual region switch.

---

# 5. REGION SELECTOR

Create a polished region selector.

Display:

- country flag
- country name
- Amazon marketplace
- currency
- current selected region

Example:

🇺🇸 United States — USD

🇬🇧 United Kingdom — GBP

🇩🇪 Germany — EUR

🇫🇷 France — EUR

The region selector should exist:

- in the header
- in the footer
- inside relevant product CTA areas
- optionally in the first-visit regional prompt

Store the user's preference using an appropriate privacy-conscious mechanism.

---

# 6. WEBSITE DESIGN DIRECTION

The website should feel like a premium modern technology/product discovery company.

The design must NOT look like:

- an outdated affiliate website
- a generic WordPress template
- a cheap dropshipping store
- a spammy SEO website
- an old-fashioned blog
- a basic Bootstrap dashboard

The design should feel:

- premium
- modern
- clean
- trustworthy
- fast
- editorial
- conversion-focused
- organized
- highly readable
- professional
- spacious
- polished

Use a strong visual hierarchy.

Avoid excessive gradients.

Avoid excessive glassmorphism.

Avoid visual clutter.

Avoid unnecessary animations.

Use animation only where it improves usability.

---

# 7. RESPONSIVE DESIGN

The entire application must work properly on:

- 320px mobile
- 375px mobile
- 390px mobile
- 412px mobile
- 480px mobile
- tablets
- laptops
- 1366px desktop
- 1440px desktop
- 1920px desktop
- ultrawide monitors

No horizontal overflow.

No broken cards.

No text clipping.

No inaccessible dropdowns.

No unusable tables on mobile.

No fixed-width layouts that break on smaller screens.

---

# 8. FRONTEND GLOBAL STRUCTURE

Create:

## Header

Include:

- logo
- primary navigation
- search
- categories
- deals
- comparisons
- buying guides
- reviews
- region selector
- theme selector if enabled

On mobile:

- hamburger menu
- search button
- compact region selector
- responsive navigation drawer

---

# 9. HOMEPAGE

Build an exceptionally polished homepage.

## Hero section

Include:

- strong headline
- supporting description
- large search bar
- search suggestions
- category shortcuts
- popular searches
- optional trending search terms

Example positioning:

"Find Better Products. Compare Smarter. Buy with Confidence."

The exact text should be editable through the CMS.

---

# 10. HOMEPAGE SECTIONS

The homepage should support configurable sections.

Potential sections:

1. Hero
2. Trending searches
3. Top categories
4. Best ranked products
5. Today's deals
6. Popular products
7. Editor's picks
8. Best products by category
9. New discoveries
10. Product comparisons
11. Buying guides
12. Latest reviews
13. Popular brands
14. Recently viewed products
15. Newsletter
16. Trust/disclosure section
17. Footer

Each section must be independently enabled/disabled/reordered through admin.

Do not hardcode homepage section ordering.

---

# 11. CATEGORY SYSTEM

Create a powerful hierarchical category system.

Support:

Category

→ Subcategory

→ Child category

→ Product

Example:

Electronics

→ Computers

→ Laptops

→ Gaming Laptops

→ Product

Categories must support:

- name
- slug
- description
- image
- icon
- parent
- SEO title
- SEO description
- canonical URL
- OG image
- schema settings
- featured status
- display order
- active/inactive state

---

# 12. CATEGORY LANDING PAGES

Every category should have a premium landing page.

Include:

- category title
- introduction
- category description
- featured products
- ranked products
- popular products
- deals
- buying guides
- FAQs
- subcategories
- related categories
- brand filters
- price filters
- rating filters
- sorting
- SEO content

Allow administrators to customize category layouts.

---

# 13. PRODUCT LISTING PAGE

Create a highly optimized product listing experience.

Product cards should display:

- product image
- product title
- brand
- rating
- review count
- current price when permitted
- previous/list price when permitted
- savings when permitted
- availability
- ranking
- badge
- short highlight
- CTA
- compare control
- favorite control if enabled

CTA examples:

"Check Price"

"View on Amazon"

"See Deal"

Do not imply Best Buy Cart sells the product.

---

# 14. PRODUCT FILTERS

Support:

- category
- subcategory
- brand
- price
- rating
- review count
- availability
- features
- attributes
- ranking
- deals
- featured
- editorial selection

Filters must update smoothly.

On desktop use a sidebar/filter toolbar.

On mobile use a filter drawer.

---

# 15. SORTING

Support:

- Recommended
- Rank
- Most Popular
- Highest Rated
- Most Reviewed
- Newest
- Price Low to High
- Price High to Low
- Best Value
- Editor's Choice

The ranking logic must be configurable.

---

# 16. SEARCH ENGINE

Build a serious internal product search system.

Search by:

- product title
- ASIN
- brand
- category
- tags
- attributes
- keywords
- product features
- article content

Support:

- autocomplete
- typo tolerance
- search suggestions
- recent searches
- trending searches
- zero-result suggestions
- popular categories
- related products

Search must be fast.

Use a dedicated search engine if the chosen architecture benefits from one.

---

# 17. SEARCH AUTOCOMPLETE

When the user types:

"wireless hea..."

Display:

- matching products
- categories
- brands
- popular searches
- buying guides
- recent searches

Do not overload the dropdown.

Prioritize relevance.

---

# 18. PRODUCT DETAIL PAGE

The product page is one of the most important pages on the website.

Build it like a premium editorial product page.

Include:

- breadcrumb
- ranking badge
- product image gallery
- title
- brand
- rating
- review count
- current price when allowed
- savings when allowed
- availability
- key features
- product highlights
- specifications
- pros
- cons
- editor verdict
- comparison section
- alternatives
- related products
- FAQs
- buying advice
- affiliate disclosure
- Amazon CTA

---

# 19. PRODUCT CTA SYSTEM

Every Amazon CTA must use the centralized affiliate-link engine.

Never allow frontend developers to manually construct affiliate links throughout random components.

All affiliate links must pass through a centralized service.

The service determines:

- product
- ASIN
- visitor region
- marketplace
- partner tag
- destination
- tracking metadata
- click tracking

Then redirects or links the user appropriately.

---

# 20. PRODUCT DATA MODEL

Products should support:

- internal ID
- ASIN
- marketplace ASIN
- title
- brand
- manufacturer
- category
- subcategory
- slug
- images
- gallery
- thumbnail
- description
- short description
- features
- specifications
- attributes
- rating
- review count
- price
- currency
- list price
- availability
- Amazon URL
- affiliate URL
- ranking
- category ranking
- featured
- editor choice
- deal status
- status
- created date
- updated date
- last API sync
- SEO metadata
- schema metadata

---

# 21. MULTI-MARKETPLACE PRODUCT MODEL

Do not assume one product has one global price.

A product can have different marketplace information.

Create a marketplace-specific product relationship.

For each marketplace store:

- ASIN
- price
- currency
- URL
- availability
- rating if available
- review count if available
- last synchronized timestamp
- API source
- affiliate configuration

This prevents incorrect global price displays.

---

# 22. AMAZON PA-API INTEGRATION

Integrate Amazon Product Advertising API according to the current supported Amazon documentation and account capabilities.

The system architecture should support operations equivalent to:

- SearchItems
- GetItems
- GetVariations
- GetBrowseNodes

Do not assume an endpoint is available if Amazon changes or restricts the API.

Create an abstraction layer so the Amazon provider can be updated independently.

---

# 23. AMAZON API SERVICE LAYER

Create:

`AmazonService`

with marketplace-specific configuration.

Responsibilities:

- authentication
- request signing
- API requests
- retries
- error handling
- throttling
- caching
- response normalization
- logging
- marketplace mapping

Create normalized internal product objects rather than coupling the entire application directly to raw Amazon API response structures.

---

# 24. AMAZON API ERROR HANDLING

Handle:

- invalid credentials
- rate limits
- timeout
- network failure
- invalid ASIN
- unavailable product
- marketplace unavailable
- API quota exceeded
- malformed response
- temporary Amazon error

Never crash the entire website because Amazon API failed.

Display graceful fallback states.

---

# 25. API CACHING

Create a configurable caching layer.

Cache:

- product metadata
- category information
- browse node information
- search results where permitted
- images only according to applicable policies
- non-price information where allowed

Price and availability caching must respect the current Amazon Associates/API terms and permitted caching periods.

Do not blindly cache Amazon data indefinitely.

Admin should be able to configure cache policies where permitted.

---

# 26. PRODUCT SYNC SYSTEM

Create automated synchronization.

Admin can:

- sync one product
- sync selected products
- sync category
- sync all products
- retry failed products
- schedule sync
- view sync status

Display:

- successful
- failed
- pending
- skipped
- rate limited

Create a synchronization log.

---

# 27. CRON / SCHEDULED TASKS

Support scheduled jobs such as:

- product refresh
- price refresh where permitted
- availability refresh
- sitemap generation
- stale-content detection
- analytics aggregation
- database cleanup
- backup
- error cleanup
- notification processing

The admin panel must show:

- job name
- schedule
- last execution
- next execution
- status
- duration
- error
- retry button

---

# 28. RANKING SYSTEM

Build a professional ranking engine.

Each product can have:

- global rank
- category rank
- subcategory rank
- editorial rank
- algorithmic rank

Rank #1 must appear before #2, etc.

Support drag-and-drop ranking.

Support numeric ranking.

Support bulk ranking.

---

# 29. AUTO-RANKING

Optional automated ranking can consider:

- CTR
- outbound clicks
- conversion data if legitimately available
- product rating
- review count
- editorial score
- popularity
- freshness
- deal status
- manual weight
- category-specific weighting

Allow admin to configure weighting.

Example:

Rating: 20%

Review count: 10%

CTR: 25%

Editorial score: 20%

Popularity: 15%

Freshness: 10%

These values must be configurable.

---

# 30. RANKING TRANSPARENCY

Do not make deceptive claims such as:

"Amazon's #1 product"

unless actually supported.

Instead use truthful labels such as:

"Best Buy Cart Rank #1"

"Editor's Pick"

"Top Rated"

"Popular Choice"

The wording must be configurable.

---

# 31. COMPARISON SYSTEM

Build a full product comparison feature.

Users can select:

2 products

3 products

4 products

and compare:

- price where permitted
- rating
- review count
- brand
- features
- specifications
- dimensions
- connectivity
- compatibility
- included items
- warranty information when available
- editorial score

The comparison table must be responsive.

On mobile, transform it into stacked comparison cards if necessary.

---

# 32. COMPARISON URLS

Allow shareable comparison URLs.

Example:

`/compare/product-a-vs-product-b`

Comparison pages should have:

- SEO metadata
- canonical URL
- product schema where appropriate
- internal links
- related products

---

# 33. DEALS SYSTEM

Create a dedicated Deals system.

Deal fields:

- product
- marketplace
- deal title
- deal description
- start time
- end time
- discount data where permitted
- badge
- priority
- status
- region

Deal pages should support:

- Today's Deals
- Trending Deals
- Electronics Deals
- Gaming Deals
- Home Deals
- Limited-Time Deals

Never fabricate discounts.

---

# 34. BLOG / CONTENT MANAGEMENT SYSTEM

Create a built-in CMS.

Content types:

- Article
- Product Review
- Buying Guide
- Best-of List
- Comparison Article
- How-to Guide
- Category Guide
- Deal Article
- FAQ Article

Each article should support:

- title
- slug
- excerpt
- body
- featured image
- author
- category
- tags
- products
- related articles
- SEO metadata
- schema type
- publish date
- modified date
- draft
- scheduled
- published
- archived

---

# 35. PRODUCT REVIEW SYSTEM

Create professional editorial review pages.

A review can include:

- introduction
- product overview
- testing methodology
- key specifications
- pros
- cons
- performance
- design
- usability
- value
- alternatives
- final verdict
- score
- Amazon CTA
- FAQ

Do not generate fake personal experiences.

Do not claim a product was physically tested unless the administrator actually provides that information.

---

# 36. BUYING GUIDE SYSTEM

Create buying guides such as:

"Best Gaming Laptops"

"Best Wireless Headphones"

"Best Budget Monitors"

"Best Office Chairs"

Each guide can contain:

- introduction
- selection criteria
- ranked products
- comparison table
- individual product sections
- buyer considerations
- FAQ
- conclusion

Products should be selectable from the database rather than manually duplicated.

---

# 37. EDITORIAL SCORE

Create an optional internal score system.

Example:

Performance

Value

Features

Design

Reliability

Overall

Each score should be editable by authorized users.

The score must be clearly identified as a Best Buy Cart editorial score, not an Amazon score.

---

# 38. USER FEATURES

If enabled, users can:

- create an account
- save products
- create favorites
- compare products
- view recently viewed products
- follow categories
- subscribe to newsletters
- receive deal notifications
- comment on articles
- submit feedback

These features must remain optional.

Do not make account creation mandatory for normal product browsing.

---

# 39. WISHLIST / FAVORITES

Allow users to save products.

Show:

- saved products
- current information where available
- region
- product status

Provide a remove button.

If users are not logged in, optionally support local-device favorites.

---

# 40. RECENTLY VIEWED

Track recently viewed products in a privacy-conscious manner.

Display:

- product image
- title
- ranking
- current relevant information
- CTA

Allow:

"Clear recently viewed"

---

# 41. COMMENTS

If comments are enabled:

Include:

- moderation
- spam detection
- report
- delete
- approve
- pending
- blocked
- rate limiting

Never allow uncontrolled spam.

---

# 42. NEWSLETTER SYSTEM

Create newsletter infrastructure.

Support:

- email subscription
- double opt-in if required
- unsubscribe
- consent tracking
- segmentation
- regional preferences

Admin dashboard:

- subscribers
- active
- unsubscribed
- growth
- source
- campaign integration

---

# 43. SEO ARCHITECTURE

SEO must be treated as a core system, not an afterthought.

Every indexable page should support:

- title
- meta description
- canonical
- robots
- Open Graph
- Twitter/X metadata
- structured data
- breadcrumbs
- internal links
- sitemap inclusion

---

# 44. SEO TEMPLATE SYSTEM

Create dynamic templates.

Product:

`{product_name} — Price, Reviews & Best Alternatives`

Category:

`Best {category} — Top Picks & Buying Guide`

Review:

`{product_name} Review — Features, Pros, Cons & Verdict`

Comparison:

`{product_a} vs {product_b} — Which Is Better?`

Templates must be editable from `/shohan`.

---

# 45. STRUCTURED DATA

Implement appropriate Schema.org structured data.

Potential schemas:

- Product
- Offer where appropriate
- AggregateRating only when legitimately sourced and permitted
- Review
- Article
- BlogPosting
- FAQPage where appropriate
- BreadcrumbList
- Organization
- WebSite
- SearchAction

Do not create misleading structured data.

Only mark up information actually visible and supported.

---

# 46. FAQ / PAA SYSTEM

Create a reusable FAQ component.

Admin can create FAQs globally or per:

- product
- category
- article
- comparison
- buying guide

Fields:

Question

Answer

Priority

Status

Schema enabled

The frontend should generate semantic FAQ markup where appropriate.

---

# 47. INTERNAL LINKING ENGINE

Build automated internal linking suggestions.

For example:

Product:

→ related category

→ related products

→ buying guides

→ comparison pages

→ reviews

Category:

→ subcategories

→ products

→ guides

→ reviews

Article:

→ products

→ categories

→ related articles

Admin should see internal-link recommendations.

---

# 48. SITEMAP SYSTEM

Generate:

- sitemap index
- product sitemap
- category sitemap
- article sitemap
- review sitemap
- comparison sitemap
- image sitemap where appropriate

Do not generate huge inefficient single sitemap files.

Use appropriate sitemap splitting.

---

# 49. ROBOTS.TXT

Provide admin controls for robots configuration.

Protect:

- admin routes
- private APIs
- internal tools
- sensitive paths

Do not accidentally block public SEO pages.

---

# 50. 404 SYSTEM

Create a beautiful custom 404 page.

Include:

- search
- popular categories
- recommended products
- popular articles
- homepage CTA

Create a 404 monitor in admin.

Log:

- requested URL
- referrer where available
- timestamp
- count

Allow admin to create redirects.

---

# 51. REDIRECT MANAGER

Admin can create:

301 redirects

302 redirects

other supported redirect types where appropriate.

Fields:

- source
- destination
- type
- active
- hit count
- created
- updated

Avoid redirect loops.

Detect conflicts.

---

# 52. ANALYTICS

Build a first-party analytics abstraction.

Track events such as:

- page view
- product view
- product click
- Amazon outbound click
- search
- filter usage
- comparison started
- comparison completed
- newsletter signup
- category click
- CTA click
- region switch

Do not collect unnecessary personal data.

---

# 53. AFFILIATE CLICK ANALYTICS

Create detailed click analytics.

For each affiliate click:

- product
- ASIN
- marketplace
- region
- page
- CTA type
- timestamp
- referrer where appropriate
- device category
- campaign/source where applicable

Avoid storing sensitive personal information unnecessarily.

---

# 54. ADMIN ANALYTICS DASHBOARD

Dashboard cards:

- Products
- Product views
- Amazon clicks
- CTR
- Top products
- Top categories
- Top pages
- Top searches
- Top countries
- Top marketplaces
- Content performance

Charts:

- clicks over time
- product views
- searches
- traffic
- category performance

Use selectable periods:

- Today
- Yesterday
- 7 days
- 30 days
- 90 days
- 12 months
- Custom

---

# 55. ADMIN PANEL — `/shohan`

The administration panel is one of the most important components.

It must feel like a combination of:

- WordPress
- modern SaaS dashboard
- cPanel
- Shopify-style usability
- professional analytics dashboard

But do not copy proprietary interfaces exactly.

Create an original design.

---

# 56. ADMIN LOGIN

Admin login route:

`/shohan`

Support:

- username/email
- password
- remember session where appropriate
- forgot password
- login protection
- rate limiting
- 2FA
- suspicious login detection
- session management

Never hardcode passwords in frontend code.

Never expose credentials in source code.

---

# 57. ADMIN DASHBOARD

Create a powerful dashboard.

Top statistics:

- total products
- active products
- categories
- articles
- Amazon clicks
- CTR
- users
- subscribers
- estimated earnings if data is legitimately available
- API health
- system health

Add quick actions:

- Add Product
- Import Products
- Create Article
- Create Category
- Run Amazon Sync
- Clear Cache
- Generate Sitemap
- Backup Database

---

# 58. ADMIN SIDEBAR

Suggested navigation:

Dashboard

Products

Categories

Brands

Tags

Deals

Comparisons

Reviews

Buying Guides

Articles

Media

Amazon

Affiliate Links

Analytics

Users

Comments

Newsletter

SEO

Redirects

Sitemaps

Settings

System

Logs

Backups

Cron Jobs

Security

Audit Logs

---

# 59. PRODUCT ADMIN TABLE

Columns:

- checkbox
- image
- title
- ASIN
- brand
- category
- rank
- price
- rating
- clicks
- status
- updated
- actions

Support:

- sorting
- filtering
- search
- pagination
- column customization
- bulk actions

---

# 60. PRODUCT BULK ACTIONS

Support:

- publish
- draft
- archive
- delete
- duplicate
- assign category
- assign tag
- feature
- unfeature
- re-rank
- sync Amazon
- export
- update SEO
- change marketplace

---

# 61. PRODUCT EDITOR

Create a professional product editor.

Tabs:

### Basic

Title

Brand

ASIN

Category

Slug

Status

### Media

Images

Gallery

Thumbnail

Alt text

### Description

Short description

Full description

Features

Pros

Cons

### Specifications

Dynamic key/value fields

### Ranking

Global rank

Category rank

Editorial score

### Amazon

Marketplace

Affiliate URL

Partner tag

API sync

### SEO

SEO title

Meta description

Canonical

OG image

Schema

### Advanced

Custom fields

Internal notes

Audit information

---

# 62. CATEGORY ADMIN

Category manager should support:

- hierarchy tree
- drag-and-drop
- bulk editing
- SEO fields
- category image
- icon
- featured state
- ordering
- status

---

# 63. BRAND MANAGEMENT

Create brand records.

Fields:

- name
- slug
- logo
- description
- website
- category associations
- SEO fields
- product count

Brand pages should be indexable when useful.

---

# 64. TAG MANAGEMENT

Support:

- tags
- aliases
- SEO metadata
- related tags
- usage counts

---

# 65. MEDIA LIBRARY

Create a modern media library.

Support:

- upload
- drag-and-drop
- folders
- search
- filters
- image preview
- dimensions
- file size
- MIME type
- alt text
- title
- caption
- description

Optimize images automatically where appropriate.

---

# 66. IMAGE OPTIMIZATION

Support:

- WebP
- AVIF
- responsive images
- lazy loading
- width/height attributes
- compression
- thumbnail generation

Prevent layout shift.

---

# 67. AMAZON ADMIN MODULE

Create a dedicated Amazon management dashboard.

Show:

- marketplace configuration
- API connection status
- partner tags
- API usage
- last successful request
- last failed request
- sync queue
- failed products
- rate limits
- cache status

Include:

"Test Amazon Connection"

button.

---

# 68. AFFILIATE LINK MANAGER

Create:

- marketplace link templates
- partner tag manager
- ASIN URL generator
- link validator
- redirect manager
- click tracking
- link health monitoring

Allow admin to test:

Product + marketplace → generated affiliate URL.

---

# 69. AMAZON API SECURITY

Never expose:

- API secret
- access key
- private credentials
- database credentials

in frontend JavaScript.

Use server-side environment variables or secure secret storage.

Admin UI should mask sensitive values.

---

# 70. USER MANAGEMENT

Roles:

- Super Admin
- Admin
- Editor
- Author
- SEO Manager
- Product Manager
- Analyst
- Contributor
- Moderator
- Subscriber

Build a granular permission matrix.

Permissions can include:

- products.read
- products.create
- products.update
- products.delete
- amazon.sync
- analytics.read
- users.manage
- seo.manage
- settings.manage
- backups.manage
- security.manage

---

# 71. SUPER ADMIN

The Super Admin can manage:

- all settings
- all users
- roles
- permissions
- system tools
- API credentials
- backups
- security
- database tools

Do not allow ordinary administrators to automatically access secret system configuration.

---

# 72. TWO-FACTOR AUTHENTICATION

Support secure 2FA.

Possible implementation:

- TOTP
- authenticator application
- recovery codes

Never store plaintext recovery codes.

---

# 73. ADMIN AUDIT LOG

Log sensitive actions:

- login
- logout
- failed login
- product created
- product edited
- product deleted
- ranking changed
- API key changed
- settings changed
- user created
- permission changed
- backup created
- backup restored
- redirects changed

Display:

- user
- action
- target
- timestamp
- IP where legally appropriate
- metadata

---

# 74. SYSTEM HEALTH

Create a system-health dashboard.

Monitor:

- CPU
- RAM
- storage
- database
- cache
- queue
- cron
- API
- filesystem
- application version

Use safe read-only diagnostics.

Never provide dangerous arbitrary shell execution through a public admin interface.

---

# 75. DATABASE MANAGEMENT

If a database management interface is included, keep it tightly restricted.

Provide safe actions such as:

- table overview
- row counts
- indexes
- database size
- optimization where supported
- backup

Do not expose unrestricted SQL execution to normal administrators.

---

# 76. BACKUP SYSTEM

Support:

- database backup
- application backup
- media backup
- full backup

Schedule:

- daily
- weekly
- monthly

Display:

- backup size
- timestamp
- type
- status
- storage location

Support restore with confirmation.

---

# 77. BACKUP SAFETY

Before destructive restoration:

- require confirmation
- verify backup
- log action
- provide rollback where feasible

Never silently overwrite production data.

---

# 78. CRON MANAGER

Create a cron/task management interface.

Display:

Task

Schedule

Last run

Next run

Status

Duration

Actions

Actions:

- Run now
- Disable
- Enable
- View logs

---

# 79. LOG MANAGEMENT

Create separate logs:

- application
- API
- Amazon
- authentication
- affiliate clicks
- cron
- database
- security
- 404
- redirects

Include filtering and search.

---

# 80. SETTINGS CENTER

Create organized settings pages.

### General

- site name
- logo
- favicon
- tagline
- timezone
- default language

### Branding

- colors
- typography
- logo
- footer branding
- button style

### Amazon

- API configuration
- marketplace settings
- partner tags

### Affiliate

- disclosure
- link attributes
- redirect behavior

### SEO

- templates
- sitemap
- schema
- indexing

### Analytics

- analytics integrations
- event settings

### Email

- SMTP
- newsletter integration

### Security

- sessions
- 2FA
- rate limits

### Performance

- caching
- CDN
- image optimization

---

# 81. THEME CUSTOMIZATION

Admin should be able to change:

- primary color
- secondary color
- accent
- background
- text color
- typography
- border radius
- button style
- card style
- header layout

But preserve design consistency.

Do not allow arbitrary customization to destroy accessibility.

---

# 82. DARK MODE

Optional dark mode.

Support:

- light
- dark
- system

Persist preference.

Ensure:

- contrast
- readable text
- accessible buttons
- readable tables
- readable forms

---

# 83. PERFORMANCE

Target:

- fast initial load
- optimized JavaScript
- optimized CSS
- server-side rendering/static generation where beneficial
- caching
- CDN
- lazy loading
- responsive images
- database indexing
- pagination
- efficient API requests

Target strong Core Web Vitals.

Do not sacrifice functionality merely to obtain an artificial Lighthouse score.

---

# 84. DATABASE ARCHITECTURE

Design a normalized relational database.

Potential tables:

users

roles

permissions

role_permissions

user_roles

products

product_marketplaces

product_images

product_features

product_specifications

categories

category_products

brands

tags

product_tags

rankings

rank_history

deals

comparisons

comparison_products

articles

article_products

reviews

buying_guides

faqs

media

affiliate_marketplaces

affiliate_links

affiliate_clicks

analytics_events

search_logs

newsletter_subscribers

comments

redirects

404_logs

cron_jobs

cron_logs

api_logs

audit_logs

settings

backups

sessions

notifications

and additional tables where required.

Do not blindly create every table if the selected ORM/database architecture provides a better normalized design.

---

# 85. DATABASE INDEXING

Add indexes for frequent queries.

Examples:

- ASIN
- slug
- category
- brand
- rank
- status
- marketplace
- created_at
- updated_at

Search-heavy columns should have suitable indexing/search strategy.

---

# 86. API ARCHITECTURE

Build a clean backend API.

Organize endpoints around resources.

Examples:

`/api/products`

`/api/categories`

`/api/search`

`/api/amazon`

`/api/affiliate`

`/api/analytics`

`/api/articles`

`/api/comparisons`

`/api/admin`

Use authentication and authorization appropriately.

Validate all incoming input.

---

# 87. API VALIDATION

Every API endpoint must validate:

- type
- required fields
- length
- allowed values
- authorization
- ownership
- pagination
- sorting

Never trust client-side validation alone.

---

# 88. SECURITY

Implement protection against:

- SQL injection
- XSS
- CSRF
- SSRF
- session hijacking
- brute force
- credential stuffing
- malicious file uploads
- path traversal
- insecure direct object references
- privilege escalation

Use secure headers.

Use HTTPS in production.

---

# 89. FILE UPLOAD SECURITY

Uploaded files must be validated by:

- MIME type
- extension
- size
- content where feasible

Do not allow arbitrary executable files in public upload directories.

---

# 90. RATE LIMITING

Apply rate limiting to:

- login
- password reset
- search
- comments
- API endpoints
- Amazon API proxy
- newsletter signup

Different limits may be used for different endpoints.

---

# 91. COOKIE CONSENT

Implement privacy-conscious consent.

Support:

- essential cookies
- analytics cookies
- marketing cookies if used

Allow users to change preferences.

Do not activate optional tracking before appropriate consent where legally required.

---

# 92. PRIVACY

Collect only necessary information.

Provide:

- Privacy Policy
- Cookie Policy
- Terms
- Affiliate Disclosure
- Contact
- Data request mechanisms where applicable

---

# 93. AMAZON DISCLOSURE

Include a clear affiliate disclosure.

The exact legal wording must be configurable from admin.

Do not hide the disclosure.

Display it in relevant places.

---

# 94. CONTENT QUALITY

The site must NOT become a low-quality AI content farm.

Avoid:

- keyword stuffing
- duplicate articles
- thin pages
- fake reviews
- fabricated testing
- fake statistics
- misleading rankings
- misleading discounts
- copied descriptions without proper handling
- doorway pages

Content should provide actual value.

---

# 95. AI CONTENT ASSISTANCE

If Manus AI implements AI-assisted content generation, it should create:

- outlines
- summaries
- FAQs
- comparison drafts
- SEO suggestions
- internal-link suggestions

But every generated content item must be editable by administrators.

Do not automatically publish AI-generated claims without review where factual accuracy matters.

---

# 96. PRODUCT DESCRIPTION HANDLING

Amazon-provided product information must be handled according to applicable Amazon policies.

Do not unnecessarily copy or permanently store restricted content.

Separate:

- Amazon API data
- editorial content
- manually entered content
- generated content

Make source provenance visible in admin.

---

# 97. SEO CONTENT STRUCTURE

Every important page should have:

One H1

Logical H2 sections

Logical H3 sections

Readable paragraphs

Bullets

Tables where useful

FAQs where relevant

Internal links

Relevant product links

Do not generate meaningless headings simply for SEO.

---

# 98. MOBILE UX

Mobile users should have:

- sticky search
- easy filter access
- thumb-friendly buttons
- readable product cards
- horizontal comparison scrolling where necessary
- bottom-sheet filters
- compact CTA
- fast navigation

Do not overload mobile screens.

---

# 99. ACCESSIBILITY

Follow modern accessibility principles.

Support:

- keyboard navigation
- focus states
- semantic HTML
- ARIA where needed
- sufficient contrast
- screen-reader labels
- accessible forms
- accessible dialogs
- reduced-motion preference

---

# 100. ERROR STATES

Every major feature needs:

Loading state

Empty state

Error state

Success state

Permission denied state

Offline/network failure state where applicable

Do not leave users staring at blank screens.

---

# 101. SKELETON LOADERS

Use skeleton loaders for:

- product cards
- product detail
- category pages
- analytics
- search results

Avoid excessive spinner usage.

---

# 102. NOTIFICATION SYSTEM

Create admin notifications for:

- Amazon API failures
- sync failures
- backup failures
- security events
- system errors
- cron failures
- low storage
- API quota issues

Use notification priority:

Info

Warning

Critical

---

# 103. ADMIN SEARCH

The `/shohan` panel should have global search.

Search:

- products
- categories
- articles
- users
- settings
- logs

Provide keyboard shortcut if practical.

---

# 104. COMMAND CENTER

Optionally implement an admin command palette.

Example:

`Ctrl/Cmd + K`

Actions:

- Add Product
- Search Products
- Create Article
- Run Amazon Sync
- Open Settings
- View Analytics
- Create Backup

---

# 105. IMPORT SYSTEM

Support importing products via:

- CSV
- JSON where appropriate

CSV fields should be mapped through an import wizard.

Steps:

1. Upload
2. Detect columns
3. Map fields
4. Validate
5. Preview
6. Import
7. Show results

Never overwrite existing products without clear confirmation.

---

# 106. EXPORT SYSTEM

Export:

- products
- categories
- articles
- clicks
- analytics
- users where permitted
- settings

Use appropriate formats.

---

# 107. DUPLICATE DETECTION

Detect duplicate products based on:

- ASIN
- marketplace
- normalized title
- internal identifiers

Show duplicate warnings before creation.

---

# 108. PRODUCT HEALTH

Create a product health indicator.

Check:

- missing image
- missing title
- missing category
- missing ASIN
- missing affiliate configuration
- broken URL
- stale API data
- missing SEO metadata

Admin should be able to filter unhealthy products.

---

# 109. SEO HEALTH SCORE

Create an SEO health checker.

Check:

- title length
- meta description
- H1
- slug
- canonical
- images
- alt text
- internal links
- schema
- content length
- duplicate metadata

Display actionable recommendations.

---

# 110. SITE-WIDE SEO DASHBOARD

Show:

- indexed pages
- noindex pages
- missing metadata
- broken links
- 404s
- redirect issues
- duplicate titles
- duplicate descriptions
- sitemap status

---

# 111. BRAND PAGES

Create SEO-friendly brand pages.

Example:

`/brand/apple`

`/brand/sony`

`/brand/samsung`

Display:

- brand description
- products
- categories
- popular products
- buying guides
- reviews

---

# 112. DEAL PAGE SEO

Create:

`/deals`

and category-specific deal pages.

Do not create empty deal pages.

If no deals exist, provide useful alternative content rather than a thin page.

---

# 113. URL STRUCTURE

Use clean URLs.

Examples:

`/products/product-name`

`/category/electronics`

`/category/electronics/headphones`

`/brand/sony`

`/deals`

`/compare/...`

`/reviews/...`

`/guides/...`

`/blog/...`

`/shohan`

Avoid unnecessary query parameters for indexable pages.

---

# 114. CANONICALIZATION

Prevent duplicate URLs.

Canonicalize:

- filter variations
- tracking parameters
- regional variants where appropriate
- pagination
- duplicate slugs

Do not accidentally canonicalize distinct marketplace pages into the wrong URL.

---

# 115. INTERNATIONALIZATION

Architect the application for internationalization.

Primary language:

English.

Future support:

- German
- French
- Spanish
- Italian
- Dutch
- Swedish
- Polish
- other languages

Do not hardcode text inside components when localization is enabled.

---

# 116. CURRENCY HANDLING

Support:

USD

GBP

CAD

EUR

SEK

PLN

AUD

and future currencies.

Never perform financial conversion using hardcoded exchange rates.

If currency conversion is implemented, use a reliable configurable data source.

---

# 117. TIMEZONE HANDLING

Store timestamps consistently.

Render dates according to:

- site timezone
- user locale
- admin preference

---

# 118. NOT FOUND PRODUCT HANDLING

If an Amazon product disappears:

Do not silently display stale information indefinitely.

Show:

"This product may no longer be available."

Provide:

- alternatives
- category
- related products

Allow admin to archive it.

---

# 119. BROKEN AFFILIATE LINK MONITOR

Create automated link checks where technically appropriate.

Identify:

- invalid URLs
- missing marketplace
- missing affiliate tag
- redirect failures

Show warnings in admin.

---

# 120. AMAZON LINK REDIRECT ARCHITECTURE

Use a safe redirect mechanism if implementing tracked redirects.

Example conceptual route:

`/go/product-slug`

The server resolves:

- product
- marketplace
- affiliate configuration

then redirects to Amazon.

Do not use redirects to conceal misleading destinations.

The destination must remain Amazon.

---

# 121. CLICK TRACKING

Track click events before redirecting.

Ensure analytics failure does NOT prevent the Amazon redirect.

If analytics service fails:

→ still send visitor to Amazon.

---

# 122. GRACEFUL DEGRADATION

If:

Amazon API fails

→ existing permitted data + clear status

Database temporarily unavailable

→ proper error page

Analytics fails

→ website continues

Image fails

→ fallback image

Search unavailable

→ basic search fallback if possible

External service unavailable

→ application remains usable wherever possible

---

# 123. ADMIN UX PRINCIPLES

The administrator should be able to understand the system without reading source code.

Use:

- clear labels
- tooltips
- descriptions
- confirmation dialogs
- warnings
- contextual help
- breadcrumbs
- tabs
- sensible defaults

---

# 124. DESTRUCTIVE ACTIONS

For:

Delete

Restore

Reset

Remove API credentials

Clear analytics

Bulk delete

Require confirmation.

For particularly dangerous actions, require typing a confirmation phrase.

---

# 125. ADMIN TABLE UX

Support:

- sticky headers
- bulk selection
- column sorting
- filtering
- pagination
- density controls
- responsive behavior
- saved filters

---

# 126. DASHBOARD CUSTOMIZATION

Allow administrators to:

- rearrange widgets
- hide widgets
- change date range
- save dashboard layout

---

# 127. AUDITABILITY

Important actions should always be traceable.

Every major admin modification should record:

- actor
- timestamp
- action
- entity
- old value where appropriate
- new value where appropriate

---

# 128. TESTING

Create automated tests for:

- authentication
- authorization
- products
- categories
- Amazon integration
- affiliate URL generation
- regional routing
- ranking
- search
- comparisons
- SEO
- redirects
- analytics
- backups

---

# 129. END-TO-END TESTING

Test critical flows:

### Flow 1

Visitor opens homepage.

### Flow 2

Visitor searches product.

### Flow 3

Visitor filters category.

### Flow 4

Visitor opens product.

### Flow 5

Visitor switches marketplace.

### Flow 6

Visitor clicks Amazon CTA.

### Flow 7

Affiliate click is recorded.

### Flow 8

Visitor reaches Amazon.

### Flow 9

Admin creates product.

### Flow 10

Admin assigns ranking.

### Flow 11

Product appears in correct order.

### Flow 12

Amazon sync updates permitted product data.

---

# 130. SECURITY TESTING

Test:

- SQL injection
- XSS
- CSRF
- authorization bypass
- brute force
- file upload attacks
- path traversal
- privilege escalation
- session security

---

# 131. PERFORMANCE TESTING

Test:

- homepage
- product listing
- product detail
- search
- admin dashboard
- large product tables

Test with realistic data volumes.

---

# 132. LARGE DATASET TESTING

Seed realistic data:

- 100 products
- 1,000 products
- 10,000 products

Test:

- search
- filtering
- sorting
- ranking
- pagination
- analytics

Do not assume the website works at scale simply because it works with 10 products.

---

# 133. SEO TESTING

Check:

- canonical
- sitemap
- robots
- structured data
- title
- descriptions
- breadcrumbs
- internal links
- mobile rendering
- duplicate pages

---

# 134. BROWSER TESTING

Test latest versions of:

- Chrome
- Firefox
- Edge
- Safari where available

Test mobile Safari and Chrome.

---

# 135. DEPLOYMENT ARCHITECTURE

The final project should be deployable to a production environment.

Support appropriate infrastructure such as:

Frontend:

Next.js / React

Backend:

Node.js / NestJS / Express or equivalent

Database:

PostgreSQL

Cache:

Redis where useful

Reverse proxy:

Nginx

Containerization:

Docker

CI/CD:

GitHub Actions or equivalent

The exact stack can be selected based on the hosting environment, but do not choose technology merely because it is fashionable.

Choose based on:

- reliability
- maintainability
- SEO
- performance
- scalability
- developer experience
- hosting compatibility

---

# 136. ENVIRONMENT VARIABLES

Create:

`.env.example`

Never commit secrets.

Examples:

DATABASE_URL

REDIS_URL

AMAZON_ACCESS_KEY

AMAZON_SECRET_KEY

AMAZON_PARTNER_TAG_US

AMAZON_PARTNER_TAG_UK

AMAZON_PARTNER_TAG_DE

etc.

ANALYTICS_ID

SMTP credentials

SESSION_SECRET

and other required secrets.

---

# 137. SECRET MANAGEMENT

Never expose server-side credentials to:

- browser
- public API
- frontend bundle
- HTML source
- logs

Mask secrets in admin.

---

# 138. LOGGING

Logs must be structured.

Include:

- timestamp
- level
- service
- request ID
- error
- context

Never log:

- passwords
- API secrets
- session tokens
- unnecessary personal data

---

# 139. OBSERVABILITY

Provide:

- error tracking integration point
- health endpoint
- readiness endpoint
- database health
- Amazon API health
- cache health

---

# 140. SEO-FRIENDLY RENDERING

For public pages, prioritize rendering strategies that allow search engines to reliably access:

- product titles
- descriptions
- category content
- FAQ
- structured data
- internal links

Do not build a purely client-rendered application if that would materially harm SEO.

---

# 141. ADMIN ROUTE SECURITY

`/shohan` must never be publicly usable without authentication.

Protect all child routes.

Example:

`/shohan/dashboard`

`/shohan/products`

`/shohan/products/new`

`/shohan/products/[id]`

`/shohan/categories`

`/shohan/amazon`

`/shohan/analytics`

etc.

---

# 142. ADMIN ROUTE DISCOVERY

Do not unnecessarily expose sensitive admin endpoints to search engines.

Use:

- authentication
- noindex
- robots controls
- secure server routing

Security must not rely on the obscurity of `/shohan`.

---

# 143. MASTER ADMIN CREDENTIALS

Do not hardcode credentials into source code.

During initial setup, create the Super Admin through a secure environment/setup process.

If credentials are supplied later by the owner, store them securely.

Never place plaintext passwords in documentation committed to Git.

---

# 144. DEMO DATA

Provide realistic demo data for development.

Include:

- products
- categories
- brands
- articles
- FAQs
- comparisons
- deals

Clearly label demo content.

Do not represent fake demo data as real Amazon data.

---

# 145. ADMIN EMPTY STATES

Every admin section should have useful empty states.

Example:

"No products yet."

Then provide:

"Add Product"

"Import CSV"

"Fetch from Amazon"

---

# 146. FRONTEND EMPTY STATES

Example:

"No products found."

Suggestions:

- remove filters
- try another keyword
- browse category
- view popular products

---

# 147. GLOBAL SEARCH EXPERIENCE

Search should be accessible from:

- header
- mobile navigation
- homepage
- keyboard shortcut if implemented

Provide fast results.

---

# 148. BREADCRUMBS

Every hierarchical page should have breadcrumbs.

Example:

Home

→ Electronics

→ Headphones

→ Wireless Headphones

→ Product

Use BreadcrumbList schema where appropriate.

---

# 149. SOCIAL SHARING

Support:

- Facebook
- X
- Reddit
- Pinterest
- LinkedIn
- copy link

Do not make social sharing intrusive.

---

# 150. OPEN GRAPH

Every important page should have:

- title
- description
- image
- URL
- site name

Product and article pages should have appropriate social preview images.

---

# 151. NEWSLETTER CTA

Use tasteful newsletter placements.

Never use aggressive popups immediately after page load.

Support configurable:

- delay
- scroll percentage
- exit intent where appropriate
- frequency limits

Respect consent.

---

# 152. ADS

Do not build fake ads.

If future advertising is enabled, create a modular ad-placement system.

Support:

- header
- sidebar
- content
- footer

But ensure ads do not destroy UX or Core Web Vitals.

---

# 153. MONETIZATION ARCHITECTURE

Primary monetization:

Amazon affiliate commissions.

Future optional monetization:

- display advertising
- sponsored editorial content with disclosure
- other affiliate networks

Architect for extension without making them mandatory.

---

# 154. LEGAL PAGE CMS

Legal pages must be editable.

Pages:

- Affiliate Disclosure
- Privacy Policy
- Cookie Policy
- Terms of Use
- Disclaimer
- Contact

Do not claim legal compliance automatically.

Provide configurable content.

---

# 155. CONTACT SYSTEM

Create contact form.

Fields:

- name
- email
- subject
- message

Protect against spam.

Admin can view submissions.

Do not expose submissions publicly.

---

# 156. EMAIL SYSTEM

Support transactional emails:

- password reset
- account verification
- admin notifications
- newsletter confirmation
- security alerts

Email templates should be configurable.

---

# 157. API DOCUMENTATION

Create internal API documentation.

Document:

- endpoint
- method
- authentication
- parameters
- response
- errors

---

# 158. PROJECT DOCUMENTATION

Deliver:

`README.md`

Include:

- architecture
- installation
- environment variables
- database setup
- migrations
- seeding
- local development
- production deployment
- Amazon configuration
- affiliate configuration
- cron configuration
- backup
- troubleshooting

---

# 159. DEVELOPER EXPERIENCE

Project must be clean.

Use:

- TypeScript where appropriate
- strict typing
- reusable components
- service layers
- repositories where useful
- validation schemas
- clean error handling
- consistent naming

Avoid giant files.

Avoid duplicated business logic.

---

# 160. COMPONENT ARCHITECTURE

Create reusable components such as:

ProductCard

ProductGrid

ProductGallery

ProductRating

AffiliateCTA

ComparisonTable

CategoryCard

DealCard

ArticleCard

FAQSection

Breadcrumbs

SearchBar

FilterPanel

RegionSelector

Pagination

AdminDataTable

AdminSidebar

AdminHeader

AnalyticsCard

Chart

Modal

Drawer

Toast

EmptyState

LoadingState

ErrorState

---

# 161. DESIGN SYSTEM

Create a consistent design system.

Define:

- typography
- spacing
- border radius
- shadows
- buttons
- inputs
- badges
- cards
- tables
- alerts
- modals
- dropdowns
- tooltips

Do not design every page independently.

---

# 162. MICRO-INTERACTIONS

Use subtle animations for:

- button hover
- card hover
- dropdown
- modal
- page transitions
- loading
- success
- errors

Respect:

`prefers-reduced-motion`.

---

# 163. NO UI PLACEHOLDERS IN FINAL BUILD

Do not leave:

"Lorem ipsum"

"Coming soon"

"TODO"

"Fake data"

"Example product"

in production areas unless intentionally marked as demo data.

---

# 164. NO BROKEN FEATURES

Before considering the application complete, verify every visible button.

If a feature cannot be implemented:

- clearly identify it
- do not pretend it works
- provide an appropriate fallback

---

# 165. ADMIN HOME PAGE CUSTOMIZATION

Admin should be able to customize homepage sections.

Example:

Drag:

Hero

→ Deals

→ Categories

→ Ranked Products

→ Buying Guides

→ Reviews

The order should be stored in the database/settings.

---

# 166. FEATURE FLAGS

Create a feature flag system for major optional features.

Examples:

- user accounts
- comments
- newsletter
- dark mode
- comparisons
- wishlist
- deals
- AI assistance
- analytics integrations

---

# 167. MAINTENANCE MODE

Create maintenance mode.

Admin can enable it.

Visitors see a polished maintenance page.

Admins can still access `/shohan`.

---

# 168. CACHE MANAGEMENT

Admin actions:

- clear all cache
- clear product cache
- clear category cache
- clear page cache
- clear search cache

Display confirmation.

---

# 169. DATABASE MIGRATIONS

Use versioned migrations.

Never modify production database schema manually without migration tracking.

---

# 170. SEED SYSTEM

Create a seed command for development.

Example conceptual command:

`seed`

Populate:

- admin development account
- categories
- products
- articles
- settings

Never seed real production credentials.

---

# 171. VERSIONING

Display application version in admin footer.

Track releases.

Include migration compatibility.

---

# 172. UPDATE SYSTEM

If an update manager is provided, make it safe.

Show:

- current version
- latest version
- changelog
- compatibility
- backup requirement

Never automatically perform destructive updates without confirmation.

---

# 173. PRODUCTION CHECKLIST

Before final delivery, verify:

- environment variables
- database
- migrations
- authentication
- HTTPS
- security headers
- caching
- image optimization
- Amazon configuration
- affiliate configuration
- sitemap
- robots
- canonical
- analytics
- legal pages
- backups
- cron
- monitoring
- error handling

---

# 174. AMAZON COMPLIANCE PRINCIPLE

Treat Amazon Associates requirements as a first-class constraint.

Do not:

- fabricate Amazon prices
- fabricate availability
- fabricate Amazon reviews
- imply Best Buy Cart is Amazon
- misuse Amazon branding
- make unsupported claims
- retain data beyond permitted limits
- use prohibited methods
- expose API credentials

Where policy requirements change, follow the latest applicable official Amazon documentation and terms instead of relying on this prompt's assumptions.

---

# 175. NO FALSE CLAIMS

Never display claims such as:

"Amazon's official #1"

"Amazon approved"

"Amazon certified"

unless genuinely authorized and supported.

Use:

"Best Buy Cart's #1 Pick"

"Editor's Choice"

"Top Rated"

where appropriate.

---

# 176. CONTENT PROVENANCE

Admin should be able to distinguish:

Amazon API data

Manual data

Editorial data

AI-assisted content

User-generated content

This is important for maintenance and quality control.

---

# 177. PRODUCT STATUS

Support:

Draft

Active

Featured

Archived

Unavailable

Pending Sync

API Error

Needs Review

---

# 178. ARTICLE STATUS

Support:

Draft

Review

Scheduled

Published

Archived

---

# 179. PRODUCT WORKFLOW

Suggested workflow:

Amazon discovery

→ Import

→ Validate

→ Categorize

→ Editorial enhancement

→ SEO optimization

→ Ranking

→ Publish

→ Monitor

→ Refresh

---

# 180. CONTENT WORKFLOW

Suggested workflow:

Idea

→ Outline

→ Draft

→ SEO review

→ Editorial review

→ Publish

→ Update

→ Archive

---

# 181. ADMIN DASHBOARD KPIs

Include:

### Content

- products
- categories
- articles
- reviews

### Traffic

- sessions
- views
- searches

### Affiliate

- clicks
- CTR
- marketplace clicks

### System

- API health
- failed jobs
- errors
- storage

---

# 182. PRODUCT PERFORMANCE

Each product should have analytics:

- views
- clicks
- CTR
- rank
- category position
- trend
- marketplace performance

Show a product performance chart.

---

# 183. CATEGORY PERFORMANCE

Show:

- traffic
- product views
- Amazon clicks
- CTR
- top product
- top search term
- growth

---

# 184. SEARCH ANALYTICS

Record useful aggregate search data.

Show:

- top searches
- searches with no results
- search frequency
- clicked result
- search-to-click rate

This can help discover new products and content opportunities.

---

# 185. SEO OPPORTUNITY DASHBOARD

Identify:

- high-traffic pages
- low-CTR pages
- missing content
- keywords with no landing page
- categories with insufficient products
- products without descriptions
- articles needing updates

---

# 186. ADMIN PRODUCT RECOMMENDATIONS

The system can suggest:

"These products are receiving high traffic but have low Amazon CTR."

"These products have high CTR and should be considered for editorial ranking."

"These categories have growing search demand."

Recommendations must be based on actual available data.

---

# 187. PRODUCT RELATIONSHIPS

Support:

- related products
- alternatives
- upgrades
- budget alternatives
- premium alternatives
- similar products
- accessories

Admin can manually define relationships.

---

# 188. PRODUCT BADGES

Support configurable badges:

- #1 Pick
- Best Overall
- Best Budget
- Premium Pick
- Editor's Choice
- Popular
- New
- Deal

Avoid misleading badges.

---

# 189. CATEGORY-SPECIFIC BADGES

Allow badges to vary by category.

Example:

Headphones:

"Best Noise Cancelling"

"Best Budget"

Gaming:

"Best Gaming Pick"

"Best Value"

---

# 190. PRODUCT CARD VARIANTS

Support:

- compact
- standard
- horizontal
- featured
- ranked
- deal

Admin/theme can select preferred variant.

---

# 191. HOME PAGE PERSONALIZATION

Optional personalization can consider:

- region
- recent categories
- recently viewed products

Do not use sensitive personal information.

---

# 192. GEO-AWARE CONTENT

Where appropriate:

US users:

USD

Amazon US

UK users:

GBP

Amazon UK

European users:

appropriate marketplace

Do not show incorrect pricing.

---

# 193. AMAZON MARKETPLACE FALLBACK

If a product does not exist in the visitor's marketplace:

Show:

"Available in another Amazon store"

Then provide the available marketplace.

---

# 194. PRODUCT AVAILABILITY

Do not state "In Stock" unless the current data supports it.

If unavailable:

"Availability may vary."

---

# 195. PRICE DISPLAY

Where Amazon policy requires current pricing, ensure the displayed price is current within permitted constraints.

If the price cannot be safely displayed:

"Check current price on Amazon"

This is preferable to showing stale or fabricated pricing.

---

# 196. PRODUCT IMAGE HANDLING

Use appropriate Amazon-provided imagery according to applicable terms.

Do not permanently copy restricted imagery without authorization.

Where required, retrieve through supported APIs or approved mechanisms.

---

# 197. SEO VS AFFILIATE BALANCE

Do not create pages solely to place affiliate links.

Every indexed page should have genuine informational value.

---

# 198. USER TRUST

Trust elements:

- transparent affiliate disclosure
- editorial methodology
- clear ranking explanation
- updated information indicators
- honest pros/cons
- no fake reviews
- no hidden affiliate relationship

---

# 199. EDITORIAL METHODOLOGY PAGE

Create:

`/how-we-rank`

Explain:

- editorial methodology
- ranking factors
- data sources
- affiliate relationship
- update process

Make the content editable.

---

# 200. ABOUT PAGE

Explain:

- what Best Buy Cart does
- how recommendations work
- Amazon relationship
- editorial approach
- contact information

---

# 201. FOOTER

Include:

- categories
- popular products
- buying guides
- reviews
- deals
- About
- Contact
- Privacy
- Terms
- Cookie Policy
- Affiliate Disclosure
- How We Rank
- region selector
- social links

---

# 202. GLOBAL SEARCH PAGE

Search page should provide:

- query
- results
- filters
- sorting
- categories
- articles
- products
- brands
- suggestions

Separate content types visually.

---

# 203. ZERO SEARCH RESULTS

If no product matches:

Show:

"We couldn't find an exact match."

Then:

- related searches
- popular categories
- popular products
- buying guides

---

# 204. PRODUCT COMPARISON UX

Comparison should be easy:

Product A

Product B

Add Product

The user should be able to remove products without leaving the page.

---

# 205. COMPARE BUTTON

Product cards should have:

"Compare"

Do not require account creation unless configured.

---

# 206. RESPONSIVE COMPARISON

Desktop:

table

Mobile:

horizontal scroll or stacked cards.

Never allow unreadable microscopic tables.

---

# 207. DEAL EXPIRATION

When a deal expires:

- automatically mark expired
- remove active deal badge
- preserve article if useful
- avoid showing outdated discount information

---

# 208. SCHEDULED CONTENT

Allow articles and deals to be scheduled.

Fields:

Publish date

Expire date

Timezone

Status

---

# 209. ADMIN CONTENT PREVIEW

Before publishing:

"Preview"

should show exactly how the page will look.

---

# 210. DRAFT PREVIEW

Use secure preview URLs.

Do not expose unpublished content publicly through predictable IDs.

---

# 211. ADMIN MEDIA USAGE

Media library should show where an image is being used.

Example:

Used in:

- Product X
- Article Y
- Category Z

---

# 212. DELETE PROTECTION

If media/product/category is referenced elsewhere:

warn before deletion.

Offer:

- replace
- archive
- delete dependencies if appropriate

---

# 213. DATABASE RELATIONSHIP SAFETY

Use proper foreign keys and cascading rules.

Do not accidentally delete thousands of dependent records through one UI click.

---

# 214. ANALYTICS PRIVACY

Analytics must be designed with privacy in mind.

Avoid collecting:

- passwords
- payment information
- unnecessary precise location
- sensitive user information

---

# 215. GDPR/CCPA SUPPORT

Provide configurable privacy controls.

Allow appropriate data access/deletion mechanisms where applicable.

---

# 216. ADMIN SECURITY NOTIFICATIONS

Notify Super Admin about:

- repeated failed logins
- password changes
- 2FA changes
- API credential changes
- suspicious permission changes
- backup failures

---

# 217. SESSION MANAGEMENT

Admin users can view:

- active sessions
- device
- approximate information where appropriate
- created time
- last activity

Allow:

"Log out all other sessions"

---

# 218. PASSWORD SECURITY

Use strong password hashing.

Never store plaintext passwords.

Implement:

- password strength requirements
- secure reset tokens
- expiration
- rate limits

---

# 219. API AUTHENTICATION

Use secure authentication for internal APIs.

Do not expose admin endpoints without authorization.

---

# 220. CORS

Configure CORS narrowly.

Do not use wildcard production CORS unless genuinely required.

---

# 221. SECURITY HEADERS

Configure appropriate:

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security

Test compatibility before deployment.

---

# 222. ERROR PAGES

Create polished:

400

401

403

404

408

429

500

503

pages.

Do not expose stack traces publicly.

---

# 223. DEVELOPMENT ERROR HANDLING

Detailed errors may be enabled in development.

Production must show safe errors.

Log the detailed error server-side.

---

# 224. CODE QUALITY

Manus AI must produce maintainable code.

Avoid:

- duplicated code
- massive components
- hidden global state
- arbitrary magic values
- insecure shortcuts
- unnecessary dependencies

---

# 225. DEPENDENCY MANAGEMENT

Use stable maintained packages.

Avoid unnecessary dependencies.

Document important dependencies.

---

# 226. FINAL BUILD REQUIREMENT

Do not stop after creating the UI.

The finished system must include:

Frontend

Backend

Database

Authentication

Admin panel

Amazon integration architecture

Affiliate engine

Analytics

SEO

CMS

Security

Testing

Deployment configuration

Documentation

---

# 227. IMPLEMENTATION ORDER

Build the project in this order unless a better dependency-aware order is required.

## Phase 1 — Architecture

- project structure
- database architecture
- API architecture
- authentication architecture
- design system

## Phase 2 — Database

- schema
- migrations
- indexes
- relationships
- seed system

## Phase 3 — Authentication

- admin login
- roles
- permissions
- sessions
- 2FA architecture

## Phase 4 — Admin Foundation

- `/shohan`
- sidebar
- dashboard
- settings
- users

## Phase 5 — Product System

- products
- categories
- brands
- tags
- media
- ranking

## Phase 6 — Amazon

- marketplace system
- PA-API abstraction
- affiliate links
- regional routing
- sync system

## Phase 7 — Frontend

- homepage
- category
- product
- search
- comparison
- deals

## Phase 8 — Content

- blog
- reviews
- buying guides
- FAQ

## Phase 9 — SEO

- metadata
- schema
- sitemap
- robots
- canonical
- internal linking

## Phase 10 — Analytics

- events
- affiliate clicks
- dashboards

## Phase 11 — Security

- hardening
- rate limits
- audit logs
- security headers

## Phase 12 — Performance

- caching
- image optimization
- database optimization
- CDN

## Phase 13 — Testing

- unit
- integration
- E2E
- security
- performance

## Phase 14 — Deployment

- production environment
- database
- reverse proxy
- SSL
- cron
- backups
- monitoring

---

# 228. MANUS AI EXECUTION RULE

Do not attempt to build the entire project blindly in one giant unverified step.

Work systematically.

For each major phase:

1. Plan
2. Implement
3. Test
4. Review
5. Fix
6. Document
7. Continue

Maintain a project progress checklist.

---

# 229. SELF-REVIEW REQUIREMENT

Before declaring any phase complete, ask yourself:

- Does this actually work?
- Is the database relationship correct?
- Is authentication secure?
- Is the UI responsive?
- Is the feature connected to backend logic?
- Are errors handled?
- Is the feature accessible?
- Does it create duplicate business logic?
- Does it comply with the Amazon affiliate architecture?
- Does it create fake information?
- Does it harm SEO?
- Does it expose sensitive data?

Fix problems before continuing.

---

# 230. DO NOT ASK UNNECESSARY QUESTIONS

If a reasonable implementation decision can be made without owner input, make the decision and continue.

Only ask questions when the missing information genuinely blocks implementation.

Examples of information that may require owner input:

- final domain
- actual Amazon API credentials
- actual affiliate tracking IDs
- hosting credentials
- SMTP credentials
- analytics IDs
- branding assets

Use environment variables/placeholders for missing credentials.

Do not stop development merely because credentials are unavailable.

Build the integration layer and provide configuration instructions.

---

# 231. DO NOT FABRICATE CREDENTIALS

Never invent:

- Amazon API keys
- affiliate tags
- database passwords
- SMTP credentials
- analytics credentials
- hosting passwords

Use:

`YOUR_VALUE_HERE`

or environment variables.

---

# 232. FINAL USER EXPERIENCE

When a normal visitor opens Best Buy Cart, the website should immediately communicate:

"We help you find and compare products and then send you to Amazon to purchase them."

The experience should be:

Search

→ Discover

→ Compare

→ Understand

→ Decide

→ Check Amazon

→ Purchase on Amazon

The website itself should never pretend to complete the purchase.

---

# 233. FINAL ADMIN EXPERIENCE

When the owner opens:

`/shohan`

they should feel that they have complete control over the platform.

They should be able to manage:

Products

Categories

Brands

Rankings

Deals

Articles

Reviews

Buying Guides

Amazon marketplaces

Affiliate links

SEO

Analytics

Users

Comments

Media

Backups

Cron jobs

Logs

Security

Settings

without editing source code for normal operations.

---

# 234. FINAL ACCEPTANCE TEST

The project is not complete until the following are verified.

### Frontend

- homepage works
- categories work
- search works
- products work
- comparison works
- deals work
- articles work
- reviews work
- buying guides work
- mobile works
- desktop works

### Admin

- `/shohan` works
- authentication works
- roles work
- products work
- categories work
- rankings work
- Amazon configuration works
- affiliate links work
- analytics works
- SEO settings work
- backups work
- logs work

### Amazon

- marketplace mapping works
- affiliate URL generation works
- API abstraction works
- errors are handled
- credentials are secure

### SEO

- sitemap works
- robots works
- canonical works
- schema works
- metadata works
- breadcrumbs work

### Security

- authentication protected
- admin protected
- rate limiting works
- secrets protected
- uploads protected
- production errors hidden

### Performance

- optimized images
- caching
- efficient database queries
- responsive UI
- no obvious layout shifts
- good Core Web Vitals

---

# 235. IMPORTANT — DO NOT BUILD THESE

Do NOT build:

- internal shopping cart
- internal checkout
- payment gateway
- fake order tracking
- fake Amazon sales dashboard
- fake Amazon reviews
- fake product prices
- fake inventory
- fake customer orders
- fake commission numbers
- fake API responses presented as live data
- misleading Amazon branding
- fake testimonials presented as real users
- deceptive rankings
- hidden affiliate disclosures

---

# 236. FINAL PROJECT QUALITY BAR

The finished application should feel like a serious commercial product.

It should NOT feel like:

- a coding tutorial
- a demo
- an unfinished template
- an AI-generated prototype
- a generic affiliate blog
- a basic CRUD dashboard

It should feel like a real SaaS-quality product discovery platform.

Every major screen should receive professional attention.

Every interaction should have a logical result.

Every important feature should have backend support.

Every data flow should be validated.

Every security-sensitive action should be protected.

---

# 237. FINAL DELIVERABLES

Deliver:

1. Complete source code
2. Production-ready frontend
3. Production-ready backend
4. Database schema
5. Database migrations
6. Seed data
7. Admin panel
8. Authentication
9. Role/permission system
10. Amazon integration layer
11. Affiliate engine
12. Regional marketplace system
13. Product management
14. Ranking engine
15. Search
16. Comparison
17. Deals
18. CMS
19. SEO system
20. Analytics
21. Media system
22. Backup system
23. Cron system
24. Logging
25. Security
26. Testing
27. Deployment configuration
28. Environment example
29. README
30. Admin documentation
31. Amazon configuration documentation
32. SEO documentation
33. Backup/restore documentation
34. Production deployment guide

---

# 238. FINAL MANUS AI COMMAND

Now begin the project.

Do not merely describe how the project could be built.

Actually build the project.

Start by creating the complete architecture and database design.

Then implement the project phase by phase.

After every major phase:

- inspect the implementation
- run tests
- identify problems
- fix problems
- continue

Prioritize correctness over speed.

Prioritize security over convenience.

Prioritize maintainability over shortcuts.

Prioritize real functionality over visual mockups.

Prioritize SEO and performance without sacrificing usability.

Use the `/shohan` administration panel as the central control system.

Keep the Amazon affiliate business model intact throughout the entire application.

Remember:

**Best Buy Cart is NOT Amazon.**

**Best Buy Cart does NOT sell the products.**

**Best Buy Cart sends users to Amazon through affiliate links.**

**There must be NO internal cart and NO internal checkout.**

Build the application as a serious, scalable, production-ready Amazon affiliate product discovery ecosystem.

Do not finish until the implementation has been tested against the acceptance criteria above.