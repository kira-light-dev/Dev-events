import Explorebtn from '@/components/Explorebtn';
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
    const response = await fetch(`${BASE_URL}/api/Events`);
    const {events} = await response.json();

    return (
        <section>
            <h1 className="text-center mt-5">The Hub for every Dev<br /> you cant miss</h1>
            <p className="text-center mt-5">Hackathons, Meet-ups, Conferences , All in one place</p>

        <Explorebtn/>

            <div className="mt-20 space-y-5">
                <h3>Featured events</h3>
                <ul className="events">
                    {events && events.length > 0 && events.map((event : IEvent) => (
                        <li key={event.title}>
                            <EventCard {...event} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
export default Page
