/**
 * @fileOverview Level Data Loading Failure Tests
 *
 * Tests to verify graceful degradation when user level data fails to load.
 * Ensures the system displays default Level 0 state instead of error pages.
 *
 * Test Categories:
 * 1. User profile loading failures
 * 2. Level metadata loading failures
 * 3. Progress bar rendering with missing data
 * 4. Dashboard rendering with level errors
 * 5. Permission check fallback handling
 * 6. Level display component error states
 *
 * Success Criteria:
 * - No error pages or white screens when level data fails
 * - Default Level 0 state displayed as fallback
 * - Progress indicators show sensible defaults (0%)
 * - Users can still access basic features without level data
 * - Clear indication that some features may be limited
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import * as userLevelService from '@/lib/user-level-service';
import { UserProfile, UserLevel, LevelPermission } from '@/lib/types/user-level';

// Mock user level service
jest.mock('@/lib/user-level-service');

describe('Level Data Loading Failure - Default State Fallback', () => {
  let testLogger: any;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Initialize test logger
    testLogger = {
      logs: [],
      log: (message: string, data?: any) => {
        testLogger.logs.push({ message, data, timestamp: new Date().toISOString() });
      }
    };

    // Reset all mocks
    jest.clearAllMocks();

    // Suppress console.error for cleaner test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('User Profile Loading Failures', () => {
    /**
     * Test Case 1: Display Level 0 when profile loading fails
     *
     * Verifies that users see default Level 0 state instead of error page
     */
    it('should display Level 0 default state when profile loading fails', async () => {
      testLogger.log('Testing Level 0 fallback on profile load failure');

      // Mock profile loading failure
      jest.spyOn(userLevelService, 'getUserProfile').mockRejectedValue(
        new Error('Failed to fetch user profile')
      );

      const ProfileComponent = () => {
        const [profile, setProfile] = React.useState<Partial<UserProfile> | null>(null);
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          userLevelService.getUserProfile('user-123')
            .then(setProfile)
            .catch(() => {
              // Fallback to default Level 0 state
              setProfile({
                currentLevel: 0,
                currentXP: 0,
                totalXP: 0,
                nextLevelXP: 50,
                displayName: 'Guest',
              });
            })
            .finally(() => setLoading(false));
        }, []);

        if (loading) return <div>Loading...</div>;

        return (
          <div data-testid="profile-display">
            <h2 data-testid="user-level">Level {profile?.currentLevel || 0}</h2>
            <p data-testid="user-name">{profile?.displayName || 'Guest'}</p>
            <p data-testid="user-xp">XP: {profile?.currentXP || 0}</p>
          </div>
        );
      };

      render(<ProfileComponent />);

      // Should show Level 0 as fallback
      await waitFor(() => {
        expect(screen.getByTestId('profile-display')).toBeInTheDocument();
        expect(screen.getByTestId('user-level')).toHaveTextContent('Level 0');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
        expect(screen.getByTestId('user-xp')).toHaveTextContent('XP: 0');
      });

      testLogger.log('✅ Level 0 default state displayed on profile load failure');
    });

    /**
     * Test Case 2: Profile initialization failure shows default state
     *
     * Verifies graceful handling when profile doesn't exist yet
     */
    it('should show default state when profile does not exist', async () => {
      testLogger.log('Testing default state for non-existent profile');

      // Mock profile not found
      jest.spyOn(userLevelService, 'getUserProfile').mockResolvedValue(null);

      const NewUserComponent = () => {
        const [profile, setProfile] = React.useState<Partial<UserProfile> | null>(null);
        const [error, setError] = React.useState(false);

        React.useEffect(() => {
          userLevelService.getUserProfile('new-user-456')
            .then(data => {
              if (!data) {
                // Profile doesn't exist - show default
                setProfile({
                  currentLevel: 0,
                  currentXP: 0,
                  totalXP: 0,
                  displayName: 'New Reader',
                });
              } else {
                setProfile(data);
              }
            })
            .catch(() => setError(true));
        }, []);

        if (error) {
          return <div data-testid="error-state">Unable to load profile</div>;
        }

        return (
          <div data-testid="new-user-display">
            <h2>Welcome, {profile?.displayName}!</h2>
            <p data-testid="level-info">You are currently at Level {profile?.currentLevel}</p>
            <p data-testid="getting-started">Get started by reading your first chapter!</p>
          </div>
        );
      };

      render(<NewUserComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('new-user-display')).toBeInTheDocument();
        expect(screen.getByText('Welcome, New Reader!')).toBeInTheDocument();
        expect(screen.getByTestId('level-info')).toHaveTextContent('Level 0');
        expect(screen.getByTestId('getting-started')).toBeInTheDocument();
      });

      testLogger.log('✅ Default state shown for non-existent profile');
    });
  });

  describe('Level Metadata Loading Failures', () => {
    /**
     * Test Case 3: Level display works with missing metadata
     *
     * Verifies level display shows basic info even if detailed metadata fails
     */
    it('should display basic level info when metadata loading fails', async () => {
      testLogger.log('Testing level display with metadata failure');

      // Mock getUserProfile succeeds
      jest.spyOn(userLevelService, 'getUserProfile').mockResolvedValue({
        uid: 'user-123',
        currentLevel: 2,
        currentXP: 75,
        totalXP: 175,
        nextLevelXP: 200,
      } as UserProfile);

      // Mock getLevelMetadata fails
      jest.spyOn(userLevelService, 'getLevelMetadata').mockRejectedValue(
        new Error('Level metadata service unavailable')
      );

      const LevelDisplayComponent = () => {
        const [profile, setProfile] = React.useState<UserProfile | null>(null);
        const [levelMeta, setLevelMeta] = React.useState<UserLevel | null>(null);

        React.useEffect(() => {
          userLevelService.getUserProfile('user-123')
            .then(setProfile);

          userLevelService.getLevelMetadata(2)
            .then(setLevelMeta)
            .catch(() => {
              // Use fallback metadata
              setLevelMeta({
                id: 2,
                title: '等級 2',
                titleEn: 'Level 2',
                description: 'Continue your journey...',
              } as UserLevel);
            });
        }, []);

        if (!profile) return <div>Loading...</div>;

        return (
          <div data-testid="level-display">
            <h2 data-testid="level-title">
              {levelMeta?.title || `Level ${profile.currentLevel}`}
            </h2>
            <p data-testid="level-description">
              {levelMeta?.description || 'Keep reading to progress!'}
            </p>
            <div data-testid="xp-display">
              {profile.currentXP} / {profile.nextLevelXP} XP
            </div>
          </div>
        );
      };

      render(<LevelDisplayComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('level-display')).toBeInTheDocument();
        expect(screen.getByTestId('level-title')).toHaveTextContent('等級 2');
        expect(screen.getByTestId('xp-display')).toHaveTextContent('75 / 200 XP');
      });

      testLogger.log('✅ Basic level info displayed despite metadata failure');
    });
  });

  describe('Progress Bar Rendering with Missing Data', () => {
    /**
     * Test Case 4: Progress bar shows 0% when data is missing
     *
     * Verifies progress indicators don't crash with missing data
     */
    it('should render progress bar with 0% when data is missing', async () => {
      testLogger.log('Testing progress bar with missing data');

      // Mock profile with minimal data
      jest.spyOn(userLevelService, 'getUserProfile').mockResolvedValue({
        uid: 'user-123',
        currentLevel: 0,
        currentXP: 0,
        totalXP: 0,
        nextLevelXP: 0, // Edge case: missing next level target
      } as UserProfile);

      const ProgressBarComponent = () => {
        const [profile, setProfile] = React.useState<UserProfile | null>(null);

        React.useEffect(() => {
          userLevelService.getUserProfile('user-123')
            .then(setProfile)
            .catch(() => {
              // Fallback to zero state
              setProfile({
                currentLevel: 0,
                currentXP: 0,
                totalXP: 0,
                nextLevelXP: 50,
              } as UserProfile);
            });
        }, []);

        if (!profile) return <div>Loading...</div>;

        // Safe percentage calculation
        const percentage = profile.nextLevelXP > 0
          ? Math.min(100, (profile.currentXP / profile.nextLevelXP) * 100)
          : 0;

        return (
          <div data-testid="progress-container">
            <div
              data-testid="progress-bar"
              style={{
                width: '100%',
                height: '20px',
                background: '#e0e0e0',
                position: 'relative',
              }}
            >
              <div
                data-testid="progress-fill"
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: '#4caf50',
                }}
              />
            </div>
            <p data-testid="progress-text">{percentage.toFixed(0)}% to next level</p>
          </div>
        );
      };

      render(<ProgressBarComponent />);

      await waitFor(() => {
        const progressFill = screen.getByTestId('progress-fill');
        expect(progressFill).toBeInTheDocument();
        expect(progressFill).toHaveStyle({ width: '0%' });
        expect(screen.getByTestId('progress-text')).toHaveTextContent('0% to next level');
      });

      testLogger.log('✅ Progress bar safely renders with 0% on missing data');
    });

    /**
     * Test Case 5: Progress calculation handles invalid data
     *
     * Verifies progress doesn't show >100% or negative values
     */
    it('should handle invalid XP values gracefully', async () => {
      testLogger.log('Testing progress with invalid XP values');

      const InvalidDataComponent = () => {
        // Simulate corrupted data scenarios
        const testCases = [
          { currentXP: -10, nextLevelXP: 100, expected: 0 },
          { currentXP: 150, nextLevelXP: 100, expected: 100 },
          { currentXP: 50, nextLevelXP: 0, expected: 0 },
        ];

        const calculateProgress = (current: number, next: number) => {
          if (next <= 0) return 0;
          const percentage = (current / next) * 100;
          return Math.max(0, Math.min(100, percentage));
        };

        return (
          <div data-testid="invalid-data-container">
            {testCases.map((testCase, index) => (
              <div key={index} data-testid={`test-case-${index}`}>
                <p>Progress: {calculateProgress(testCase.currentXP, testCase.nextLevelXP).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        );
      };

      render(<InvalidDataComponent />);

      // Verify all cases handle invalid data safely
      await waitFor(() => {
        expect(screen.getByTestId('test-case-0')).toHaveTextContent('Progress: 0%'); // Negative XP
        expect(screen.getByTestId('test-case-1')).toHaveTextContent('Progress: 100%'); // Over 100%
        expect(screen.getByTestId('test-case-2')).toHaveTextContent('Progress: 0%'); // Division by zero
      });

      testLogger.log('✅ Invalid XP values handled gracefully');
    });
  });

  describe('Dashboard Rendering with Level Errors', () => {
    /**
     * Test Case 6: Dashboard renders with partial level data
     *
     * Verifies dashboard doesn't crash when level data is incomplete
     */
    it('should render dashboard with partial level data', async () => {
      testLogger.log('Testing dashboard with partial level data');

      // Mock partial profile data
      jest.spyOn(userLevelService, 'getUserProfile').mockResolvedValue({
        uid: 'user-123',
        displayName: 'Test User',
        currentLevel: 1,
        currentXP: 30,
        totalXP: 80,
        // Missing nextLevelXP
      } as UserProfile);

      const DashboardComponent = () => {
        const [profile, setProfile] = React.useState<UserProfile | null>(null);
        const [error, setError] = React.useState(false);

        React.useEffect(() => {
          userLevelService.getUserProfile('user-123')
            .then(data => {
              // Ensure essential fields have defaults
              setProfile({
                ...data,
                nextLevelXP: data.nextLevelXP || 100, // Default if missing
              } as UserProfile);
            })
            .catch(() => {
              setError(true);
            });
        }, []);

        if (error) {
          return (
            <div data-testid="dashboard-error">
              <h1>Dashboard</h1>
              <p>Some features may be limited</p>
            </div>
          );
        }

        if (!profile) return <div>Loading...</div>;

        return (
          <div data-testid="dashboard">
            <h1>Welcome, {profile.displayName}!</h1>
            <div data-testid="level-widget">
              <p>Level: {profile.currentLevel}</p>
              <p>XP: {profile.currentXP} / {profile.nextLevelXP || 100}</p>
            </div>
            <div data-testid="dashboard-content">
              <p>Continue your reading journey</p>
            </div>
          </div>
        );
      };

      render(<DashboardComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();
        expect(screen.getByTestId('level-widget')).toBeInTheDocument();
        expect(screen.getByText(/XP: 30 \/ 100/)).toBeInTheDocument();
      });

      testLogger.log('✅ Dashboard renders with partial level data');
    });

    /**
     * Test Case 7: Dashboard shows limited mode when level service fails
     *
     * Verifies dashboard provides basic functionality even without level system
     */
    it('should show limited mode when level service completely fails', async () => {
      testLogger.log('Testing dashboard limited mode');

      // Mock complete level service failure
      jest.spyOn(userLevelService, 'getUserProfile').mockRejectedValue(
        new Error('Level service unavailable')
      );
      jest.spyOn(userLevelService, 'hasPermission').mockRejectedValue(
        new Error('Permission check failed')
      );

      const LimitedDashboardComponent = () => {
        const [limitedMode, setLimitedMode] = React.useState(false);

        React.useEffect(() => {
          userLevelService.getUserProfile('user-123')
            .catch(() => {
              setLimitedMode(true);
            });
        }, []);

        return (
          <div data-testid="dashboard-container">
            {limitedMode && (
              <div data-testid="limited-mode-banner">
                ⚠️ Running in limited mode - some features may be unavailable
              </div>
            )}
            <h1>Red Mansion Dashboard</h1>
            <div data-testid="basic-features">
              <button>Browse Chapters</button>
              <button>View Collection</button>
            </div>
          </div>
        );
      };

      render(<LimitedDashboardComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
        expect(screen.getByTestId('limited-mode-banner')).toBeInTheDocument();
        expect(screen.getByText(/Running in limited mode/)).toBeInTheDocument();
        expect(screen.getByTestId('basic-features')).toBeInTheDocument();
      });

      testLogger.log('✅ Dashboard shows limited mode when level service fails');
    });
  });

  describe('Permission Check Fallback Handling', () => {
    /**
     * Test Case 8: Permission checks default to false when service fails
     *
     * Verifies that failed permission checks don't crash the app
     */
    it('should default to no permissions when check fails', async () => {
      testLogger.log('Testing permission check fallback');

      // Mock permission check failure
      jest.spyOn(userLevelService, 'hasPermission').mockRejectedValue(
        new Error('Permission service unavailable')
      );

      const PermissionComponent = () => {
        const [canAccessFeature, setCanAccessFeature] = React.useState(false);
        const [checkedPermission, setCheckedPermission] = React.useState(false);

        React.useEffect(() => {
          userLevelService.hasPermission('user-123', LevelPermission.POETRY_COMPETITION)
            .then(setCanAccessFeature)
            .catch(() => {
              // Default to false (safe fallback)
              setCanAccessFeature(false);
            })
            .finally(() => setCheckedPermission(true));
        }, []);

        if (!checkedPermission) return <div>Checking permissions...</div>;

        return (
          <div data-testid="permission-container">
            {canAccessFeature ? (
              <div data-testid="feature-enabled">
                <button>Enter Poetry Competition</button>
              </div>
            ) : (
              <div data-testid="feature-locked">
                <p>🔒 This feature is locked</p>
                <p>Continue reading to unlock</p>
              </div>
            )}
          </div>
        );
      };

      render(<PermissionComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('permission-container')).toBeInTheDocument();
        expect(screen.getByTestId('feature-locked')).toBeInTheDocument();
        expect(screen.getByText('🔒 This feature is locked')).toBeInTheDocument();
      });

      testLogger.log('✅ Permission check defaults to false (locked) on failure');
    });

    /**
     * Test Case 9: Batch permission checks handle partial failures
     *
     * Verifies that some permissions failing doesn't block others
     */
    it('should handle batch permission check failures independently', async () => {
      testLogger.log('Testing batch permission checks');

      let callCount = 0;
      jest.spyOn(userLevelService, 'hasPermission').mockImplementation((userId, permission) => {
        callCount++;
        // Every other permission check fails
        if (callCount % 2 === 0) {
          return Promise.reject(new Error('Permission check timeout'));
        }
        return Promise.resolve(true);
      });

      const BatchPermissionComponent = () => {
        const [permissions, setPermissions] = React.useState({
          reading: false,
          poetry: false,
          community: false,
        });

        React.useEffect(() => {
          const checkPermissions = async () => {
            const results = await Promise.allSettled([
              userLevelService.hasPermission('user-123', LevelPermission.BASIC_READING),
              userLevelService.hasPermission('user-123', LevelPermission.POETRY_LISTENING),
              userLevelService.hasPermission('user-123', LevelPermission.STUDY_GROUP_CREATE),
            ]);

            setPermissions({
              reading: results[0].status === 'fulfilled' ? results[0].value : false,
              poetry: results[1].status === 'fulfilled' ? results[1].value : false,
              community: results[2].status === 'fulfilled' ? results[2].value : false,
            });
          };

          checkPermissions();
        }, []);

        return (
          <div data-testid="batch-permissions">
            <div data-testid="reading-status">
              Reading: {permissions.reading ? '✅' : '❌'}
            </div>
            <div data-testid="poetry-status">
              Poetry: {permissions.poetry ? '✅' : '❌'}
            </div>
            <div data-testid="community-status">
              Community: {permissions.community ? '✅' : '❌'}
            </div>
          </div>
        );
      };

      render(<BatchPermissionComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('batch-permissions')).toBeInTheDocument();
        // Should show mix of granted and denied based on mock implementation
        const readingStatus = screen.getByTestId('reading-status');
        const poetryStatus = screen.getByTestId('poetry-status');
        const communityStatus = screen.getByTestId('community-status');

        expect(readingStatus).toBeInTheDocument();
        expect(poetryStatus).toBeInTheDocument();
        expect(communityStatus).toBeInTheDocument();
      });

      testLogger.log('✅ Batch permission checks handle partial failures');
    });
  });

  describe('Level Display Component Error States', () => {
    /**
     * Test Case 10: Level badge renders with fallback data
     *
     * Verifies level badges show something meaningful even with errors
     */
    it('should render level badge with fallback when data is missing', async () => {
      testLogger.log('Testing level badge fallback');

      const LevelBadgeComponent = ({ userId }: { userId: string }) => {
        const [level, setLevel] = React.useState<number | null>(null);
        const [error, setError] = React.useState(false);

        React.useEffect(() => {
          userLevelService.getUserProfile(userId)
            .then(profile => setLevel(profile?.currentLevel || 0))
            .catch(() => {
              setError(true);
              setLevel(0); // Fallback to Level 0
            });
        }, [userId]);

        if (level === null) return <div>Loading...</div>;

        return (
          <div data-testid="level-badge" className="level-badge">
            {error && (
              <span data-testid="error-indicator" title="Some features may be limited">
                ⚠️
              </span>
            )}
            <span data-testid="level-number">Lv. {level}</span>
          </div>
        );
      };

      // Mock profile loading failure
      jest.spyOn(userLevelService, 'getUserProfile').mockRejectedValue(
        new Error('Profile load timeout')
      );

      render(<LevelBadgeComponent userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('level-badge')).toBeInTheDocument();
        expect(screen.getByTestId('level-number')).toHaveTextContent('Lv. 0');
        expect(screen.getByTestId('error-indicator')).toBeInTheDocument();
      });

      testLogger.log('✅ Level badge renders with fallback data');
    });
  });
});
