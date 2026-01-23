'use server';

import { cache } from 'react';
import Event, { IEvent } from '@/database/event.model';
import connectDB from '@/lib/mongodb';

export const getSimilarEventsBySlug = cache(
    async (slug: string) => {
        try {
            await connectDB();

            const event = await Event.findOne({ slug });

            if (!event) {
                return [];
            }

            const similarEvents = await Event.find({
                _id: { $ne: event._id },
                tags: { $in: event.tags },
                slug: { $exists: true, $ne: null, $ne: '' },
            })
                .select('title image slug location date time')
                .limit(3)
                .lean<IEvent[]>();

            return similarEvents;
        } catch {
            return [];
        }
    }
);
