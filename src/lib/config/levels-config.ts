/**
 * @fileOverview Level Configuration for Red Mansion Cultivation Path
 *
 * This file defines the complete 8-level progression system based on
 * classical Chinese literary culture and Red Mansion (Dream of the Red Chamber) themes.
 *
 * Each level represents a stage in the user's learning journey:
 * - Cultural authenticity: Level titles based on classical Chinese roles
 * - Progressive difficulty: XP requirements increase non-linearly
 * - Meaningful rewards: Each level unlocks substantial new features
 * - Clear progression: Users understand what they're working towards
 *
 * Design philosophy:
 * - Levels 0-1: New users, basic orientation
 * - Levels 2-3: Regular learners, building habits
 * - Levels 4-5: Dedicated students, active community members
 * - Levels 6-7: Expert scholars, mentors to others
 */

import { UserLevel, LevelPermission } from '../types/user-level';

/**
 * Complete level configuration array
 * 8 levels from visitor (0) to grand master (7)
 *
 * XP Progression Formula:
 * - Level 0: 0 XP (starting point)
 * - Level 1: 100 XP (1 week of casual engagement)
 * - Level 2: 300 XP (2-3 weeks of regular engagement)
 * - Level 3: 600 XP (1-2 months of consistent use)
 * - Level 4: 1000 XP (2-3 months of dedicated learning)
 * - Level 5: 1500 XP (3-4 months of active participation)
 * - Level 6: 2200 XP (5-6 months of expert-level engagement)
 * - Level 7: 3000 XP (6+ months of mastery)
 *
 * Estimated XP earning rate: 20-30 XP per day with normal engagement
 */
