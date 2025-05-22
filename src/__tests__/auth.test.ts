import request from 'supertest'
import { createTestServer } from '../utils/testServer'

const { server, prisma } = createTestServer()

describe('Auth', () => {
  const testEmail = 'test@example.com'
  const testPassword = 'testpass123'
  let token = ''

  afterAll(async () => {
    await prisma.user.deleteMany()
  })

  it('registers a user', async () => {
    const res = await request(server)
      .post('/graphql')
      .send({
        query: `mutation { register(email: "${testEmail}", password: "${testPassword}") { token user { email } } }`,
      })

    expect(res.body.data.register.token).toBeTruthy()
    expect(res.body.data.register.user.email).toBe(testEmail)
    token = res.body.data.register.token
  })

  it('logs in a user', async () => {
    const res = await request(server)
      .post('/graphql')
      .send({
        query: `mutation { login(email: "${testEmail}", password: "${testPassword}") { token } }`,
      })

    expect(res.body.data.login.token).toBeTruthy()
  })
})