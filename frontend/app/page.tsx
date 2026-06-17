"use client";

import { Button } from "@/components/ui/button";
import { motion, useInView, useSpring } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle,
  Database,
  Eye,
  Shield,
  Ticket,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

// --- Main Page Component ---
export default function LandingPage() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute top-0 left-0 right-0 h-[500px] -z-10 opacity-20 [mask-image:radial-gradient(100%_50%_at_50%_0%,#fff_0%,transparent_100%)]">
          <div className="absolute inset-[-200%] animate-[aurora_15s_linear_infinite] bg-[linear-gradient(to_right,var(--primary)_0%,hsl(var(--primary)/0)_30%,hsl(var(--primary)/0)_70%,var(--primary)_100%)]"></div>
        </div>

        <div className="container relative mx-auto px-4">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="hidden"
            animate="visible"
            variants={gridContainerVariants}
          >
            <motion.div
              variants={sectionVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Zap className="h-4 w-4" />
              <span>AI-Powered Anomaly Detection</span>
            </motion.div>
            <motion.h1
              variants={sectionVariants}
              className="mb-6 text-5xl font-bold leading-tight tracking-tight text-balance md:text-7xl"
            >
              Protect train ticket sales with{" "}
              <span className="text-primary animate-flicker">Canomaly</span>
            </motion.h1>
            <motion.p
              variants={sectionVariants}
              className="mb-8 text-xl text-muted-foreground text-balance md:text-2xl"
            >
              Canomaly quietly monitors ticket transactions in real-time,
              spotting unusual patterns and potential fraud before it impacts
              your operations.
            </motion.p>
            <motion.div
              variants={sectionVariants}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="min-w-[200px] shadow-lg shadow-primary/20 transition-transform hover:scale-105"
                asChild
              >
                <Link href="/admin/homepage">
                  Start Monitoring <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px] transition-transform hover:scale-105"
                asChild
              >
                <Link href="/user/homepage">
                   Buy Ticket Simulation <Ticket className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <motion.section
        className="border-y border-border bg-card/20 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Trusted by railway operators to keep ticketing safe
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex items-center justify-center text-2xl font-bold text-muted-foreground/60">
              KAI
            </div>
            <div className="flex items-center justify-center text-2xl font-bold text-muted-foreground/60">
              JAYA
            </div>
            <div className="flex items-center justify-center text-2xl font-bold text-muted-foreground/60">
              JAYA
            </div>
            <div className="flex items-center justify-center text-2xl font-bold text-muted-foreground/60">
              JAYA
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-2 text-5xl font-bold text-primary">
                <AnimatedCounter value={99.8} decimals={1} postfix="%" />
              </div>
              <div className="text-sm text-muted-foreground">
                Accuracy you can trust
              </div>
            </div>
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-2 text-5xl font-bold text-primary">
                <AnimatedCounter value={100} prefix="<" postfix="ms" />
              </div>
              <div className="text-sm text-muted-foreground">
                Instant insights
              </div>
            </div>
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-2 text-5xl font-bold text-primary">
                <AnimatedCounter value={85} postfix="%" />
              </div>
              <div className="text-sm text-muted-foreground">
                Fewer fraudulent transactions
              </div>
            </div>
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-2 text-5xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">
                Always monitoring
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ✨ Features Section - Now with 6 cards */}
      <motion.section
        id="features"
        className="border-t border-border bg-card/20 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-balance md:text-5xl">
              Smart anomaly detection for every transaction
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
              Canomaly quietly works in the background, analyzing ticket
              transactions and providing insights, alerts, and logs to keep your
              operations safe.
            </p>
          </div>
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={gridContainerVariants}
          >
            <motion.div variants={sectionVariants} className="card-glow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Real-time Protection
              </h3>
              <p className="text-sm text-muted-foreground">
                Monitor every transaction instantly, spotting unusual patterns
                with advanced AI.
              </p>
            </motion.div>
            <motion.div variants={sectionVariants} className="card-glow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Anomaly Detection</h3>
              <p className="text-sm text-muted-foreground">
                AI models identify suspicious behavior quietly and accurately.
              </p>
            </motion.div>
            <motion.div variants={sectionVariants} className="card-glow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Dashboards give you insights into sales, anomalies, and fraud
                trends.
              </p>
            </motion.div>
            <motion.div variants={sectionVariants} className="card-glow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Instant Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Receive notifications when suspicious activity is detected, so
                you can act quickly.
              </p>
            </motion.div>
            <motion.div variants={sectionVariants} className="card-glow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Complete History</h3>
              <p className="text-sm text-muted-foreground">
                Access full logs of every transaction for auditing and analysis.
              </p>
            </motion.div>
            <motion.div variants={sectionVariants} className="card-glow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Enterprise Security
              </h3>
              <p className="text-sm text-muted-foreground">
                Bank-level encryption ensures sensitive data stays safe.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Platform Section */}
      <motion.section
        id="platform"
        className="py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Eye className="h-3 w-3" />
                Platform Overview
              </div>
              <h2 className="mb-6 text-4xl font-bold text-balance md:text-5xl">
                See Canomaly in Action
              </h2>
              <p className="mb-8 text-lg text-muted-foreground text-pretty">
                Don&apos;t just read about our features—see them. Our platform brings
                everything together in one clear interface, helping your team
                spot and prevent fraud.
              </p>
            </div>
            <motion.div variants={sectionVariants}>
              <LiveUIDemo />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="border-y border-border bg-card/20 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-balance md:text-5xl">
              Keep your railway operations safe with Canomaly
            </h2>
            <p className="mb-8 text-lg text-muted-foreground text-pretty">
              Join operators using Canomaly to detect suspicious activity in
              real-time, prevent fraud, and gain valuable insights effortlessly.
            </p>
            <Button
              size="lg"
              className="min-w-[200px] shadow-lg shadow-primary/20 transition-transform hover:scale-105"
              asChild
            >
              <Link href="/admin/homepage">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-16">
        <div className="container mx-auto px-4">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Canomaly.
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- Helper Component: AnimatedCounter ---
function AnimatedCounter({
  value,
  prefix = "",
  postfix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  postfix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const spring = useSpring(0, { damping: 50, stiffness: 200 });

  useEffect(() => {
    if (inView) {
      spring.set(value);
    }
  }, [spring, value, inView]);

  useEffect(() => {
    spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(
          decimals
        )}${postfix}`;
      }
    });
  }, [spring, prefix, postfix, decimals]);

  return <span ref={ref} />;
}

// --- Helper Component: LiveUIDemo (Static Mockup) ---
const transactions = [
  { id: "TXN-004", status: "anomaly", amount: "Rp 5.500.000" },
  { id: "TXN-003", status: "ok", amount: "Rp 450.000" },
  { id: "TXN-002", status: "ok", amount: "Rp 150.000" },
  { id: "TXN-001", status: "ok", amount: "Rp 250.000" },
];

function LiveUIDemo() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border bg-card/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Transaction Feed</h3>
            <span className="flex items-center gap-2 text-xs font-medium text-primary">
              <Shield className="h-4 w-4" /> Protected
            </span>
          </div>
          <div className="space-y-3">
            {transactions.map((item) => {
              const isDetected = item.status === "anomaly";
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    isDetected
                      ? "border-destructive/50 bg-destructive/10"
                      : "border-border bg-background"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isDetected ? "bg-destructive/10" : "bg-primary/10"
                    }`}
                  >
                    {isDetected ? (
                      <Bell className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isDetected && "text-destructive"
                      }`}
                    >
                      {item.id}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{item.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -right-6 flex items-start gap-3 rounded-xl border border-destructive/50 bg-card p-4 shadow-2xl shadow-destructive/10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <Bell className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <h4 className="font-bold text-destructive">Anomaly Detected!</h4>
          <p className="text-sm text-muted-foreground">
            High-value transaction flagged.
          </p>
        </div>
      </div>
    </div>
  );
}
