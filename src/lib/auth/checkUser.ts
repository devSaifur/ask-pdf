type User = {
  id: string
  name: string
  email: string
}

export async function checkUser(): Promise<User | null> {
  return new Promise((resolve) =>
    resolve({
      id: 'iponyzy7bd6xt352cv0xgqas',
      name: 'Frank Auer',
      email: 'Kristofer.Swift@yahoo.com',
    }),
  )
}
