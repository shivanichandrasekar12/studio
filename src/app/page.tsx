
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase, Users, Car, UserCog, Building, ShieldAlert } from "lucide-react";
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
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">NomadX</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hover:shadow-md hover:-translate-y-0.5">Login</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Login As</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/customer/auth/login">Customer</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/agency/auth/login">Agency</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/auth/login">Admin</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="hover:shadow-lg hover:bg-primary/90 hover:-translate-y-0.5">Get Started</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Register As</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link href="/customer/auth/register">Customer</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/agency/auth/register">Agency</Link>
              </DropdownMenuItem>
              {/* Admin registration is typically not public */}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none  animate-fade-in-down delay-100">
                    The Future of Travel Coordination: <span className="text-primary">NomadX</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl animate-fade-in-down delay-300">
                    Seamlessly connect customers, agencies, and administrators on a unified platform. Book rides, manage operations, and oversee the entire ecosystem with NomadX.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row animate-fade-in-up delay-500">
                  <Button asChild size="lg" className="group hover:shadow-xl hover:bg-primary/90 hover:-translate-y-1">
                    <Link href="/customer/auth/register">
                      Book Your Ride
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="hover:shadow-md hover:border-primary hover:-translate-y-1">
                    <Link href="/agency/auth/register">
                      Register Your Agency
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-xl">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="NomadX Platform Mockup"
                  width={600}
                  height={400}
                  className="mx-auto aspect-video object-cover sm:w-full lg:order-last rounded-xl transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:shadow-2xl"
                  data-ai-hint="travel platform dashboard"
                  priority
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm animate-fade-in-down delay-200">Key Platform Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl animate-fade-in-down delay-400">Empowering Every User Role</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed animate-fade-in-down delay-600">
                  NomadX provides tailored tools for customers, travel agencies, and administrators.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <Card className="card-interactive hover:shadow-xl hover:scale-105 transform animate-fade-in-up delay-300">
                <CardHeader className="pb-4">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>For Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Effortlessly book rides, manage your trips, and communicate with agencies.</CardDescription>
                </CardContent>
              </Card>
              <Card className="card-interactive hover:shadow-xl hover:scale-105 transform animate-fade-in-up delay-500">
                <CardHeader className="pb-4">
                  <Building className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>For Agencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Manage your fleet, staff, and bookings with an AI-powered dashboard.</CardDescription>
                </CardContent>
              </Card>
              <Card className="card-interactive hover:shadow-xl hover:scale-105 transform animate-fade-in-up delay-700">
                <CardHeader className="pb-4">
                  <UserCog className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>For Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Oversee platform operations, user activity, and ensure smooth service delivery.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} NomadX. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline hover:text-primary underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline hover:text-primary underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
