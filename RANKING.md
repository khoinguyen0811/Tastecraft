# 🛡️ Anti-Cheat & Ranking System (Next.js + Supabase)

## 📌 Overview

Tài liệu này mô tả cách triển khai hệ thống **Rank (XP)** và các cơ chế **chống gian lận (anti-cheat)** cho web cho phép user:

* Đăng công thức
* Comment
* Like
* Tham gia event

---

# 🎯 1. XP System Design

## 📊 XP Rules

| Action        | XP   |
| ------------- | ---- |
| Create Recipe | +20  |
| Comment       | +5   |
| Receive Like  | +2   |
| Join Event    | +30  |
| Win Event     | +100 |

---

## 🗄️ Database Schema (Supabase)

### users

```sql
id (uuid)
email
xp (int, default 0)
rank (text)
created_at
```

---

### user_points (log)

```sql
id (uuid)
user_id (uuid)
action (text)
points (int)
created_at
```

---

# ⚙️ 2. Core XP Flow

```txt
User Action → Validate → Add XP → Log → Anti-Cheat Check → Update Rank
```

---

## 📌 Example (Next.js API Route)

```ts
// /api/xp/add
export async function addXP(userId: string, action: string) {
  const pointsMap = {
    COMMENT: 5,
    POST: 20,
    LIKE: 2,
    EVENT_JOIN: 30,
  };

  const points = pointsMap[action];

  // 1. Add XP
  await supabase
    .from("users")
    .update({ xp: supabase.rpc("increment", { x: points }) })
    .eq("id", userId);

  // 2. Log
  await supabase.from("user_points").insert({
    user_id: userId,
    action,
    points,
  });

  // 3. Update Rank
  await updateRank(userId);
}
```

---

# 🏆 3. Rank System

## 📊 Rank Levels

| Rank     | XP   |
| -------- | ---- |
| Bronze   | 0    |
| Silver   | 100  |
| Gold     | 300  |
| Platinum | 700  |
| Diamond  | 1500 |

---

## 📌 Rank Logic

```ts
function getRank(xp: number) {
  if (xp >= 1500) return "Diamond";
  if (xp >= 700) return "Platinum";
  if (xp >= 300) return "Gold";
  if (xp >= 100) return "Silver";
  return "Bronze";
}
```

---

# 🛡️ 4. Anti-Cheat Strategies

---

## 🚫 4.1 Rate Limiting

### Rule

* Comment: max 10 / hour
* Post: max 3 / day
* Like: max 50 / day

### Implementation (Supabase query)

```sql
SELECT COUNT(*) FROM comments
WHERE user_id = $1
AND created_at > NOW() - INTERVAL '1 hour'
```

👉 Nếu vượt giới hạn → không cộng XP

---

## ⏳ 4.2 Cooldown

### Rule

* Comment: 10s delay
* Post: 60s delay

### Logic

```ts
if (now - lastActionTime < cooldown) {
  throw new Error("Too fast");
}
```

---

## 🔁 4.3 Duplicate Action Prevention

### Like

```sql
UNIQUE(user_id, post_id)
```

👉 1 user chỉ like 1 lần

---

### Comment spam detection

```ts
if (isDuplicateContent(userId, content)) {
  return; // no XP
}
```

---

## 👤 4.4 Multi-Account Detection

### Check IP

```sql
SELECT COUNT(*) FROM users WHERE ip = $1
```

### Rules

* > 3 accounts/IP → flag
* New account:

  * ❌ cannot join event immediately
  * ❌ limited XP gain

---

## 📧 4.5 Email Verification

* Must verify email before:

  * comment
  * earn XP
  * join event

---

## 📉 4.6 Diminishing Returns

### Example

| Action Count | XP |
| ------------ | -- |
| 1            | 5  |
| 2            | 3  |
| 3            | 1  |
| >3           | 0  |

```ts
function calculateXP(baseXP, count) {
  if (count === 1) return baseXP;
  if (count === 2) return baseXP * 0.6;
  if (count === 3) return baseXP * 0.2;
  return 0;
}
```

---

## 🧾 4.7 Activity Logging

All XP must be logged:

```sql
user_points
```

👉 Use for:

* Debug
* Detect abuse
* Rollback XP

---

## 🚨 4.8 Abuse Detection

### Rule

```ts
if (xpEarnedIn1Hour > 200) {
  flagUser(userId);
}
```

---

## 🕵️ 4.9 Shadow Ban

### Behavior

* User vẫn thấy XP tăng
* Nhưng:

  * ❌ không vào leaderboard
  * ❌ không ảnh hưởng hệ thống

---

## 🤖 4.10 CAPTCHA

Trigger when:

* Spam comment
* Too many actions

---

# ⚠️ 5. Security Rules (VERY IMPORTANT)

## ❌ NEVER trust frontend

Bad:

```ts
POST /api/xp { points: 100 }
```

Good:

```ts
POST /api/comment
→ backend tự cộng XP
```

---

## ✅ Always validate server-side

---

# 🚀 6. Leaderboard

```sql
SELECT * FROM users
ORDER BY xp DESC
LIMIT 10
```

---

# 🧠 7. Future Improvements

* Daily login bonus
* Rank decay (inactive → giảm rank)
* Event-based XP multiplier
* AI spam detection

---

# ✅ Conclusion

To build a secure ranking system:

* Validate all actions server-side
* Limit user behavior (rate limit + cooldown)
* Log everything
* Detect abnormal patterns
* Prevent duplicate actions

---

# 🔥 Recommended Architecture

```txt
Client → API (Next.js) → Validate → Supabase → Log → Anti-Cheat → Rank Update
```

---
