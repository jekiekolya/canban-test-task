import { createTestServer } from '../utils/testServer'

let server: any
let prisma: any
let createTestContext: any
let createAuthenticatedContext: any
let token = ''
let boardId = ''
let columnId = ''
let cardId = ''

beforeAll(async () => {
  const result = createTestServer()
  server = result.server
  prisma = result.prisma
  createTestContext = result.createTestContext
  createAuthenticatedContext = result.createAuthenticatedContext

  // Register a test user
  const res = await server.executeOperation(
    {
      query: `mutation Register($email: String!, $password: String!) {
      register(email: $email, password: $password)
    }`,
      variables: { email: 'test@kanban.com', password: '123456' },
    },
    {
      contextValue: createTestContext(),
    }
  )

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
        query: `mutation CreateBoard($title: String!) {
        createBoard(title: $title) {
          id
          title
        }
      }`,
        variables: { title: 'My Board' },
      },
      {
        contextValue: createAuthenticatedContext(token),
      }
    )

    expect(res.body.singleResult.errors).toBeUndefined()
    expect(res.body.singleResult.data?.createBoard.title).toBe('My Board')
    boardId = res.body.singleResult.data?.createBoard.id
  })

  it('creates a column', async () => {
    const res = await server.executeOperation(
      {
        query: `mutation CreateColumn($boardId: String!, $title: String!, $order: Int!) {
        createColumn(boardId: $boardId, title: $title, order: $order) {
          id
          title
        }
      }`,
        variables: {
          boardId: boardId,
          title: 'To Do',
          order: 0,
        },
      },
      {
        contextValue: createAuthenticatedContext(token),
      }
    )

    expect(res.body.singleResult.errors).toBeUndefined()
    columnId = res.body.singleResult.data?.createColumn.id
  })

  it('creates a card', async () => {
    const res = await server.executeOperation(
      {
        query: `mutation CreateCard($columnId: String!, $title: String!, $order: Int!) {
        createCard(columnId: $columnId, title: $title, order: $order) {
          id
          title
        }
      }`,
        variables: {
          columnId: columnId,
          title: 'Test Card',
          order: 0,
        },
      },
      {
        contextValue: createAuthenticatedContext(token),
      }
    )

    expect(res.body.singleResult.errors).toBeUndefined()
    cardId = res.body.singleResult.data?.createCard.id
  })

  it('fails when unauthenticated', async () => {
    const res = await server.executeOperation(
      {
        query: `mutation CreateBoard($title: String!) {
        createBoard(title: $title) {
          id
          title
        }
      }`,
        variables: { title: 'Should Fail' },
      },
      {
        contextValue: createTestContext(), // No token provided
      }
    )

    expect(res.body.singleResult.errors).toBeDefined()
    expect(res.body.singleResult.errors[0].message).toContain('Not authenticated')
  })
})