export const LEVELS_CONFIG: UserLevel[] = [
  // ==================== LEVEL 0: 賈府訪客 (Mansion Visitor) ====================
  {
    id: 0,
    title: '賈府訪客',
    titleEn: 'Mansion Visitor',
    description: '初來乍到,對紅樓夢充滿好奇。您剛踏入大觀園,還在熟悉這座文學殿堂的一磚一瓦。',
    requiredXP: 0,
    xpFromPrevious: 0,
    permissions: [
      LevelPermission.BASIC_READING,
      LevelPermission.SIMPLE_AI_QA,
    ],
    exclusiveContent: [
      'intro_guide',            // Introduction guide
      'character_intro_basic',  // Basic character introductions
    ],
    visualRewards: {
      avatarFrame: 'frame-visitor',           // Simple wooden frame
      titleColor: '#9CA3AF',                  // Gray-400
      exclusiveBadges: ['badge-newcomer'],    // Newcomer badge
      profileEffects: [],
    },
    virtualResidence: '榮府外院',  // Outer courtyard of Rongguo Mansion
  },

  // ==================== LEVEL 1: 陪讀書僮 (Reading Companion) ====================
  {
    id: 1,
    title: '陪讀書僮',
    titleEn: 'Reading Companion',
    description: '熟悉了賈府的日常,開始跟隨主人公們的腳步。您已成為大觀園的一員,每日陪伴著寶玉等人學習成長。',
    requiredXP: 100,
    xpFromPrevious: 100,
    permissions: [
      LevelPermission.BASIC_READING,
      LevelPermission.SIMPLE_AI_QA,
      LevelPermission.DAILY_TASKS,
      LevelPermission.BASIC_ACHIEVEMENTS,
    ],
    exclusiveContent: [
      'daily_tasks_unlock',     // Daily task system
      'achievement_system',     // Achievement collection
      'character_profiles_basic', // Basic character profiles
    ],
    visualRewards: {
      avatarFrame: 'frame-companion',         // Blue wooden frame
      titleColor: '#3B82F6',                  // Blue-500
      exclusiveBadges: [
        'badge-first-week',                   // First week completion
        'badge-daily-reader',                 // Daily reading habit
      ],
      profileEffects: ['sparkle-light'],      // Light sparkle effect
    },
    specialRequirements: [
      {
        type: 'chapters_read',
        description: '完成前5回閱讀',
        target: 5,
      },
      {
        type: 'quiz',
        description: '通過「賈府初印象」測驗',
        target: 'quiz-mansion-intro',
      },
    ],
    virtualResidence: '怡紅院',  // Yihong Courtyard (Baoyu's residence)
  },

  // ==================== LEVEL 2: 門第清客 (Guest Scholar) ====================
  {
    id: 2,
    title: '門第清客',
    titleEn: 'Guest Scholar',
    description: '受邀參與詩社雅集,開始品味紅樓詩詞之美。您不再是門外漢,已能與府中文人雅士共賞詩文。',
    requiredXP: 300,
    xpFromPrevious: 200,
    permissions: [
      LevelPermission.BASIC_READING,
      LevelPermission.SIMPLE_AI_QA,
      LevelPermission.DAILY_TASKS,
      LevelPermission.BASIC_ACHIEVEMENTS,
      LevelPermission.POETRY_LISTENING,
      LevelPermission.EXPERT_READINGS_BASIC,
      LevelPermission.GARDEN_3D_VIEW,
    ],
    exclusiveContent: [
      'poetry_collection',      // Poetry anthology
      'expert_commentary_basic', // Basic expert readings
      'garden_3d_tour',         // 3D Grand View Garden
      'character_relationships_basic', // Basic relationship map
    ],
    visualRewards: {
      avatarFrame: 'frame-scholar',           // Elegant jade frame
      titleColor: '#10B981',                  // Green-500
      exclusiveBadges: [
        'badge-poetry-apprentice',            // Poetry learner
        'badge-garden-explorer',              // Garden explorer
      ],
      profileEffects: ['sparkle-medium', 'jade-glow'],
    },
    specialRequirements: [
      {
        type: 'chapters_read',
        description: '完成前20回閱讀',
        target: 20,
      },
      {
        type: 'quiz',
        description: '通過「賈府人事關係」測驗',
        target: 'quiz-family-relationships',
      },
      {
        type: 'tasks_completed',
        description: '連續7天完成每日任務',
        target: 7,
      },
    ],
    virtualResidence: '瀟湘館',  // Xiaoxiang Lodge (Daiyu's residence)
  },

  // ==================== LEVEL 3: 庶務管事 (Estate Manager) ====================
  {
    id: 3,
    title: '庶務管事',
    titleEn: 'Estate Manager',
    description: '深入理解賈府興衰,開始參與社群管理。您已洞察紅樓世態,能夠幫助引導其他學習者。',
    requiredXP: 600,
    xpFromPrevious: 300,
    permissions: [
      LevelPermission.BASIC_READING,
      LevelPermission.SIMPLE_AI_QA,
      LevelPermission.DAILY_TASKS,
      LevelPermission.BASIC_ACHIEVEMENTS,
      LevelPermission.POETRY_LISTENING,
      LevelPermission.EXPERT_READINGS_BASIC,
      LevelPermission.GARDEN_3D_VIEW,
      LevelPermission.ADVANCED_AI_ANALYSIS,
      LevelPermission.CHARACTER_RELATIONSHIP_MAP,
    ],
    exclusiveContent: [
      'advanced_analysis_tools', // Advanced AI analysis
      'character_psychology',   // Character psychological analysis
      'historical_context',     // Historical and cultural context
      'interactive_relationship_map', // Interactive character map
    ],
    visualRewards: {
      avatarFrame: 'frame-manager',           // Gold-trimmed frame
      titleColor: '#F59E0B',                  // Amber-500
      exclusiveBadges: [
        'badge-community-helper',             // Community contributor
        'badge-analysis-expert',              // Analysis specialist
      ],
      profileEffects: ['sparkle-strong', 'gold-shimmer'],
    },
    specialRequirements: [
      {
        type: 'chapters_read',
        description: '完成前40回閱讀',
        target: 40,
      },
      {
        type: 'community_contribution',
        description: '在社群發表10篇有價值的討論',
        target: 10,
      },
    ],
    virtualResidence: '秋爽齋',  // Qiushuang Study (Xichun's art studio)
  },

  // ==================== LEVEL 4: 詩社雅士 (Poetry Society Scholar) ====================
  {
    id: 4,
    title: '詩社雅士',
    titleEn: 'Poetry Society Scholar',
    description: '詩詞造詣日深,常與眾人切磋文墨。您已是海棠詩社的重要成員,詩文為眾人所稱道。',
    requiredXP: 1000,
    xpFromPrevious: 400,
    permissions: [
      LevelPermission.BASIC_READING,
      LevelPermission.SIMPLE_AI_QA,
      LevelPermission.DAILY_TASKS,
      LevelPermission.BASIC_ACHIEVEMENTS,
      LevelPermission.POETRY_LISTENING,
      LevelPermission.EXPERT_READINGS_BASIC,
      LevelPermission.GARDEN_3D_VIEW,
      LevelPermission.ADVANCED_AI_ANALYSIS,
      LevelPermission.CHARACTER_RELATIONSHIP_MAP,
      LevelPermission.POETRY_COMPETITION,
      LevelPermission.STUDY_GROUP_CREATE,
    ],
    exclusiveContent: [
      'poetry_competitions',    // Poetry competition system
      'study_groups',           // Create and join study groups
      'advanced_poetry_tools',  // Advanced poetry analysis
      'cultural_deep_dive',     // Deep cultural exploration
    ],
    visualRewards: {
      avatarFrame: 'frame-poet',              // Artistic calligraphy frame
      titleColor: '#8B5CF6',                  // Violet-500
      exclusiveBadges: [
        'badge-poetry-master',                // Poetry mastery
        'badge-study-group-leader',           // Study group creator
        'badge-cultural-scholar',             // Cultural expert
      ],
      profileEffects: ['sparkle-brilliant', 'ink-wash-effect', 'floating-petals'],
    },
    specialRequirements: [
      {
        type: 'chapters_read',
        description: '完成前60回閱讀',
        target: 60,
      },
      {
        type: 'tasks_completed',
        description: '完成50個每日任務',
        target: 50,
      },
    ],
    virtualResidence: '櫳翠庵',  // Green Gauze Pavilion (Miaoyu's residence)
  },

  // ==================== LEVEL 5: 府中幕賓 (Mansion Counselor) ====================
  {
    id: 5,
    title: '府中幕賓',
    titleEn: 'Mansion Counselor',
    description: '學識淵博,為眾人所敬重。您已成為大觀園的文化導師,引領著眾多後來學習者。',
    requiredXP: 1500,
    xpFromPrevious: 500,
    permissions: [
      LevelPermission.BASIC_READING,
      LevelPermission.SIMPLE_AI_QA,
      LevelPermission.DAILY_TASKS,
      LevelPermission.BASIC_ACHIEVEMENTS,
      LevelPermission.POETRY_LISTENING,
      LevelPermission.EXPERT_READINGS_BASIC,
      LevelPermission.EXPERT_READINGS_FULL,
      LevelPermission.GARDEN_3D_VIEW,
      LevelPermission.ADVANCED_AI_ANALYSIS,
      LevelPermission.CHARACTER_RELATIONSHIP_MAP,
      LevelPermission.POETRY_COMPETITION,
      LevelPermission.STUDY_GROUP_CREATE,
      LevelPermission.SPECIAL_TOPICS,
    ],
    exclusiveContent: [
      'expert_commentary_full', // Full expert commentary
      'special_topics',         // Special topic discussions
      'mentor_system',          // Mentor new users
      'exclusive_webinars',     // Expert webinar access
    ],
    visualRewards: {
      avatarFrame: 'frame-counselor',         // Imperial purple frame
      titleColor: '#EC4899',                  // Pink-500
      exclusiveBadges: [
        'badge-mentor',                       // Mentor badge
        'badge-expert-scholar',               // Expert scholar
        'badge-special-contributor',          // Special contributor
      ],
      profileEffects: ['sparkle-radiant', 'ink-wash-effect', 'flowing-silk', 'lantern-glow'],
    },
    specialRequirements: [
      {
        type: 'chapters_read',
        description: '完成前80回閱讀',
        target: 80,
      },
      {
        type: 'community_contribution',
        description: '幫助20位新用戶完成引導',
        target: 20,
      },
    ],
    virtualResidence: '稻香村',  // Daoxiang Village (Li Wan's residence)
  },

  // ==================== LEVEL 6: 紅學通儒 (Red Chamber Scholar) ====================
  {
    id: 6,
    title: '紅學通儒',
    titleEn: 'Red Chamber Scholar',
    description: '融會貫通紅樓精義,已成一家之言。您對紅樓夢的理解已臻化境,能夠發表獨到見解。',
    requiredXP: 2200,
    xpFromPrevious: 700,
    permissions: [
      LevelPermission.BASIC_READING,
      LevelPermission.SIMPLE_AI_QA,
      LevelPermission.DAILY_TASKS,
      LevelPermission.BASIC_ACHIEVEMENTS,
      LevelPermission.POETRY_LISTENING,
      LevelPermission.EXPERT_READINGS_BASIC,
      LevelPermission.EXPERT_READINGS_FULL,
      LevelPermission.GARDEN_3D_VIEW,
      LevelPermission.ADVANCED_AI_ANALYSIS,
      LevelPermission.CHARACTER_RELATIONSHIP_MAP,
      LevelPermission.POETRY_COMPETITION,
      LevelPermission.STUDY_GROUP_CREATE,
      LevelPermission.SPECIAL_TOPICS,
      LevelPermission.MENTOR_ROLE,
      LevelPermission.RESEARCH_TOOLS,
      LevelPermission.ANNOTATION_PUBLISH,
    ],
    exclusiveContent: [
      'research_tools',         // Advanced research tools
      'annotation_system',      // Publish scholarly annotations
      'exclusive_archives',     // Historical archives
      'expert_dialogue',        // Direct dialogue with experts
    ],
    visualRewards: {
      avatarFrame: 'frame-scholar-master',    // Scholarly jade seal frame
      titleColor: '#DC2626',                  // Red-600
      exclusiveBadges: [
        'badge-red-chamber-scholar',          // Official scholar badge
        'badge-research-master',              // Research master
        'badge-annotation-expert',            // Annotation expert
        'badge-cultural-ambassador',          // Cultural ambassador
      ],
      profileEffects: ['sparkle-magnificent', 'ink-wash-effect', 'flowing-silk', 'jade-aura', 'scroll-unfurl'],
    },
    specialRequirements: [
      {
        type: 'chapters_read',
        description: '完成全書120回閱讀',
        target: 120,
      },
      {
        type: 'tasks_completed',
        description: '發表至少5篇深度研究文章',
        target: 5,
      },
    ],
    virtualResidence: '櫳翠庵藏經閣',  // Scripture Pavilion at Longcui Nunnery
  },

  // ==================== LEVEL 7: 一代宗師 (Grand Master) ====================
  {
    id: 7,
    title: '一代宗師',
    titleEn: 'Grand Master',
    description: '紅學造詣登峰造極,為後學楷模。您已成為紅樓文化的傳承者,引領著整個學習社群的發展。',
    requiredXP: 3000,
    xpFromPrevious: 800,
    permissions: [
      // Inherits all previous permissions
      ...Object.values(LevelPermission),
      LevelPermission.EXCLUSIVE_EVENTS,
    ],
    exclusiveContent: [
      'master_archives',        // Master-only archives
      'exclusive_events',       // VIP cultural events
      'platform_governance',    // Platform governance participation
      'legacy_content',         // Create legacy content
    ],
    visualRewards: {
      avatarFrame: 'frame-grand-master',      // Imperial golden dragon frame
      titleColor: '#B45309',                  // Amber-700 (gold)
      exclusiveBadges: [
        'badge-grand-master',                 // Grand Master badge
        'badge-platform-legend',              // Platform legend
        'badge-cultural-guardian',            // Cultural guardian
        'badge-lifetime-achievement',         // Lifetime achievement
      ],
      profileEffects: ['sparkle-divine', 'ink-wash-effect', 'flowing-silk', 'jade-aura', 'scroll-unfurl', 'phoenix-feather', 'golden-light'],
    },
    specialRequirements: [
      {
        type: 'community_contribution',
        description: '對社群做出傑出貢獻',
        target: 100,
      },
      {
        type: 'tasks_completed',
        description: '持續活躍180天以上',
        target: 180,
      },
    ],
    virtualResidence: '大觀園總管',  // Grand View Garden Chief Administrator
  },
];

