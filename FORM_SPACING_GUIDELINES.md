# Form Field Spacing Guidelines for Copilot

## Overview

This document provides guidelines for ensuring consistent spacing between form labels and their corresponding input elements across the entire SpiritHub Café website.

## Problem Statement

Forms with labels directly followed by input/select/textarea elements without proper spacing create poor user experience and inconsistent visual hierarchy.

## Solution Standard

All form fields must follow one of these spacing patterns:

### Pattern 1: Container with `space-y-2` (Recommended)

```tsx
<div className="space-y-2">
  <Label htmlFor="fieldName">Field Label</Label>
  <Input id="fieldName" />
</div>
```

### Pattern 2: Label with `mb-2` (Alternative)

```tsx
<div>
  <Label htmlFor="fieldName" className="mb-2 block">Field Label</Label>
  <Input id="fieldName" />
</div>
```

## Implementation Rules

### 1. **Label-Input Pairs**

✅ **Correct:**

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

❌ **Incorrect:**

```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

### 2. **Label-Select Pairs**

✅ **Correct:**

```tsx
<div className="space-y-2">
  <Label htmlFor="category">Category</Label>
  <Select value={category} onValueChange={setCategory}>
    <SelectTrigger>
      <SelectValue placeholder="Select category" />
    </SelectTrigger>
  </Select>
</div>
```

### 3. **Label-Textarea Pairs**

✅ **Correct:**

```tsx
<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea id="description" rows={3} />
</div>
```

### 4. **Grid Layouts**

When using grid layouts, apply spacing to each grid item:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="firstName">First Name</Label>
    <Input id="firstName" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="lastName">Last Name</Label>
    <Input id="lastName" />
  </div>
</div>
```

## Files Verified and Updated

The following files have been checked and updated to follow these guidelines:

### ✅ **Already Compliant:**

- `src/pages/LoginPage.tsx` - Uses `space-y-2` containers
- `src/pages/RegisterPage.tsx` - Uses `space-y-2` containers  
- `src/pages/ContactPage.tsx` - Uses `space-y-2` containers
- `src/pages/ForgotPasswordPage.tsx` - Uses `space-y-2` containers
- `src/components/admin/CategoryManagement.tsx` - Uses `mb-2 block` on labels
- `src/components/admin/ProductManagement.tsx` - Uses `space-y-2` containers
- `src/components/dashboard/DashboardUsers.tsx` - Uses `space-y-2` containers
- `src/components/dashboard/DashboardProfile.tsx` - Uses `space-y-2` containers
- `src/components/product-reviews.tsx` - Uses `mb-2 block` on labels
- `src/pages/ProductPage.tsx` - Uses `mb-2` on labels
- `src/components/product-quick-view.tsx` - Uses `mb-2` on labels

### ✅ **Updated:**

- `src/pages/CheckoutPage.tsx` - Added `space-y-2` to all form field containers

## Copilot Instructions

When creating or modifying forms, **ALWAYS**:

1. **Check for Label-Input pairs** that are directly adjacent without spacing
2. **Wrap each field in a container** with `className="space-y-2"`
3. **Use consistent patterns** across the entire component
4. **Test visually** to ensure proper spacing is applied

### Search Pattern for Issues

Use this regex to find potential spacing issues:

```regex
<Label.*htmlFor.*>\s*.*\s*<(Input|Select|Textarea)
```

### Quick Fix Commands

- For single fields: Add `className="space-y-2"` to the wrapping div
- For multiple fields: Ensure each field container has `space-y-2`
- For existing `mb-2` labels: Keep them if they work, but prefer `space-y-2` containers

## Quality Assurance

### Visual Test Checklist

- [ ] All labels have visible space below them
- [ ] Form fields don't feel cramped
- [ ] Spacing is consistent across the entire form
- [ ] Mobile responsive spacing works correctly

### Code Review Checklist

- [ ] No direct Label→Input adjacency without spacing
- [ ] Consistent use of `space-y-2` pattern
- [ ] Grid layouts have spacing on individual items
- [ ] No redundant spacing (both `space-y-2` and `mb-2`)

## Examples from Current Codebase

### Checkout Form (Fixed)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="firstName">First Name</Label>
    <Input id="firstName" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="lastName">Last Name</Label>
    <Input id="lastName" />
  </div>
</div>
```

### Product Management (Already Good)

```tsx
<div className="space-y-2">
  <Label htmlFor="name">Product Name (English) *</Label>
  <Input id="name" required />
</div>
```

### Category Management (Alternative Pattern)

```tsx
<div>
  <Label htmlFor="name" className="mb-2 block">Name (English)</Label>
  <Input id="name" />
</div>
```

---

## Final Note

This spacing standard improves user experience, accessibility, and visual consistency across the entire SpiritHub Café web application. Always apply these guidelines when working with forms.
