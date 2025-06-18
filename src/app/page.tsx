
/**
 * @fileOverview Homepage component for the Red Mansion learning platform.
 * 
 * This is the main landing page that introduces visitors to the platform and its capabilities.
 * It serves as the marketing and onboarding entry point for new users, showcasing:
 * 
 * Key sections:
 * - Hero section with compelling visuals and primary call-to-action
 * - Problem identification (challenges students face with classical literature)
 * - Solution presentation (how our AI platform addresses these challenges)
 * - Call-to-action section encouraging user registration
 * - Footer with branding and navigation
 * 
 * Features:
 * - Multilingual support with language selector in navigation
 * - Responsive design optimized for mobile and desktop
 * - Rich visual design with classical Chinese art backgrounds
 * - Interactive elements with hover effects and animations
 * - Accessibility-compliant navigation and content structure
 * - SEO-friendly semantic HTML structure
 * 
 * The page uses the translation system extensively to support multiple languages
 * and provide a localized experience for different user communities.
 */

"use client"; // Required for client-side interactivity and hooks

// Import Next.js components for navigation and image optimization
import Link from 'next/link';
import Image from 'next/image';

// Import custom UI components from the design system
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import icons from Lucide React for consistent iconography
import { 
  ArrowRight,      // Call-to-action arrows
  TrendingDown,    // Problem indicator icons
  BookLock,        // Literature accessibility challenges
  Puzzle,          // Complexity challenges
  Award,           // Achievement and gamification
  Lightbulb,       // AI insights and learning
  Library,         // Knowledge and resources
  ScrollText,      // Main brand icon (classical scroll)
  ChevronDown      // Dropdown indicator
} from 'lucide-react';

// Import language/internationalization functionality
import { useLanguage } from '@/hooks/useLanguage';
import { LANGUAGES } from '@/lib/translations';
import type { Language } from '@/lib/translations';


/**
 * Homepage Component
 * 
 * The main landing page component that showcases the Red Mansion learning platform.
 * Implements a modern, responsive design with internationalization support.
 * 
 * @returns {JSX.Element} Complete homepage with header, hero, content sections, and footer
 */
