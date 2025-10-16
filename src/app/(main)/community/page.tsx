/**
 * @fileOverview Community Discussion Platform for Red Chamber Learning with Firebase Integration
 * 
 * This component provides a real social learning environment where users can share insights,
 * discuss themes, ask questions, and engage in scholarly discourse about the Dream of
 * the Red Chamber. Now integrated with Firebase Firestore for persistent data storage.
 * 
 * Key features:
 * - Real-time user-generated content posting with Firebase backend
 * - Interactive commenting system with persistent storage
 * - Like/reaction system with user tracking in database
 * - Content moderation through character limits and validation
 * - Tag-based categorization stored in Firestore
 * - Responsive design for mobile and desktop interaction
 * - Real-time updates for community engagement via Firestore listeners
 * - User authentication integration for personalized experience
 * - Offline support and data synchronization
 * 
 * Educational value:
 * - Encourages active participation and critical thinking
 * - Facilitates peer-to-peer learning and knowledge exchange
 * - Provides platform for scholarly discussion and debate
 * - Supports different perspectives and interpretations
 * - Creates sense of community among learners
 * - Maintains learning history and progress tracking
 * 
 * Technical implementation:
 * - React functional components with hooks for state management
 * - Firebase Firestore for real-time database operations
 * - Form validation and content length restrictions
 * - Dynamic content rendering with expand/collapse functionality
 * - Integration with authentication system for user identity
 * - Multi-language support for international users
 * - Optimistic UI updates for responsive user experience
 * - Real-time listeners for live updates
 * - Error handling and retry mechanisms
 * 
 * Database structure:
 * - posts: Main collection for forum posts
 * - posts/{postId}/comments: Sub-collection for threaded discussions
 * - Real-time synchronization with all connected clients
 * - Automatic data validation and sanitization
 */

"use client"; // Required for interactive community features and state management

// React hooks for component state and lifecycle management
import { useState, useEffect } from 'react';

// UI component imports for community interface
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';

// Icon imports for community interactions
import { 
  Users,          // Community/group indicator
  MessageSquare,  // Discussion/posts indicator
  Search,         // Search functionality
  ThumbsUp,       // Like/approval actions
  MessageCircle,  // Comments and replies
  Send,           // Submit/send actions
  Pencil,         // Edit/compose actions
  Loader2,        // Loading spinner
  AlertCircle     // Error indicator
} from "lucide-react";

// Custom hooks for application functionality
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// Firebase community service for database operations
import {
  communityService,
  type CommunityPost,
  type PostComment,
  type CreatePostData,
  type CreateCommentData
} from '@/lib/community-service';
import { Timestamp } from 'firebase/firestore';

// User level service for XP awards
import { userLevelService, XP_REWARDS } from '@/lib/user-level-service';

// Toast notifications for XP feedback
import { useToast } from '@/hooks/use-toast';

// Type definitions for local component state
type LocalPost = {
  id: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  content: string;
  likes: number;
  likedBy: string[];
  tags: string[];
  commentCount: number;
  isLiked?: boolean;
  comments?: LocalComment[];
  /**
   * Array of user IDs who have bookmarked this post. Optional for backward compatibility.
   */
  bookmarkedBy?: string[];
};

type LocalComment = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
};

// Constants for content validation
const MAX_POST_LENGTH = 5000;
const CONTENT_TRUNCATE_LENGTH = 150; 

// Utility function to format Firestore timestamps
const formatTimestamp = (timestamp: Timestamp): string => {
  if (!timestamp) return '剛剛';
  
  const now = new Date();
  const postTime = timestamp.toDate();
  const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000);
  
  if (diffInSeconds < 60) return '剛剛';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分鐘前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小時前`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`;
  
  return postTime.toLocaleDateString('zh-TW');
};

