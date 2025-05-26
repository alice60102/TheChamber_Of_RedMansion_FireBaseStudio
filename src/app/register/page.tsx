
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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "姓氏不能為空" }), // Zod message might need update if "firstName" now means "surname"
  lastName: z.string().min(1, { message: "名字不能為空" }),  // Zod message might need update if "lastName" now means "given name"
  email: z.string().email({ message: "請輸入有效的電子郵件地址" }),
  password: z.string().min(6, { message: "密碼長度至少為6位" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    setFirebaseError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      // Optionally update profile with name
      // Note: If firstName is now surname and lastName is given name, ensure displayName is formed as desired.
      // For many Chinese names, it's Surname followed by Given Name.
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: `${data.firstName}${data.lastName}`, // Example: "李四" if firstName="李", lastName="四"
        });
      }
      router.push('/dashboard'); // Redirect to dashboard on successful registration
    } catch (error: any) {
      // Handle Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        setFirebaseError('此電子郵件地址已被註冊。');
      } else if (error.code === 'auth/weak-password') {
        setFirebaseError('密碼太弱，請使用更強的密碼。');
      } else if (error.code === 'auth/configuration-not-found') {
        setFirebaseError('Firebase 驗證設定未找到。請確認您的 .env 文件中的 Firebase 專案ID是否正確，並在 Firebase 控制台中啟用了 Email/Password 登入方式。');
      } else if (error.code === 'auth/invalid-api-key') {
        setFirebaseError('Firebase API 金鑰無效。請檢查您的 .env 文件中的 Firebase 配置是否正確。');
      }
      else {
        setFirebaseError('註冊失敗，請稍後再試。錯誤碼：' + error.code);
      }
      console.error("Registration error:", error);
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
          <CardTitle className="text-3xl font-artistic text-primary">加入紅樓慧讀</CardTitle>
          <CardDescription>創建您的帳戶，開啟智能閱讀新體驗</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {firebaseError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>註冊錯誤</AlertTitle>
                <AlertDescription>{firebaseError}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">請輸入姓氏</Label>
                <Input id="firstName" placeholder="姓氏" {...register("firstName")} className={`bg-background/70 ${errors.firstName ? 'border-destructive' : ''}`} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">請輸入名字</Label>
                <Input id="lastName" placeholder="名字" {...register("lastName")} className={`bg-background/70 ${errors.lastName ? 'border-destructive' : ''}`} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
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
              {isLoading ? "創建中..." : "創建帳戶"}
            </Button>
          </CardContent>
        </form>
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
