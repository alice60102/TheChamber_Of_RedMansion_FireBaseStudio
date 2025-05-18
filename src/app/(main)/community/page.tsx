
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, MessageSquare, PlusCircle, ThumbsUp, MessageCircle, Search, PencilLine } from "lucide-react";

// Placeholder data for posts - in a real app, this would come from a backend
const initialPosts = [
  {
    id: '1',
    author: '寶玉哥哥',
    timestamp: '2小時前',
    title: '關於金陵十二釵判詞的個人淺見',
    content: '今日細讀判詞，忽有所悟，不知諸位有何高見？尤其是晴為黛影，襲為釵副之說，總覺得意猶未盡...',
    likes: 15,
    comments: 4,
    tags: ['判詞解析', '人物探討'],
  },
  {
    id: '2',
    author: '瀟湘妃子',
    timestamp: '5小時前',
    title: '葬花詞中的意境與情感',
    content: '「儂今葬花人笑痴，他年葬儂知是誰？」每讀此句，心緒難平。不知各位姐妹讀此詞時，作何感想？',
    likes: 28,
    comments: 9,
    tags: ['詩詞賞析', '黛玉'],
  },
  {
    id: '3',
    author: '村夫賈雨村',
    timestamp: '1天前',
    title: '論《紅樓夢》對清代社會風貌的反映',
    content: '《紅樓夢》不僅是文學巨著，亦是研究清代社會的珍貴史料。從衣食住行到人情世故，無不細緻入微...',
    likes: 12,
    comments: 2,
    tags: ['社會背景', '歷史研究'],
  },
];

type Post = typeof initialPosts[0];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState('');

  // In a real app, you'd fetch posts, handle new post creation, likes, comments, etc.
  // For now, this is a static display.

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PencilLine className="h-4 w-4 mr-2" /> 發表新主題
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="搜索帖子標題、內容、作者或標籤..." 
                className="pl-10 bg-background/50 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="shadow-lg overflow-hidden bg-card/70 hover:shadow-primary/10 transition-shadow">
                  <CardHeader>
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
                    <CardTitle className="font-artistic text-xl hover:text-accent cursor-pointer">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80 leading-relaxed line-clamp-3 mb-3">{post.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-xs bg-accent/20 text-accent-foreground py-0.5 px-2 rounded-full cursor-pointer hover:bg-accent/30">#{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-4 border-t border-border/50">
                    <div className="flex gap-4 text-muted-foreground">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-primary">
                        <ThumbsUp className="h-4 w-4" /> {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-primary">
                        <MessageCircle className="h-4 w-4" /> {post.comments}
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:text-accent hover:border-accent">閱讀全文</Button>
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
