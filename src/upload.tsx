import { useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import { analyzePlayer, confirmUpload, createAnalysis, getAnalysis, requestUploadUrl, uploadToSignedUrl, type AnalysisStatus } from './services/videoAnalysis'
import './upload.css'

const advice = [
  ['زاوية الكاميرا المرتفعة (High Angle)', 'كاميرا علوية تكتيكية أو بث تلفزيوني يغطي ثلثي الملعب على الأقل لضمان رصد تموضع اللاعبين.'],
  ['ثبات الإطار وتجنب التقريب (No Zoom)', 'تثبيت حامل الكاميرا وتجنب الاهتزاز المفاجئ للحفاظ على المرجع المكاني.'],
  ['وضوح خطوط الملعب (Homography)', 'وضوح خطوط التماس ومنطقة الجزاء لمعايرة الإحداثيات الهندسية.'],
  ['تباين أرقام القمصان وإضاءة الملعب', 'إضاءة كافية لتمييز اللاعبين بدقة.'],
]

function UploadCloud() { return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 34h22a8 8 0 0 0 .7-16 12 12 0 0 0-23.2 2.1A7 7 0 0 0 13 34Z"/><path d="m18 25 6-6 6 6M24 19v15"/></svg> }

const formatSize = (size: number) => size >= 1024 ** 3 ? `${(size / 1024 ** 3).toFixed(2)} GB` : `${(size / 1024 ** 2).toFixed(1)} MB`

export default function Upload() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('اختر فيديو المباراة للبدء')
  const [analysis, setAnalysis] = useState<AnalysisStatus | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [playerResult, setPlayerResult] = useState<unknown>(null)

  useEffect(() => {
    if (!analysis || ['COMPLETED', 'FAILED'].includes(analysis.status)) return
    const timer = window.setTimeout(async () => {
      try { setAnalysis(await getAnalysis(analysis.analysisId)) }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر جلب حالة التحليل.') }
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [analysis])

  const choose = (candidate?: File) => {
    setError('')
    if (!candidate) return
    if (!['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(candidate.type) && !/\.(mp4|mov|avi)$/i.test(candidate.name)) { setError('الصيغ المدعومة هي MP4 وMOV وAVI.'); return }
    if (candidate.size > 2 * 1024 ** 3) { setError('الحد الأقصى لحجم الفيديو هو 2 جيجابايت.'); return }
    setFile(candidate); setAnalysis(null); setProgress(0); setPlayerResult(null)
  }

  const start = async () => {
    if (!file || busy) return
    setBusy(true); setError(''); setAnalysis(null); setProgress(0)
    try {
      setStage('جارٍ طلب رابط الرفع من الخادم…')
      const { videoId, uploadUrl } = await requestUploadUrl(file)
      setStage('جارٍ رفع الفيديو إلى التخزين…')
      await uploadToSignedUrl(uploadUrl, file, setProgress)
      setStage('جارٍ تأكيد رفع الفيديو…')
      await confirmUpload(videoId)
      setStage('جارٍ إنشاء التحليل…')
      const created = await createAnalysis(videoId)
      setStage('التحليل قيد المعالجة')
      setAnalysis({ ...created, status: created.status || 'PENDING' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إكمال رفع الفيديو والتحليل.')
      setStage('تعذر إكمال العملية')
    } finally { setBusy(false) }
  }

  const runPlayerAnalysis = async () => {
    if (!analysis || !playerId.trim()) return
    setBusy(true); setError(''); setPlayerResult(null)
    try { setPlayerResult(await analyzePlayer(analysis.analysisId, playerId.trim())) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تحليل اللاعب.') }
    finally { setBusy(false) }
  }

  return <div className="upload-layout" dir="rtl"><Sidebar active="upload"/><main className="upload-main">
    <header className="upload-heading"><div><div className="upload-eyebrow">▣ المرصد التكتيكي • وحدة استيراد الوسائط</div><h1>رفع فيديو المباراة</h1><p>ارفع تسجيل اللقاء لبدء التحليل من خلال الخادم.</p></div><span className="ready-label"><i/> جاهز لرفع الفيديو</span></header>
    <nav className="upload-steps">{[['١','الخطوة الأولى','رفع ملف الفيديو'],['٢','الخطوة الثانية','معاينة الملف ورفعه'],['٣','الخطوة الثالثة','معالجة التحليل'],['٤','الخطوة الرابعة','تحليل لاعب']].map(([n,title,subtitle],index)=><div className={`upload-step ${index===0?'step-current':''}`} key={n}><span>{n}</span><div><b>{title}</b><small>{subtitle}</small></div></div>)}</nav>
    <div className="upload-workspace"><section className={`drop-panel ${dragging?'is-dragging':''}`} onDragOver={event=>{event.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={event=>{event.preventDefault();setDragging(false);choose(event.dataTransfer.files[0])}}><input ref={fileInput} hidden type="file" accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi" onChange={event=>choose(event.target.files?.[0])}/>{file?<div className="picked-file"><div className="video-preview"><div className="play">▶</div><span>فيديو</span></div><div className="picked-info"><b>{file.name}</b><small>جاهز للرفع</small><span>{formatSize(file.size)} · {file.type || 'فيديو'}</span></div><button type="button" className="remove-file" disabled={busy} onClick={()=>setFile(null)}>×</button></div>:<div className="drop-content" onClick={()=>fileInput.current?.click()} role="button" tabIndex={0} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();fileInput.current?.click()}}}><div className="drop-icon"><UploadCloud/></div><h2>اسحب وأفلت ملف الفيديو هنا</h2><p>أو تصفح جهازك لاختيار فيديو المباراة</p><button type="button" onClick={event=>{event.stopPropagation();fileInput.current?.click()}}>اختر ملف من جهازك　⇧</button></div>}{error&&<p className="upload-error" role="alert">{error}</p>}<div className="file-specs"><span>الصيغ المدعومة: <b>MP4, MOV, AVI</b></span><i>•</i><span>أقصى حجم للملف: <b>2.0 جيجابايت</b></span></div></section>
      <aside className="guidance"><h2>▣ إرشادات التصوير لرؤية الآلة</h2><p className="guidance-intro">تعتمد دقة التحليل على توافق زوايا الكاميرا مع المعايير الميدانية:</p>{advice.map(([title,description],index)=><div className="advice" key={title}><span>{index+1}</span><div><b>{title}</b><p>{description}</p></div></div>)}<div className="ai-note"><span>♙</span><div><b>حالة العملية</b><small>{stage}</small></div></div></aside>
    </div>
    <div className="upload-actionbar"><button className="start-analysis" disabled={!file || busy} onClick={start}>{busy ? 'جارٍ التنفيذ…' : 'رفع الفيديو وبدء التحليل　←'}</button><span>{stage}</span></div>
    {(busy || progress > 0) && <section className="file-status"><header><h3>رفع الفيديو</h3><span>{progress}%</span></header><div className="progress-track"><i style={{width:`${progress}%`}}/></div></section>}
    {analysis && <section className="file-status analysis-status"><header><h3>حالة التحليل</h3><span>{analysis.status}</span></header><p>رقم التحليل: <bdi>{analysis.analysisId}</bdi></p>{analysis.error&&<p className="upload-error-inline">{analysis.error}</p>}{analysis.result!=null&&<pre className="analysis-result">{JSON.stringify(analysis.result,null,2)}</pre>}{analysis.status==='COMPLETED'&&<div className="player-request"><label>معرّف اللاعب <input value={playerId} onChange={event=>setPlayerId(event.target.value)} placeholder="أدخل playerId"/></label><button type="button" disabled={busy||!playerId.trim()} onClick={runPlayerAnalysis}>تحليل اللاعب</button></div>}{playerResult!=null&&<pre className="analysis-result">{JSON.stringify(playerResult,null,2)}</pre>}</section>}
  </main></div>
}
