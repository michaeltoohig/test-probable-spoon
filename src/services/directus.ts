// import { authentication, createDirectus, rest, readItem, readItems  } from "@directus/sdk";
import { BaseStorage, Directus, ID } from '@directus/sdk';
import { authToken } from '../stores/authStore';

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

// NOTE: Adds reactivity to `authToken` in our app by explicitly accessing it.
class CustomStorage extends BaseStorage {
  get(key: string) {
    if (key === 'auth_token') return authToken.value;
    return localStorage.getItem(key);
  }
  set(key: string, value: string) {
    if (key === 'auth_token') return authToken.value = value;
    return localStorage.setItem(key, value);
  }
  delete(key: string) {
    if (key === 'auth_token') return authToken.value = null;
    return localStorage.removeItem(key);
  }
}

// const directus = createDirectus<Schema>(import.meta.env.VITE_DIRECTUS_URL).with(rest()).with(authentication());
// @ts-expect-error
const directus = new Directus<Schema>(import.meta.env.VITE_DIRECTUS_URL, {
  storage: new CustomStorage(),
});

export { directus };
