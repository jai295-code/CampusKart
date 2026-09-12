# Requirements Document

## Introduction

CampusKart is a campus-only marketplace web application that lets students within a single
college buy and sell used items (textbooks, calculators, electronics, furniture, cycles, and
similar goods). Today this activity happens in WhatsApp groups, where messages scroll away:
buyers cannot find items and sellers' posts get buried. CampusKart replaces that
"broadcast and forget" stream with persistent, searchable, filterable listings.

The platform's responsibility is limited to discovery, trust signals, and connecting a buyer
with a seller. Deals are completed offline and in person. CampusKart does not handle payments,
delivery, or escrow.

This document covers the Minimum Viable Product (MVP) scope: authentication and profile,
posting a listing with images, browsing the feed, searching and filtering, viewing a listing
detail with contact options, and managing and removing one's own listings. Known limitations
and out-of-scope items are recorded at the end of the document.

## Glossary

- **CampusKart_System**: The campus-only marketplace web application, including its frontend and REST backend, treated as a single system for requirements purposes.
- **Student**: A registered person who uses CampusKart. Every Student can act as both a Buyer and a Seller under one account type.
- **Buyer**: A Student who browses, searches, and views listings to find items.
- **Seller**: A Student who creates and manages listings for items they offer.
- **Viewer**: Any person accessing the CampusKart_System, whether authenticated or not.
- **Owner**: The Seller who created a specific Listing.
- **Listing**: A record of a single item offered for sale, including its details, images, price, condition, and status.
- **Feed**: The browse view that presents active listings as a responsive card grid.
- **Listing_Detail**: The view that presents the full information for a single Listing.
- **Cover_Image**: The single required primary image of a Listing.
- **Additional_Image**: An optional supplementary image of a Listing, beyond the Cover_Image.
- **Category**: A classification of a Listing from the fixed set: Books & Notes, Electronics & Gadgets, Stationery, Room & Furniture, Cycles, Others.
- **Condition**: The wear state of an item from the fixed set: New, Like New, Good, Fair.
- **Active_Listing**: A Listing whose status is "active".
- **Removed_Listing**: A Listing whose status is "removed" (soft deleted).
- **Verified_Badge**: A visual indicator that a Seller's account carries the verified flag.
- **Session_Token**: The JSON Web Token (JWT) issued at login that authenticates subsequent write requests.
- **Maximum_Image_Size**: The configured per-image upload size limit, defaulted to 5 megabytes for the MVP.

## Requirements

### Requirement 1: Account Registration

**User Story:** As a student, I want to create an account with my email, password, and profile details, so that I can post and manage listings on CampusKart.

#### Acceptance Criteria

1. WHEN a Viewer submits the sign-up form with name, email, password, hostel, and mobile number including country code, THE CampusKart_System SHALL create a new Student account.
2. THE CampusKart_System SHALL store the account password as a bcrypt hash.
3. IF a sign-up email matches the email of an existing Student account, THEN THE CampusKart_System SHALL reject the registration and return an error indicating the email is already registered.
4. IF a sign-up submission omits the name, email, password, hostel, or mobile number, THEN THE CampusKart_System SHALL reject the registration and return a validation error identifying the missing field.
5. IF a sign-up email is not a syntactically valid email address, THEN THE CampusKart_System SHALL reject the registration and return a validation error.
6. WHEN a Student account is created, THE CampusKart_System SHALL set the account verified flag to true.
7. WHERE an avatar image is provided during sign-up, THE CampusKart_System SHALL store the avatar and associate it with the Student account.
8. WHEN a Student account is created, THE CampusKart_System SHALL record the account creation timestamp.
9. WHEN a registration is rejected, THE CampusKart_System SHALL leave the stored Student accounts unchanged.

### Requirement 2: Authentication (Login)

**User Story:** As a registered student, I want to log in with my email and password, so that I can access listing creation and management features.

#### Acceptance Criteria

1. WHEN a Student submits an email and password that match an existing account, THE CampusKart_System SHALL authenticate the Student and issue a Session_Token.
2. IF a login submission provides an email or password that does not match an existing account, THEN THE CampusKart_System SHALL reject the login and return an authentication error.
3. WHILE a Student presents a valid Session_Token that the CampusKart_System issued to that Student at login, THE CampusKart_System SHALL grant that Student access to authenticated write operations.
4. IF a request presents an expired or invalid Session_Token, THEN THE CampusKart_System SHALL reject the request and return an authentication error.

