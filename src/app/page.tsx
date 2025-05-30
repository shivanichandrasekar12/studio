import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase, CalendarCheck, Users, Car } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">AgencyLink</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Streamline Your Travel Agency Operations with <span className="text-primary">AgencyLink</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Manage your employees, vehicles, and bookings all in one place. Get AI-powered vehicle suggestions and stay organized with our intuitive platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="group">
                    <Link href="/register">
                      Register Your Agency
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">
                      Login to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                alt="AgencyLink Dashboard Mockup"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                data-ai-hint="travel agency dashboard"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  AgencyLink provides a comprehensive suite of tools to help your travel agency thrive.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <Card>
                <CardHeader className="pb-4">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Employee Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Easily add, update, and manage profiles for all your agency staff.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-4">
                  <Car className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Vehicle Fleet Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Keep track of vehicle details, availability, and maintenance schedules.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-4">
                  <CalendarCheck className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Smart Booking Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Visualize bookings, avoid conflicts, and manage reservations efficiently.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} AgencyLink. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
