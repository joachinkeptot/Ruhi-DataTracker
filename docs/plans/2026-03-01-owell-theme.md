# Owell Dark Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Retheme `src/styles.css` from warm amber/brown to Owell's cold near-black + indigo palette.

**Architecture:** Single-file CSS change. Step 1 replaces the `:root` variables and body/brand hardcoded values with Edit calls. Steps 2–4 use `sed -i` to bulk-replace the ~50+ scattered rgba/hex warm color values with cool equivalents. No layout changes.

**Tech Stack:** Plain CSS, sed (macOS — uses `sed -i ''`), Vite dev server for visual verification.

---

### Task 1: Replace `:root` variables and targeted hardcoded values

**Files:**
- Modify: `src/styles.css:1-14` (root block)
- Modify: `src/styles.css:24` (body background)
- Modify: `src/styles.css:40` (topbar background)
- Modify: `src/styles.css:55,61` (brand logo)

**Step 1: Replace the `:root` block**

Find this exact block at the top of `src/styles.css`:

```css
:root {
  color-scheme: dark;
  --bg: #1a120e;
  --panel: #2a1f1a;
  --panel-2: #3a2b23;
  --border: #5a4539;
  --accent: #d4a574;
  --accent-2: #a0522d;
  --text: #f5e6d3;
  --muted: #b89f88;
  --success: #6b7f5f;
  --warning: #d2691e;
  --danger: #8b3a3a;
}
```

Replace with:

```css
:root {
  color-scheme: dark;
  --bg: #08080f;
  --panel: #0f0f1a;
  --panel-2: #161626;
  --border: #1e1e35;
  --accent: #6366f1;
  --accent-2: #818cf8;
  --text: #e2e8f0;
  --muted: #64748b;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```

**Step 2: Replace body background**

Find:
```css
  background: radial-gradient(circle at top left, #2a1f1a, #1a120e 60%);
```

Replace with:
```css
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 50%),
    radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.06), transparent 50%),
    #08080f;
```

**Step 3: Replace topbar background**

Find:
```css
  background: rgba(26, 18, 14, 0.9);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
```

Replace with:
```css
  background: rgba(8, 8, 15, 0.9);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
```

**Step 4: Replace brand logo gradient and text color**

Find:
```css
  background: linear-gradient(135deg, #d4a574, #a0522d);
```
Replace with:
```css
  background: linear-gradient(135deg, #6366f1, #3b82f6);
```

Find:
```css
  color: #1a120e;
```
(this line is inside `.brand__logo`) Replace with:
```css
  color: #ffffff;
```

**Step 5: Verify TypeScript/Vite still compiles**

