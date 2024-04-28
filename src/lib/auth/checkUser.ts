type User = {
  id: string
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
          id: 'ofj9ftiiu2fh818xco8fl3mx',
          name: 'Frank Auer',
          email: 'Kristofer.Swift@yahoo.com',
        }),
      500,
    ),
  )
}
