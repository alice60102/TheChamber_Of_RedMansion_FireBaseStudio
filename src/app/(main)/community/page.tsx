
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageSquare, Search, ThumbsUp, MessageCircle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

// Placeholder data for posts - in a real app, this would come from a backend
const initialPostsData = [
  {
    id: '1',
    author: '寶玉哥哥',
    timestamp: '2小時前',
    content: '今日細讀判詞，忽有所悟，不知諸位有何高見？尤其是晴為黛影，襲為釵副之說，總覺得意猶未盡... 判詞云：「霽月難逢，彩雲易散。心比天高，身為下賤。風流靈巧招人怨。壽夭多因毀謗生，多情公子空牽念。」此處暗示晴雯命運。又云：「枉自溫柔和順，空雲似桂如蘭。堪羨優伶有福，誰知公子無緣。」此為襲人。',
    likes: 15,
    comments: 4,
    tags: ['判詞解析', '人物探討'],
  },
  {
    id: '2',
    author: '瀟湘妃子',
    timestamp: '5小時前',
    content: '「儂今葬花人笑痴，他年葬儂知是誰？」每讀此句，心緒難平。不知各位姐妹讀此詞時，作何感想？「試看春殘花漸落，便是紅顏老死時。一朝春盡紅顏老，花落人亡兩不知！」全詩淒婉動人，道盡了黛玉的多愁善感和悲劇命運。',
    likes: 28,
    comments: 9,
    tags: ['詩詞賞析', '黛玉'],
  },
  {
    id: '3',
    author: '村夫賈雨村',
    timestamp: '1天前',
    content: '《紅樓夢》不僅是文學巨著，亦是研究清代社會的珍貴史料。從衣食住行到人情世故，無不細緻入微。例如書中對貴族家庭的飲食描寫，如第四十一回「櫳翠庵茶品梅花雪 怡紅院劫遇母蝗蟲」，其中的點心、茶品都極其講究，反映了當時的物質文化水平。',
    likes: 12,
    comments: 2,
    tags: ['社會背景', '歷史研究'],
  },
];

type Post = {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
};

const MAX_POST_LENGTH = 5000;

function NewPostForm({ onPostSubmit }: { onPostSubmit: (content: string) => void }) {
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
            <p className="font-semibold text-primary mb-1">{user?.displayName || '訪客'}</p>
            <Textarea
              placeholder="發文內容..."
              value={postContent}
              onChange={handleContentChange}
              className="w-full min-h-[80px] bg-background/50 text-base mb-2"
              rows={3}
            />
            <div className="flex justify-end items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {characterCount} / {MAX_POST_LENGTH}
              </span>
              <Button 
                onClick={handleSubmit} 
                disabled={!postContent.trim()}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                發佈
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(initialPostsData);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth(); 

  const handleNewPost = (content: string) => {
    const newPost: Post = {
      id: (posts.length + 1).toString(),
      author: user?.displayName || '匿名用戶',
      timestamp: '剛剛',
      content: content,
      likes: 0,
      comments: 0,
      tags: ['新帖'],
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
                紅學社
              </CardTitle>
              <CardDescription>
                用戶交流、分享心得的園地。暢所欲言，共同探討《紅樓夢》的無窮魅力。
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="搜索帖子內容、作者或標籤..." 
                className="pl-10 bg-background/50 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {user && <NewPostForm onPostSubmit={handleNewPost} />}

          {filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="shadow-lg overflow-hidden bg-card/70 hover:shadow-primary/10 transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <i 
                        className="fa fa-user-circle text-primary" 
                        aria-hidden="true"
                        style={{ fontSize: '32px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      ></i>
                      <div>
                        <p className="font-semibold text-primary">{post.author}</p>
                        <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-xs bg-accent/20 text-accent-foreground py-0.5 px-2 rounded-full cursor-pointer hover:bg-accent/30">#{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-start items-center pt-4 border-t border-border/50">
                    <div className="flex gap-4 text-muted-foreground">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-primary">
                        <ThumbsUp className="h-4 w-4" /> {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-primary">
                        <MessageCircle className="h-4 w-4" /> {post.comments}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold text-foreground">暫無匹配帖子</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? "未找到與您的搜索詞相關的帖子。" : "這裡還沒有帖子，快來發表第一篇吧！"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

