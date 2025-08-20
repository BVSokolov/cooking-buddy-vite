import {QueryBuilder} from 'knex'

export const getFirstRow = async (queryFn: QueryBuilder, column?: string) => {
  console.log(`[getFirstRow] query ${queryFn.toString()} column ${column}`)
  const res = await queryFn
  console.log('result is', res)
  return res[0] ? (column ? res[0][column] : res[0]) : undefined
}

export const gotFirstRow = async (queryFn: QueryBuilder, column?: string) => {
  const res = await getFirstRow(queryFn, column)
  if (!res) throw new Error(`expected a return value from query ${queryFn.toString()}, got ${res}`)
  return res
}
