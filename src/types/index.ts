import type { User } from 'next-auth'

type NonNullableProperties<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

export type ENV = {
  Variables: {
    userId: NonNullableProperties<Required<User>>['id']
    user: NonNullableProperties<Required<User>>
  }
}