### Requirement 3: Access Control for Reads and Writes

**User Story:** As a student, I want listing creation and removal to require authentication while browsing stays open, so that only accountable students can post while anyone can discover items.

#### Acceptance Criteria

1. THE CampusKart_System SHALL allow unauthenticated Viewers to access the Feed, search, filtering, and Listing_Detail views.
2. IF an unauthenticated Viewer navigates to the listing creation view, THEN THE CampusKart_System SHALL redirect that Viewer to the login view.
3. IF an unauthenticated request submits a new Listing, THEN THE CampusKart_System SHALL reject the submission and return an authentication error.
4. IF an unauthenticated request attempts to remove a Listing, THEN THE CampusKart_System SHALL reject the request and return an authentication error.

### Requirement 4: Create a Listing with Images

**User Story:** As a seller, I want to post an item with photos, a price, and details, so that other students can discover and buy it.

#### Acceptance Criteria

1. WHEN an authenticated Seller submits a Listing with a title, Category, price, negotiable indicator, Condition, description, and a Cover_Image, THE CampusKart_System SHALL create a new Active_Listing.
2. THE CampusKart_System SHALL require exactly one Cover_Image for each Listing.
3. THE CampusKart_System SHALL accept between zero and four Additional_Images per Listing, for a maximum of five images per Listing including the Cover_Image.
4. THE CampusKart_System SHALL restrict the Category of a Listing to one value from the set: Books & Notes, Electronics & Gadgets, Stationery, Room & Furniture, Cycles, Others.
5. THE CampusKart_System SHALL restrict the Condition of a Listing to one value from the set: New, Like New, Good, Fair.
6. IF a Listing submission provides a price below zero, THEN THE CampusKart_System SHALL reject the submission and return a validation error.
7. THE CampusKart_System SHALL accept a Listing price of zero to denote a free item.
8. IF a Listing submission omits the title, Category, price, Condition, or Cover_Image, THEN THE CampusKart_System SHALL reject the submission and return a validation error identifying the missing field.
9. IF an uploaded file for a Cover_Image or Additional_Image is not an image file, THEN THE CampusKart_System SHALL reject the upload and return a validation error.
10. IF an uploaded image exceeds the Maximum_Image_Size, THEN THE CampusKart_System SHALL reject the upload and return a validation error.
11. WHEN a Listing is created, THE CampusKart_System SHALL populate the Listing contact number and hostel from the Seller's profile.
12. WHEN a Listing is created, THE CampusKart_System SHALL set the Listing status to active and record the creation timestamp.

### Requirement 5: Browse the Feed

**User Story:** As a buyer, I want to browse a grid of listings with the newest first, so that I can quickly see what is currently available.

#### Acceptance Criteria

1. WHEN a Viewer opens the Feed, THE CampusKart_System SHALL display Active_Listings in a responsive card grid.
2. THE CampusKart_System SHALL order Feed listings by creation timestamp with the most recently created Listing first.
3. THE CampusKart_System SHALL display on each Feed card the Cover_Image, price, Condition badge, title, Seller's hostel, and elapsed time since the Listing creation timestamp.
4. THE CampusKart_System SHALL exclude Removed_Listings from the Feed.
5. THE CampusKart_System SHALL restrict display of the Seller's mobile number to the Listing_Detail view.

### Requirement 6: Search and Filter Listings

**User Story:** As a buyer, I want to search by keyword and filter by category, condition, and price range, so that I can find specific items quickly.

#### Acceptance Criteria

1. WHEN a Viewer submits a keyword search, THE CampusKart_System SHALL return Active_Listings whose title or description contains the keyword using case-insensitive matching.
2. WHERE a Category filter is applied, THE CampusKart_System SHALL return only Active_Listings assigned to the selected Category.
3. WHERE a Condition filter is applied, THE CampusKart_System SHALL return only Active_Listings assigned to the selected Condition.
4. WHERE a minimum price filter is applied, THE CampusKart_System SHALL return only Active_Listings with a price greater than or equal to the minimum price.
5. WHERE a maximum price filter is applied, THE CampusKart_System SHALL return only Active_Listings with a price less than or equal to the maximum price.
6. WHEN a Viewer applies a keyword search together with one or more filters, THE CampusKart_System SHALL return only Active_Listings that satisfy every applied criterion.
7. WHERE one or more filters are applied without a keyword search, THE CampusKart_System SHALL return Active_Listings that satisfy every applied filter.
8. THE CampusKart_System SHALL order search and filter results by creation timestamp with the most recently created Listing first.

