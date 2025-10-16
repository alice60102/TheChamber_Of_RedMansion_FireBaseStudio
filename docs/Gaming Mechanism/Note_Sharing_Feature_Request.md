# Note Sharing Feature Request

**Feature ID**: GAME-001-DEFERRED-01
**Feature Name**: 筆記分享功能（Note Sharing with XP Reward）
**Status**: 📋 DEFERRED TO FUTURE WORK
**Priority**: Medium (P2)
**Estimated Effort**: 2-3 days
**Target Release**: GAME-005 (Study Group System) or later

---

## 功能概述 (Feature Overview)

允許用戶將個人閱讀筆記分享至社群，並獲得 2 XP 獎勵。此功能旨在促進知識分享和社群互動。

**English**: Allow users to share their reading notes to the community and receive 2 XP as a reward. This feature aims to promote knowledge sharing and community interaction.

---

## 延後原因 (Reason for Deferral)

1. **社群功能設計未完成**: 筆記分享需要明確的社群展示位置和 UI/UX 設計
2. **權限控制待定義**: 需要決定誰可以查看分享的筆記（公開/好友/小組）
3. **內容審核機制**: 分享的筆記可能需要經過內容過濾（spam prevention）
4. **依賴 GAME-005**: 學習社群系統（紅學社）提供更完整的分享情境

**English**:
1. Community feature design incomplete - needs UI/UX for note display
2. Permission control undefined - who can view shared notes?
3. Content moderation - shared notes may need filtering
4. Depends on GAME-005 - Study Group System provides better sharing context

---

## 技術規格 (Technical Specifications)

### XP 獎勵定義 (XP Reward Definition)

**已定義於**: `src/lib/user-level-service.ts` (Line 94)

```typescript
export const XP_REWARDS = {
  // ...
  NOTE_CREATED: 3,
  NOTE_QUALITY_BONUS: 5,       // For well-written notes
  NOTE_SHARED: 2,              // ← 已定義但未實現 (Defined but not implemented)
  ANNOTATION_PUBLISHED: 10,
  // ...
} as const;
```

### 資料庫結構 (Database Schema)

**現有筆記結構** (`src/lib/notes-service.ts`):
```typescript
export interface Note {
  id?: string;              // Firestore document ID
  userId: string;           // User's unique ID
  chapterId: number;        // Chapter number
  selectedText: string;     // The text user selected
  note: string;             // The user's note content
  createdAt: Date;          // Timestamp of creation
}
```

**需新增欄位**:
```typescript
export interface SharedNote extends Note {
  isShared: boolean;        // Whether note is shared to community
  sharedAt?: Date;          // When note was shared
  visibility: 'public' | 'friends' | 'group';  // Who can see
  sharedToGroupId?: string; // If shared to specific group
  likes: number;            // Community engagement
  comments: Comment[];      // Community feedback
}
```

---

## 功能需求 (Feature Requirements)

### 基本功能 (Basic Features)

1. **分享按鈕**:
   - 在筆記卡片添加「分享至社群」按鈕
   - 點擊後顯示分享確認對話框
   - 選擇分享範圍（公開/好友/小組）

2. **XP 獎勵**:
   - 首次分享該筆記時獎勵 2 XP
   - 防止重複分享同一筆記獲得 XP（Source ID 去重）
   - Toast 通知：「+2 XP 感謝分享學習心得！」

3. **社群展示**:
   - 在社群頁面顯示分享的筆記
   - 包含筆記內容、原文引用、作者資訊
   - 支援按讚和評論

4. **隱私控制**:
   - 用戶可選擇筆記是否公開
   - 可隨時取消分享（不扣除已獲得的 XP）

### 進階功能 (Advanced Features)

1. **內容過濾**: 整合現有 `content-filter-service.ts` 審核分享內容
2. **質量獎勵**: 分享的優質筆記（被點讚多）可獲額外 XP
3. **小組分享**: 與 GAME-005 學習小組整合，支援小組內分享
4. **筆記收藏**: 其他用戶可收藏優質分享筆記

---

## 實現步驟 (Implementation Steps)

### Phase 1: 基礎功能實現 (1 day)

1. **擴展 notes-service.ts**:
   ```typescript
   export async function shareNote(noteId: string, visibility: string): Promise<string> {
     // Update note with isShared: true
     // Create shared note document in community collection
     // Return shared note ID
   }

   export async function unshareNote(noteId: string): Promise<void> {
     // Update note with isShared: false
     // Remove from community collection
   }
   ```

2. **添加分享按鈕至 UI**:
   - 修改 `src/app/(main)/read-book/page.tsx` 筆記卡片
   - 添加分享圖標和確認對話框

