import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsContent = async ({
                                       params,
                                   }: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await params;

    return (
        <main>
            <Suspense fallback={<div>Loading ...</div>}>
                <EventDetails params={slug} />
            </Suspense>
        </main>
    );
};

const EventDetailsPage = ({
                              params,
                          }: {
    params: Promise<{ slug: string }>;
}) => {
    return (
        <Suspense fallback={<section id="event"><p>Loading event...</p></section>}>
            <EventDetailsContent params={params} />
        </Suspense>
    );
};

export default EventDetailsPage;
