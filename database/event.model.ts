import mongoose, { Schema, Document, Model } from 'mongoose';

// Event document shape
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO date string (yyyy-mm-dd)
  time: string; // stored as HH:mm (24h)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper to create URL‑friendly slugs from titles
const createSlug = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-url-safe chars
    .replace(/\s+/g, '-') // spaces to dashes
    .replace(/-+/g, '-'); // collapse repeated dashes

// Normalize date input into ISO yyyy-mm-dd
const normalizeDate = (value: string): string => {
  const trimmed = value.trim();
  // If already looks like yyyy-mm-dd, accept
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid event date');
  }

  // toISOString() -> yyyy-mm-ddThh:mm:ss.sssZ, we keep just the date part
  return parsed.toISOString().slice(0, 10);
};

// Normalize time input into HH:mm (24h)
const normalizeTime = (value: string): string => {
  const trimmed = value.trim();

  // Already in HH:mm 24h
  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Try to parse using Date for looser inputs like "3pm", "15:30"
  const baseDate = new Date(`1970-01-01T${trimmed}`);
  if (!Number.isNaN(baseDate.getTime())) {
    const hours = baseDate.getHours().toString().padStart(2, '0');
    const minutes = baseDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  throw new Error('Invalid event time');
};

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true, // unique index for fast lookups
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    overview: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      trim: true,
    },
    audience: {
      type: String,
      required: true,
      trim: true,
    },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]): boolean => Array.isArray(arr) && arr.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]): boolean => Array.isArray(arr) && arr.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // createdAt / updatedAt managed by Mongoose
    strict: true,
  },
);

// Ensure unique index on slug at schema level
EventSchema.index({ slug: 1 }, { unique: true });

// Pre‑save hook: validate required strings, normalize date & time, generate slug
EventSchema.pre<IEvent>('save', function preSave(next) {
  try {
    const requiredStringFields: Array<keyof IEvent> = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'mode',
      'audience',
      'organizer',
    ];

    for (const field of requiredStringFields) {
      const value = this[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        return next(new Error(`Field "${String(field)}" is required and cannot be empty`));
      }
    }

    // Normalize date & time into consistent formats
    this.date = normalizeDate(this.date);
    this.time = normalizeTime(this.time);

    // Only regenerate slug if title has changed or slug is missing
    if (this.isModified('title') || !this.slug) {
      this.slug = createSlug(this.title);
    }

    return next();
  } catch (err) {
    return next(err as Error);
  }
});

// Use existing model if it is already compiled (hot‑reload safe)
export const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) || mongoose.model<IEvent>('Event', EventSchema);

export default Event;

