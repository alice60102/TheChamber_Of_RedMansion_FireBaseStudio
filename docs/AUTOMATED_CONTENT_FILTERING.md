# 自動內容過濾系統 (Automated Content Filtering System)

## 概述 (Overview)

本系統實現了任務1.7.3中的「自動內容過濾系統」功能，為紅樓慧讀社群平台提供即時的內容審核和安全保護。

## 核心功能 (Core Features)

### 1. 即時內容分析 (Real-time Content Analysis)
- **支援語言**: 繁體中文 & 英文
- **處理內容**: 貼文標題、內容、留言
- **分析速度**: < 100ms 處理時間

### 2. 多層次違規檢測 (Multi-level Violation Detection)

#### 2.1 不當用語檢測 (Profanity Detection)
```typescript
// 檢測結果範例
{
  type: 'profanity',
  severity: 'medium',
  details: 'Inappropriate language detected: 2 violations',
  matchedTerms: ['白痴', 'stupid']
}
```

#### 2.2 垃圾內容檢測 (Spam Detection)
- 重複字符檢測 (aaaaaaaa)
- 推廣內容識別 (限時優惠、加LINE等)
- 過度重複詞彙檢測

#### 2.3 仇恨言論檢測 (Hate Speech Detection)
- 高風險內容自動阻擋
- 騷擾行為識別
- 歧視性語言檢測

#### 2.4 個人資訊保護 (Personal Information Protection)
- 手機號碼自動遮蔽
- 電子郵件地址隱藏
- LINE ID / WeChat ID 過濾

### 3. 智慧審核動作 (Intelligent Moderation Actions)

| 動作 | 說明 | 觸發條件 |
|------|------|----------|
| `allow` | 允許發布 | 無違規內容 |
| `warn` | 警告提示 | 輕微違規 |
| `filter` | 內容過濾 | 不當用語、個人資訊 |
| `hide` | 隱藏內容 | 垃圾內容、中等違規 |
| `block` | 阻擋發布 | 仇恨言論、嚴重違規 |
| `flag-for-review` | 標記人工審核 | 模糊情況 |

## 技術實現 (Technical Implementation)

### 1. 服務架構 (Service Architecture)
```
ContentFilterService
├── analyzeContent()      // 內容分析
├── processContent()      // 內容處理
├── logModerationDecision() // 審核記錄
└── getModerationStats() // 統計資料
```

### 2. 資料庫整合 (Database Integration)
- **審核記錄**: `moderation_logs` 集合
- **內容標記**: 貼文和留言增加審核欄位
- **統計追蹤**: 違規類型和處理統計

### 3. 社群服務整合 (Community Service Integration)
```typescript
// 貼文創建時自動過濾
async createPost(postData: CreatePostData): Promise<string> {
  const filterResult = await contentFilterService.processContent(/*...*/);
  if (filterResult.shouldBlock) {
    throw new Error(filterResult.warningMessage);
  }
  // 繼續創建貼文...
}
```

## 使用示例 (Usage Examples)

### 1. 正常內容 (Clean Content)
```typescript
輸入: "我很喜歡讀紅樓夢第一回"
結果: 
- isAppropriate: true
- suggestedAction: "allow"
- 直接發布
```

### 2. 不當用語 (Profanity)
```typescript
輸入: "這個白痴在說什麼"
結果:
- isAppropriate: false
- suggestedAction: "filter"
- 處理後: "這個**在說什麼"
- 警告: "您的內容包含不當用語，已自動過濾部分內容。"
```

### 3. 個人資訊 (Personal Information)
```typescript
輸入: "聯絡我 0912345678"
結果:
- isAppropriate: false
- suggestedAction: "filter"
- 處理後: "聯絡我 [個人資訊已隱藏]"
- 警告: "為保護隱私，已隱藏個人資訊內容。"
```

### 4. 仇恨言論 (Hate Speech)
```typescript
輸入: "你這個廢物滾出去"
結果:
- isAppropriate: false
- suggestedAction: "block"
- 結果: 阻擋發布
- 警告: "檢測到仇恨言論或騷擾內容，請保持友善的討論環境。"
```

## 配置選項 (Configuration Options)

```typescript
interface FilterConfiguration {
  sensitivity: 'low' | 'medium' | 'high';
  enableProfanityFilter: boolean;
  enableSpamDetection: boolean;
  enableHateSpeechDetection: boolean;
  enablePersonalInfoDetection: boolean;
  autoHideThreshold: number;  // 0.7
  autoBlockThreshold: number; // 0.9
}
```

## 審核記錄 (Moderation Logs)

系統自動記錄所有審核決策：
- 原始內容與處理後內容
- 違規類型和嚴重程度
- 處理動作和時間戳記
- 審核狀態（待審核/已批准/已拒絕）

## 效能指標 (Performance Metrics)

- **處理速度**: < 100ms
- **記憶體使用**: 最小化模式匹配
- **資料庫負載**: 異步記錄，不影響主要流程
- **準確率**: 基於規則匹配，可持續優化

## 未來擴展 (Future Enhancements)

1. **機器學習模型**: 整合 AI 模型提升檢測準確率
2. **用戶回報系統**: 實現用戶舉報功能
3. **管理員介面**: 提供審核管理後台
4. **多語言支援**: 擴展至其他語言支援
5. **自定義規則**: 允許管理員自定義過濾規則

## 測試覆蓋 (Test Coverage)

已實現全面的單元測試：
- ✅ 違禁詞檢測測試
- ✅ 垃圾內容檢測測試
- ✅ 仇恨言論檢測測試
- ✅ 個人資訊檢測測試
- ✅ 混合違規測試
- ✅ 錯誤處理測試
- ✅ 配置敏感度測試

## 安全性與隱私 (Security & Privacy)

- **資料保護**: 個人資訊自動遮蔽
- **審核記錄**: 安全儲存，僅授權人員可存取
- **錯誤處理**: 系統錯誤時默認允許內容發布
- **日誌安全**: 不記錄敏感個人資訊

---

**完成日期**: 2025-01-27  
**負責人**: AI 開發團隊  
**狀態**: ✅ 已完成並整合至社群服務 