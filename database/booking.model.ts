import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import Event from './event.model';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Email validation regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster event-based queries
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => EMAIL_REGEX.test(email),
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook to validate that the referenced event exists
// Note: async middleware doesn't require next() - promise handles flow control
BookingSchema.pre('save', async function () {
  // Only validate eventId if it's new or modified
  if (this.isModified('eventId') || this.isNew) {
    const eventExists = await Event.findById(this.eventId);
    if (!eventExists) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
  }
});

// Prevent model recompilation in development with hot reload
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
