import EventCard from "@/components/EventCard"
import ExploreBtn from "@/components/ExploreBtn"
import { IEvent } from "@/database";
import { events } from "@/lib/constants"

const BASE_URL=process.env.NEXT_PUBLIC_BASE_URL;


export interface EventDTO {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}


const Page = async () => {

  const response=await fetch(`${BASE_URL}/api/event`);
  const {events}=await response.json();

  return (
      <section>
        <h1 className="text-center">
          The Hub for Every Dev <br /> Event You Can&apos;t Miss
        </h1>
        <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>
        <ExploreBtn/>

        <div className="mt-20 space-y-7">
          <h3>Featured Events</h3>

          <ul className="events list-none">
              {
                events.map((event:EventDTO)=>(
                  <li key={event.title}>
                    <EventCard {...event}/>
                  </li>
                ))
              }
          </ul>
        </div>
      </section>
  )
}

export default Page