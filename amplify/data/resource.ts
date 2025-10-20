/**
 * Data Resource - Not Used (Using Prisma instead)
 *
 * This project uses Prisma as the ORM/database layer.
 * Amplify Data is not used here.
 *
 * If you want to use Amplify Data in the future, uncomment below:
 *
 * import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
 *
 * const schema = a.schema({
 *   Todo: a.model({
 *     content: a.string(),
 *   }).authorization(allow => [allow.owner()]),
 * });
 *
 * export type Schema = ClientSchema<typeof schema>;
 *
 * export const data = defineData({
 *   schema,
 *   authorizationModes: {
 *     defaultAuthorizationMode: 'userPool',
 *   },
 * });
 */

// Export empty data config - using Prisma
export const data = null;
