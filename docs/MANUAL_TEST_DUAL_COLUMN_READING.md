# Manual Testing Guide: Dual-Column Horizontal Reading Mode

## Overview
This document provides a comprehensive manual testing procedure for the dual-column horizontal reading feature implemented in the read-book page.

## Test Environment Setup
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3001/read-book`
3. Login if required
4. Ensure you're viewing a chapter with sufficient content

## Test Cases

### 1. Layout Rendering Tests

#### Test 1.1: Single Column Layout
**Steps:**
1. Click the single-column button (AlignLeft icon) in the toolbar
2. Observe the layout

**Expected Result:**
- ✅ Text displays in a single column
- ✅ Text flows vertically (top to bottom)
- ✅ No pagination controls visible
- ✅ Normal scrolling works

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.2: Dual Column Layout Activation
**Steps:**
1. Click the double-column button (AlignCenter icon) in the toolbar
2. Observe the layout changes

**Expected Result:**
- ✅ Text displays in two columns (side by side)
- ✅ Text flows horizontally: LEFT column first, then RIGHT column
- ✅ Pagination controls appear at bottom-left and bottom-right
- ✅ Vertical scrolling is disabled
- ✅ Wider gap between columns (3rem)

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.3: Column Gap and Styling
**Steps:**
1. In dual-column mode, inspect the column gap
2. Check if text is evenly distributed

**Expected Result:**
- ✅ Clear visual separation between columns
- ✅ Text is balanced across columns
- ✅ Column gap is approximately 3rem (48px)

**Status:** [ ] Pass [ ] Fail

---

### 2. Navigation Tests

#### Test 2.1: Mouse Wheel Navigation - Next Page
**Steps:**
1. Activate dual-column mode
2. Scroll the mouse wheel DOWNWARD

**Expected Result:**
- ✅ Page advances to next page
- ✅ Vertical scroll position changes
- ✅ Page indicator updates (if visible)
- ✅ Cannot scroll beyond last page

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.2: Mouse Wheel Navigation - Previous Page
**Steps:**
1. In dual-column mode, ensure you're on page 2 or later
2. Scroll the mouse wheel UPWARD

**Expected Result:**
- ✅ Page goes back to previous page
- ✅ Vertical scroll position changes backward
- ✅ Cannot scroll before first page

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.3: Keyboard Navigation - Right Arrow
**Steps:**
1. In dual-column mode
2. Press the RIGHT ARROW key

**Expected Result:**
- ✅ Page advances to next page
- ✅ Same effect as mouse wheel down
- ✅ Cannot navigate beyond last page

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.4: Keyboard Navigation - Left Arrow
**Steps:**
1. In dual-column mode, on page 2 or later
2. Press the LEFT ARROW key

**Expected Result:**
- ✅ Page goes back to previous page
- ✅ Same effect as mouse wheel up
- ✅ Cannot navigate before first page

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.5: Pagination Button - Next Page
**Steps:**
1. In dual-column mode
2. Click the "下一頁 ›" button (bottom-right)

**Expected Result:**
- ✅ Page advances to next page
- ✅ Button becomes disabled on last page

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.6: Pagination Button - Previous Page
**Steps:**
1. In dual-column mode, on page 2 or later
2. Click the "‹ 上一頁" button (bottom-left)

**Expected Result:**
- ✅ Page goes back to previous page
- ✅ Button becomes disabled on first page

**Status:** [ ] Pass [ ] Fail

---

### 3. Edge Case Tests

#### Test 3.1: First Page Boundary
**Steps:**
1. In dual-column mode, ensure you're on page 1
2. Try to navigate backward (wheel up, left arrow, or prev button)

**Expected Result:**
- ✅ Nothing happens
- ✅ Stay on page 1
- ✅ Previous page button is disabled

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.2: Last Page Boundary
**Steps:**
1. In dual-column mode, navigate to the last page
2. Try to navigate forward (wheel down, right arrow, or next button)

**Expected Result:**
- ✅ Nothing happens
- ✅ Stay on last page
- ✅ Next page button is disabled

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.3: Keyboard Input Protection
**Steps:**
1. In dual-column mode
2. Open the search input (top toolbar)
3. Type in the search box and press arrow keys

**Expected Result:**
- ✅ Arrow keys work normally in the input field
- ✅ Page navigation does NOT trigger while typing
- ✅ Can move cursor with arrow keys

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.4: Note Sheet Input Protection
**Steps:**
1. In dual-column mode
2. Select some text and click "寫筆記"
3. Type in the note textarea and press arrow keys

**Expected Result:**
- ✅ Arrow keys work normally in the textarea
- ✅ Page navigation does NOT trigger while typing
- ✅ Can navigate text with arrow keys

**Status:** [ ] Pass [ ] Fail

---

### 4. Cross-Mode Functionality Tests

#### Test 4.1: Text Selection in Dual-Column Mode
**Steps:**
1. In dual-column mode
2. Try to select text with mouse

**Expected Result:**
- ✅ Text selection works normally
- ✅ Selection toolbar appears
- ✅ Can create notes, highlight, etc.

**Status:** [ ] Pass [ ] Fail

---

#### Test 4.2: AI Sheet in Dual-Column Mode
**Steps:**
1. In dual-column mode
2. Click the AI button (Lightbulb icon)
3. Ask a question

**Expected Result:**
- ✅ AI sheet opens normally
- ✅ Can type and submit questions
- ✅ Navigation shortcuts don't interfere with AI input

**Status:** [ ] Pass [ ] Fail

---

#### Test 4.3: Mode Switching
**Steps:**
1. In dual-column mode (page 3)
2. Switch to single-column mode
3. Switch back to dual-column mode

**Expected Result:**
- ✅ Layout switches correctly
- ✅ Pagination resets to page 1 when switching to dual-column
- ✅ No layout glitches

**Status:** [ ] Pass [ ] Fail

---

### 5. Responsive Design Tests

#### Test 5.1: Mobile/Small Screen Behavior
**Steps:**
1. Resize browser window to mobile size (< 768px)
2. Activate dual-column mode

**Expected Result:**
- ✅ Falls back to single column on small screens
- ✅ `md:columns-2` only applies on medium+ screens
- ✅ Layout remains usable

**Status:** [ ] Pass [ ] Fail

---

### 6. Performance Tests

#### Test 6.1: Smooth Navigation
**Steps:**
1. In dual-column mode
2. Rapidly navigate forward and backward

**Expected Result:**
- ✅ Navigation feels smooth
- ✅ No lag or stuttering
- ✅ No visual glitches

**Status:** [ ] Pass [ ] Fail

---

#### Test 6.2: Long Chapter Handling
**Steps:**
1. View a very long chapter (e.g., chapter 1)
2. Activate dual-column mode
3. Navigate through multiple pages

**Expected Result:**
- ✅ Page calculation is correct
- ✅ Can navigate through all pages
- ✅ No performance degradation

**Status:** [ ] Pass [ ] Fail

---

### 7. Visual Regression Tests

#### Test 7.1: Theme Consistency
**Steps:**
1. In dual-column mode
2. Switch between different themes (white, night, etc.)

**Expected Result:**
- ✅ Column layout works with all themes
- ✅ Text remains readable
- ✅ Pagination controls are visible

**Status:** [ ] Pass [ ] Fail

---

#### Test 7.2: Font Size Changes
**Steps:**
1. In dual-column mode
2. Increase/decrease font size

**Expected Result:**
- ✅ Layout adjusts automatically
- ✅ Page count recalculates correctly
- ✅ Text remains in two-column format

**Status:** [ ] Pass [ ] Fail

---

## Bug Detection Checklist

### Critical Issues to Watch For:
- [ ] Text flows vertically instead of horizontally in dual-column mode
- [ ] Pagination doesn't trigger on wheel/keyboard input
- [ ] Can scroll beyond first/last page
- [ ] Arrow keys trigger navigation while typing in inputs
- [ ] Layout breaks when switching modes
- [ ] Text selection doesn't work in dual-column mode
- [ ] Columns are too narrow or too wide
- [ ] Column gap is missing or too small

### Minor Issues to Watch For:
- [ ] Pagination buttons don't disable at boundaries
- [ ] Page number display is incorrect
- [ ] Smooth scrolling doesn't work
- [ ] Navigation feels laggy
- [ ] Visual glitches during mode switching
- [ ] Themes don't apply correctly to columns

## Test Summary

**Total Tests:** 23
**Passed:** ___
**Failed:** ___
**Blocked:** ___

**Critical Bugs Found:** ___
**Minor Issues Found:** ___

**Overall Status:**
- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️ Minor issues found - Needs attention
- [ ] ❌ Critical bugs found - Needs immediate fix

## Notes & Observations

[Add any additional observations, edge cases discovered, or suggestions for improvement]

---

**Tester:** _______________
**Date:** _______________
**Browser/Device:** _______________
**Build/Commit:** _______________
