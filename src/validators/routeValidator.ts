import { z } from 'zod';
import { MAP_NODES } from '../services/mapService';

const nodeKeys = Object.keys(MAP_NODES) as [string, ...string[]];

export const routeSchema = z.object({
  startNode: z.enum(nodeKeys, {
    errorMap: () => ({ message: 'Invalid start location selected' })
  }),
  endNode: z.enum(nodeKeys, {
    errorMap: () => ({ message: 'Invalid destination location selected' })
  })
}).refine(data => data.startNode !== data.endNode, {
  message: 'Start and destination cannot be the same',
  path: ['endNode']
});

export type RouteInput = z.infer<typeof routeSchema>;

export const validateRouteInput = (input: unknown) => {
  return routeSchema.safeParse(input);
};
