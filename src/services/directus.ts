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
  type: string;
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
  reported_by: string | undefined;
  date_reported: string;
  date_created: string | undefined;
}

interface Schema {
  Containers: Container[];
  Areas: Area[];
  Locations: Location[];
  MovementCodes: MovementCode[];
  Movements: Movement[];
}

// const directus = createDirectus<Schema>(import.meta.env.VITE_DIRECTUS_URL).with(rest()).with(authentication());
// @ts-expect-error
const directus = new Directus<Schema>(import.meta.env.VITE_DIRECTUS_URL);

export { directus };
