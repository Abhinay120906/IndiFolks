import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CreditCard, MapPin, RefreshCw, ShieldCheck } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type Booking = {
  _id: string;
  artist: { _id: string; name: string; profileImage?: string; specialty?: string } | null;
  date: string;
  location: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "demo_paid" | "refunded";
  demoPaymentId?: string;
  demoPaidAt?: string;
};
type DemoResult = { success?: boolean; simulated?: boolean; message?: string; booking?: Booking };
const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export default function MyBookings() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || user?.role !== "customer") {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(apiUrl + "/api/bookings/my", {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not fetch bookings");
      if (!Array.isArray(data)) throw new Error("Unexpected bookings response");
      setBookings(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => { if (!authLoading) void fetchBookings(); }, [authLoading, fetchBookings]);

  const simulatePayment = async () => {
    const booking = selectedBooking;
    setSelectedBooking(null);
    if (!booking || paying) return;
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in again");
    setPaying(booking._id);
    try {
      const response = await fetch(apiUrl + "/api/demo-payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ bookingId: booking._id, acknowledgement: "SIMULATE" })
      });
      const data: DemoResult = await response.json();
      if (!response.ok || !data.success || !data.simulated) {
        throw new Error(data.message || "Demo transaction could not be recorded");
      }
      toast.success("Demo payment recorded — no real money charged");
      await fetchBookings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Demo payment failed");
    } finally {
      setPaying(null);
    }
  };

  return <MainLayout>
    <main className="container min-h-[70vh] py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My bookings</h1>
          <p className="mt-2 text-muted-foreground">Track your artist booking requests and practice the payment workflow.</p>
        </div>
        <Button variant="outline" onClick={() => void fetchBookings()} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="mb-7 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950" role="note">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">
          <strong>Thesis demonstration only.</strong> Payments on this page are simulated.
          No bank account, card, UPI, Razorpay transaction, or real money is involved.
          Demo transactions are recorded separately from real payments.
        </p>
      </div>

      {!user || user.role !== "customer" ?
        <Card><CardContent className="py-10 text-center">
          <p>Log in with a customer account to view your bookings.</p>
          <Button asChild className="mt-4"><Link to="/login">Log in</Link></Button>
        </CardContent></Card>
      : loading ? <p>Loading bookings…</p>
      : bookings.length === 0 ?
        <Card><CardContent className="py-12 text-center">
          <p>No bookings yet. Discover an artist to get started.</p>
          <Button asChild className="mt-4"><Link to="/artists">Find artists</Link></Button>
        </CardContent></Card>
      : <div className="grid gap-5 md:grid-cols-2">
          {bookings.map(booking => <Card key={booking._id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-xl">{booking.artist?.name || "Artist"}</CardTitle>
                <Badge variant={booking.paymentStatus === "demo_paid" ? "secondary" : "outline"}>
                  {booking.paymentStatus === "demo_paid"
                    ? "Demo paid"
                    : booking.paymentStatus === "paid"
                      ? "Gateway test paid"
                      : booking.status}
                </Badge>
              </div>
              {booking.artist?.specialty && <p className="text-sm text-muted-foreground">{booking.artist.specialty}</p>}
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {booking.location}</p>
              <p className="text-lg font-semibold">₹{booking.price.toLocaleString("en-IN")} <span className="text-xs font-normal text-muted-foreground">(demo amount)</span></p>
              {booking.status === "pending" && <p className="text-sm text-muted-foreground">Waiting for the artist to accept your request.</p>}
              {booking.status === "confirmed" && booking.paymentStatus === "unpaid" &&
                <Button onClick={() => setSelectedBooking(booking)} disabled={paying !== null}>
                  <CreditCard className="mr-2 h-4 w-4" /> {paying === booking._id ? "Recording…" : "Simulate payment — no money charged"}
                </Button>}
              {booking.paymentStatus === "demo_paid" &&
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                  <strong>Demo payment recorded.</strong> This is not a real transaction.
                  {booking.demoPaymentId && <p className="mt-1 break-all text-xs">Demo receipt: {booking.demoPaymentId}</p>}
                  {booking.status === "confirmed" && <p className="mt-1">Artist can now mark the event completed.</p>}
                </div>}
              {booking.paymentStatus === "paid" && <p className="text-sm text-green-700">Razorpay TEST transaction recorded. No real money was charged.</p>}
              {booking.status === "completed" && <p className="text-sm text-green-700">Booking marked completed.</p>}
              {booking.status === "cancelled" && <p className="text-sm text-muted-foreground">This booking was cancelled.</p>}
              {booking.artist?._id && <Button variant="outline" asChild><Link to={"/artists/" + booking.artist._id}>View artist</Link></Button>}
            </CardContent>
          </Card>)}
        </div>}
    </main>

    <AlertDialog open={selectedBooking !== null} onOpenChange={open => { if (!open) setSelectedBooking(null); }}>
      <AlertDialogContent className="border border-[#e5ddd3] bg-[#fffdfa] text-[#231f1b]">
        <AlertDialogHeader>
          <AlertDialogTitle>Simulate a payment?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-[#5e5348]">
            <span className="block">This is a demonstration for the IndiFolks thesis project.</span>
            <span className="block font-semibold text-[#231f1b]">
              Demo amount: ₹{selectedBooking?.price.toLocaleString("en-IN") ?? "0"}
            </span>
            <span className="block">Clicking confirm will record a simulated payment in your booking history. No payment gateway is contacted and no real money is charged or transferred.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={paying !== null}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={paying !== null} onClick={() => void simulatePayment()}>
            Confirm demo payment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </MainLayout>;
