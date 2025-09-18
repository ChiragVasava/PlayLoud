import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        <Navbar />

        {/* Your main content goes here */}
        <main className="container mx-auto px-4 py-8">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to PlayLoud</h1>
            <p className="text-gray-300">Your favorite music streaming platform</p>
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}

export default App