3. **整合 XP 獎勵**:
   ```typescript
   // After successful share
   await userLevelService.awardXP(
     user.uid,
     XP_REWARDS.NOTE_SHARED,  // 2 XP
     'Shared reading note to community',
     'notes',
     `note-share-${noteId}`  // Source ID for deduplication
   );

   toast({
     title: "+2 XP",
     description: "感謝分享學習心得！",
     duration: 2000,
   });
   ```

### Phase 2: 社群展示整合 (1 day)

4. **擴展社群頁面**:
   - 添加「筆記分享」標籤/分類
   - 顯示分享筆記的特殊 UI（包含原文引用）

5. **實現按讚和評論功能** (使用現有 community-service)

### Phase 3: 測試與優化 (0.5-1 day)

6. **編寫單元測試**: 測試 shareNote/unshareNote 函數
7. **整合測試**: 測試完整的分享流程和 XP 獎勵
8. **內容過濾測試**: 確保不適當內容無法分享

---

## UI/UX 設計建議 (UI/UX Recommendations)

### 分享按鈕位置

**選項 1**: 筆記卡片右上角（建議）
```
┌─────────────────────────────┐
│ 我的筆記 #1     [編輯] [分享]│
│                              │
│ 這是我的讀書心得...          │
│                              │
│ 原文引用：「...」            │
└─────────────────────────────┘
```

**選項 2**: 筆記卡片底部操作列
```
┌─────────────────────────────┐
│ 我的筆記 #1                  │
│ 這是我的讀書心得...          │
│ 原文引用：「...」            │
├─────────────────────────────┤
│ [編輯] [刪除] [分享至社群]  │
└─────────────────────────────┘
```

### 分享確認對話框

```
┌──────────────────────────────┐
│  分享筆記至社群              │
├──────────────────────────────┤
│  分享範圍：                  │
│  ○ 公開（所有人可見）        │
│  ○ 好友可見                  │
│  ○ 小組內分享                │
│                              │
│  [取消]  [確認分享 +2 XP]    │
└──────────────────────────────┘
```

---

## 測試檢查清單 (Testing Checklist)

- [ ] 分享筆記後獲得 2 XP，Toast 正確顯示
- [ ] 重複分享同一筆記不會重複獲得 XP
- [ ] 社群頁面正確顯示分享的筆記
- [ ] 分享的筆記包含原文引用和章節資訊
- [ ] 取消分享後筆記從社群消失
- [ ] 不適當內容無法通過內容過濾
- [ ] 其他用戶可以看到並評論分享的筆記
- [ ] 隱私設置正確控制筆記可見性

---

## 依賴關係 (Dependencies)

### 必須先完成的功能

1. ✅ 用戶等級系統（GAME-001） - 已完成
2. ✅ 社群基礎功能（community page） - 已完成
3. ✅ 筆記系統（notes-service） - 已完成
4. ✅ XP 獎勵系統 - 已完成

### 建議一起實現的功能

1. ⬜ GAME-005: 學習社群系統（提供小組分享情境）
2. ⬜ 質量評分系統（判斷優質筆記）
3. ⬜ 社群互動統計（分享筆記的參與度數據）

---

## 相關文件 (Related Documents)

- `src/lib/user-level-service.ts` - XP_REWARDS.NOTE_SHARED 定義
- `src/lib/notes-service.ts` - 筆記服務現有功能
- `src/app/(main)/community/page.tsx` - 社群頁面
- `docs/Gaming Mechanism/XP_Integration_Strategy.md` - XP 整合策略
- `docs/Gaming Mechanism/GAME-001_Completion_Summary.md` - GAME-001 完成總結

---

## 估算與排程 (Estimation & Scheduling)

**工作量估算**:
- 後端功能（shareNote, unshareNote）: 4-6 小時
- UI 實現（分享按鈕、對話框）: 4-6 小時
- 社群頁面整合: 3-4 小時
- 測試與除錯: 4-6 小時
- **總計**: 15-22 小時（約 2-3 個工作日）

**建議排程**:
- 在 GAME-005（學習社群系統）開發期間一起實現
- 或在 Phase 1 所有任務完成後作為優化項目

---

## 驗收標準 (Acceptance Criteria)

✅ 此功能完成的標準：

1. 用戶可以在筆記上點擊「分享」按鈕
2. 分享後立即獲得 2 XP 獎勵（Toast 通知正確顯示）
3. 社群頁面正確顯示分享的筆記（包含原文引用）
4. 重複分享同一筆記不會重複獲得 XP（Source ID 去重生效）
5. 其他用戶可以查看、按讚、評論分享的筆記
6. 用戶可以取消分享（筆記從社群消失）
7. 隱私控制正常運作（公開/好友/小組）
8. 不適當內容無法通過分享（內容過濾生效）
9. 單元測試和整合測試 100% 通過
10. 用戶手冊和 API 文件更新完成

---

**Document Status**: ✅ Complete
**Created**: 2025-10-15
**Last Updated**: 2025-10-15
**Owner**: GAME-001 Team
**Related Task**: GAME-001 (Deferred Feature)
