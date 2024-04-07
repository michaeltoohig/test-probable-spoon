import { ref } from 'vue';
import { directus } from '../services/directus';
import type { Container } from '../services/directus';

export default function useContainer() {
  const containers = ref<Container[]>([]);
  const promise = directus
    .items('Containers')
    .readByQuery({
      limit: -1,
      // @ts-ignore
      fields: ['id', 'code', 'type'],
      // @ts-ignore
      sort: 'code',
    })
    .then((resp: any) => {
      containers.value = resp.data;
    });
  
  return { containers, promise }
};