
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollText } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "請輸入有效的電子郵件地址" }),
  password: z.string().min(1, { message: "密碼不能為空" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    setFirebaseError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/dashboard'); // Redirect to dashboard on successful login
    } catch (error: any) {
      // Handle Firebase errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setFirebaseError('電子郵件或密碼不正確。');
      } else {
        setFirebaseError('登入失敗，請稍後再試。');
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {firebaseError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>登入錯誤</AlertTitle>
                  <AlertDescription>{firebaseError}</AlertDescription>
                </Alert>
              )}
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input id="email" type="email" placeholder="m@example.com" {...register("email")} className={`bg-background/70 ${errors.email ? 'border-destructive' : ''}`} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input id="password" type="password" {...register("password")} className={`bg-background/70 ${errors.password ? 'border-destructive' : ''}`} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "登入中..." : "登入"}
            </Button>
          </CardContent>
        </form>
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
