import {QueryBuilder} from 'knex'

export const getFirstRow = async (queryFn: QueryBuilder, column?: string) => {
  console.log('in getFirstRow util column is', column)
  const res = await queryFn
  console.log('result is', res)
  if (!res[0]) throw new Error(`expected a return value from query, got ${res}`)
  return column ? res[0][column] : res[0]
}
