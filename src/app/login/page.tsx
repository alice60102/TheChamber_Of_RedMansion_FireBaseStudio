
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollText } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/10 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-lg">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="inline-block mb-4">
             <ScrollText className="h-12 w-12 text-primary mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-artistic text-primary">歡迎回來</CardTitle>
          <CardDescription>登入以繼續您的紅樓慧讀之旅</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input id="email" type="email" placeholder="m@example.com" className="bg-background/70"/>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="password">密碼</Label>
              <Link href="#" className="ml-auto inline-block text-sm text-accent underline hover:text-accent/80">
                忘記密碼?
              </Link>
            </div>
            <Input id="password" type="password" className="bg-background/70"/>
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            登入
          </Button>
          <Button variant="outline" className="w-full">
            使用其他方式登入 (例如：Google)
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm">
          還沒有帳戶?{' '}
          <Link href="/register" className="text-accent underline hover:text-accent/80">
            立即註冊
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
