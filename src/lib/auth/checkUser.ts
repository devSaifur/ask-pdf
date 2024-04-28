type User = {
  id: number
  name: string
  email: string
}

export async function checkUser(): Promise<User | null> {
  // TODO: check if user is authenticated
  // TODO: check if user is in the database

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          id: 1,
          name: 'John Doe',
          email: 'johndoe@example.com',
        }),
      500,
    ),
  )
}
