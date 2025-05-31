
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Briefcase, Users, Car, UserCog, Building, ShieldAlert, MapPin, Search, Calendar, UserPlus, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">NomadX</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hover:bg-accent/50">Login <LogIn className="ml-2 h-4 w-4"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Login As</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/customer/auth/login" className="flex items-center"><Users className="mr-2 h-4 w-4"/>Customer</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/agency/auth/login" className="flex items-center"><Building className="mr-2 h-4 w-4"/>Agency</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/auth/login" className="flex items-center"><ShieldAlert className="mr-2 h-4 w-4"/>Admin</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="hover:shadow-lg hover:bg-primary/90 hover:-translate-y-0.5">Register <UserPlus className="ml-2 h-4 w-4"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Register As</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link href="/customer/auth/register" className="flex items-center"><Users className="mr-2 h-4 w-4"/>Customer</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/agency/auth/register" className="flex items-center"><Building className="mr-2 h-4 w-4"/>Agency</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center text-center text-white overflow-hidden">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Dynamic cityscape or travel background"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0"
            data-ai-hint="cityscape travel"
            priority
          />
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <div className="relative z-20 container px-4 md:px-6 animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none drop-shadow-lg">
              Your Journey, <span className="text-primary">Simplified.</span>
            </h1>
            <p className="mt-4 max-w-[700px] mx-auto text-lg md:text-xl text-neutral-200 drop-shadow-md">
              Book rides, manage fleets, and oversee operations with NomadX – the all-in-one travel coordination platform.
            </p>
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg shadow-xl">
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 h-5 w-5 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Enter pickup location"
                    className="pl-10 pr-4 py-3 w-full bg-white text-neutral-900 border-transparent focus:ring-2 focus:ring-primary rounded-md placeholder-neutral-500"
                  />
                </div>
                <Button size="lg" className="w-full sm:w-auto hover:shadow-xl hover:bg-primary/90">
                  <Link href="/customer/auth/register" className="flex items-center justify-center">
                    Find a Ride
                    <Search className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose NomadX Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 animate-fade-in-down">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground font-medium">Why NomadX?</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything You Need to Move Smarter</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                NomadX is designed for seamless experiences, whether you're a rider, an agency, or an administrator.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Easy Booking for Customers", description: "Find and book rides in minutes. Track your journey and manage trips with ease.", icon: Users },
                { title: "Powerful Agency Tools", description: "Manage your fleet, drivers, and bookings efficiently. Optimize operations with AI insights.", icon: Building },
                { title: "Robust Admin Oversight", description: "Monitor the entire platform, manage users, and ensure service quality across the board.", icon: UserCog }
              ].map((feature, index) => (
                <Card key={feature.title} className="flex flex-col card-interactive hover:shadow-xl hover:scale-105 transform transition-all duration-300 animate-fade-in-up" style={{animationDelay: `${index * 150}ms`}}>
                  <CardHeader className="pb-4 items-center text-center p-4 sm:p-6">
                    <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center p-4 sm:p-6 pt-0">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How NomadX Works Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 animate-fade-in-down">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground font-medium">Get Started in Minutes</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How NomadX Works</h2>
            </div>
            <div className="mx-auto grid max-w-3xl items-start gap-10 md:grid-cols-3 md:gap-12">
              {[
                { title: "Sign Up / Login", description: "Create an account or log in to your respective portal.", icon: UserPlus },
                { title: "Book or Manage", description: "Customers book rides; agencies manage fleets and bookings.", icon: Car },
                { title: "Travel or Oversee", description: "Enjoy your journey or monitor platform operations smoothly.", icon: Calendar }
              ].map((step, index) => (
                <div key={step.title} className="flex flex-col items-center text-center space-y-3 animate-fade-in-up" style={{animationDelay: `${index * 200 + 300}ms`}}>
                  <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Explore Portals Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 animate-fade-in-down">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tailored for Your Role</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                    Access the NomadX portal designed specifically for your needs.
                </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                <Card className="flex flex-col items-center text-center p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: '600ms'}}>
                    <Users className="h-12 w-12 text-primary mb-4"/>
                    <CardTitle className="mb-2 text-2xl">Customer Portal</CardTitle>
                    <CardDescription className="mb-6">Book rides, track your trips, and manage your account.</CardDescription>
                    <Button asChild className="w-full max-w-xs group hover:shadow-lg mt-auto">
                        <Link href="/customer/auth/login">
                            Go to Customer Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                        </Link>
                    </Button>
                </Card>
                 <Card className="flex flex-col items-center text-center p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: '750ms'}}>
                    <Building className="h-12 w-12 text-primary mb-4"/>
                    <CardTitle className="mb-2 text-2xl">Agency Portal</CardTitle>
                    <CardDescription className="mb-6">Manage your fleet, drivers, bookings, and leverage AI tools.</CardDescription>
                     <Button asChild className="w-full max-w-xs group hover:shadow-lg mt-auto">
                        <Link href="/agency/auth/login">
                            Go to Agency Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                        </Link>
                    </Button>
                </Card>
                 <Card className="flex flex-col items-center text-center p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: '900ms'}}>
                    <ShieldAlert className="h-12 w-12 text-primary mb-4"/>
                    <CardTitle className="mb-2 text-2xl">Admin Portal</CardTitle>
                    <CardDescription className="mb-6">Oversee platform operations, manage users, and access system settings.</CardDescription>
                     <Button asChild className="w-full max-w-xs group hover:shadow-lg mt-auto">
                        <Link href="/admin/auth/login">
                           Go to Admin Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                        </Link>
                    </Button>
                </Card>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <div className="container flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} NomadX. All rights reserved.</p>
            <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
            <Link href="#" className="text-xs hover:underline hover:text-primary underline-offset-4" prefetch={false}>
                Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:underline hover:text-primary underline-offset-4" prefetch={false}>
                Privacy Policy
            </Link>
            <Link href="#" className="text-xs hover:underline hover:text-primary underline-offset-4" prefetch={false}>
                Contact Us
            </Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}