/**
 * Helper function to get level configuration by level ID
 * @param level - Level ID (0-7)
 * @returns UserLevel configuration or null if invalid
 */
export function getLevelConfig(level: number): UserLevel | null {
  if (level < 0 || level >= LEVELS_CONFIG.length) {
    return null;
  }
  return LEVELS_CONFIG[level];
}

/**
 * Helper function to get all permissions for a specific level (cumulative)
 * Includes all permissions from current and previous levels
 * @param level - Level ID (0-7)
 * @returns Array of all permissions available at this level
 */
export function getAllPermissionsForLevel(level: number): LevelPermission[] {
  const permissions = new Set<LevelPermission>();

  for (let i = 0; i <= level && i < LEVELS_CONFIG.length; i++) {
    LEVELS_CONFIG[i].permissions.forEach(p => permissions.add(p));
  }

  return Array.from(permissions);
}

/**
 * Helper function to calculate level from total XP
 * @param totalXP - Total XP amount
 * @returns Current level ID (0-7)
 */
export function calculateLevelFromXP(totalXP: number): number {
  for (let i = LEVELS_CONFIG.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS_CONFIG[i].requiredXP) {
      return i;
    }
  }
  return 0; // Default to level 0
}

/**
 * Helper function to calculate XP progress within current level
 * @param totalXP - Total XP amount
 * @returns Object with current level, current XP, and XP to next level
 */