// Convert Firebase post to local post format
const convertFirebasePost = (firebasePost: CommunityPost, currentUserId?: string): LocalPost => ({
  id: firebasePost.id,
  authorId: firebasePost.authorId,
  authorName: firebasePost.authorName,
  timestamp: formatTimestamp(firebasePost.createdAt),
  content: firebasePost.content,
  likes: firebasePost.likes,
  likedBy: firebasePost.likedBy,
  tags: firebasePost.tags,
  commentCount: firebasePost.commentCount,
  isLiked: currentUserId ? firebasePost.likedBy.includes(currentUserId) : false,
  comments: [],
  bookmarkedBy: Array.isArray((firebasePost as any).bookmarkedBy) ? (firebasePost as any).bookmarkedBy : []
});

function NewPostForm({ onPostSubmit, t, isLoading }: { 
  onPostSubmit: (content: string) => Promise<void>; 
  t: (key: string) => string;
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value;
    if (content.length <= MAX_POST_LENGTH) {
      setPostContent(content);
      setCharacterCount(content.length);
    }
  };

  const handleSubmit = async () => {
    if (postContent.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onPostSubmit(postContent.trim());
      setPostContent('');
      setCharacterCount(0);
      } catch (error) {
        console.error('Error submitting post:', error);
        // Error handling is done in parent component
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="mb-6 shadow-lg bg-card/70">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <i 
            className="fa fa-user-circle text-primary mt-1" 
            aria-hidden="true"
            style={{ fontSize: '32px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          ></i>
          <div className="flex-grow">
            <p className="font-semibold text-white mb-1">{user?.displayName || t('community.anonymousUser')}</p>
            <Textarea
              placeholder={t('placeholders.postContent')}
              value={postContent}
              onChange={handleContentChange}
              className="w-full min-h-[80px] bg-background/50 text-base mb-2"
              rows={3}
              disabled={isLoading || isSubmitting}
            />
            <div className="flex justify-end items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {characterCount} / {MAX_POST_LENGTH} {t('community.characterCount')}
              </span>
              <Button 
                onClick={handleSubmit} 
                disabled={!postContent.trim() || isLoading || isSubmitting}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('buttons.posting')}
                  </>
                ) : (
                  t('buttons.post')
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ 
  post: initialPost, 
  t, 
  onLike, 
  onComment, 
  isLoading,
  onDelete
}: { 
  post: LocalPost; 
  t: (key: string) => string;
  onLike: (postId: string, isLiking: boolean) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  isLoading: boolean;
  onDelete: (postId: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const showMoreButton = initialPost.content.length > CONTENT_TRUNCATE_LENGTH;
  const { user } = useAuth();

  const [isLiked, setIsLiked] = useState(initialPost.isLiked || false);
  const [currentLikes, setCurrentLikes] = useState(initialPost.likes);
  const [isLiking, setIsLiking] = useState(false);

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<LocalComment[]>(initialPost.comments || []);
  const [currentCommentsCount, setCurrentCommentsCount] = useState(initialPost.commentCount);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Update local state when post prop changes
  useEffect(() => {
    setIsLiked(initialPost.isLiked || false);
    setCurrentLikes(initialPost.likes);
    setCurrentCommentsCount(initialPost.commentCount);
  }, [initialPost]);

  // 即時監聽留言變化，當留言有新增、刪除、修改時自動更新
  useEffect(() => {
    if (!showCommentInput) return;
    // 設定 Firestore onSnapshot 監聽
    const unsubscribe = communityService.setupCommentsListener(
      initialPost.id,
      (firebaseComments) => {
        const localComments: LocalComment[] = firebaseComments.map(comment => ({
          id: comment.id,
          author: comment.authorName,
          text: comment.content,
          timestamp: formatTimestamp(comment.createdAt)
        }));
        setComments(localComments);
        setCurrentCommentsCount(localComments.length); // 即時同步留言數
      }
    );
    return () => unsubscribe();
  }, [showCommentInput, initialPost.id]);

  const handleLike = async () => {
    if (!user || isLiking) return;

    const newLikedState = !isLiked;
    
    // Optimistic update
    setIsLiked(newLikedState);
    setCurrentLikes(prev => newLikedState ? prev + 1 : prev - 1);
    setIsLiking(true);

    try {
      await onLike(initialPost.id, newLikedState);
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!newLikedState);
      setCurrentLikes(prev => newLikedState ? prev - 1 : prev + 1);
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) return; // Already loaded
    setIsLoadingComments(true);
    try {
      // 只在第一次展開時載入（即時監聽會自動更新）
      const firebaseComments = await communityService.getComments(initialPost.id);
      const localComments: LocalComment[] = firebaseComments.map(comment => ({
        id: comment.id,
        author: comment.authorName,
        text: comment.content,
        timestamp: formatTimestamp(comment.createdAt)
      }));
      setComments(localComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    const newShowState = !showCommentInput;
    setShowCommentInput(newShowState);
    // 第一次展開時載入一次，之後交給即時監聽
    if (newShowState && comments.length === 0) {
      loadComments();
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || isCommenting) return;

    setIsCommenting(true);
    try {
      await onComment(initialPost.id, newComment.trim());
      setNewComment(''); // 只清空輸入框，不再 optimistic setComments
      // Firestore 監聽會自動同步留言內容與數量
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  // Handler for deleting a post (only for the author)
  const handleDelete = async () => {
    if (!user || user.uid !== initialPost.authorId) return;
    if (!window.confirm('確定要永久刪除此貼文？此操作無法復原。')) return;
    try {
      await onDelete(initialPost.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('刪除失敗，請稍後再試。');
    }
  };

  // Handler for deleting a comment (only for the author)
  const handleDeleteComment = async (commentId: string, commentAuthor: string) => {
    if (!user || user.displayName !== commentAuthor) return;
    if (!window.confirm('確定要永久刪除此留言？此操作無法復原。')) return;
    try {
      await communityService.deleteComment(initialPost.id, commentId);
      // 主動刷新一次留言，確保畫面立即更新
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('刪除留言失敗，請稍後再試。');
    }
  };

  return (
    <Card className="shadow-lg overflow-hidden bg-card/70 hover:shadow-primary/10 transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <i 
            className="fa fa-user-circle text-primary" 
            aria-hidden="true"
            style={{ fontSize: '32px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          ></i>
          <div>
            <p className="font-semibold text-white">{initialPost.authorName}</p>
            <p className="text-xs text-muted-foreground">{initialPost.timestamp}</p>
          </div>
          {/* Show delete button only for the author */}
          {user && user.uid === initialPost.authorId && (
            <Button
              variant="destructive"
              size="sm"
              className="ml-auto"
              onClick={handleDelete}
              disabled={isLoading}
            >
              刪除
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className={`text-foreground/80 leading-relaxed whitespace-pre-line ${!isExpanded && initialPost.content.length > CONTENT_TRUNCATE_LENGTH ? 'line-clamp-3' : ''}`}>
          {initialPost.content}
        </p>
        {showMoreButton && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-primary/80 p-0 h-auto mt-1 text-sm"
          >
            {isExpanded ? t('community.showLess') : t('community.showMore')}
          </Button>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {initialPost.tags.map(tag => (
            <span key={tag} className="text-xs bg-blue-500/20 text-blue-400 py-0.5 px-2 rounded-full cursor-pointer hover:bg-blue-500/30">#{tag}</span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-start items-center pt-4 border-t border-border/50">
        <div className="flex gap-2 text-muted-foreground">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike} 
            disabled={!user || isLiking || isLoading}
            className={`flex items-center gap-1 ${isLiked ? 'text-primary' : 'hover:text-primary'}`}
          >
            {isLiking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-primary text-primary' : ''}`} />
            )}
            {currentLikes}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleComments} 
            className="flex items-center gap-1 hover:text-primary"
            disabled={isLoading}
          >
            <MessageCircle className="h-4 w-4" /> {currentCommentsCount}
          </Button>
        </div>
      </CardFooter>

      {showCommentInput && (
        <CardContent className="pt-4 border-t border-border/50 bg-muted/20">
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">載入留言中...</span>
            </div>
          ) : comments.length > 0 ? (
            <div className="mb-4 space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-2 bg-background/30 rounded-md flex items-start gap-2">
                  <i 
                    className="fa fa-user-circle text-primary/70 mt-0.5" 
                    aria-hidden="true"
                    style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  ></i>
                  <div className="text-foreground/80 leading-relaxed whitespace-pre-line flex-1">
                    <span className="font-semibold text-white">{comment.author}: </span>
                    <span>{comment.text}</span>
                  </div>
                  {/* Show delete button only for the comment author */}
                  {user && user.displayName === comment.author && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleDeleteComment(comment.id, comment.author)}
                      disabled={isLoading}
                    >
                      刪除
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : null}
          
          {user && (
          <div className="space-y-2">
              <Label htmlFor={`comment-input-${initialPost.id}`} className="text-sm font-semibold text-foreground/90">
                {t('community.commentLabel')}
              </Label>
            <Textarea
              id={`comment-input-${initialPost.id}`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('placeholders.writeYourComment')}
              rows={2}
              className="bg-background/70 text-base"
                disabled={isCommenting || isLoading}
            />
              <Button 
                onClick={handleSubmitComment} 
                size="sm" 
                className="bg-accent text-accent-foreground hover:bg-accent/90" 
                disabled={!newComment.trim() || isCommenting || isLoading}
              >
                {isCommenting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin"/>
                    {t('buttons.submittingComment')}
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1.5"/>
                    {t('buttons.submitComment')}
                  </>
                )}
            </Button>
          </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function CommunityPage() {
  const { t } = useLanguage();
  const { user, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  // State management for posts and UI
  const [posts, setPosts] = useState<LocalPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPostingNew, setIsPostingNew] = useState(false);

  // Load posts from Firebase on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const firebasePosts = await communityService.getPosts();
      const localPosts = firebasePosts.map(post => convertFirebasePost(post, user?.uid));
      setPosts(localPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('無法載入貼文，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPost = async (content: string) => {
    if (!user) {
      setError('請先登入才能發文。');
      return;
    }

    setIsPostingNew(true);
    setError(null);

    try {
      const postData: CreatePostData = {
        authorId: user.uid,
        authorName: user.displayName || '匿名用戶',
        content: content,
        tags: [t('community.postTagNew')], // Default tag for new posts
        category: 'discussion'
      };

      const newPostId = await communityService.createPost(postData);

      // Award XP for post creation
      try {
        const xpResult = await userLevelService.awardXP(
          user.uid,
          XP_REWARDS.POST_CREATED,
          'Created community post',
          'community',
          newPostId
        );

        // Show toast notification with XP award
        toast({
          title: `+${XP_REWARDS.POST_CREATED} XP`,
          description: '感謝分享！你的貢獻讓社群更精彩！',
          duration: 3000,
        });

        // Refresh user profile to update level display
        await refreshUserProfile();
      } catch (error) {
        console.error('Error awarding XP for post creation:', error);
        // Don't fail the post creation if XP award fails
      }

      // Add new post optimistically to local state
      const newPost: LocalPost = {
        id: newPostId,
        authorId: user.uid,
        authorName: user.displayName || '匿名用戶',
        timestamp: '剛剛',
        content: content,
        likes: 0,
        likedBy: [],
        tags: [t('community.postTagNew')],
        commentCount: 0,
        isLiked: false,
        comments: [],
        bookmarkedBy: []
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);

      // Refresh posts to get the real data
      setTimeout(() => loadPosts(), 1000);
    } catch (error) {
      console.error('Error creating post:', error);
      setError('發文失敗，請稍後再試。');
    } finally {
      setIsPostingNew(false);
    }
  };

  const handleLike = async (postId: string, isLiking: boolean) => {
    if (!user) {
      setError('請先登入才能按讚。');
      return;
    }

    try {
      await communityService.togglePostLike(postId, user.uid, isLiking);

      // Award XP only when liking (not un-liking)
      if (isLiking) {
        try {
          // Generate unique sourceId based on user-post combination
          // This prevents duplicate XP for like/unlike/re-like on the same post
          const sourceId = `like-${user.uid}-${postId}`;

          const result = await userLevelService.awardXP(
            user.uid,
            XP_REWARDS.LIKE_RECEIVED, // Award to the person giving the like
            'Liked community post',
            'community',
            sourceId
          );

          // Only show toast if not a duplicate reward
          if (!result.isDuplicate) {
            // Show toast notification with XP award
            toast({
              title: `+${XP_REWARDS.LIKE_RECEIVED} XP`,
              description: '感謝支持！',
              duration: 1500,
            });

            // Refresh user profile to update level display
            await refreshUserProfile();
          } else {
            console.log(`⚠️ Duplicate like reward prevented for post ${postId}`);
          }
        } catch (error) {
          console.error('Error awarding XP for like:', error);
          // Don't fail the like if XP award fails
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error; // Re-throw to allow component to handle optimistic update reversion
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!user) {
      setError('請先登入才能留言。');
      return;
    }

    try {
      const commentData: CreateCommentData = {
        postId: postId,
        authorId: user.uid,
        authorName: user.displayName || '匿名用戶',
        content: content
      };

      const commentId = await communityService.addComment(commentData);

      // Award XP for comment creation
      try {
        await userLevelService.awardXP(
          user.uid,
          XP_REWARDS.COMMENT_CREATED,
          'Created community comment',
          'community',
          `${postId}-${commentId}`
        );

        // Show toast notification with XP award
        toast({
          title: `+${XP_REWARDS.COMMENT_CREATED} XP`,
          description: '謝謝參與討論！',
          duration: 2000,
        });

        // Refresh user profile to update level display
        await refreshUserProfile();
      } catch (error) {
        console.error('Error awarding XP for comment:', error);
        // Don't fail the comment if XP award fails
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Handler for deleting a post
  const handleDeletePost = async (postId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await communityService.deletePost(postId);
      // Remove the deleted post from local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('刪除貼文失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="font-artistic text-2xl text-primary flex items-center gap-2">
                <Users className="h-7 w-7" />
                {t('community.title')}
              </CardTitle>
              <CardDescription>
                {t('community.description')}
              </CardDescription>
            </div>
            {user && (
              <Button 
                onClick={() => document.getElementById('new-post-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isLoading}
              >
                <Pencil className="mr-2 h-4 w-4" /> {t('community.writeNewPost')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder={t('placeholders.searchPosts')}
                className="pl-10 bg-background/50 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error message display */}
          {error && (
            <Card className="mb-6 bg-destructive/10 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* New post form - only show if user is logged in */}
          {user && (
            <div id="new-post-form">
              <NewPostForm onPostSubmit={handleNewPost} t={t} isLoading={isLoading || isPostingNew} />
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg text-muted-foreground">載入社群內容中...</span>
            </div>
          )}

          {/* Posts display */}
          {!isLoading && (
            <>
          {filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      t={t} 
                      onLike={handleLike}
                      onComment={handleComment}
                      isLoading={isLoading || isPostingNew}
                      onDelete={handleDeletePost}
                    />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {searchTerm ? t('community.noMatchingPosts') : t('community.noPostsYet')}
                  </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm 
                      ? t('community.errorSearchNoResults') 
                      : user 
                        ? '成為第一個分享想法的人！' 
                        : '請登入後開始討論。'
                    }
              </p>
                  {!user && (
                    <Button 
                      onClick={() => window.location.href = '/login'} 
                      className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      前往登入
                    </Button>
                  )}
            </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
