"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Clock,
  CreditCard,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient();

function InfoCard({
  title,
  children,
  icon: Icon,
  titleButton,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  titleButton?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-md">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Icon className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-card-foreground">{title}</h2>
        </div>
        {titleButton}
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

type TrainData = {
  name: string;
  class: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  class_id?: number;
};

type BookingSearchData = {
  operator: string;
  tripType: string;
  origin: string;
  destination: string;
  departure: string;
  returnDate: string;
  adults: string;
  infants: string;
};

function TripDetailCard({
  train,
  date,
  origin,
  destination,
  isReturn = false,
}: {
  train: TrainData;
  date: string;
  origin: string;
  destination: string;
  isReturn?: boolean;
}) {
  return (
    <div>
      <h3 className="font-bold text-lg text-foreground mb-2">
        {isReturn ? "Kereta Pulang" : "Kereta Pergi"}
      </h3>
      <div className="border border-border p-3 rounded-lg bg-muted/50 space-y-3">
        <p className="font-semibold text-card-foreground text-sm">{date}</p>
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-md text-primary">
            {train.name}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({train.class})
            </span>
          </h4>
          <p className="text-xs text-muted-foreground font-medium">
            Non-refundable
          </p>
        </div>
        <div className="flex items-center justify-between text-center">
          <div className="w-1/3">
            <p className="text-xl font-semibold text-card-foreground">
              {train.departureTime}
            </p>
            <p className="text-sm text-muted-foreground">{origin}</p>
          </div>
          <div className="w-1/3 flex flex-col items-center text-muted-foreground">
            <ArrowRight size={20} />
            <span className="text-xs mt-1 flex items-center gap-1">
              <Clock size={12} /> {train.duration}
            </span>
          </div>
          <div className="w-1/3">
            <p className="text-xl font-semibold text-card-foreground">
              {train.arrivalTime}
            </p>
            <p className="text-sm text-muted-foreground">{destination}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type AdultPassenger = {
  title: string;
  name: string;
  idType: "KTP" | "PASPOR";
  idValue: string;
  error: string;
};


function validateId(value: string, type: "KTP" | "PASPOR") {
  if (type === "KTP") {
    if (!/^\d{16}$/.test(value)) return "KTP harus 16 digit angka";
  } else {
    if (!/^[A-Z]\d{7,8}$/.test(value)) return "Format Paspor salah";
  }
  return "";
}

type BookingDetailsState = {
  searchData: BookingSearchData;
  departureTrain: TrainData;
  returnTrain: TrainData | null;
};

function BookingDetails() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetailsState | null>(null);
  const [adultPassengers, setAdultPassengers] = useState<AdultPassenger[]>([]);
  const [departureStationId, setDepartureStationId] = useState<number | null>(
    null
  );
  const [destinationStationId, setDestinationStationId] = useState<
    number | null
  >(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) setUserId(user.id);

      const params = new URLSearchParams(window.location.search);
      const departureTrainStr = params.get("departureTrain");
      const returnTrainStr = params.get("returnTrain");
      const departureTrainStation = params.get("origin");
      const destinationTrainStation = params.get("destination");

      if (departureTrainStation) {
        const { data } = await supabase
          .from("stations")
          .select("id")
          .eq("name", departureTrainStation)
          .maybeSingle();
        if (data) setDepartureStationId(data.id);
      }

      if (destinationTrainStation) {
        const { data } = await supabase
          .from("stations")
          .select("id")
          .eq("name", destinationTrainStation)
          .maybeSingle();
        if (data) setDestinationStationId(data.id);
      }

      params.delete("departureTrain");
      params.delete("returnTrain");

      const searchData: BookingSearchData = {
        operator: params.get("operator") ?? "",
        tripType: params.get("tripType") ?? "",
        origin: params.get("origin") ?? "",
        destination: params.get("destination") ?? "",
        departure: params.get("departure") ?? "",
        returnDate: params.get("returnDate") ?? "",
        adults: params.get("adults") ?? "1",
        infants: params.get("infants") ?? "0",
      };

      try {
        const departureTrain = departureTrainStr
          ? JSON.parse(departureTrainStr)
          : null;
        const returnTrain = returnTrainStr ? JSON.parse(returnTrainStr) : null;

        if (!departureTrain)
          return console.error("Data kereta keberangkatan tidak ditemukan.");

        setBookingDetails({ searchData, departureTrain, returnTrain });

        const adultsCount = parseInt(searchData.adults || "1");

        setAdultPassengers(
          Array.from({ length: adultsCount }).map(() => ({
            title: "Tn.",
            name: "",
            idType: "KTP" as const,
            idValue: "",
            error: "",
          }))
        );
      } catch (e) {
        console.error("Gagal mengurai data kereta dari URL:", e);
      }
    }

    init();
  }, []);

  if (!bookingDetails) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Memuat detail pemesanan...
      </div>
    );
  }

  const { searchData, departureTrain, returnTrain } = bookingDetails;
  const departurePrice = parseFloat(departureTrain.price) || 0;
  const returnPrice = parseFloat(returnTrain?.price) || 0;
  const totalPrice =
    (departurePrice + returnPrice) * parseInt(searchData.adults || "0");

  async function handleSubmit() {
    try {
      if (!departureStationId || !destinationStationId) {
        alert("ID stasiun belum siap, coba beberapa detik lagi.");
        return;
      }

      setLoading(true);
      setSuccess(false);

      const payload = {
        transaction_id: uuidv4(),
        user_id: userId || "669f08bf-6134-e352-9ac6-1c2e6930b3d0",
        price: totalPrice,
        num_tickets:
          parseInt(searchData.adults || "1") +
          parseInt(searchData.infants || "0"),
        ticket_class_id: departureTrain?.class_id || 1,
        discount_amount: 0,
        station_from_id: departureStationId,
        station_to_id: destinationStationId,
        payment_method_id: 2,
        booking_channel_id: 1,
        is_refund: 0,
        transaction_time: new Date().toISOString(),
        is_popular_route: 1,
        price_category: 0,
        tickets_category: 0,
        passenger_name: adultPassengers.map((p) => p.name),
        seat_number: adultPassengers.map((_, i) => `Seat-${i + 1}`),
      };

      const response = await fetch("http://127.0.0.1:8000/tickets/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("Booking response:", data);
      setSuccess(true);
      alert("Booking berhasil!");
    } catch (error) {
      console.error("Gagal melakukan booking:", error);
      alert("Booking gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted relative">
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-primary mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <p className="text-lg font-semibold text-gray-700">Loading...</p>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Details */}
          <InfoCard title="Detail Kontak" icon={User}>
            <p className="text-xs text-muted-foreground -mt-2">
              Detail Kontak (untuk E-tiket/Voucher)
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Tanpa gelar dan tanda baca"
                  className="mt-1 w-full p-2 border border-input rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Nomor Ponsel*
                </label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 border border-input rounded-l-md bg-background text-sm text-muted-foreground">
                    +62
                  </span>
                  <input
                    type="tel"
                    placeholder="cth. 812345678"
                    className="w-full p-2 border-t border-r border-b border-input rounded-r-md bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Email*
                </label>
                <input
                  type="email"
                  placeholder="cth. email@contoh.com"
                  className="mt-1 w-full p-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
          </InfoCard>

          {/* Passenger Details */}
          <InfoCard title="Detail Penumpang" icon={Users}>
            {adultPassengers.map((adult, idx) => (
              <div
                key={`adult-${idx}`}
                className="space-y-4 mb-6 border-b last:border-b-0 border-border pb-4 last:pb-0"
              >
                <p className="text-sm font-bold text-foreground">
                  Dewasa {idx + 1}
                </p>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Gelar*
                  </label>
                  <select
                    className="mt-1 w-full p-2 border border-input rounded-md bg-background"
                    value={adult.title}
                    onChange={(e) => {
                      const newAdults = [...adultPassengers];
                      newAdults[idx].title = e.target.value;
                      setAdultPassengers(newAdults);
                    }}
                  >
                    <option>Tn.</option>
                    <option>Ny.</option>
                    <option>Nn.</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Nama Lengkap*
                  </label>
                  <input
                    type="text"
                    placeholder="Tanpa gelar dan tanda baca"
                    className="mt-1 w-full p-2 border border-input rounded-md bg-background"
                    value={adult.name}
                    onChange={(e) => {
                      const newAdults = [...adultPassengers];
                      newAdults[idx].name = e.target.value;
                      setAdultPassengers(newAdults);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Tipe ID*
                  </label>
                  <select
                    className="mt-1 w-full p-2 border border-input rounded-md bg-background"
                    value={adult.idType}
                    onChange={(e) => {
                      const newAdults = [...adultPassengers];
                      newAdults[idx].idType = e.target.value as
                        | "KTP"
                        | "PASPOR";
                      newAdults[idx].idValue = "";
                      newAdults[idx].error = "";
                      setAdultPassengers(newAdults);
                    }}
                  >
                    <option value="KTP">KTP</option>
                    <option value="PASPOR">PASPOR</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    {adult.idType}*
                  </label>
                  <input
                    type="text"
                    placeholder={
                      adult.idType === "KTP"
                        ? "Contoh: 1234567890123456"
                        : "Contoh: A1234567"
                    }
                    value={adult.idValue}
                    onChange={(e) => {
                      const newAdults = [...adultPassengers];
                      newAdults[idx].idValue = e.target.value;
                      newAdults[idx].error = validateId(
                        e.target.value,
                        adult.idType
                      );
                      setAdultPassengers(newAdults);
                    }}
                    className={`mt-1 w-full p-2 border rounded-md bg-background ${
                      adult.error ? "border-red-500" : "border-input"
                    }`}
                  />
                  {adult.error && (
                    <p className="text-red-500 text-xs mt-1">{adult.error}</p>
                  )}
                </div>
              </div>
            ))}
          </InfoCard>
        </div>

        {/* Summary Right */}
        <div className="lg:col-span-1 space-y-8 sticky top-8">
          <InfoCard title="Rencana Perjalanan Anda" icon={Ticket}>
            <TripDetailCard
              train={departureTrain}
              date={searchData.departure}
              origin={searchData.origin}
              destination={searchData.destination}
            />
            {returnTrain && (
              <TripDetailCard
                train={returnTrain}
                date={searchData.returnDate}
                origin={searchData.destination}
                destination={searchData.origin}
                isReturn
              />
            )}
          </InfoCard>

          <InfoCard title="Ringkasan Harga" icon={CreditCard}>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-card-foreground">
                Total Harga
              </span>
              <span className="text-2xl font-extrabold text-primary">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalPrice)}
              </span>
            </div>
            <button
              className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 px-5 rounded-lg text-lg hover:bg-primary/90 transition-colors shadow-lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              Beli
            </button>
            {success && (
              <p className="mt-2 text-green-600 font-medium">
                Booking berhasil!
              </p>
            )}
          </InfoCard>
        </div>
      </main>
    </div>
  );
}

export default function YourBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Memuat...
        </div>
      }
    >
      <BookingDetails />
    </Suspense>
  );
}
