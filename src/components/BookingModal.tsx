import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    artistId: string;
    artistName: string;
    price: number;
    selectedDate: Date | null;
    onAvailabilityChanged?: () => void;
    initialPackage?: any;
}

const BookingModal = ({ isOpen, onClose, artistId, artistName, price: basePrice, selectedDate, onAvailabilityChanged, initialPackage }: BookingModalProps) => {
    const [message, setMessage] = useState("");
    const [location, setLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const bookingPrice = initialPackage ? initialPackage.price : basePrice;

    const handleBooking = async () => {
        if (!selectedDate) {
            toast.error("Select an available date on the artist calendar first");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Please login to book an artist");
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    artistId,
                    date: format(selectedDate, "yyyy-MM-dd"),
                    message,
                    location,
                    pricingPackage: initialPackage
                })
            });

            if (response.ok) {
                setIsSuccess(true);
                onAvailabilityChanged?.();
                toast.success("Booking request sent successfully!");
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setMessage("");
                    setLocation("");
                }, 2000);
            } else {
                const data = await response.json().catch(() => ({}));
                toast.error(data.message || "Failed to create booking");
                if (response.status === 409) {
                    onAvailabilityChanged?.();
                    onClose();
                }
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#e5ddd3] bg-[#fffdfa] p-6 text-[#231f1b] shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:max-w-[460px]">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
                        <h3 className="text-xl font-bold">Booking Requested!</h3>
                        <p className="text-muted-foreground text-sm">
                            Your request for {artistName} has been sent. Once the artist accepts, visit My bookings to simulate a payment. No money will be charged.
                        </p>
                        <Button asChild className="mt-5"><Link to="/bookings" onClick={onClose}>View my bookings</Link></Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Book {artistName}</DialogTitle>
                            <DialogDescription>
                                Confirm the date chosen on the calendar, then provide your event location.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Selected event date</label>
                                <div className="flex items-center gap-3 rounded-xl border border-[#e5ddd3] bg-[#f6f1e9] p-3 text-[#231f1b]">
                                    <CalendarIcon className="h-5 w-5 text-[#c86432]" />
                                    <span className="font-semibold">{selectedDate ? format(selectedDate, "PPPP") : "Select a green date on the calendar"}</span>
                                </div>
                                <p className="text-xs text-[#695f54]">To change the date, close this form and select another day on the calendar.</p>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Event Location</label>
                                <Input
                                    placeholder="Enter venue address or 'Virtual'"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Message (Optional)</label>
                                <Textarea
                                    placeholder="Tell the artist about your event..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="resize-none"
                                />
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                                <div className="flex flex-col gap-1">
                                    {initialPackage && (
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Package</span>
                                            <span>{initialPackage.name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span>Total Price</span>
                                        <span className="font-semibold">₹{bookingPrice.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button
                                onClick={handleBooking}
                                disabled={isSubmitting || !selectedDate || !location.trim()}
                                className="bg-[#c86432] text-white hover:bg-[#ab4e20] focus-visible:ring-[#c86432]"
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Confirm Booking
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;
