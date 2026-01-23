'use server';

import { cache } from 'react';
import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb';

export const getSimilarEventsBySlug = cache(
    async (slug: string) => {
        try {
            await connectDB();

            const event = await Event.findOne({ slug });

            if (!event) {
                return [];
            }

            return await Event.find({
                _id: { $ne: event._id },
                tags: { $in: event.tags },
            }).limit(3);
        } catch {
            return [];
        }
    }
);
