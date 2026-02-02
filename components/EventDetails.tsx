import { Suspense } from "react";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { getEventBySlug, getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { notFound } from "next/navigation";
import BookEvent from "@/components/BookEvent";

// ---------- reusable components ----------

const EventDetailItem = ({
                             icon,
                             alt,
                             label,
                         }: {
    icon: string;
    alt: string;
    label: string;
}) => (
    <div className="flex flex-row gap-2.5 items-center">
        <img src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({ agenda }: { agenda: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agenda.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div key={tag} className="pill">
                {tag}
            </div>
        ))}
    </div>
);

// ---------- similar events ----------

const SimilarEventsSection = async ({ slug }: { slug: string }) => {
    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

    if (!similarEvents || similarEvents.length === 0) return null;

    return (
        <div className="flex w-full flex-col gap-5 pt-24">
            <h2>Similar Events</h2>

            <div className="events">
                {similarEvents.map((similarEvent) => (
                    <EventCard
                        key={similarEvent._id?.toString() ?? similarEvent.slug}
                        {...similarEvent}
                    />
                ))}
            </div>
        </div>
    );
};

// ---------- main event details ----------

const EventDetails = async ({ slug }: { slug: string }) => {
    if (!slug) notFound();

    const event = await getEventBySlug(slug);
    if (!event || !event.description) notFound();

    const {
        title,
        description,
        image,
        overview,
        date,
        time,
        location,
        mode,
        audience,
        agenda,
        organizer,
        tags,
        _id,
    } = event;

    return (
        <section id="event">
            {/* header */}
            <div className="header">
                <h1>{title}</h1>
                <p className="mt-4">{description}</p>
            </div>

            {/* main layout */}
            <div className="details">
                {/* left content */}
                <div className="content">
                    <img
                        src={image}
                        alt="event banner"
                        width={800}
                        height={800}
                        className="banner"
                    />

                    {/* overview */}
                    <section className="flex flex-col gap-3">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    {/* event details */}
                    <section className="flex flex-col gap-3">
                        <h2>Event details</h2>

                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="time" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="location" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem
                            icon="/icons/audience.svg"
                            alt="audience"
                            label={audience}
                        />
                    </section>

                    {/* agenda */}
                    <EventAgenda agenda={agenda} />

                    {/* organizer */}
                    <section className="flex flex-col gap-3">
                        <h2>About the organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    {/* tags */}
                    <EventTags tags={tags} />
                </div>

                {/* right side booking */}
                <aside className="booking">
                    <BookEvent eventId={_id.toString()} slug={slug} />
                </aside>
            </div>

            {/* similar events */}
            <Suspense
                fallback={
                    <div className="flex w-full flex-col gap-5 pt-24">
                        <h2>Similar Events</h2>
                        <p>Loading similar events...</p>
                    </div>
                }
            >
                <SimilarEventsSection slug={slug} />
            </Suspense>
        </section>
    );
};

export default EventDetails;
