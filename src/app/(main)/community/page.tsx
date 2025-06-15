
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageSquare, Search, ThumbsUp, MessageCircle, Send, Pencil } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';


type PostedComment = {
  author: string;
  text: string;
};

type Post = {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  likes: number;
  tags: string[];
  initialPlaceholderComments?: PostedComment[];
};


const getInitialPostsData = (t: (key: string) => string): Post[] => [
  {
    id: '1',
    author: '寶玉哥哥', // Example, could be dynamic or user-based
    timestamp: '2小時前',
    content: '今日細讀判詞，忽有所悟，不知諸位有何高見？尤其是晴為黛影，襲為釵副之說，總覺得意猶未盡... 判詞云：「霽月難逢，彩雲易散。心比天高，身為下賤。風流靈巧招人怨。壽夭多因毀謗生，多情公子空牽念。」此處暗示晴雯命運。又云：「枉自溫柔和順，空雲似桂如蘭。堪羨優伶有福，誰知公子無緣。」此為襲人。',
    likes: 15,
    tags: ['判詞解析', '人物探討'], // These could also be translated if needed, but often tags are language-specific
    initialPlaceholderComments: [
      {
        author: t('community.placeholderInitialCommentAuthor1'),
        text: t('community.placeholderInitialCommentText1')
      },
      {
        author: t('community.placeholderInitialCommentAuthor2'),
        text: t('community.placeholderInitialCommentText2')
      }
    ]
  },
  {
    id: '2',
    author: '瀟湘妃子',
    timestamp: '5小時前',
    content: '「儂今葬花人笑痴，他年葬儂知是誰？」每讀此句，心緒難平。不知各位姐妹讀此詞時，作何感想？「試看春殘花漸落，便是紅顏老死時。一朝春盡紅顏老，花落人亡兩不知！」全詩淒婉動人，道盡了黛玉的多愁 sensibilia (多愁善感) and tragic fate.',
    likes: 28,
    tags: ['詩詞賞析', '黛玉'],
    initialPlaceholderComments: []
  },
  {
    id: '3',
    author: '村夫賈雨村',
    timestamp: '1天前',
    content: '《紅樓夢》不僅是文學巨著，亦是研究清代社會的珍貴史料。從衣食住行到人情世故，無不細緻入微。例如書中對貴族家庭的飲食描寫，如第四十一回「櫳翠庵茶品梅花雪 怡紅院劫遇母蝗蟲」，其中的點心、茶品都極其講究，反映了當時的物質文化水平。這是一個較短的發文，應該不需要展開。',
    likes: 12,
    tags: ['社會背景', '歷史研究'],
    initialPlaceholderComments: [
      {
        author: t('community.placeholderInitialCommentAuthor3'),
        text: t('community.placeholderInitialCommentText3')
      }
    ]
  },
];


const MAX_POST_LENGTH = 5000;
const CONTENT_TRUNCATE_LENGTH = 150; 

function NewPostForm({ onPostSubmit, t }: { onPostSubmit: (content: string) => void; t: (key: string) => string }) {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [characterCount, setCharacterCount] = useState(0);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value;
    if (content.length <= MAX_POST_LENGTH) {
      setPostContent(content);
      setCharacterCount(content.length);
    }
  };

  const handleSubmit = () => {
    if (postContent.trim()) {
      onPostSubmit(postContent.trim());
      setPostContent('');
      setCharacterCount(0);
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
            />
            <div className="flex justify-end items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {characterCount} / {MAX_POST_LENGTH} {t('community.characterCount')}
              </span>
              <Button 
                onClick={handleSubmit} 
                disabled={!postContent.trim()}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {t('buttons.post')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ post: initialPost, t }: { post: Post; t: (key: string) => string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const showMoreButton = initialPost.content.length > CONTENT_TRUNCATE_LENGTH;
  const { user } = useAuth();

  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(initialPost.likes);

  const handleLike = () => {
    if (isLiked) {
      setCurrentLikes(prev => prev - 1);
    } else {
      setCurrentLikes(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postedComments, setPostedComments] = useState<PostedComment[]>(initialPost.initialPlaceholderComments || []); 
  const [currentCommentsCount, setCurrentCommentsCount] = useState(initialPost.initialPlaceholderComments?.length || 0);


  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const newCommentEntry: PostedComment = {
        author: user?.displayName || t('community.anonymousUser'),
        text: newComment.trim(),
      };
      setPostedComments(prev => [newCommentEntry, ...prev]); 
      setCurrentCommentsCount(prev => prev + 1);
      setNewComment('');
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
            <p className="font-semibold text-white">{initialPost.author}</p>
            <p className="text-xs text-muted-foreground">{initialPost.timestamp}</p>
          </div>
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
          <Button variant="ghost" size="sm" onClick={handleLike} className={`flex items-center gap-1 ${isLiked ? 'text-primary' : 'hover:text-primary'}`}>
            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-primary text-primary' : ''}`} /> {currentLikes}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowCommentInput(!showCommentInput)} className="flex items-center gap-1 hover:text-primary">
            <MessageCircle className="h-4 w-4" /> {currentCommentsCount}
          </Button>
        </div>
      </CardFooter>

      {showCommentInput && (
        <CardContent className="pt-4 border-t border-border/50 bg-muted/20">
          {postedComments.length > 0 && (
            <div className="mb-4 space-y-3">
              {postedComments.map((comment, index) => (
                <div key={index} className="p-2 bg-background/30 rounded-md flex items-start gap-2">
                  <i 
                    className="fa fa-user-circle text-primary/70 mt-0.5" 
                    aria-hidden="true"
                    style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  ></i>
                  <div className="text-foreground/80 leading-relaxed whitespace-pre-line">
                    <span className="font-semibold text-white">{comment.author}: </span>
                    <span>{comment.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor={`comment-input-${initialPost.id}`} className="text-sm font-semibold text-foreground/90">{t('community.commentLabel')}</Label>
            <Textarea
              id={`comment-input-${initialPost.id}`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('placeholders.writeYourComment')}
              rows={2}
              className="bg-background/70 text-base"
            />
            <Button onClick={handleSubmitComment} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={!newComment.trim()}>
              <Send className="h-3 w-3 mr-1.5"/> {t('buttons.submitComment')}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function CommunityPage() {
  const { t } = useLanguage();
  const initialPostsData = getInitialPostsData(t);
  const [posts, setPosts] = useState<Post[]>(initialPostsData);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth(); 

  const handleNewPost = (content: string) => {
    const newPost: Post = {
      id: (posts.length + 1).toString(),
      author: user?.displayName || t('community.anonymousUser'),
      timestamp: '剛剛', // This could be localized or formatted too
      content: content,
      likes: 0,
      tags: [t('community.postTagNew')],
      initialPlaceholderComments: []
    };
    setPosts([newPost, ...posts]);
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              <Button onClick={() => alert(t('community.newPostPlaceholder'))} className="bg-accent text-accent-foreground hover:bg-accent/90">
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
              />
            </div>
          </div>

          {user && <NewPostForm onPostSubmit={handleNewPost} t={t} />}

          {filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} t={t} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold text-foreground">{t('community.noMatchingPosts')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? t('community.errorSearchNoResults') : t('community.noPostsYet')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
