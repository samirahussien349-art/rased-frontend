
import { Navigate, Route, Routes } from 'react-router-dom'
import Performance from './performance'
import Upload from './upload'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/performance" replace />} />
      <Route path="/performance" element={<Performance />} />
      <Route path="/upload" element={<Upload />} />
      <Route
        path="*"
        element={
          <main dir="rtl" style={{ padding: '32px' }}>
            <h1>الصفحة غير موجودة</h1>
            <a href="/performance">العودة إلى تحليل المباريات</a>
          </main>
        }
      />
    </Routes>
  )
}
