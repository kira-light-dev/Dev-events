"use client";

import { useState } from "react";

const BookEvent = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const bookings = 10;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    };

    return (
        <div id="book-event">
            <div className="signup-card flex flex-col gap-4 p-6">
                <h2 className="mb-1">Book your spot</h2>

                {bookings > 0 ? (
                    <p className="text-sm mb-2">
                        Join {bookings} people who have already booked their spot
                    </p>
                ) : (
                    <p className="text-sm mb-2">
                        Be the first to book your spot
                    </p>
                )}

                {submitted ? (
                    <p className="text-sm">Thank you for signing up</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email">Email address</label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                placeholder="Enter your email address"
                                onChange={(e) => setEmail(e.target.value)}
                                className="py-2 px-3 rounded-md"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-2 py-2 rounded-md"
                        >
                            Submit
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default BookEvent;
