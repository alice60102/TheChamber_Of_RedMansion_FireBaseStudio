
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollText, ArrowLeft, ArrowRight } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "姓氏不能為空" }),
  lastName: z.string().min(1, { message: "名字不能為空" }),
  email: z.string().email({ message: "請輸入有效的電子郵件地址" }),
  password: z.string().min(6, { message: "密碼長度至少為6位" }),
  learningBackground: z.string().optional(),
  readingInterests: z.string().optional(),
  learningGoals: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { register, handleSubmit, control, formState: { errors }, trigger } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Validate on change for better UX during steps
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    setFirebaseError(null);
    console.log("Registration Data:", data); 
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: `${data.firstName}${data.lastName}`,
        });
      }
      router.push('/dashboard');
    } catch (error: any) {
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

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["firstName", "lastName", "email", "password"];
    }
    // No explicit validation needed for optional fields to proceed to next step

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        return; 
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/10 to-background p-4">
      <Card className="w-full max-w-lg shadow-2xl bg-card/90 backdrop-blur-lg">
        <CardHeader className="space-y-1 text-center">
           <Link href="/" className="inline-block mb-4">
             <ScrollText className="h-12 w-12 text-primary mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-artistic text-primary">加入紅樓慧讀</CardTitle>
          <CardDescription>
            {currentStep === 1 && "創建您的帳戶，開啟智能閱讀新體驗"}
            {currentStep === 2 && "告訴我們更多關於您的學習背景"}
            {currentStep === 3 && "分享您對《紅樓夢》的閱讀興趣"}
            {currentStep === 4 && "設定您的學習目標"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 min-h-[320px] flex flex-col">
            {firebaseError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>註冊錯誤</AlertTitle>
                <AlertDescription>{firebaseError}</AlertDescription>
              </Alert>
            )}

            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="password">密碼 (至少6位)</Label>
                  <Input id="password" type="password" {...register("password")} className={`bg-background/70 ${errors.password ? 'border-destructive' : ''}`} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="space-y-2">
                <Label htmlFor="learningBackground">您的古典文學基礎？ (選填)</Label>
                <Controller
                  name="learningBackground"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full bg-background/70">
                        <SelectValue placeholder="請選擇您的古典文學背景" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">初次接觸</SelectItem>
                        <SelectItem value="intermediate">略有涉獵</SelectItem>
                        <SelectItem value="advanced">曾修讀相關課程</SelectItem>
                        <SelectItem value="expert">深入研究</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-2">
                <Label htmlFor="readingInterests">您對《紅樓夢》的哪些方面最感興趣？ (選填)</Label>
                <Textarea
                  id="readingInterests"
                  placeholder="例如：人物關係、詩詞賞析、歷史文化背景..."
                  {...register("readingInterests")}
                  className="bg-background/70 min-h-[120px]"
                  rows={4}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-2">
                <Label htmlFor="learningGoals">您希望透過本平台達成什麼學習目標？ (選填)</Label>
                <Textarea
                  id="learningGoals"
                  placeholder="例如：完整閱讀一遍、理解主要人物、完成所有判詞筆記..."
                  {...register("learningGoals")}
                  className="bg-background/70 min-h-[120px]"
                  rows={4}
                />
              </div>
            )}

            {/* Spacer to push buttons to bottom if content is short, but not needed if min-h and flex-col is used correctly */}
            {currentStep > 1 && currentStep < 4 && <div className="flex-grow"></div>}


            <div className="flex justify-between items-center pt-4 mt-auto"> {/* mt-auto will push this to the bottom if CardContent is flex-col */}
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={handlePreviousStep} className="text-accent border-accent hover:bg-accent/10">
                  <ArrowLeft className="mr-2 h-4 w-4" /> 上一步
                </Button>
              ) : (
                 <div></div> // Placeholder to keep "Next" button to the right on step 1
              )}
              
              {currentStep < 4 && (
                <Button type="button" onClick={handleNextStep} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  下一步 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {currentStep === 4 && (
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "創建中..." : "創建帳戶並開始學習"}
                </Button>
              )}
            </div>
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
