import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    artistId: string;
    artistName: string;
    price: number;
    initialPackage?: any;
}

const BookingModal = ({ isOpen, onClose, artistId, artistName, price: basePrice, initialPackage }: BookingModalProps) => {
    const [date, setDate] = useState<Date>();
    const [message, setMessage] = useState("");
    const [location, setLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const bookingPrice = initialPackage ? initialPackage.price : basePrice;

    const handleBooking = async () => {
        if (!date) {
            toast.error("Please select a date for the booking");
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
                    date,
                    message,
                    location,
                    pricingPackage: initialPackage
                })
            });

            if (response.ok) {
                setIsSuccess(true);
                toast.success("Booking request sent successfully!");
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setDate(undefined);
                    setMessage("");
                }, 2000);
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to create booking");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
                        <h3 className="text-xl font-bold">Booking Requested!</h3>
                        <p className="text-muted-foreground text-sm">
                            Your request for {artistName} has been sent. You will be notified once they confirm.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Book {artistName}</DialogTitle>
                            <DialogDescription>
                                Select a date and add an optional message for the artist.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Select Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                            disabled={(date) => date < new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
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
                                disabled={isSubmitting}
                                className="bg-gradient-saffron hover:opacity-90"
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
