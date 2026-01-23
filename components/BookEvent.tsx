"use client";

import { useEffect, useState } from "react";
import { createBooking, getBookingsWithEvent } from "@/lib/actions/booking.actions";

const BookEvent = ({eventId, slug}: {eventId: string, slug: string}) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [bookings, setBookings] = useState<number | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            const result = await getBookingsWithEvent();
            if (result.success && Array.isArray(result.data)) {
                setBookings(result.data.length);
            }
        };

        fetchBookings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(false);
        setErrorMessage(null);

        const {success, error} = await createBooking({eventId, email, slug});

        if(success) {
            setSubmitted(true);
        } else {
            if (error === 'You have already booked this event') {
                setErrorMessage('You have already booked this event');
            } else {
                setErrorMessage('Something went wrong. Please try again.');
            }
        }
    };

    return (
        <div id="book-event">
            <div className="signup-card flex flex-col gap-5 p-6">
                <h2 className="mb-2">Book your spot</h2>

                {bookings !== null && bookings > 0 ? (
                    <p className="text-sm mb-3">
                        Join {bookings} people who have already booked their spot
                    </p>
                ) : bookings !== null ? (
                    <p className="text-sm mb-3">
                        Be the first to book your spot
                    </p>
                ) : (
                    <p className="text-sm mb-3">Loading booking info...</p>
                )}

                {submitted ? (
                    <p className="text-sm">Thank you for booking the event.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2.5">
                            <label htmlFor="email">Email address</label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                placeholder="Enter your email address"
                                onChange={(e) => setEmail(e.target.value)}
                                className="py-3 px-5 rounded-md"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-1 py-3 rounded-md"
                        >
                            Submit
                        </button>
                    </form>
                )}

                {errorMessage && !submitted && (
                    <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
                )}
            </div>
        </div>
    );
};

export default BookEvent;
