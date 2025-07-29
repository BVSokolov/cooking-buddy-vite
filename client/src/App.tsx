import './App.css'
import {Home} from './Components/Home'
// import {Navbar} from './Components/Navigation/Navbar'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        {/* <Navbar /> */}
        <Home />
        app test
      </QueryClientProvider>
    </div>
  )
}

export default App
