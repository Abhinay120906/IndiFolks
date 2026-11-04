import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CreditCard, MapPin, RefreshCw } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type Booking = {
  _id: string;
  artist: { _id: string; name: string; profileImage?: string; specialty?: string } | null;
  date: string;
  location: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded";
};
type Order = { keyId: string; orderId: string; bookingId: string; amount: number; currency: string };
type PaymentSuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = {
  key: string; order_id: string; amount: number; currency: string;
  name: string; description: string;
  handler: (response: PaymentSuccess) => void | Promise<void>;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
};
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}
const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function loadCheckout() {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => window.Razorpay ? resolve() : reject(new Error("Payment checkout unavailable"));
    script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export default function MyBookings() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || user?.role !== "customer") { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(apiUrl + "/api/bookings/my", {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not fetch bookings");
      if (!Array.isArray(data)) throw new Error("Unexpected bookings response");
      setBookings(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => { if (!authLoading) void fetchBookings(); }, [authLoading, fetchBookings]);

  const pay = async (booking: Booking) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in again");
    setPaying(booking._id);
    try {
      await loadCheckout();
      const orderRes = await fetch(apiUrl + "/api/payments/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ bookingId: booking._id })
      });
      const order: Order & { message?: string } = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.message || "Could not start payment");
      if (!window.Razorpay) throw new Error("Razorpay unavailable");
      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "IndiFolks",
        description: "Test payment for artist booking",
        theme: { color: "#e67e22" },
        modal: { ondismiss: () => setPaying(null) },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(apiUrl + "/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
              body: JSON.stringify({ bookingId: booking._id, ...response })
            });
            const result = await verifyRes.json();
            if (!verifyRes.ok || !result.success) throw new Error(result.message || "Payment verification failed");
            toast.success("Test payment verified — booking paid!");
            await fetchBookings();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment verification failed");
          } finally { setPaying(null); }
        }
      });
      checkout.open();
    } catch (error) {
      setPaying(null);
      toast.error(error instanceof Error ? error.message : "Could not open checkout");
    }
  };

  return <MainLayout>
    <main className="container py-12 min-h-[70vh]">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My bookings</h1>
          <p className="text-muted-foreground mt-2">Track artist requests and complete secure Razorpay test payments.</p>
        </div>
        <Button variant="outline" onClick={() => void fetchBookings()} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>
      {!user || user.role !== "customer" ?
        <Card><CardContent className="py-10 text-center">
          <p>Log in with a customer account to view your bookings.</p>
          <Button asChild className="mt-4"><Link to="/login">Log in</Link></Button>
        </CardContent></Card>
      : loading ? <p>Loading bookings…</p>
      : bookings.length === 0 ? <Card><CardContent className="py-12 text-center">
          <p>No bookings yet. Discover an artist to get started.</p>
          <Button asChild className="mt-4"><Link to="/artists">Find artists</Link></Button>
        </CardContent></Card>
      : <div className="grid gap-5 md:grid-cols-2">
          {bookings.map(booking => <Card key={booking._id}>
            <CardHeader>
              <div className="flex justify-between gap-3 items-start">
                <CardTitle className="text-xl">{booking.artist?.name || "Artist"}</CardTitle>
                <Badge variant={booking.paymentStatus === "paid" ? "default" : "outline"}>
                  {booking.paymentStatus === "paid" ? "Paid" : booking.status}
                </Badge>
              </div>
              {booking.artist?.specialty && <p className="text-sm text-muted-foreground">{booking.artist.specialty}</p>}
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="flex gap-2 items-center"><CalendarDays className="h-4 w-4"/> {new Date(booking.date).toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"})}</p>
              <p className="flex gap-2 items-center"><MapPin className="h-4 w-4"/> {booking.location}</p>
              <p className="text-lg font-semibold">₹{booking.price.toLocaleString("en-IN")}</p>
              {booking.status === "pending" && <p className="text-sm text-muted-foreground">Waiting for the artist to accept your request.</p>}
              {booking.status === "confirmed" && booking.paymentStatus === "unpaid" &&
                <Button onClick={() => void pay(booking)} disabled={paying !== null}>
                  <CreditCard className="h-4 w-4 mr-2" /> {paying === booking._id ? "Opening checkout…" : "Pay now (test mode)"}
                </Button>}
              {booking.paymentStatus === "paid" && <p className="text-sm text-green-700">Test payment confirmed.</p>}
              {booking.status === "cancelled" && <p className="text-sm text-muted-foreground">This booking was cancelled.</p>}
              {booking.artist?._id && <Button variant="outline" asChild><Link to={"/artists/" + booking.artist._id}>View artist</Link></Button>}
            </CardContent>
          </Card>)}
        </div>}
    </main>
  </MainLayout>;
}
