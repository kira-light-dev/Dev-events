import { notFound } from "next/navigation";
import BookEvent from "@/components/BookEvent";
import {IEvent} from "@/database";
import {getSimilarEventsBySlug} from "@/lib/event.actions";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
    <div className="flex flex-row gap-2 items-center">
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

// ---------- page ----------

const EventDetailsPage = async ({params}: { params: Promise<{ slug: string }>}) => {
    const { slug } = await params;

    const res = await fetch(`${BASE_URL}/api/Events/${slug}`);
    const { data: event } = await res.json();

    if (!event) notFound();

    const {
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
    } = event;

    if (!description) notFound();

    const similarEvents : IEvent[] = await getSimilarEventsBySlug(slug);

    return (
        <section id="event">
            {/* header */}
            <div className="header">
                <h1>Event description</h1>
                <p className="mt-2">{description}</p>
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
                    <section className="flex flex-col gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    {/* event details */}
                    <section className="flex flex-col gap-2">
                        <h2>Event details</h2>

                        <EventDetailItem
                            icon="/icons/cal.svg"
                            alt="calendar"
                            label={date}
                        />
                        <EventDetailItem
                            icon="/icons/clock.svg"
                            alt="time"
                            label={time}
                        />
                        <EventDetailItem
                            icon="/icons/pin.svg"
                            alt="location"
                            label={location}
                        />
                        <EventDetailItem
                            icon="/icons/mode.svg"
                            alt="mode"
                            label={mode}
                        />
                        <EventDetailItem
                            icon="/icons/audience.svg"
                            alt="audience"
                            label={audience}
                        />
                    </section>

                    {/* agenda */}
                    <EventAgenda agenda={agenda} />

                    {/* organizer */}
                    <section className="flex flex-col gap-2">
                        <h2>About the organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    {/* tags */}
                    <EventTags tags={tags} />
                </div>

                {/* right side booking */}
                <aside className="booking">
                    <BookEvent/>
                </aside>
            </div>

            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>

                <div className="events">
                    {similarEvents.length > 0 &&
                        similarEvents.map((similarEvent: IEvent) => (
                            <EventCard
                                key={similarEvent._id.toString()}
                                {...similarEvent}
                            />
                        ))}
                </div>

            </div>

        </section>
    );
};

export default EventDetailsPage;
