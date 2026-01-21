import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { Event } from './event.model';

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailRegex =
  // Basic email format validation suitable for application-level checks
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // index on eventId for faster event-based queries
    },
    email: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string): boolean => emailRegex.test(value),
        message: 'Invalid email address',
      },
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
    strict: true,
  },
);

// Pre‑save validation: ensure referenced Event exists and email is valid
BookingSchema.pre<IBooking>('save', async function preSave(next) {
  try {
    if (!this.eventId) {
      return next(new Error('eventId is required'));
    }

    // Extra safety check for email beyond schema validator (guards programmatic assignments)
    if (!emailRegex.test(this.email)) {
      return next(new Error('Invalid email address'));
    }

    // Verify the referenced event exists before creating the booking
    const eventExists = await Event.exists({ _id: this.eventId }).lean().exec();
    if (!eventExists) {
      return next(new Error('Referenced event does not exist'));
    }

    return next();
  } catch (err) {
    return next(err as Error);
  }
});

export const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;

