import Explorebtn from '@/components/Explorebtn';
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
    const response = await fetch(`${BASE_URL}/api/Events`, {
        next: { tags: ['events'] },
    });
    const {events} = await response.json();

    return (
        <section>
            <h1 className="text-center mt-8 mb-6">The Hub for every Dev<br /> you cant miss</h1>
            <p className="text-center mt-6 mb-8">Hackathons, Meet-ups, Conferences , All in one place</p>

        <Explorebtn/>

            <div className="mt-24 space-y-6">
                <h3>Featured events</h3>
                <ul className="events">
                    {events && events.length > 0 &&
                        events.map((event: IEvent) => (
                            <li key={event._id.toString()}>
                                <EventCard {...event} />
                            </li>
                        ))}
                </ul>
            </div>
        </section>
    )
}
export default Page
