import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsContent = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const slug  = params.then((p) => p.slug);

    return (
        <main>
            <Suspense fallback={<div>Loading ...</div>}>
                 <EventDetails params={slug} />
            </Suspense>
        </main>
    )
};


const EventDetailsPage = (props: { params: Promise<{ slug: string }> }) => {
    return (
        <Suspense fallback={<section id="event"><p>Loading event...</p></section>}>
          
            <EventDetailsContent {...props} />
        </Suspense>
    );
};

export default EventDetailsPage;
