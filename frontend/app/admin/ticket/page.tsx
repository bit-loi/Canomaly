"use client";

import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Download, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";

// Ticket type with station relations
type Ticket = {
  id: string;
  transaction_id: string;
  passenger_name: string;
  seat_number: string;
  price: number;
  final_price: number;
  status_id: number;
  created_at: string;
  ticket_class_id: number;
  station_from_id?: { id: number; name: string };
  station_to_id?: { id: number; name: string };
};

// ✨ HOOK: Debounces input to prevent excessive API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function TicketsLogPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search input
  const supabase = createClient();
  const pageSize = 10;

  // ✨ FIX: Corrected typo "Cending" -> "Pending"
  function getStatusInfo(status_id: number) {
    switch (status_id) {
      case 1:
        return {
          label: "Confirmed",
          className: "bg-green-600 text-green-50 hover:bg-green-600/80",
        };
      case 2:
        return {
          label: "Pending",
          className: "bg-yellow-500 text-yellow-900 hover:bg-yellow-500/80",
        };
      case 3:
        return {
          label: "Cancelled",
          className:
            "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        };
      default:
        return {
          label: "Unknown",
          className: "bg-muted text-muted-foreground",
        };
    }
  }

  // Reset page to 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("tickets")
        .select(
          `id, transaction_id, passenger_name, seat_number, price, final_price, status_id, created_at, ticket_class_id, station_from_id(id, name), station_to_id(id, name)`,
          { count: "exact" }
        );

      // ✨ FIX: Search is now performed on the database
      if (debouncedSearchQuery) {
        query = query.or(
          `transaction_id.ilike.%${debouncedSearchQuery}%,passenger_name.ilike.%${debouncedSearchQuery}%`
        );
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching tickets:", error.message);
      } else {
        setTickets((data as unknown as Ticket[]) || []);
        setTotalTickets(count || 0);
      }
      setLoading(false);
    }

    fetchTickets();
  }, [page, debouncedSearchQuery, supabase]);

  const totalPages = Math.ceil(totalTickets / pageSize);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <Header />
      <main className="flex-1 overflow-auto p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tickets Log</h1>
            <p className="text-muted-foreground">
              Complete history of all ticket transactions
            </p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Tickets</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID or Name..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border">
              {/* ✨ REBUILT: Switched to a semantic <table> for better structure */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th className="p-4 text-left font-medium">Ticket ID</th>
                    <th className="p-4 text-left font-medium">Booking Time</th>
                    <th className="p-4 text-left font-medium">Passenger</th>
                    <th className="p-4 text-left font-medium">Route</th>
                    <th className="p-4 text-center font-medium">Seat</th>
                    <th className="p-4 text-right font-medium">Price</th>
                    <th className="p-4 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <motion.tbody
                  className="divide-y"
                  variants={containerVariants}
                  initial="hidden"
                  animate={loading ? "hidden" : "visible"}
                >
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-muted-foreground"
                      >
                        Loading tickets...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-muted-foreground"
                      >
                        No tickets found.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => {
                      const status = getStatusInfo(ticket.status_id);
                      return (
                        <motion.tr
                          key={ticket.id}
                          variants={itemVariants}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-4 font-mono font-medium text-foreground whitespace-nowrap">
                            {ticket.transaction_id.split("-")[0]}...
                          </td>
                          <td className="p-4 text-muted-foreground whitespace-nowrap">
                            {new Date(ticket.created_at).toLocaleString(
                              "en-GB",
                              { timeZone: "Asia/Jakarta" }
                            )}
                          </td>
                          <td className="p-4 text-foreground truncate max-w-xs">
                            {ticket.passenger_name}
                          </td>
                          <td className="p-4 text-muted-foreground truncate max-w-xs">
                            {ticket.station_from_id?.name} →{" "}
                            {ticket.station_to_id?.name}
                          </td>
                          <td className="p-4 text-center text-muted-foreground">
                            {ticket.seat_number}
                          </td>
                          <td className="p-4 text-right font-medium text-foreground whitespace-nowrap">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(ticket.final_price ?? ticket.price)}
                          </td>
                          <td className="p-4 text-center">
                            <Badge
                              className={cn(
                                "w-24 justify-center",
                                status.className
                              )}
                            >
                              {status.label}
                            </Badge>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </motion.tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({totalTickets} tickets)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}