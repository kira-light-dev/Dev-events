'use server';

import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";

export const createBooking = async ({eventId, email, slug}: {eventId: string, email: string, slug: string}) => {
    try {
        await connectDB();

        const booking = (await Booking.create({eventId, email, slug})).lean();

        return {success : true, booking};
    } catch (error) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create booking' };
    }
}