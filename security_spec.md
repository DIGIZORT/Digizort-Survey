# Security Specification - DIGIZORT Web Platform

This document describes the security model, invariants, test payloads, and defensive strategy for the Firestore databases.

## 1. Data Invariants

- **Opinions Collection**:
  - Anyone can write (create) a response, provided it contains all required fields (`fullName`, `answer`, `opinion`, `createdAt`).
  - No one can read (get or list) or delete responses from the client side unless they are signed in as the authorized administrator (`admin@digizort.com`).
  - Responses are immutable after creation. No user can edit/update any response.
  - The ID of each document must be a valid, alphanumeric identifier to prevent resource exhaustion/poisoning.
  - Timestamps (`createdAt`) must exactly equal the current server time of creation.
  - Full Name must be between 2 and 100 characters.
  - Answer must be strictly `'Yes'` or `'No'`.
  - Opinion must be between 10 and 2000 characters.

## 2. The "Dirty Dozen" Malicious Payloads

We test against these 12 malicious payloads to ensure total rejection by Firestore Security Rules:

1. **Anonymous Read**: Attempt to read the entire `opinions` collection as an unauthenticated external user.
2. **Standard User List Attempt**: Attempt to list opinions as a normal logged-in user who is not `admin@digizort.com`.
3. **Ghost Field Creation**: Attempt to create an opinion containing an unrequested field like `isAdmin: true` or `isVerified: true`.
4. **Name Length Underflow**: Attempt to submit an opinion with a Name smaller than 2 characters (e.g. `fullName: "A"`).
5. **Name Length Overflow**: Attempt to submit an opinion with a Name larger than 100 characters.
6. **Invalid Option Type**: Attempt to insert a values other than `"Yes"` or `"No"` for the `answer` field (e.g., `answer: "Maybe"`).
7. **Opinion Underflow / Spam**: Create an opinion with `opinion` less than 10 characters (e.g. `opinion: "great"`).
8. **Opinion Memory Bomb**: Create an opinion with an extremely large `opinion` payload (e.g. 5MB of junk characters).
9. **Fake Client Timestamp**: Submit an opinion with a manually provided `createdAt` timestamp that does NOT match the Firestore server time.
10. **Privilege Escalation / Modify Response**: Attempt to update an existing opinion and modify its fields.
11. **Unauthorized Delete**: Attempt to delete an opinion from an unauthenticated user or verified user who is not `admin@digizort.com`.
12. **Poison Document ID**: Attempt to write a document with a non-alphanumeric ID (like a very long string containing SQL-like or script injection vectors).

## 3. Database Rules Configuration

The `firestore.rules` will explicitly enforce these requirements:
- Read/Delete: Only allowed if `request.auth != null && request.auth.token.email_verified == true && request.auth.token.email == 'admin@digizort.com'` (Admin Email verified).
- Update: Locked entirely (no updates allowed).
- Create: Checked against `isValidOpinion` helper wrapping length limits, schema verification, and `createdAt == request.time`.
