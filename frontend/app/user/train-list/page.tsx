"use client";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Loader2,
  Tag,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Defines the structure for a single train schedule
type Train = {
  id: string;
  name: string;
  class: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  operator?: string;
  origin?: string;
  destination?: string;
  departure_date?: string;
};

// Generates mock train schedule data for demonstration
const generateFakeSchedules = (
  operator: string,
  origin: string,
  destination: string,
  date: string
): Train[] => {
  const schedules: Train[] = [];
  const count = Math.floor(Math.random() * (10 - 4 + 1)) + 4;

  const trainNamePrefixes = [
    "Argo",
    "Ekspres",
    "Laju",
    "Cepat",
    "Komuter",
    "Metro",
  ];
  const trainNameSuffixes = [
    "Pagi",
    "Sore",
    "Malam",
    "Selatan",
    "Utara",
    "Jaya",
  ];
  const classes = ["Ekonomi", "Bisnis", "Eksekutif"];

  let lastDepartureHour = 5;

  for (let i = 0; i < count; i++) {
    const departureMinutes = Math.floor(Math.random() * 60);
    const minuteIncrement = Math.floor(Math.random() * 90) + 30;

    const departureDate = new Date(
      `1970-01-01T${String(lastDepartureHour).padStart(2, "0")}:${String(
        departureMinutes
      ).padStart(2, "0")}:00`
    );
    departureDate.setMinutes(departureDate.getMinutes() + minuteIncrement);

    lastDepartureHour = departureDate.getHours();
    const finalDepartureMinutes = departureDate.getMinutes();

    if (lastDepartureHour > 22) break;

    const departureTime = `${String(lastDepartureHour).padStart(
      2,
      "0"
    )}:${String(finalDepartureMinutes).padStart(2, "0")}`;

    const durationHours = Math.floor(Math.random() * 2) + 1;
    const durationMinutes = Math.floor(Math.random() * 60);
    const duration = `${durationHours}h ${durationMinutes}m`;

    const arrivalDate = new Date(departureDate.getTime());
    arrivalDate.setHours(arrivalDate.getHours() + durationHours);
    arrivalDate.setMinutes(arrivalDate.getMinutes() + durationMinutes);

    const arrivalTime = `${String(arrivalDate.getHours()).padStart(
      2,
      "0"
    )}:${String(arrivalDate.getMinutes()).padStart(2, "0")}`;

    const trainClass = classes[Math.floor(Math.random() * classes.length)];
    let price;
    if (trainClass === "Eksekutif") {
      price = Math.floor(Math.random() * (35 - 25 + 1) + 25) * 10000;
    } else if (trainClass === "Bisnis") {
      price = Math.floor(Math.random() * (24 - 15 + 1) + 15) * 10000;
    } else {
      price = Math.floor(Math.random() * (14 - 8 + 1) + 8) * 10000;
    }

    schedules.push({
      id: `${operator.toUpperCase()}-${i + 1}-${date}`,
      name: `${
        trainNamePrefixes[Math.floor(Math.random() * trainNamePrefixes.length)]
      } ${
        trainNameSuffixes[Math.floor(Math.random() * trainNameSuffixes.length)]
      }`,
      class: trainClass,
      operator: operator.toUpperCase(),
      origin,
      destination,
      departure_date: date,
      departureTime,
      arrivalTime,
      duration,
      price,
    });
  }
  return schedules;
};

// UI component for a single train schedule card
function TrainCard({
  train,
  origin,
  destination,
  onSelect,
  isSelected,
}: {
  train: Train;
  origin: string;
  destination: string;
  onSelect: (train: Train) => void;
  isSelected: boolean;
}) {
  return (
    <div
      className={`border-2 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 bg-card ${
        isSelected ? "border-primary ring-2 ring-primary" : "border-border"
      }`}
    >
      <div className="p-5">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-primary">{train.name}</h3>
          <span className="bg-primary/10 text-primary font-semibold text-xs px-3 py-1 rounded-full">
            {train.class}
          </span>
        </div>
        <div className="flex items-center justify-between mt-4 text-center">
          <div className="w-1/3">
            <p className="text-2xl font-semibold text-card-foreground">
              {train.departureTime}
            </p>
            <p className="text-sm text-muted-foreground">{origin}</p>
          </div>
          <div className="w-1/3 flex flex-col items-center text-muted-foreground">
            <ArrowRight size={20} />
            <span className="text-xs mt-1">{train.duration}</span>
          </div>
          <div className="w-1/3">
            <p className="text-2xl font-semibold text-card-foreground">
              {train.arrivalTime}
            </p>
            <p className="text-sm text-muted-foreground">{destination}</p>
          </div>
        </div>
      </div>
      <div className="bg-muted p-4 flex justify-between items-center border-t-2 border-border">
        <p className="text-xl font-extrabold text-foreground">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(train.price)}
          <span className="text-sm font-medium text-muted-foreground">
            /pax
          </span>
        </p>
        <button
          onClick={() => onSelect(train)}
          disabled={isSelected}
          className="bg-primary text-primary-foreground font-bold py-2 px-5 rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg disabled:bg-muted-foreground disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSelected ? (
            <>
              <CheckCircle2 size={16} /> Terpilih
            </>
          ) : (
            "Pilih"
          )}
        </button>
      </div>
    </div>
  );
}

