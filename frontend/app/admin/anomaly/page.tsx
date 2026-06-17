"use client";

import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";


type Anomaly = {
  id: string;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  status: "active" | "investigating" | "resolved";
  detected_at: string;
  affected_tickets: number;
  confidence: number;
  final_price: number;
};

export default function AnomalyDetectionPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [hebohAnomaly, setHebohAnomaly] = useState<Anomaly | null>(null);
  const supabase = createClient();
  const lastIdsRef = useRef<Set<string>>(new Set());


  useEffect(() => {
    async function fetchAnomalies() {
      setLoading(true);

      const { data, error } = await supabase
        .from("transactions")
        .select(
          "id, anomaly_score, num_tickets, review_status, created_at, anomaly_label_id, total_amount"
        )
        .eq("fraud_flag", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped: Anomaly[] = data.map((row: { id: string; anomaly_score: number; num_tickets: number; review_status: string; created_at: string; anomaly_label_id: string | null; total_amount: number }) => ({
          id: row.id,
          title: row.anomaly_label_id
            ? `Pattern: ${row.anomaly_label_id}`
            : "Unusual Transaction Pattern",
          description: "Automatically flagged by anomaly detection system",
          severity:
            row.anomaly_score > 0.8
              ? "High"
              : row.anomaly_score > 0.5
              ? "Medium"
              : "Low",
          status:
            (row.review_status as "active" | "investigating" | "resolved") ||
            "active",
          detected_at: new Date(row.created_at).toLocaleString("en-GB", {
            timeZone: "Asia/Jakarta",
          }),
          affected_tickets: row.num_tickets ?? 0,
          confidence: row.anomaly_score
            ? Math.round(row.anomaly_score)
            : 0,
          final_price: row.total_amount ?? 0,
        }));

        lastIdsRef.current = new Set(mapped.map((a) => a.id));
        setAnomalies(mapped);
      }

      setLoading(false);
    }

    fetchAnomalies();

    const channel = supabase
      .channel("anomalies-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload: { new: { id: string; fraud_flag: boolean; anomaly_score: number; num_tickets: number; review_status: string; created_at: string; anomaly_label_id: string | null; total_amount: number } }) => {
          if (!payload.new.fraud_flag) return;

          const anomaly: Anomaly = {
            id: payload.new.id,
            title: payload.new.anomaly_label_id
              ? `Pattern: ${payload.new.anomaly_label_id}`
              : "Unusual Transaction Pattern",
            description: "Automatically flagged by anomaly detection system",
            severity:
              payload.new.anomaly_score > 0.8
                ? "High"
                : payload.new.anomaly_score > 0.5
                ? "Medium"
                : "Low",
            status:
              (payload.new.review_status as
                | "active"
                | "investigating"
                | "resolved") || "active",
            detected_at: new Date(payload.new.created_at).toLocaleString(
              "en-GB",
              { timeZone: "Asia/Jakarta" }
            ),
            affected_tickets: payload.new.num_tickets ?? 0,
            confidence: payload.new.anomaly_score
              ? Math.round(payload.new.anomaly_score * 100)
              : 0,
            final_price: payload.new.total_amount ?? 0,
          };

          setAnomalies((prev) => [anomaly, ...prev]);

          if (!lastIdsRef.current.has(anomaly.id)) {
            lastIdsRef.current.add(anomaly.id);
            triggerHeboh(anomaly);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const triggerHeboh = (anomaly: Anomaly) => {
    // Show full-screen modal
    setHebohAnomaly(anomaly);

    // Browser notification
    if (Notification.permission === "granted") {
      new Notification("🚨 ANOMALY DETECTED!", {
        body: `${anomaly.title} (${anomaly.severity})`,
        icon: "/alert-icon.png",
      });
    } else {
      Notification.requestPermission();
    }

    // Auto hide modal after 5s
    setTimeout(() => setHebohAnomaly(null), 8000);
  };

  const activeCount = anomalies.filter((a) => a.status === "active").length;
  const investigatingCount = anomalies.filter(
    (a) => a.status === "investigating"
  ).length;
  const resolvedCount = anomalies.filter((a) => a.status === "resolved").length;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-auto p-6 lg:p-8 space-y-6">
        {/* Header and Stats Cards (No changes here) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Anomaly Detection
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and analysis of ticket anomalies
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Last 24 Hours
            </Button>
            <Button>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Run Analysis
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="rounded-lg bg-red-500/10 p-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Anomalies
                </p>
                <p className="text-2xl font-bold text-card-foreground">
                  {activeCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="rounded-lg bg-yellow-500/10 p-3">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Under Investigation
                </p>
                <p className="text-2xl font-bold text-card-foreground">
                  {investigatingCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-card-foreground">
                  {resolvedCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anomalies Table */}
        <Card className="shadow-sm relative">
          <CardHeader>
            <CardTitle>Detected Anomalies Log</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Loading anomalies...
              </p>
            ) : anomalies.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No anomalies detected.
              </p>
            ) : (
              <div className="overflow-x-auto relative">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="p-4 text-left font-medium">Transaction</th>
                      <th className="p-4 text-left font-medium">Detected At</th>
                      <th className="p-4 text-center font-medium">Tickets</th>
                      <th className="p-4 text-right font-medium">Price</th>
                      <th className="p-4 text-center font-medium">Severity</th>
                      <th className="p-4 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.map((anomaly) => (
                      <tr
                        key={anomaly.id}
                        className="border-b transition-colors hover:bg-muted/30"
                      >
                        <td className="p-4 text-left">
                          <div className="font-medium text-foreground">
                            {anomaly.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {anomaly.id}
                          </div>
                        </td>
                        <td className="p-4 text-left text-muted-foreground">
                          {anomaly.detected_at}
                        </td>
                        <td className="p-4 text-center font-medium text-foreground">
                          {anomaly.affected_tickets}
                        </td>
                        <td className="p-4 text-right font-medium text-foreground">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(anomaly.final_price)}
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-semibold capitalize",
                              anomaly.severity === "High" &&
                                "border-destructive/50 text-destructive",
                              anomaly.severity === "Medium" &&
                                "border-yellow-500/50 text-yellow-600",
                              anomaly.severity === "Low" &&
                                "border-blue-500/50 text-blue-600"
                            )}
                          >
                            {anomaly.severity} ({anomaly.confidence}%)
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            className={cn(
                              "w-32 justify-center capitalize",
                              anomaly.status === "active" &&
                                "bg-destructive text-destructive-foreground hover:bg-destructive/80",
                              anomaly.status === "investigating" &&
                                "bg-yellow-500 text-yellow-900 hover:bg-yellow-500/80",
                              anomaly.status === "resolved" &&
                                "bg-green-600 text-green-50 hover:bg-green-600/80"
                            )}
                          >
                            {anomaly.status === "active" && (
                              <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {anomaly.status === "investigating" && (
                              <Clock className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {anomaly.status === "resolved" && (
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {anomaly.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* HEBOH MODAL */}
      <AnimatePresence>
        {hebohAnomaly && (
          <>
            <Confetti />
            <motion.div
              key={hebohAnomaly.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-600/90 text-white p-8 text-center"
            >
              <h1 className="text-4xl font-extrabold animate-pulse">
                🚨 CALO DETECTED!! 🚨
              </h1>
              <p className="mt-4 text-2xl font-bold">
                {hebohAnomaly.title} ({hebohAnomaly.severity})
              </p>
              <p className="mt-2 text-lg">{hebohAnomaly.description}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
