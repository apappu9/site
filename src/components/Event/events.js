export async function getEvents() {
  const data = await fetch('https://api.hackillinois.org/event/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const json = await data.json();
  return json.events;
}

/* Example return object:
[
  {
    dayOfWeek: "Friday",
    date: "February 28",
    events: [ ... ] // all the event objects occuring on this day
  },
  ...
]
*/
export function sortEventsIntoDays(events) {
  // separate events by day into a map like so {"2/28/2019": [], "3/1/2019": [], ...}
  const eventsByDay = new Map();
  events.forEach(event => {
    const dateString = new Date(event.startTime);
    if (eventsByDay.has(dateString)) {
      eventsByDay.set(dateString, [event]);
    } else {
      eventsByDay.get(dateString).push(event);
    }
  });

  // convert the map into an array of day objects
  const days = [];
  eventsByDay.entries().forEach(([dateString, events]) => {
    const date = new Date(dateString);
    days.push({
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long '}),
      date: date.toLocaleTimeString('en-US', { month: 'long', day: 'numeric' }),
      events,
    });
  });

  // sort the days in order (using the startTime of the first event on that day to prevent additional calculations)
  days.sort((a, b) => a.events[0].startTime - b.events[0].startTime);

  return days;
}


const MINUTES_BEFORE = 10;
let notificationTimeouts = [];

export function createNotifications(events, minutesBefore = MINUTES_BEFORE) {
  removeNotifications(); // remove old notification timeouts so that the user doesn't get two notifications
  events.forEach(event => {
    const timeToEvent = (event.startTime * 1000) - Date.now();
    const delay = timeToEvent - (minutesBefore * 60 * 1000);
    if (delay >= 0) { // make sure event hasn't already passed
      notificationTimeouts.push(setTimeout(() => new Notification(`${event.name} happening in 10 minutes!`), delay));
    }
  });
}

export function removeNotifications() {
  notificationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  notificationTimeouts = [];
}