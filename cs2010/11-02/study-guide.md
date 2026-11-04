# Calc 1 · §3.5 — Derivatives of Trigonometric Functions

**One-page study guide.** No calculator, no formula sheet: the two things to have automatic are the **six derivative rules** and the **exact values at the 16 unit-circle angles**.

---

## 1. The six derivative rules

| f(x) | f′(x) |
|---|---|
| sin x | cos x |
| cos x | −sin x |
| tan x | sec²x |
| cot x | −csc²x |
| sec x | sec x tan x |
| csc x | −csc x cot x |

**Negative signs:** cos, cot, csc. **No negative sign:** sec (it's the only one that starts positive besides sin).

Derive the last four with the quotient rule: `tan x = sin x / cos x` gives `(cos²x + sin²x)/cos²x = sec²x`; `sec x = 1/cos x` gives `sin x / cos²x = sec x tan x`.

## 2. The proof to be able to reproduce

Two limits from Chapter 2:

```
lim (h→0) sin h / h = 1        lim (h→0) (cos h − 1) / h = 0
```

Angle-addition identity: `sin(x + h) = sin x cos h + cos x sin h`

```
d/dx sin x = lim [sin(x+h) − sin x] / h
           = lim [sin x cos h + cos x sin h − sin x] / h
           = sin x · lim (cos h − 1)/h + cos x · lim (sin h)/h
           = sin x · 0 + cos x · 1
           = cos x
```

For cos x, use `cos(x + h) = cos x cos h − sin x sin h`; the same two limits leave `−sin x`.

## 3. Exact values

| θ | sin θ | cos θ | tan θ |
|---|---|---|---|
| 0 | 0 | 1 | 0 |
| π/6 | 1/2 | √3/2 | √3/3 |
| π/4 | √2/2 | √2/2 | 1 |
| π/3 | √3/2 | 1/2 | √3 |
| π/2 | 1 | 0 | undefined |
| 2π/3 | √3/2 | −1/2 | −√3 |
| 3π/4 | √2/2 | −√2/2 | −1 |
| 5π/6 | 1/2 | −√3/2 | −√3/3 |
| π | 0 | −1 | 0 |
| 7π/6 | −1/2 | −√3/2 | √3/3 |
| 5π/4 | −√2/2 | −√2/2 | 1 |
| 4π/3 | −√3/2 | −1/2 | √3 |
| 3π/2 | −1 | 0 | undefined |
| 5π/3 | −√3/2 | 1/2 | −√3 |
| 7π/4 | −√2/2 | √2/2 | −1 |
| 11π/6 | −1/2 | √3/2 | −√3/3 |

**How to rebuild the first quadrant:** sin at 0, π/6, π/4, π/3, π/2 is `√0/2, √1/2, √2/2, √3/2, √4/2`. Cos is the same list backwards.

**Signs by quadrant:** I all positive · II sin only · III tan only · IV cos only.
**Tan** is sin ÷ cos; it's undefined where cos = 0 (π/2, 3π/2). **Cot** is undefined where sin = 0 (0, π).

## 4. Higher-order derivatives

Both sin and cos repeat every **four** derivatives.

```
sin x →  cos x →  −sin x →  −cos x →  sin x
cos x → −sin x →  −cos x →   sin x →  cos x
```

To jump: take `n mod 4`. For sin x — `0: sin, 1: cos, 2: −sin, 3: −cos` (cos shifts one step: `0: cos, 1: −sin, 2: −cos, 3: sin`).
Example: `74 mod 4 = 2`, so `d⁷⁴/dx⁷⁴ (sin x) = −sin x`.

## 5. Traps that cost points

- Dropping the minus on **cos**, **cot**, or **csc**.
- Writing `−sec x tan x` (wrong) or forgetting the minus on `csc x cot x`.
- Confusing a **value** with a **derivative**: `sin(π/6) = 1/2`, but `d/dx sin x = cos x`.
- Guessing the higher-order phase instead of reducing mod 4.
- Forgetting `tan(π/2)` and `tan(3π/2)` are **undefined**.
- Sloppy signs in QIII/QIV: reduce to the reference angle, then apply the quadrant sign.

**Fast sanity checks:** the slope of sin at 0 is 1 = cos 0; the slope at π/2 is 0 = cos(π/2); cos starts at 1 with slope 0 = −sin 0.

## 6. Five-minute self-check

1. `d/dx (x² + sec x)` → `2x + sec x tan x`
2. `d/dx (sin x cos x)` → `cos²x − sin²x`
3. `d⁵⁹/dx⁵⁹ (sin x)` → `−cos x` (59 mod 4 = 3)
4. `cos θ = −1/2`, `0 ≤ θ < 2π` → `θ = 2π/3, 4π/3`
5. `tan(5π/6)` → `−√3/3`
6. Reproduce the derivative of sin x from the limit definition, without notes.

---

Drill it: `trig-drill` → **Drill** tab for values and rules, **Unit circle** tab for the reverse direction (value → angle).
