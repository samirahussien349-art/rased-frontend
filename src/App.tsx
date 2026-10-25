
import { Navigate, Route, Routes } from 'react-router-dom'
import Upload from './upload'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route path="/performance" element={<Navigate to="/upload" replace />} />
      <Route path="/upload" element={<Upload />} />
      <Route
        path="*"
        element={
          <main dir="rtl" style={{ padding: '32px' }}>
            <Navigate to="/upload" replace />
          </main>
        }
      />
    </Routes>
  )
}
