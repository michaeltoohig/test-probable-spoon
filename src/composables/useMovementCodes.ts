import { ref } from 'vue';
import { directus } from '../services/directus';
import type { MovementCode } from '../services/directus';

export default function useMovementCode() {
  const movementCodes = ref<MovementCode[]>([]);
  const promise = directus
    .items('MovementCodes')
    .readByQuery({
      limit: -1,
      // @ts-ignore
      fields: ['id', 'code'],
    })
    .then((resp: any) => {
      movementCodes.value = resp.data;
    });

  return { movementCodes, promise }
};