export function calculateXPProgress(totalXP: number): {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
} {
  const currentLevel = calculateLevelFromXP(totalXP);
  const currentLevelConfig = LEVELS_CONFIG[currentLevel];
  const nextLevelConfig = LEVELS_CONFIG[currentLevel + 1];

  if (!nextLevelConfig) {
    // Max level reached
    return {
      currentLevel,
      currentXP: totalXP - currentLevelConfig.requiredXP,
      nextLevelXP: 0,
      xpToNextLevel: 0,
      progressPercentage: 100,
    };
  }

  const currentXP = totalXP - currentLevelConfig.requiredXP;
  const nextLevelXP = nextLevelConfig.requiredXP - currentLevelConfig.requiredXP;
  const xpToNextLevel = nextLevelConfig.requiredXP - totalXP;
  const progressPercentage = (currentXP / nextLevelXP) * 100;

  return {
    currentLevel,
    currentXP,
    nextLevelXP,
    xpToNextLevel,
    progressPercentage: Math.min(progressPercentage, 100),
  };
}

/**
 * Constant for maximum level
 */
export const MAX_LEVEL = LEVELS_CONFIG.length - 1;

/**
 * Constant for maximum XP (Level 7 requirement)
 */
export const MAX_XP = LEVELS_CONFIG[MAX_LEVEL].requiredXP;
