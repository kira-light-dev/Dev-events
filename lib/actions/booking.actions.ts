'use server';

import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";

export const createBooking = async ({eventId, email, slug}: {eventId: string, email: string, slug: string}) => {
    try {
        await connectDB();

        // Defensive check to avoid duplicates before hitting the DB constraint
        const existing = await Booking.findOne({ eventId, email }).lean();
        if (existing) {
            return { success: false, error: 'You have already booked this event' };
        }

        const bookingDoc = await Booking.create({ eventId, email, slug });
        const bookingObj = bookingDoc.toObject();

        // Convert Mongoose ObjectIds and Dates to plain values for Next.js serialization
        const booking = {
            ...bookingObj,
            _id: bookingObj._id?.toString(),
            eventId: bookingObj.eventId?.toString(),
            createdAt: bookingObj.createdAt instanceof Date ? bookingObj.createdAt.toISOString() : bookingObj.createdAt,
            updatedAt: bookingObj.updatedAt instanceof Date ? bookingObj.updatedAt.toISOString() : bookingObj.updatedAt,
        };

        return { success: true, booking };
    } catch (error: unknown) {
        console.error(error);

        // Handle race-condition duplicates via unique index
        if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
            return { success: false, error: 'You have already booked this event' };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create booking',
        };
    }
};

export const getBookingsWithEvent = async () => {
    try {
        await connectDB();

        const bookings = await Booking.find()
            .populate('eventId', 'title slug _id')
            .lean();

        const safeBookings = bookings.map((booking: any) => ({
            ...booking,
            _id: booking._id?.toString(),
            createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
            updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : booking.updatedAt,
            eventId: booking.eventId
                ? {
                    ...booking.eventId,
                    _id: booking.eventId._id?.toString(),
                }
                : booking.eventId,
        }));

        return { success: true, data: safeBookings };
    } catch (error) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch bookings' };
    }
};