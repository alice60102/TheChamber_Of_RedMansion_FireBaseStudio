
/**
 * @fileOverview User Registration Page Component for Red Mansion Learning Platform
 * 
 * This component provides a comprehensive multi-step registration process for new users
 * to create accounts and set up their learning profiles. It combines secure authentication
 * with personalized onboarding to tailor the learning experience from the start.
 * 
 * Key features:
 * - Multi-step registration wizard with progressive disclosure
 * - Firebase Authentication with email/password account creation
 * - User profile setup with learning preferences and goals
 * - React Hook Form with step-by-step validation
 * - Internationalization support throughout the process
 * - Elegant error handling and loading states
 * - Responsive design maintaining classical Chinese aesthetic
 * - Accessibility-compliant form navigation and feedback
 * 
 * Registration steps:
 * 1. Basic Information (name, email, password) - Required for account creation
 * 2. Learning Background - Skill level assessment for content personalization
 * 3. Reading Interests - Preference gathering for recommendation system
 * 4. Learning Goals - Goal setting for progress tracking and motivation
 * 
 * The multi-step approach reduces cognitive load while gathering necessary information
 * to provide a personalized learning experience from day one.
 */

"use client"; // Required for client-side form handling and authentication

// Next.js imports for navigation and routing
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Form handling and validation imports
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// UI component imports from the design system
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Icon imports for visual elements and navigation
import { ScrollText, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

// Firebase authentication imports
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// React hooks for state management
import { useState } from 'react';

// Custom hooks for internationalization
import { useLanguage } from '@/hooks/useLanguage';

/**
 * Dynamic Registration Form Validation Schema
 * 
 * Creates a comprehensive Zod validation schema with internationalized error messages.
 * The schema includes both required fields for account creation and optional fields
 * for learning profile setup, allowing for flexible validation across registration steps.
 * 
 * @param t - Translation function from useLanguage hook
 * @returns Zod schema object with validation rules for all registration fields
 */
const getRegisterSchema = (t: (key: string) => string) => z.object({
  // Required fields for account creation (Step 1)
  firstName: z.string().min(1, { 
    message: t('register.errors.firstNameRequired') 
  }),
  lastName: z.string().min(1, { 
    message: t('register.errors.lastNameRequired') 
  }),
  email: z.string().email({ 
    message: t('register.errors.emailInvalid') 
  }),
  password: z.string().min(6, { 
    message: t('register.errors.passwordMinLength') 
  }),
  
  // Optional fields for learning profile setup (Steps 2-4)
  learningBackground: z.string().optional(),  // User's current skill level
  readingInterests: z.string().optional(),    // Areas of interest for recommendations
  learningGoals: z.string().optional(),       // Personal learning objectives
});


export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  type RegisterFormValues = z.infer<ReturnType<typeof getRegisterSchema>>;

  const { register, handleSubmit, control, formState: { errors }, trigger } = useForm<RegisterFormValues>({
    resolver: zodResolver(getRegisterSchema(t)),
    mode: "onChange", 
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    setFirebaseError(null);
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
        setFirebaseError(t('register.errorEmailInUse'));
      } else if (error.code === 'auth/weak-password') {
        setFirebaseError(t('register.errorWeakPassword'));
      } else if (error.code === 'auth/configuration-not-found') {
        setFirebaseError(t('register.errorConfigNotFound'));
      } else if (error.code === 'auth/invalid-api-key') {
        setFirebaseError(t('register.errorInvalidApiKey'));
      }
      else {
        setFirebaseError(`${t('register.errorDefault')} ${error.code}`);
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

  const stepDescriptions: Record<number, string> = {
    1: t('register.step1Description'),
    2: t('register.step2Description'),
    3: t('register.step3Description'),
    4: t('register.step4Description'),
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/10 to-background p-4">
      <Card className="w-full max-w-lg shadow-2xl bg-card/90 backdrop-blur-lg">
        <CardHeader className="space-y-1 text-center">
           <Link href="/" className="inline-block mb-4">
             <ScrollText className="h-12 w-12 text-primary mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-artistic text-primary">{t('register.joinApp')}</CardTitle>
          <CardDescription>
            {stepDescriptions[currentStep]}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="min-h-[320px] flex flex-col">
            <div className="flex flex-col"> 
              {firebaseError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('register.errorTitle')}</AlertTitle>
                  <AlertDescription>{firebaseError}</AlertDescription>
                </Alert>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('register.firstNameLabel')}</Label>
                      <Input id="firstName" placeholder={t('register.firstNamePlaceholder')} {...register("firstName")} className={`bg-background/70 ${errors.firstName ? 'border-destructive' : ''}`} />
                      {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('register.lastNameLabel')}</Label>
                      <Input id="lastName" placeholder={t('register.lastNamePlaceholder')} {...register("lastName")} className={`bg-background/70 ${errors.lastName ? 'border-destructive' : ''}`} />
                      {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('register.emailLabel')}</Label>
                    <Input id="email" type="email" placeholder={t('placeholders.emailExample')} {...register("email")} className={`bg-background/70 ${errors.email ? 'border-destructive' : ''}`} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('register.passwordLabel')}</Label>
                    <Input id="password" type="password" {...register("password")} className={`bg-background/70 ${errors.password ? 'border-destructive' : ''}`} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-2">
                  <Label htmlFor="learningBackground">{t('register.learningBackgroundLabel')}</Label>
                  <Controller
                    name="learningBackground"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full bg-background/70">
                          <SelectValue placeholder={t('register.learningBackgroundPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">{t('register.bgOptionBeginner')}</SelectItem>
                          <SelectItem value="intermediate">{t('register.bgOptionIntermediate')}</SelectItem>
                          <SelectItem value="advanced">{t('register.bgOptionAdvanced')}</SelectItem>
                          <SelectItem value="expert">{t('register.bgOptionExpert')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-2">
                  <Label htmlFor="readingInterests">{t('register.readingInterestsLabel')}</Label>
                  <Textarea
                    id="readingInterests"
                    placeholder={t('register.readingInterestsPlaceholder')}
                    {...register("readingInterests")}
                    className="bg-background/70 min-h-[120px]"
                    rows={4}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-2">
                  <Label htmlFor="learningGoals">{t('register.learningGoalsLabel')}</Label>
                  <Textarea
                    id="learningGoals"
                    placeholder={t('register.learningGoalsPlaceholder')}
                    {...register("learningGoals")}
                    className="bg-background/70 min-h-[120px]"
                    rows={4}
                  />
                </div>
              )}
            
              <div className="flex items-center mt-6 gap-4">
                 {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="text-accent border-accent hover:bg-accent/10 flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('buttons.previous')}
                  </Button>
                ) : (
                  <div className="flex-1"></div> 
                )}
                
                {currentStep < 4 && (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
                  >
                    {t('buttons.next')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {currentStep === 4 && (
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? t('register.creatingAccount') : t('register.createAndStart')}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-grow"></div> 
          </CardContent>
        </form>
        <CardFooter className="text-center text-sm">
          {t('register.alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-accent underline hover:text-accent/80">
            {t('buttons.login')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
