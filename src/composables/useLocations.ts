import { computed, ref } from 'vue';
import type { Area, Location } from '../services/directus';
import { directus } from '../services/directus';

export default function useLocations() {
  const locations = ref<Location[]>([]);
  const promise = directus
    .items('Locations')
    .readByQuery({
      limit: -1,
      // @ts-ignore
      fields: ['id', 'name', 'area.id', 'area.name', 'type'],
      // @ts-ignore
      sort: 'name',
    })
    .then((resp: any) => {
      locations.value = resp.data;
    });

  const areas = computed((): Area[] => {
    if (!locations.value) return []
    return locations.value.reduce((acc: Area[], loc: Location) => {
      if (!acc.some((i) => i.id === loc.area.id)) {
        acc.push(loc.area);
      }
      return acc;
    }, []);
  });

  return { areas, locations, promise }
}
