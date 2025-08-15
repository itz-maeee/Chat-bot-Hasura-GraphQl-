import { useState, useEffect } from 'react'
import { useNhostClient, useFileUpload } from '@nhost/react'

const deleteTodo = `
    mutation($id: uuid!) {
      delete_todos_by_pk(id: $id) {
        id
      }
    }
  `
const createTodo = `
    mutation($title: String!, $file_id: uuid) {
      insert_todos_one(object: {title: $title, file_id: $file_id}) {
        id
      }
    }
  `
const getTodos = `
    query {
      todos {
        id
        title
        file_id
        completed
      }
    }
  `

export default function Todos() {
  const [loading, setLoading] = useState(true)
  const [todos, setTodos] = useState([])

  const [todoTitle, setTodoTitle] = useState('')
  const [todoAttachment, setTodoAttachment] = useState(null)
  const [fetchAll, setFetchAll] = useState(false)

  const nhostClient = useNhostClient()
  const { upload } = useFileUpload()

  useEffect(() => {
    async function fetchTodos() {
      setLoading(true)
      const { data, error } = await nhostClient.graphql.request(getTodos)

      if (error) {
        console.error({ error })
        return
      }

      setTodos(data.todos)
      setLoading(false)
    }

    fetchTodos()

    return () => {
      setFetchAll(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll])

  const handleCreateTodo = async (e) => {
    e.preventDefault()

    let todo = { title: todoTitle }
    if (todoAttachment) {
      const { id, error } = await upload({
        file: todoAttachment,
        name: todoAttachment.name
      })

      if (error) {
        console.error({ error })
        return
      }

      todo.file_id = id
    }

    const { error } = await nhostClient.graphql.request(createTodo, todo)

    if (error) {
      console.error({ error })
    }

    setTodoTitle('')
    setTodoAttachment(null)
    setFetchAll(true)
  }

  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this TODO?')) {
      return
    }

    const todo = todos.find((todo) => todo.id === id)
    if (todo.file_id) {
      await nhostClient.storage.delete({ fileId: todo.file_id })
    }

    const { error } = await nhostClient.graphql.request(deleteTodo, { id })
    if (error) {
      console.error({ error })
    }

    setFetchAll(true)
  }

  const completeTodo = async (id) => {
    const { error } = await nhostClient.graphql.request(
      `
      mutation($id: uuid!) {
        update_todos_by_pk(pk_columns: {id: $id}, _set: {completed: true}) {
          completed
        }
      }
    `,
      { id }
    )

    if (error) {
      console.error({ error })
    }

    setFetchAll(true)
  }

  const openAttachment = async (todo) => {
    const { presignedUrl, error } = await nhostClient.storage.getPresignedUrl({
      fileId: todo.file_id
    })

    if (error) {
      console.error({ error })
      return
    }

    window.open(presignedUrl.url, '_blank')
  }

  return (
    <>
      <div className="container">
        <div className="form-section">
          <h2>Add a new TODO</h2>
          <form onSubmit={handleCreateTodo}>
            <div className="input-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                placeholder="Title"
                value={todoTitle}
                onChange={(e) => setTodoTitle(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="file">File (optional)</label>
              <input id="file" type="file" onChange={(e) => setTodoAttachment(e.target.files[0])} />
            </div>
            <div className="submit-group">
              <button type="submit" disabled={!todoTitle}>
                Add Todo
              </button>
            </div>
          </form>
        </div>
        <div className="todos-section">
          {(!loading &&
            todos.map((todo) => (
              <div className="todo-item" key={todo.id ?? 0}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  disabled={todo.completed}
                  id={`todo-${todo.id}`}
                  onChange={() => completeTodo(todo.id)}
                />
                {todo.file_id && (
                  <span>
                    <a onClick={() => openAttachment(todo)}> Open Attachment</a>
                  </span>
                )}
                <label htmlFor={`todo-${todo.id}`} className="todo-title">
                  {todo.completed && <s>{todo.title}</s>}
                  {!todo.completed && todo.title}
                </label>
                <button type="button" onClick={() => handleDeleteTodo(todo.id)}>
                  Delete
                </button>
              </div>
            ))) || (
            <div className="todo-item">
              <label className="todo-title">Loading...</label>
            </div>
          )}
        </div>
      </div>

      <div className="sign-out-section">
        <button type="button" onClick={() => nhostClient.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </>
  )
}