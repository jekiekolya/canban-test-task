import { createTestServer } from '../utils/testServer'

let server: any
let prisma: any

beforeAll(async () => {
  const result = createTestServer()
  server = result.server
  prisma = result.prisma
  await result.startServer()
})

afterAll(async () => {
  await prisma.user.deleteMany()
  await prisma.$disconnect()
})

describe('Auth', () => {
  const testEmail = 'test@example.com'
  const testPassword = 'testpass123'
  let token = ''

  it('registers a user', async () => {
    const res = await server.executeOperation({
      query: `mutation Register($email: String!, $password: String!) {
        register(email: $email, password: $password)
      }`,
      variables: { email: testEmail, password: testPassword },
    })

    expect(res.body.singleResult.errors).toBeUndefined()
    expect(res.body.singleResult.data?.register).toBeTruthy()
    token = res.body.singleResult.data?.register
  })

  it('logs in a user', async () => {
    const res = await server.executeOperation({
      query: `mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password)
      }`,
      variables: { email: testEmail, password: testPassword },
    })

    expect(res.body.singleResult.errors).toBeUndefined()
    expect(res.body.singleResult.data?.login).toBeTruthy()
  })
})
