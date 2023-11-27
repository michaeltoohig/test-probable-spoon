// import { authentication, createDirectus, rest, readItem, readItems  } from "@directus/sdk";
import { Directus  } from "@directus/sdk";


interface Container {
  id: string;
  code: string;
  type: string;
}

interface Schema {
  containers: Container[];
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

export {
  directus,
};