# Kenya Market Launch Guide (KENYA.md)

Kenya represents one of the most dynamic gaming and mobile-first esports markets in Africa, boasting over 90% smartphone penetration, ubiquitous mobile money adoption, and a booming youth gaming demographic.

---

## 📱 Market Dynamics & Popular Games

Kenyan esports enthusiasts engage across three distinct hardware tiers:

### 1. Mobile Gaming (Dominant Tier)
- **PUBG Mobile & Free Fire**: High competition in survival and battle royale formats.
- **eFootball Mobile (formerly PES Mobile)**: Massive cult following in Nairobi, Mombasa, and Kisumu.
- **Subway Surfers & Temple Run**: Casual high-score speed challenges.
- **Call of Duty: Mobile (CODM)**: Fast-paced competitive multiplayer.

### 2. PlayStation & Console Gaming Cafes ("Movie Shops / Game Centers")
- **FIFA / EA Sports FC 24**: The undisputed king of Kenyan gaming lounges.
- **Mortal Kombat 1 / Tekken 8**: High-stakes local couch competitions.
- **Need for Speed / Gran Turismo**: Low-time speedruns.

### 3. Physical & Table Games
- **Drafts / Checkers (Dama)**: Ubiquitous street strategy game played across estates.
- **Chess & Scrabble**: Popular collegiate and club circuits.

---

## 📲 M-Pesa Daraja Integration Plan

When migrating from `WALLET_MODE=demo` to real-money skill gaming in Kenya:

### Phase 1: Sandbox & Onboarding
- Register Paybill or Till Number via Safaricom Daraja Portal.
- Procure Daraja 2.0 API credentials (`Consumer Key`, `Consumer Secret`, `Passkey`).
- Whitelist API callback URLs on Render.

### Phase 2: Flow Implementation
```
Player Enters Mobile Number (e.g. 254712345678)
                  |
                  v
Backend triggers M-Pesa Express (STK Push)
                  |
                  v
Player inputs PIN on SIM Application Toolkit
                  |
                  v
Safaricom fires Webhook callback to /webhooks/mpesa
                  |
                  v
ACID Transaction records CREDIT in wallet_ledgers
```

### Phase 3: B2C Instant Prize Payouts
- Automate tournament prize distribution directly to winner's M-Pesa wallet via Safaricom Business-to-Customer (B2C) API endpoint.

---

## 🏛️ BCLB Regulatory Positioning Strategy

1. **Explicit Skill Differentiation**: Emphasize deterministic scoring (e.g., goals scored in EA FC or points in Subway Surfers) over chance-based wagering.
2. **Transparent Platform Rake**: The platform takes a fixed administration fee (e.g., 5-10%) for hosting the tournament infrastructure, rather than betting against the player ("no house advantage").
3. **Age Verification**: Integration with Integrated Population Registration System (IPRS) via SMS verification to confirm Kenyan National ID age (18+).

---

## 🏆 Local Tournament Structures

### "Estate Champions" Weekly Cups
- **Format**: 64-player single elimination bracket.
- **Frequency**: Every Saturday afternoon.
- **Prizes**: Funded by local sponsors or entry pool distribution.
- **Verification**: Screen recording upload or stream capture via Twitch/YouTube for console players.
