import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: ['online', 'offline', 'hybrid'],
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'Agenda must have at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'Tags must have at least one item',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

/**
 * Generates a URL-friendly slug from a title
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Normalizes date string to ISO format (YYYY-MM-DD)
 * Throws error if date is invalid
 */
function normalizeDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return parsed.toISOString().split('T')[0];
}

/**
 * Normalizes time to 24-hour format (HH:MM)
 * Accepts various formats like "2:30 PM", "14:30", "2:30pm"
 */
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim().toUpperCase();
  
  // Match patterns like "2:30 PM", "14:30", "2:30PM"
  const match12Hour = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  const match24Hour = trimmed.match(/^(\d{1,2}):(\d{2})$/);

  let hours: number;
  let minutes: number;

  if (match12Hour) {
    hours = parseInt(match12Hour[1], 10);
    minutes = parseInt(match12Hour[2], 10);
    const period = match12Hour[3];

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  } else if (match24Hour) {
    hours = parseInt(match24Hour[1], 10);
    minutes = parseInt(match24Hour[2], 10);
  } else {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values: ${timeStr}`);
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Pre-save hook for slug generation and date/time normalization
// Note: async middleware doesn't require next() - promise handles flow control
EventSchema.pre('save', async function () {
  // Only regenerate slug if title is new or modified
  if (this.isModified('title') || this.isNew) {
    let baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness by appending counter if needed
    const Event = this.constructor as Model<IEvent>;
    while (await Event.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }

  // Normalize date to ISO format
  if (this.isModified('date') || this.isNew) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time to 24-hour format
  if (this.isModified('time') || this.isNew) {
    this.time = normalizeTime(this.time);
  }
});

// Prevent model recompilation in development with hot reload
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
