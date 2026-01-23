import {NextRequest,NextResponse } from 'next/server';
import {v2 as cloudinary} from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();
        const event = Object.fromEntries(formData.entries());

        // FIX TYPES
        if (typeof event.tags === 'string') {
            event.tags = JSON.parse(event.tags);
        }

        if (typeof event.agenda === 'string') {
            event.agenda = JSON.parse(event.agenda);
        }


        const file = formData.get('image') as File;
        if (!file) {return NextResponse.json({message : "Image not found"},{status : 400})}

        const tags = JSON.parse(formData.get('tags') as string);
        const agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({resource_type: 'image', folder: 'DevEvent'},(error, result) => {
                if (error) {return reject(error);}

                resolve(result)
            }).end(buffer);
        });

        event.image =(uploadResult as{secure_url : string}).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        const { revalidateTag, revalidatePath } = await import('next/cache');
        revalidateTag('events');
        revalidatePath('/');

        return NextResponse.json(createdEvent, { status: 201 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            {
                message: 'Event creation failed',
                error: err instanceof Error ? err.message : 'unknown',
            },
            { status: 400 }
        );
    }
}

export async function GET(){
    try{
        await connectDB();
        const events = await Event.find().sort({createdAt: -1});

        const response = NextResponse.json({message : "Events fetched successfully", events}, {status : 200});
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        return response;
    }catch(err){
        console.error(err);
        return NextResponse.json({message:"Event creation failed", error: err},{status : 500});
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get('id');

        if (!eventId) {
            return NextResponse.json(
                { message: 'Event ID is required' },
                { status: 400 }
            );
        }

        const deletedEvent = await Event.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            return NextResponse.json(
                { message: 'Event not found' },
                { status: 404 }
            );
        }

        const { revalidateTag, revalidatePath } = await import('next/cache');
        revalidateTag('events');
        revalidateTag(`event-${deletedEvent.slug}`);
        revalidatePath('/');
        revalidatePath(`/events/${deletedEvent.slug}`);

        return NextResponse.json(
            { message: 'Event deleted successfully', deletedEvent },
            { status: 200 }
        );
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            {
                message: 'Event deletion failed',
                error: err instanceof Error ? err.message : 'unknown',
            },
            { status: 500 }
        );
    }
}

// route that accepts a slug as input -> return the event details