import { createTestServer } from '../utils/testServer'

let server: any
let prisma: any
let token = ''
let boardId = ''
let columnId = ''
let cardId = ''

beforeAll(async () => {
  const result = createTestServer()
  server = result.server
  prisma = result.prisma
  await result.startServer()

  const res = await server.executeOperation({
    query: `mutation {
      register(email: "test@kanban.com", password: "123456")
    }`,
  })

  token = res.body.singleResult.data?.register
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
    const res = await server.executeOperation(
      {
        query: `mutation {
        createBoard(title: "My Board") {
          id
          title
        }
      }`,
      },
      {
        contextValue: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      }
    )

    expect(res.body.singleResult.errors).toBeUndefined()
    expect(res.body.singleResult.data?.createBoard.title).toBe('My Board')
    boardId = res.body.singleResult.data?.createBoard.id
  })

  it('creates a column', async () => {
    const res = await server.executeOperation(
      {
        query: `mutation {
        createColumn(boardId: "${boardId}", title: "To Do", order: 0) {
          id
          title
        }
      }`,
      },
      {
        contextValue: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      }
    )

    expect(res.body.singleResult.errors).toBeUndefined()
    columnId = res.body.singleResult.data?.createColumn.id
  })

  it('creates a card', async () => {
    const res = await server.executeOperation(
      {
        query: `mutation {
        createCard(columnId: "${columnId}", title: "Test Card", order: 0) {
          id
          title
        }
      }`,
      },
      {
        contextValue: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      }
    )

    expect(res.body.singleResult.errors).toBeUndefined()
    cardId = res.body.singleResult.data?.createCard.id
  })
})
