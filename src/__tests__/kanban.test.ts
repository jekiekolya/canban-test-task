import request from 'supertest'
import { createTestServer } from '../utils/testServer'

let token = ''
let boardId = ''
let columnId = ''
let cardId = ''

const { server, prisma, startServer } = createTestServer()

beforeAll(async () => {
  await startServer()
  const res = await request(server).post('/graphql').send({
    query: `mutation { register(email: "test@kanban.com", password: "123456") { token } }`,
  })
  token = res.body.data.register.token
})

afterAll(async () => {
  await prisma.card.deleteMany()
  await prisma.column.deleteMany()
  await prisma.board.deleteMany()
  await prisma.user.deleteMany()
  await prisma.$disconnect()
})

describe('Kanban Flow', () => {
  it('creates a board', async () => {
    const res = await request(server)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `mutation { createBoard(title: "My Board") { id title } }`,
      })
    expect(res.body.data.createBoard.title).toBe('My Board')
    boardId = res.body.data.createBoard.id
  })

  it('creates a column', async () => {
    const res = await request(server)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `mutation { createColumn(boardId: "${boardId}", title: "To Do") { id title } }`,
      })
    expect(res.body.data.createColumn.title).toBe('To Do')
    columnId = res.body.data.createColumn.id
  })

  it('creates a card', async () => {
    const res = await request(server)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `mutation { createCard(columnId: "${columnId}", content: "Test task") { id content } }`,
      })
    expect(res.body.data.createCard.content).toBe('Test task')
    cardId = res.body.data.createCard.id
  })
})
