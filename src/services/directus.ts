// import { authentication, createDirectus, rest, readItem, readItems  } from "@directus/sdk";
import { Directus, ID } from '@directus/sdk';

export interface Container {
  id: ID;
  code: string;
  type: string;
}

export interface Area {
  id: ID;
  name: string;
}

export interface Location {
  id: ID;
  name: string;
  area: Area;
}

export interface MovementCode {
  id: ID;
  name: string;
  code: string;
}

export interface Movement {
  id: ID;
  container: Container;
  location: Location;
  movement_code: MovementCode;
  reported_by: string;
  date_reported: string;
  date_created: string;
}

interface Schema {
  Containers: Container[];
  Areas: Area[];
  Locations: Location[];
  MovementCodes: MovementCode[];
  Movements: Movement[];
}

// const directus = createDirectus<Schema>(import.meta.env.VITE_DIRECTUS_URL).with(rest()).with(authentication());
const directus = new Directus<Schema>(import.meta.env.VITE_DIRECTUS_URL);

// const email = 'driver@example.com';
// const password = 'd1r3ctu5';
// await directus.auth.login({ email, password });

// const results = await directus.request(
//   readItems('Containers', {
//     fields: ['id', 'code'],
//   })
// );

// const results = await directus.items("Containers").readByQuery({ limit: -1 })
// console.log('x', results);

export { directus };
