# Bitez Campus Mess & Food Delivery — Complete Project Workflows

This document maps out every end-to-end workflow across the **Bitez** platform, covering the **Student Portal**, **Admin Control Center**, **Delivery Rider App**, **Backend APIs**, and **Automated Policies**.

---

## 1. System Architecture Overview

```mermaid
flowchart TD
    subgraph Client["Frontend (React + TypeScript + Tailwind CSS)"]
        SP["Student Portal (Home, Menu, Dashboard, Cart, Subscriptions)"]
        AP["Admin Control Center (/admin, /admin/instant, /admin/tiffin-plans)"]
        RA["Delivery Rider App (/rider)"]
    end

    API["API Service Layer (src/services/api.ts)"]

    subgraph Backend["Backend (Node.js + Express - server.js)"]
        Auth["Auth & Wallet (/api/auth)"]
        Subs["Subscriptions & Skips (/api/subscriptions)"]
        Orders["Orders & Extra Policy (/api/orders)"]
        Menu["Menu, Dishes & Extras (/api/menu, /api/dishes, /api/extras)"]
        Admin["Admin Dispatch & Settings (/api/admin)"]
        Rider["Rider Tasks & Payouts (/api/rider)"]
        Complaints["Support & Complaints (/api/complaints)"]
    end

    DB[("Hybrid Adapter (adapter.js)\nMongoDB or JSON Store (backend/data/db.json)")]

    SP --> API
    AP --> API
    RA --> API

    API --> Auth
    API --> Subs
    API --> Orders
    API --> Menu
    API --> Admin
    API --> Rider
    API --> Complaints

    Auth --> DB
    Subs --> DB
    Orders --> DB
    Menu --> DB
    Admin --> DB
    Rider --> DB
    Complaints --> DB
```

### Core Portals & Routes
| Portal | Key Routes | Primary Components / Pages |
| :--- | :--- | :--- |
| **Customer / Student** | `/`, `/menu`, `/cart`, `/dashboard`, `/subscriptions`, `/timetable`, `/orders`, `/track/:orderId`, `/support` | `Home.tsx`, `Menu.tsx`, `Cart.tsx`, `Dashboard.tsx`, `Subscriptions.tsx`, `WeeklyTimetable.tsx`, `OrderTracking.tsx`, `MealLoadingScreen.tsx` |
| **Admin Mess & Kitchen** | `/admin`, `/admin/mess`, `/admin/instant`, `/admin/tiffin-plans` | `AdminPanel.tsx`, `InstantAdminPanel.tsx`, `AdminTiffinPlans.tsx`, `RiderEarningsReport.tsx`, `DeliveryRidersSuite.tsx` |
| **Delivery Rider** | `/rider`, `/rider-app` | `RiderApp.tsx`, `riderSound.ts` |

---

## 2. Subscription, Meal Balance & Skip Rollover Workflow

```mermaid
flowchart TD
    Start(["Student Selects Mess Plan"]) --> PlanType{"Plan Type"}
    PlanType -->|"1 Meal/Day"| P1["30 Meals / Month"]
    PlanType -->|"2 Meals/Day"| P2["Lunch & Dinner (60 Meals / Month)"]
    PlanType -->|"3 Meals/Day"| P3["Breakfast + Lunch + Dinner (90 Meals / Month)"]

    P1 --> CreateSub["Create Active Subscription\nremainingMeals = totalMeals"]
    P2 --> CreateSub
    P3 --> CreateSub

    CreateSub --> DailyCycle{"Daily Meal Event"}

    DailyCycle -->|"Tiffin Delivered (OTP Verified)"| Deduct["Deduct -1 Meal Balance\nremainingMeals = remainingMeals - 1\nmealDeducted = true"]
    DailyCycle -->|"Student Requests Skip (Before Cutoff)"| PendingSkip["Pending Skip Request Created\nKitchen Tagged: SKIP PENDING"]

    PendingSkip --> AdminReview{"Admin Action"}
    AdminReview -->|"Approve"| ApproveSkip["Add +1 Rollover Meal\nremainingMeals + 1\nskippedMeals + 1\nKitchen Tagged: SKIPPED"]
    AdminReview -->|"Reject"| RejectSkip["Meal Remains Scheduled"]

    DailyCycle -->|"Student / Admin Pauses Plan"| Pause["Status = paused\nRemaining Meals Preserved\nDispatch Tagged: PAUSED"]
```

### Key Implementation Rules:
- **Automatic Meal Deduction**: When either the **Rider** verifies customer OTP (`PUT /api/rider/tasks/:id/status`) or the **Admin** updates dispatch status to `delivered` (`PUT /api/admin/dispatch/:id/status`), `remainingMeals` decrements by `1` (guarded by `mealDeducted: true` to prevent double deduction). If status is reverted from `delivered`, the meal is restored (`+1`).
- **Skip & Rollover Policy**: Skipping a meal does **not** credit cash to the wallet; instead, Admin approval rolls over `+1` saved meal to the student's `remainingMeals` balance (`admin.js` & `SkipMealModal.tsx`).
- **Real-Time Sync**: Displayed across `Dashboard.tsx` (Meal Balance Card), `Subscriptions.tsx`, and `AdminPanel.tsx`.

---

## 3. Daily 3-Slot Mess Operations & Dispatch Workflow