Run: `npx tsc --noEmit`
Expected: no errors (CSS change can't break TS)

**Step 6: Commit**

```bash
git add src/styles.css
git commit -m "feat: owell theme - update root variables and brand colors"
```

---

### Task 2: Bulk-replace warm rgba amber values

The amber color `rgba(212, 165, 116, ...)` appears ~30 times scattered through the file. Replace all with indigo `rgba(99, 102, 241, ...)`.

**Files:**
- Modify: `src/styles.css`

**Step 1: Run sed replacement**

```bash
sed -i '' 's/rgba(212, 165, 116,/rgba(99, 102, 241,/g' src/styles.css
```

**Step 2: Verify the replacement**

```bash
grep -n "rgba(212, 165, 116" src/styles.css
```
Expected: no output (all instances replaced)

**Step 3: Check indigo occurrences landed**

```bash
grep -c "rgba(99, 102, 241" src/styles.css
```
Expected: a number > 0 (should be ~30)

**Step 4: Commit**

```bash
git add src/styles.css
git commit -m "feat: owell theme - replace amber rgba with indigo"
```

---

### Task 3: Bulk-replace remaining warm rgba values

**Files:**
- Modify: `src/styles.css`

**Step 1: Replace warm rust rgba**

```bash
sed -i '' 's/rgba(160, 82, 45,/rgba(99, 102, 241,/g' src/styles.css
```

**Step 2: Replace warm dark bg rgba**

```bash
sed -i '' 's/rgba(26, 18, 14,/rgba(8, 8, 15,/g' src/styles.css
```

**Step 3: Replace warm panel rgba**

```bash
sed -i '' 's/rgba(42, 31, 26,/rgba(15, 15, 26,/g' src/styles.css
```

**Step 4: Replace warm hover tint rgba**

```bash
sed -i '' 's/rgba(58, 43, 35,/rgba(30, 30, 53,/g' src/styles.css
```

**Step 5: Replace warm border tint rgba**

```bash
sed -i '' 's/rgba(90, 69, 57,/rgba(30, 30, 53,/g' src/styles.css
```

**Step 6: Replace old success green rgba**

```bash
sed -i '' 's/rgba(107, 127, 95,/rgba(34, 197, 94,/g' src/styles.css
```

**Step 7: Replace old danger red rgba**

```bash
sed -i '' 's/rgba(139, 58, 58,/rgba(239, 68, 68,/g' src/styles.css
```

**Step 8: Replace old warning rgba**

```bash
sed -i '' 's/rgba(210, 105, 30,/rgba(245, 158, 11,/g' src/styles.css
```

**Step 9: Verify no warm rgba remain**

```bash
grep -n "rgba(26, 18\|rgba(42, 31\|rgba(58, 43\|rgba(90, 69\|rgba(107, 127\|rgba(139, 58\|rgba(160, 82\|rgba(210, 105\|rgba(212, 165" src/styles.css
```
Expected: no output

**Step 10: Commit**

```bash
git add src/styles.css
git commit -m "feat: owell theme - replace all warm rgba values"
```

---

### Task 4: Bulk-replace warm hex values

**Files:**
- Modify: `src/styles.css`

**Step 1: Replace amber hex**

```bash
sed -i '' 's/#d4a574/#6366f1/g' src/styles.css
```

**Step 2: Replace rust hex**

```bash
sed -i '' 's/#a0522d/#818cf8/g' src/styles.css
```

**Step 3: Replace warm bg hex**

```bash
sed -i '' 's/#1a120e/#08080f/g' src/styles.css
```

**Step 4: Replace warm panel hex**

```bash
sed -i '' 's/#2a1f1a/#0f0f1a/g' src/styles.css
```

**Step 5: Replace warm panel-2 hex**

```bash
sed -i '' 's/#3a2b23/#161626/g' src/styles.css
```

**Step 6: Replace warm border hex**

```bash
sed -i '' 's/#5a4539/#1e1e35/g' src/styles.css
```

**Step 7: Replace old success green hex**

```bash
sed -i '' 's/#6b7f5f/#22c55e/g' src/styles.css
```

**Step 8: Replace old danger hex**

```bash
sed -i '' 's/#8b3a3a/#ef4444/g' src/styles.css
```

**Step 9: Replace lighter amber variant used in gradients**

```bash
sed -i '' 's/#c9a574/#818cf8/g' src/styles.css
```

**Step 10: Replace dark text color used on bright buttons (`#070b14`)**

This dark near-black was used as text on amber buttons. With indigo buttons, white text reads better:

```bash
sed -i '' 's/#070b14/#ffffff/g' src/styles.css
```

**Step 11: Verify no warm hex remain**

```bash
grep -n "#1a120e\|#2a1f1a\|#3a2b23\|#5a4539\|#d4a574\|#a0522d\|#c9a574\|#6b7f5f\|#8b3a3a\|#b89f88\|#f5e6d3\|#d2691e\|#070b14" src/styles.css
```
Expected: no output

**Step 12: Commit**

```bash
git add src/styles.css
git commit -m "feat: owell theme - replace all warm hex values"
```

---

### Task 5: Visual verification

**Step 1: Start the dev server**

```bash
npm run dev
```

**Step 2: Check each view**

Open the app and verify each view looks correct:

- [ ] Background is near-black (not warm brown)
- [ ] Nav bar has dark glass look
- [ ] Brand logo is indigo/blue gradient
- [ ] Buttons are indigo
- [ ] Active tab is still blue (was already blue, unchanged)
- [ ] People table rows have subtle indigo hover
- [ ] Panel borders are dark cool grey
- [ ] No amber/rust/brown colors visible anywhere
- [ ] Success indicators are vivid green
- [ ] Error/danger indicators are vivid red
- [ ] Network canvas nodes have indigo glow on selection

**Step 3: Fix anything that looks wrong**

If any component looks off (e.g. unreadable text, wrong contrast), do a targeted Edit on that specific rule.

**Step 4: Final commit**

```bash
git add src/styles.css
git commit -m "feat: owell theme - complete cold black/indigo retheme"
```