### Requirement 7: View Listing Detail and Contact the Seller

**User Story:** As a buyer, I want to open a listing to see its full details and contact options, so that I can arrange an in-person deal with the seller.

#### Acceptance Criteria

1. WHEN a Viewer selects a Listing card, THE CampusKart_System SHALL display the Listing_Detail view for that Listing.
2. THE CampusKart_System SHALL display an image gallery containing the Cover_Image and any Additional_Images, with selectable thumbnails.
3. THE CampusKart_System SHALL display the Listing title, price, negotiable indicator, Condition, Category, description, and elapsed time since the creation timestamp.
4. THE CampusKart_System SHALL display the Seller's name, hostel, and Verified_Badge on the Listing_Detail view.
5. WHERE the Viewer is not the Owner of the Listing, THE CampusKart_System SHALL display the Seller's mobile number as text, a telephone link (tel:) targeting the Seller's number, and a WhatsApp link (wa.me) targeting the Seller's number.
6. WHEN a Viewer activates the WhatsApp link, THE CampusKart_System SHALL open a direct WhatsApp chat with the Seller containing no pre-filled message.
7. WHERE the Viewer is the Owner of the Listing, THE CampusKart_System SHALL display a Remove listing control in place of the Seller contact section.
8. WHEN a Listing_Detail view is opened, THE CampusKart_System SHALL increment the view count of that Listing.

### Requirement 8: Manage and Remove Own Listings

**User Story:** As a seller, I want to view my own listings and remove ones that are sold or withdrawn, so that I can keep my offerings current.

#### Acceptance Criteria

1. WHEN an authenticated Seller opens the my-listings view, THE CampusKart_System SHALL display the Active_Listings owned by that Seller.
2. WHEN an authenticated Owner removes one of their Listings, THE CampusKart_System SHALL set that Listing status to removed.
3. WHEN a Listing status is set to removed, THE CampusKart_System SHALL retain the Listing record in the database as a soft delete.
4. WHEN a Listing status is set to removed, THE CampusKart_System SHALL exclude that Listing from the Feed and from search and filter results.
5. IF an authenticated Seller attempts to remove a Listing they do not own, THEN THE CampusKart_System SHALL reject the request and return an authorization error.

### Requirement 9: Responsive Web Experience

**User Story:** As a student, I want CampusKart to work well on both desktop and mobile browsers, so that I can use it from any device.

#### Acceptance Criteria

1. THE CampusKart_System SHALL render a responsive layout that adapts to browser viewport widths from 320 pixels through desktop widths.
2. WHILE a Viewer accesses CampusKart from a mobile browser, THE CampusKart_System SHALL present the Feed, Listing_Detail, and forms in a single-column layout that fits the viewport width without horizontal scrolling.

## Known Limitations and Future Considerations

These items are intentionally excluded from the MVP. They are recorded here for transparency
and are not requirements for this release.

- **Open sign-up (known security limitation):** Sign-up is currently open to anyone, and the account verified flag is defaulted to true for the demo. The real trust mechanism is deferred: a future release plans to restrict sign-up to a college-provided allowlist of approved emails and mobile numbers. Until then, the Verified_Badge does not reflect an independently verified identity.
- **No admin or moderation:** Reporting, moderation, seller ratings and reputation, and an admin panel are out of scope for the MVP.
- **No payments or logistics:** Payments, delivery, escrow, and any monetization (advertisements, featured listings, PG/rental listings) are out of scope. Monetization will be documented separately.
- **Discovery enhancements deferred:** Wanted posts, favorites and saved items, notify-me alerts, share-listing, and book search by course code are future roadmap items.
- **Single college only:** Multi-college support and analytics dashboards are out of scope for the MVP.
- **In-app messaging deferred:** Buyer and seller communication happens through the external phone and WhatsApp links; in-app chat is out of scope.