```mermaid
stateDiagram-v2
    [*] --> Preparing: Daily Roster Synced (Breakfast / Lunch / Dinner)
    Preparing --> Packed: Kitchen Packs Tiffin + Attached Extras
    Packed --> OutForDelivery: Rider Assigned & Dispatched
    OutForDelivery --> Delivered: Customer 4-Digit OTP Verified
    Delivered --> [*]

    note right of OutForDelivery
        Extra Food Ordering Window
        CLOSES strictly here
    end note
```

### Dynamic Meal Timings Management
- Admins can configure **Breakfast**, **Lunch**, and **Dinner** service hours, delivery windows, skip cutoffs, and enable/disable toggles directly from `AdminPanel.tsx` (backed by `mealTimingsHelper.js`).
- These live timings sync automatically across:
  - `Dashboard.tsx` (Current Shift Card & Countdown in IST)
  - `WeeklyTimetable.tsx`
  - `SkipMealModal.tsx` (Enforces slot-specific skip deadlines)
  - `OrderExtraModal.tsx` & `Cart.tsx`

---

## 4. "Extra Food With Meal Only" Policy Workflow

Extra items (Butter Rotis, Paneer Sides, Curd, Gulab Jamun, Lassi) are delivered for **₹0 delivery fee** packed directly inside the subscriber's daily tiffin box.

```mermaid
flowchart TD
    Req(["Student Requests Extra Food"]) --> CheckSub{"Active Subscriber?"}
    CheckSub -->|"No"| RejectNonSub["403 Rejected: Active Subscribers Only"]
    CheckSub -->|"Yes"| CheckSlot["Check Slot in Active Plan\n(e.g., 2-Meal Plan excludes Breakfast)"]

    CheckSlot -->|"Slot Not in Plan"| RejectPlan["400 Rejected: PLAN_SLOT_INELIGIBLE"]
    CheckSlot -->|"Slot Included"| CheckAdmin{"Admin Enabled Slot\n& Kitchen Unlocked?"}

    CheckAdmin -->|"Paused / Locked"| RejectLocked["400 Rejected: MEAL_ORDER_LOCKED"]
    CheckAdmin -->|"Open"| CheckStatus{"Meal Dispatch Status\n(No Clock Cutoff!)"}

    CheckStatus -->|"Out for Delivery / Dispatched"| RejectOut["400 Rejected: MEAL_OUT_FOR_DELIVERY"]
    CheckStatus -->|"Delivered"| RejectDel["400 Rejected: MEAL_ALREADY_DELIVERED"]
    CheckStatus -->|"Preparing / Packed"| AcceptOrder["Order Accepted (₹0 Delivery Fee)\nAttached to DispatchRoster.attachedExtras"]
```

### Crucial Policy Rule:
- **Zero Clock-Time Closing**: Extra food ordering NEVER locks based on wall-clock time (`totalMins >= deliveryEndMins` was removed).
- It locks **strictly** when:
  1. The meal status transitions to **Out for Delivery** (`dispatched`, `out_for_delivery`, `on-the-way`, `picked-up`, `reached-gate`) or **Delivered**.
  2. The requested meal slot is not part of the student's active subscription plan.
  3. The admin pauses the slot or the kitchen locks the meal box.

---

## 5. Instant Food Ordering, Cart & Wallet Workflow

```mermaid
sequenceDiagram
    actor Student
    participant UI as Menu / Cart (React)
    participant API as Orders & Auth Routes
    participant DB as Database / Store

    Student->>UI: Browse dishes (/menu) & Add to Cart
    UI->>UI: Select Instant Delivery or Pack With Meal
    Student->>UI: Choose Payment (Campus Wallet / UPI / COD)
    UI->>API: POST /api/orders

    alt Paid via Campus Wallet
        API->>DB: Verify walletBalance >= totalAmount
        API->>DB: Deduct walletBalance & push Transaction Log
    end

    API->>DB: Create Order Record (ORD-XXXX)
    API-->>UI: Return Order Confirmation
    Student->>UI: Live Order Tracking (/track/:orderId)
```

---

## 6. Rider App, OTP Delivery & Earnings Workflow

```mermaid
flowchart LR
    Admin["Admin Dispatch & Instant Panel"] -->|"Assigns Mess Boxes & Instant Orders"| RiderApp["Rider App (/rider)"]
    RiderApp -->|"Sound Alert (riderSound.ts)"| Pickup["1. Picked Up from Kitchen"]
    Pickup --> OnWay["2. On The Way to Hostel"]
    OnWay --> Gate["3. Reached Hostel Gate"]
    Gate --> OTP{"4. Enter Customer\n4-Digit OTP"}
    OTP -->|"Valid OTP"| Done["5. Status = Delivered\n• Attached Extras Marked Delivered\n• Meal Balance (-1) Deducted\n• COD Collected Logged\n• Per-Box/Order Earning Credited"]
```

### Rider Earnings & Payouts (`riderEarningsHelper.js` & `RiderEarningsReport.tsx`)
- **Configurable Rates**: Admin sets custom Mess Per-Box delivery rates and Instant Order delivery rates.
- **Ledger Tracking**: Tracks deliveries per day, total earnings, customer tips, COD cash collected, and payout settlement requests (`POST /api/rider/payout-request`).

---

## 7. Branded Lunch Box Loading Experience

- `MealLoadingScreen.tsx` provides a unified, animated loading UI featuring a steaming **Hot Lunch Box (`♨️`)**, floating hostel delivery pills, and an animated **Delivery Scooter (`🛵`)** riding along the progress track.
- Active across `Dashboard.tsx`, `Subscriptions.tsx`, `WeeklyTimetable.tsx`, `OrderTracking.tsx`, and `Menu.tsx`.