// Main logic component for fetching, displaying, and handling selections
function SearchResults() {
  const router = useRouter();
  const [searchData, setSearchData] = useState<{
    operator: string;
    tripType: string;
    origin: string;
    destination: string;
    departure: string;
    returnDate: string | null;
    adults: string;
    infants: string;
  } | null>(null);
  const [selectedDeparture, setSelectedDeparture] = useState<Train | null>(
    null
  );
  const [selectedReturn, setSelectedReturn] = useState<Train | null>(null);

  const [departureTrains, setDepartureTrains] = useState<Train[]>([]);
  const [returnTrains, setReturnTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = {
      operator: params.get("operator") || "N/A",
      tripType: params.get("tripType") || "N/A",
      origin: params.get("origin") || "N/A",
      destination: params.get("destination") || "N/A",
      departure: params.get("departure") || "N/A",
      returnDate: params.get("return"),
      adults: params.get("adults") || "0",
      infants: params.get("infants") || "0",
    };
    setSearchData(data);
  }, []);

  useEffect(() => {
    if (!searchData || searchData.origin === "N/A") return;

    setIsLoading(true);

    setTimeout(() => {
      const departureResults = generateFakeSchedules(
        searchData.operator,
        searchData.origin,
        searchData.destination,
        searchData.departure
      );
      setDepartureTrains(departureResults);

      if (searchData.tripType === "round-trip" && searchData.returnDate) {
        const returnResults = generateFakeSchedules(
          searchData.operator,
          searchData.destination,
          searchData.origin,
          searchData.returnDate
        );
        setReturnTrains(returnResults);
      }

      setIsLoading(false);
    }, 1000);
  }, [searchData]);

  const handleProceed = () => {
    if (!canProceed || !searchData) return;

    const params = new URLSearchParams();
    Object.entries(searchData).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });

    if (selectedDeparture) {
      params.append("departureTrain", JSON.stringify(selectedDeparture));
    }

    if (selectedReturn) {
      params.append("returnTrain", JSON.stringify(selectedReturn));
    }

    router.push(`/user/your-booking?${params.toString()}`);
  };

  if (!searchData) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Menganalisis pencarian Anda...
      </div>
    );
  }

  const totalPassengers =
    parseInt(searchData.adults) + parseInt(searchData.infants);
  const canProceed =
    searchData.tripType === "round-trip"
      ? selectedDeparture && selectedReturn
      : selectedDeparture;

  return (
    <div className="min-h-screen pb-32">
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-card p-5 rounded-xl shadow-md border border-border mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">
            {searchData.origin}{" "}
            <ArrowRight className="inline-block mx-2" size={24} />{" "}
            {searchData.destination}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground mt-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{searchData.departure}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{totalPassengers} Penumpang</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={16} />
              <span>{searchData.operator.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center p-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold text-foreground">
              Mencari perjalanan terbaik...
            </p>
            <p className="text-muted-foreground">Mohon tunggu sebentar.</p>
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Hasil Keberangkatan
              </h2>
              {departureTrains.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departureTrains.map((train) => (
                    <TrainCard
                      key={train.id}
                      train={train}
                      origin={searchData.origin}
                      destination={searchData.destination}
                      isSelected={selectedDeparture?.id === train.id}
                      onSelect={(selectedTrain) =>
                        setSelectedDeparture(selectedTrain)
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Tidak ada jadwal keberangkatan yang ditemukan untuk rute ini.
                </p>
              )}
            </section>

            {searchData.tripType === "round-trip" && searchData.returnDate && (
              <section className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Hasil Kepulangan
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar size={16} />
                    <span>{searchData.returnDate}</span>
                  </div>
                </div>
                {returnTrains.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {returnTrains.map((train) => (
                      <TrainCard
                        key={`${train.id}-return`}
                        train={train}
                        origin={searchData.destination}
                        destination={searchData.origin}
                        isSelected={selectedReturn?.id === train.id}
                        onSelect={(selectedTrain) =>
                          setSelectedReturn(selectedTrain)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Tidak ada jadwal kepulangan yang ditemukan untuk rute ini.
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {selectedDeparture && (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t-2 border-border shadow-2xl p-4 z-20">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-center md:text-left">
              <p className="font-bold text-foreground">
                Keberangkatan:{" "}
                <span className="font-normal text-primary">
                  {selectedDeparture.name} ({selectedDeparture.departureTime})
                </span>
              </p>
              {selectedReturn && (
                <p className="font-bold text-foreground">
                  Kepulangan:{" "}
                  <span className="font-normal text-primary">
                    {selectedReturn.name} ({selectedReturn.departureTime})
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg text-lg w-full md:w-auto hover:bg-primary/90 transition-colors shadow-lg disabled:bg-muted-foreground disabled:cursor-not-allowed"
            >
              Lanjutkan
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

// Default export for the page, wrapping the main component in Suspense
export default function TrainListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Memuat...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}