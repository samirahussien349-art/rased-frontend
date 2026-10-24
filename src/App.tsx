import './App.css'

function App() {
  return (
    <main className="rased-app">
      <header className="rased-header">
        <a className="rased-logo" href="/" aria-label="RASED Home">
          RASED
        </a>

        <span className="rased-tagline">
          AI-Powered Football Performance Analysis
        </span>
      </header>

      <section className="rased-welcome">
        <p className="rased-eyebrow">FOOTBALL INTELLIGENCE PLATFORM</p>

        <h1>
          Welcome to <span>RASED</span>
        </h1>

        <p className="rased-description">
          A platform for football performance analysis powered by computer
          vision and artificial intelligence.
        </p>

        <div className="rased-status">
          <span className="status-indicator" />
          Frontend foundation is ready
        </div>
      </section>

      <footer className="rased-footer">
        RASED · Football Performance Intelligence
      </footer>
    </main>
  )
}

export default App