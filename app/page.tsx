import Explorebtn from '@/components/Explorebtn';
import EventCard from "@/components/EventCard";
import {events} from '@/lib/constants';

const Page = () => {
    return (
        <section>
            <h1 className="text-center mt-5">The Hub for every Dev<br /> you cant miss</h1>
            <p className="text-center mt-5">Hackathons, Meet-ups, Conferences , All in one place</p>

        <Explorebtn/>

            <div className="mt-20 space-y-5">
                <h3>Featured events</h3>
                <ul className="events">
                    {events.map((event) => (
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