export default function HomePage() {
  // Access language context for internationalization
  const { language, setLanguage, t } = useLanguage();

  /**
   * Problem/Challenge data structure
   * 
   * Defines the main challenges that students face when studying classical Chinese literature.
   * Each item includes an icon, translated title, and description to create compelling
   * problem statements that our platform addresses.
   */
  const painPoints = [
    {
      icon: TrendingDown,                    // Icon representing declining interest
      title: t('page.painPoint1Title'),     // Translated title for first challenge
      description: t('page.painPoint1Desc'), // Translated description explaining the problem
    },
    {
      icon: BookLock,                        // Icon representing accessibility barriers
      title: t('page.painPoint2Title'),     // Translated title for second challenge
      description: t('page.painPoint2Desc'), // Translated description of access difficulties
    },
    {
      icon: Puzzle,                          // Icon representing complexity challenges
      title: t('page.painPoint3Title'),     // Translated title for third challenge
      description: t('page.painPoint3Desc'), // Translated description of comprehension issues
    },
  ];

  /**
   * Solution/Feature data structure
   * 
   * Defines how our AI-powered platform addresses the identified challenges.
   * Each solution corresponds to a problem and showcases platform capabilities
   * with positive, engaging iconography and messaging.
   */
  const solutions = [
    {
      icon: Award,                           // Icon representing achievements and gamification
      title: t('page.solution1Title'),      // Translated title for first solution
      description: t('page.solution1Desc'), // Translated description of gamified learning
    },
    {
      icon: Lightbulb,                       // Icon representing AI insights and intelligence
      title: t('page.solution2Title'),      // Translated title for second solution
      description: t('page.solution2Desc'), // Translated description of AI assistance
    },
    {
      icon: Library,                         // Icon representing comprehensive resources
      title: t('page.solution3Title'),      // Translated title for third solution
      description: t('page.solution3Desc'), // Translated description of resource access
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 ml-4">
            <ScrollText className="h-7 w-7 text-primary" />
            <span className="text-xl font-artistic font-bold text-white">{t('appName')}</span>
          </Link>
          <nav className="flex items-center space-x-1 md:space-x-2 mr-4">
            <Button variant="ghost" asChild className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground px-2 sm:px-3">
              <Link href="/">{t('page.navHome')}</Link>
            </Button>
            <Button variant="ghost" asChild className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground px-2 sm:px-3">
              <Link href="#challenges">{t('page.navFeatures')}</Link>
            </Button>
            <Button variant="ghost" asChild className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground px-2 sm:px-3">
              <Link href="#solutions">{t('page.navSolutions')}</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-xs sm:text-sm font-medium text-foreground/70 hover:text-foreground px-2 sm:px-3">
                  {LANGUAGES.find(lang => lang.code === language)?.name || language}
                  <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((langOption) => (
                  <DropdownMenuItem
                    key={langOption.code}
                    onSelect={() => setLanguage(langOption.code)}
                    disabled={language === langOption.code}
                  >
                    {langOption.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
           <Image
            src="https://placehold.co/1920x800.png?tint=2E0A0A,932121" // Base red background
            alt="紅樓夢藝術背景底色"
            fill
            priority
            quality={75}
            className="absolute inset-0 -z-20 object-cover opacity-30" 
            data-ai-hint="red texture"
          />
          <Image
            src="https://sc0.blr1.digitaloceanspaces.com/large/876203-87586-yybgacqder-1524133512.jpg" // New overlay image
            alt="紅樓夢古典繪畫疊加背景"
            fill
            quality={75}
            className="absolute inset-0 -z-10 object-cover opacity-50"
            data-ai-hint="chinese classical painting"
          />
          <div className="container relative z-0 mx-auto px-6 text-center">
            <h1 className="text-4xl font-artistic font-bold text-white md:text-6xl leading-tight">
              {t('page.heroTitlePart1')}
              <span className="text-primary">{t('page.heroTitleHighlight')}</span>
              {t('page.heroTitlePart2')}
            </h1>
            <p className="mt-6 text-lg text-foreground/80 md:text-xl max-w-3xl mx-auto">
              {t('page.heroSubtitle')}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/dashboard">{t('buttons.startLearning')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent" asChild>
                <Link href="#challenges">{t('buttons.learnMore')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Challenges Section */}
        <section id="challenges" className="py-16 md:py-24 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-artistic font-bold text-white md:text-4xl">{t('page.challengesTitle')}</h2>
              <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
                {t('page.challengesSubtitle')}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {painPoints.map((item) => (
                <Card key={item.title} className="bg-card/80 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 flex flex-col">
                  <CardHeader className="items-center text-center">
                    <div className="mb-4 rounded-full bg-destructive/20 p-3 ring-1 ring-destructive/30">
                      <item.icon className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="font-artistic text-xl text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center flex-grow">
                    <CardDescription className="text-foreground/70 text-sm">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-artistic font-bold text-white md:text-4xl">{t('page.solutionsTitle')}</h2>
              <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
                {t('page.solutionsSubtitle')}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {solutions.map((item) => (
                <Card key={item.title} className="bg-card/80 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 flex flex-col">
                  <CardHeader className="items-center text-center">
                    <div className="mb-4 rounded-full bg-accent/20 p-3 ring-1 ring-accent/30">
                      <item.icon className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className="font-artistic text-xl text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center flex-grow">
                    <CardDescription className="text-foreground/70 text-sm">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-card/50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-artistic font-bold text-white md:text-4xl">
              {t('page.ctaTitle')}
            </h2>
            <p className="mt-4 text-lg text-foreground/70 max-w-xl mx-auto">
              {t('page.ctaSubtitle')}
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link href="/register">{t('buttons.registerFree')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-background text-foreground/70">
        <div className="container mx-auto px-6 py-8">
          <div className="md:flex md:justify-between items-center text-center md:text-left">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <ScrollText className="h-7 w-7 text-primary" />
                <span className="text-lg font-artistic font-bold text-white">{t('appName')}</span>
              </Link>
              <p className="text-sm">{t('page.footerSlogan')}</p>
            </div>
            <div className="text-sm">
            </div>
          </div>
          <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs">
            <p>{t('page.footerRights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
