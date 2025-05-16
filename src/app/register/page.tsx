
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollText } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/10 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-lg">
        <CardHeader className="space-y-1 text-center">
           <Link href="/" className="inline-block mb-4">
             <ScrollText className="h-12 w-12 text-primary mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-artistic text-primary">加入紅樓慧讀</CardTitle>
          <CardDescription>創建您的帳戶，開啟智能閱讀新體驗</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">名字</Label>
              <Input id="firstName" placeholder="姓氏" className="bg-background/70"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">稱呼</Label>
              <Input id="lastName" placeholder="名字" className="bg-background/70"/>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input id="email" type="email" placeholder="m@example.com" className="bg-background/70"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密碼</Label>
            <Input id="password" type="password" className="bg-background/70"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">您的角色</Label>
            <Select>
              <SelectTrigger id="role" className="w-full bg-background/70">
                <SelectValue placeholder="選擇您的角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">學生</SelectItem>
                <SelectItem value="teacher">教師</SelectItem>
                <SelectItem value="researcher">研究者</SelectItem>
                <SelectItem value="enthusiast">愛好者</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            創建帳戶
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm">
          已經有帳戶了?{' '}
          <Link href="/login" className="text-accent underline hover:text-accent/80">
            登入
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
